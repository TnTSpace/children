import { env } from '$env/dynamic/private';
import crypto from 'crypto';
import { uploadFromBuffer } from '$lib/server/minio';

// ── Request / response interfaces ────────────────────────────────────────────

export interface ImageGenerateRequest {
	prompt: string;
	/** WaveSpeed size format: "1024*1024" (use * not x). Defaults to "1024*1024". */
	size?: string;
	model?: string;
	models?: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const WS_LLM_URL = 'https://llm.wavespeed.ai/v1/chat/completions';
const WS_MEDIA_BASE = 'https://api.wavespeed.ai/api/v3';
const DEFAULT_TIMEOUT = 60_000;
const HEAVY_TIMEOUT = 180_000;
const MEDIA_POLL_INTERVAL_MS = 2_000;
const MEDIA_TIMEOUT_MS = 300_000; // 5 min

/**
 * Per-task model registry. Override any entry with the matching env var
 * (e.g. WAVESPEED_CHAT_MODEL) without a redeploy.
 */
export const AI_MODELS = {
	chat: env.WAVESPEED_CHAT_MODEL || 'google/gemini-2.5-flash',
	reasoning: env.WAVESPEED_REASONING_MODEL || 'google/gemini-2.5-flash',
	image: env.WAVESPEED_IMAGE_MODEL || 'wavespeed-ai/flux-schnell',
	audioSynthesis: env.WAVESPEED_TTS_MODEL || 'inworld/inworld-1.5-max/text-to-speech',
	audioTranscription: 'openai/whisper-1', // not used — WaveSpeed has no STT
	video: env.WAVESPEED_VIDEO_MODEL || 'kwaivgi/kling-v3-turbo-std/text-to-video'
} as const;

export type AIModelKey = keyof typeof AI_MODELS;

/**
 * Image models with reliable on-image TEXT rendering (course banners, titles).
 */
export const TEXT_ACCURATE_IMAGE_MODELS = [
	'google/nano-banana-pro/text-to-image',
	'recraft-ai/recraft-v4.1/text-to-image',
	'wavespeed-ai/qwen-image/text-to-image'
];

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractFirstJson(text: string): any {
	if (!text) return null;
	try { return JSON.parse(text); } catch { /* fall through */ }
	const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
	if (fenced) {
		try { return JSON.parse(fenced[1].trim()); } catch { /* continue */ }
	}
	for (const [open, close] of [['{', '}'], ['[', ']']] as const) {
		const start = text.indexOf(open);
		if (start === -1) continue;
		let depth = 0;
		for (let i = start; i < text.length; i++) {
			if (text[i] === open) depth++;
			else if (text[i] === close) {
				depth--;
				if (depth === 0) {
					try { return JSON.parse(text.slice(start, i + 1)); } catch { break; }
				}
			}
		}
	}
	return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Thrown when WaveSpeed rejects due to insufficient account credits.
 * Signals callers to stop queuing more generations and assemble what's ready.
 */
export class WaveSpeedCreditError extends Error {
	readonly code = 'wavespeed_credits_exhausted' as const;
	constructor(detail: string) {
		super(`WaveSpeed credit balance exhausted: ${detail}`);
		this.name = 'WaveSpeedCreditError';
	}
}

function isPaymentError(httpStatus: number, body: string): boolean {
	return httpStatus === 402 || /insufficient.*credit|credit.*exhaust|insufficient.*balance|payment.?required|quota.*exceed/i.test(body);
}

function requireApiKey(): string {
	const apiKey = (env.WAVESPEED_API_KEY || env.WAVESPEED_API)?.trim();
	if (!apiKey) {
		throw new Error('WAVESPEED_API_KEY is not configured. Set it in .env to enable AI features.');
	}
	return apiKey;
}

function wsHeaders(apiKey: string): HeadersInit {
	return { Authorization: `Bearer ${apiKey}` };
}

const MODEL_FALLBACKS: Record<AIModelKey, string[]> = {
	chat: ['google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite', 'qwen/qwen3.6-flash'],
	reasoning: ['google/gemini-2.5-flash', 'google/gemini-2.5-flash-lite', 'qwen/qwen3.6-flash'],
	image: ['wavespeed-ai/flux-schnell', 'wavespeed-ai/flux-dev', 'wavespeed-ai/qwen-image/text-to-image'],
	audioSynthesis: ['inworld/inworld-1.5-max/text-to-speech', 'bytedance/seed-speech-tts-2.0'],
	audioTranscription: ['openai/whisper-1'],
	video: ['kwaivgi/kling-v3-turbo-std/text-to-video', 'bytedance/seedance-2.0-fast/text-to-video']
};

const resolvedModel: Partial<Record<AIModelKey, string>> = {};

function candidateChain(key: AIModelKey): string[] {
	const proven = resolvedModel[key];
	const curated = [proven, AI_MODELS[key], ...(MODEL_FALLBACKS[key] || [])];
	return Array.from(new Set(curated.filter(Boolean) as string[]));
}

function resolveCandidates(input: AIModelKey | string | undefined): { key?: AIModelKey; candidates: string[] } {
	const requested = input || 'chat';
	if (typeof requested === 'string' && requested in AI_MODELS) {
		const key = requested as AIModelKey;
		return { key, candidates: candidateChain(key) };
	}
	return { candidates: [String(requested)] };
}

// ── Core: WaveSpeed text (OpenAI-compatible chat/completions) ─────────────────

async function singleChatCall(
	model: string,
	messages: ChatMessage[],
	opts: { jsonMode?: boolean; timeout: number; temperature: number },
	apiKey: string
): Promise<{ ok: true; content: string } | { ok: false; status: number; error: string }> {
	console.log(`[WaveSpeed] Chat → ${model}`);
	const controller = new AbortController();
	const tid = setTimeout(() => controller.abort(), opts.timeout);
	try {
		const body: Record<string, any> = {
			model,
			messages,
			temperature: opts.temperature,
			max_tokens: 4096,
			thinking: { type: 'disabled' }
		};
		if (opts.jsonMode) body.response_format = { type: 'json_object' };

		const response = await fetch(WS_LLM_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...wsHeaders(apiKey) },
			body: JSON.stringify(body),
			signal: controller.signal
		});

		if (!response.ok) {
			const errText = await response.text().catch(() => '');
			console.warn(`[WaveSpeed] Chat failed (${model}) ${response.status}: ${errText.slice(0, 120)}`);
			return { ok: false, status: response.status, error: `WaveSpeed ${response.status}: ${errText.slice(0, 200)}` };
		}
		const data = await response.json();
		const content = data?.choices?.[0]?.message?.content;
		if (typeof content !== 'string') return { ok: false, status: 502, error: 'WaveSpeed returned no content' };
		return { ok: true, content };
	} catch (err: any) {
		const isTimeout = err?.name === 'AbortError';
		return { ok: false, status: isTimeout ? 408 : 0, error: isTimeout ? 'AI request timed out' : err?.message || 'fetch failed' };
	} finally {
		clearTimeout(tid);
	}
}

export async function wavespeedChat(
	messages: ChatMessage[],
	opts: { jsonMode?: boolean; timeout?: number; temperature?: number; model?: AIModelKey | string } = {}
): Promise<string> {
	const apiKey = requireApiKey();
	const { key, candidates } = resolveCandidates(opts.model);
	const timeout = opts.timeout ?? DEFAULT_TIMEOUT;
	const temperature = opts.temperature ?? 0.7;

	let lastError = 'unknown';
	let lastStatus = 0;
	for (const model of candidates) {
		const result = await singleChatCall(model, messages, { jsonMode: opts.jsonMode, timeout, temperature }, apiKey);
		if (result.ok) {
			if (key) resolvedModel[key] = model;
			return result.content;
		}
		if (result.status === 404 || result.status === 429) {
			lastError = result.error;
			lastStatus = result.status;
			continue;
		}
		throw new Error(result.error);
	}
	throw new Error(`All WaveSpeed ${key || 'model'} candidates failed (last: ${lastStatus} ${lastError})`);
}

export async function wavespeedJson<T = any>(
	messages: ChatMessage[],
	opts: { timeout?: number; temperature?: number; model?: AIModelKey | string } = {}
): Promise<T> {
	const raw = await wavespeedChat(messages, { ...opts, jsonMode: true });
	const parsed = extractFirstJson(raw);
	if (parsed == null) throw new Error('AI did not return valid JSON');
	return parsed as T;
}

// Aliases so existing call sites keep working unchanged.
export const openRouterChat = wavespeedChat;
export const openRouterJson = wavespeedJson;

// ── Core: WaveSpeed media (submit → poll → output URLs) ───────────────────────

function pickOutputs(d: any): string[] {
	if (!d || typeof d !== 'object') return [];
	const cands = d.outputs ?? d.output ?? d.urls ?? d.result?.outputs ?? d.result ?? d.data?.outputs;
	if (Array.isArray(cands)) return cands.filter((x: any) => typeof x === 'string' && x);
	if (typeof cands === 'string' && cands) return [cands];
	return [];
}

export async function wavespeedRun(
	model: string,
	input: Record<string, any>,
	opts: { timeoutMs?: number; pollMs?: number } = {}
): Promise<string[]> {
	const apiKey = requireApiKey();
	const timeoutMs = opts.timeoutMs ?? MEDIA_TIMEOUT_MS;
	const pollMs = opts.pollMs ?? MEDIA_POLL_INTERVAL_MS;

	const submit = await fetch(`${WS_MEDIA_BASE}/${model}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...wsHeaders(apiKey) },
		body: JSON.stringify(input),
		signal: AbortSignal.timeout(30_000)
	});
	if (!submit.ok) {
		const t = await submit.text().catch(() => '');
		if (isPaymentError(submit.status, t)) throw new WaveSpeedCreditError(t.slice(0, 200));
		throw new Error(`WaveSpeed submit ${submit.status}: ${t.slice(0, 200)}`);
	}
	const sj = await submit.json();
	const node = sj?.data ?? sj;
	const immediate = pickOutputs(node);
	if (immediate.length) return immediate;

	const id = node?.id || node?.task_id || node?.request_id || sj?.id;
	if (!id) throw new Error('WaveSpeed submit returned no task id');

	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		await sleep(pollMs);
		let r: Response;
		try {
			r = await fetch(`${WS_MEDIA_BASE}/predictions/${id}/result`, {
				headers: wsHeaders(apiKey),
				signal: AbortSignal.timeout(15_000)
			});
		} catch { continue; }
		if (!r.ok) continue;
		const j = await r.json().catch(() => null);
		const d = j?.data ?? j;
		const status = (d?.status || '').toString().toLowerCase();
		if (status === 'completed' || status === 'succeeded' || status === 'success') {
			const outs = pickOutputs(d);
			if (outs.length) return outs;
			throw new Error('WaveSpeed task completed but returned no outputs');
		}
		if (status === 'failed' || status === 'error' || status === 'canceled' || status === 'cancelled') {
			const msg = d?.error || `WaveSpeed task ${status}`;
			if (isPaymentError(0, msg)) throw new WaveSpeedCreditError(msg);
			throw new Error(msg);
		}
	}
	throw new Error('WaveSpeed task timed out');
}

// ── AIService ─────────────────────────────────────────────────────────────────

export class AIService {
	/** Generic text chat — use for any prompt/response pattern on toolsntuts. */
	static async chat(data: {
		messages?: Array<{ role: string; content: string }>;
		message?: string;
		context?: string;
		session_id?: string;
	}): Promise<{ response: string; session_id?: string }> {
		let message = data.message;
		if (!message && data.messages?.length) {
			const lastUser = [...data.messages].reverse().find((m) => m.role === 'user');
			message = lastUser?.content || data.messages[data.messages.length - 1].content;
		}
		if (!message) throw new Error('AIService.chat(): message or messages required');

		const msgs: ChatMessage[] = [];
		if (data.context) msgs.push({ role: 'system', content: data.context });
		msgs.push({ role: 'user', content: message });

		const response = await wavespeedChat(msgs, { model: 'chat', temperature: 0.7 });
		return { response, session_id: data.session_id };
	}

	/**
	 * Image generation via WaveSpeed (Flux by default).
	 * Returns a hosted image URL. On failure returns empty url — no stock fallback.
	 */
	static async generateImage(data: ImageGenerateRequest & { model?: string; models?: string[] }) {
		const candidates =
			Array.isArray(data.models) && data.models.length > 0
				? data.models
				: data.model
					? [data.model]
					: candidateChain('image');
		const size = (data.size || '1024*1024').replace(/x/i, '*');
		let lastError = 'unknown';
		for (const model of candidates) {
			try {
				const outputs = await wavespeedRun(model, { prompt: data.prompt, size });
				const url = outputs[0];
				if (url) {
					resolvedModel.image = model;
					return { url, prompt: data.prompt };
				}
				lastError = 'no image in WaveSpeed output';
			} catch (err: any) {
				lastError = err?.message || 'image generation failed';
				console.warn(`[WaveSpeed] Image model ${model} failed: ${lastError}`);
			}
		}
		return { url: '', prompt: data.prompt, fallback: true, error: lastError };
	}

	/**
	 * Text-to-speech via WaveSpeed. Returns a base64 data URL (audio/mpeg).
	 */
	static async synthesizeAudio(
		text: string,
		opts: { voice?: string; format?: 'mp3' | 'pcm'; speed?: number; model?: string } = {}
	) {
		const format = opts.format === 'pcm' ? 'pcm' : 'mp3';
		const candidates = opts.model ? [opts.model] : candidateChain('audioSynthesis');
		let lastError = 'unknown';
		for (const model of candidates) {
			try {
				const input: Record<string, any> = { text };
				if (opts.voice) input.voice_id = opts.voice;
				const outputs = await wavespeedRun(model, input);
				const audioUrl = outputs[0];
				if (!audioUrl) { lastError = 'no audio in WaveSpeed output'; continue; }
				const r = await fetch(audioUrl);
				if (!r.ok) { lastError = `fetch audio ${r.status}`; continue; }
				const buf = Buffer.from(await r.arrayBuffer());
				if (buf.byteLength === 0) { lastError = 'empty audio response'; continue; }
				const ct = (r.headers.get('content-type') || '').split(';')[0].trim();
				const mime = ct && ct.startsWith('audio/') ? ct : format === 'pcm' ? 'audio/pcm' : 'audio/mpeg';
				resolvedModel.audioSynthesis = model;
				return { dataUrl: `data:${mime};base64,${buf.toString('base64')}`, format, model };
			} catch (err: any) {
				lastError = err?.message || 'speech request failed';
				console.warn(`[WaveSpeed] TTS model ${model} failed: ${lastError}`);
			}
		}
		return { dataUrl: '', error: `All TTS candidates failed. Last error: ${lastError}` };
	}

	/** Lightweight ping. */
	static async healthCheck(): Promise<{ status: string; version: string }> {
		const apiKey = (env.WAVESPEED_API_KEY || env.WAVESPEED_API)?.trim();
		if (!apiKey) return { status: 'unconfigured', version: 'wavespeed-v1' };
		try {
			const response = await fetch('https://llm.wavespeed.ai/v1/models', {
				method: 'GET',
				headers: { Authorization: `Bearer ${apiKey}` },
				signal: AbortSignal.timeout(5_000)
			});
			return { status: response.ok ? 'ok' : 'degraded', version: 'wavespeed-v1' };
		} catch {
			return { status: 'unreachable', version: 'wavespeed-v1' };
		}
	}

	/**
	 * Generate an image with WaveSpeed and persist it to MinIO.
	 * Returns a stable URL ready to save to the DB; falls back to an inline
	 * data URL if MinIO is unreachable so callers still get a usable image.
	 */
	static async generateAndStoreImage(
		prompt: string,
		options: { size?: string; path?: string; model?: string; models?: string[] } = {}
	): Promise<{ url: string; directUrl: string; id: string; prompt: string }> {
		const result = await this.generateImage({
			prompt,
			size: options.size,
			model: options.model,
			models: options.models
		});
		const imageUrl = result.url;

		let buffer: Buffer | null = null;
		let contentType = 'image/png';
		let extension = 'png';

		if (imageUrl.startsWith('data:image/')) {
			const m = imageUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
			if (!m) throw new Error('Invalid base64 image data url');
			contentType = m[1];
			extension = contentType.split('/')[1] || 'png';
			buffer = Buffer.from(m[2], 'base64');
		} else if (/^https?:\/\//i.test(imageUrl)) {
			const r = await fetch(imageUrl);
			if (!r.ok) throw new Error(`Failed to fetch generated image: ${r.status}`);
			buffer = Buffer.from(await r.arrayBuffer());
			const ct = r.headers.get('content-type');
			if (ct && ct.startsWith('image/')) {
				contentType = ct.split(';')[0].trim();
				extension = contentType.split('/')[1] || 'png';
			}
		} else {
			throw new Error('Image generation returned no usable payload');
		}

		if (!buffer || buffer.length === 0) throw new Error('Image generation produced an empty file');

		const dir = (options.path || 'ai-images').replace(/^\/+|\/+$/g, '');
		const objectName = `${dir}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

		try {
			const upload = await uploadFromBuffer(env.MINIO_BUCKET, objectName, buffer, contentType, objectName);
			const origin = (env.PUBLIC_BETTER_AUTH_URL || 'https://toolsntuts.com').replace(/\/+$/, '');
			const relative = upload.directUrl || upload.url;
			const absolute = relative && relative.startsWith('/') ? `${origin}${relative}` : relative;
			return { url: absolute, directUrl: absolute, id: upload.id, prompt };
		} catch (err: any) {
			console.warn(`[WaveSpeed.generateAndStoreImage] storage unavailable (${err?.code || err?.message}); returning inline data URL.`);
			const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
			return { url: dataUrl, directUrl: dataUrl, id: objectName, prompt };
		}
	}
}

// ── Model catalog ─────────────────────────────────────────────────────────────

export interface ModelInfo {
	id: string;
	name?: string;
	description?: string;
	contextLength?: number;
	pricing?: Record<string, number | undefined>;
	costTier?: 'low' | 'medium' | 'high';
	qualityTier?: 'basic' | 'good' | 'high' | 'top';
	tradeoffs?: string[];
}

export async function getEnrichedModels(modality: AIModelKey): Promise<ModelInfo[]> {
	return candidateChain(modality).map((id) => ({
		id,
		name: id,
		qualityTier: 'high' as const,
		costTier: 'medium' as const,
		tradeoffs: []
	}));
}

export function getDiscoveredModels(): Record<string, { slugs: string[]; at: number }> {
	const out: Record<string, { slugs: string[]; at: number }> = {};
	for (const key of Object.keys(AI_MODELS) as AIModelKey[]) {
		out[key] = { slugs: candidateChain(key), at: 0 };
	}
	return out;
}

export async function refreshOpenRouterModels(): Promise<ReturnType<typeof getDiscoveredModels>> {
	return getDiscoveredModels();
}

import { env } from '$env/dynamic/private';

/**
 * Windmill REST client.
 *
 * Auth: a dedicated API token with the `jobs:run:scripts` scope, set as
 * WINDMILL_TOKEN. The token embedded in WINDMILL_MCP_URL is MCP-scoped only and
 * is REJECTED by the jobs REST API (403 "Required scope: jobs:run:scripts"), so
 * we do NOT use it. Create a token at:
 *   Windmill → user menu → Account settings → Tokens → Create token.
 *
 * Base URL + workspace are derived from WINDMILL_URL (preferred) or, failing
 * that, the host/workspace in WINDMILL_MCP_URL. All pipeline scripts are quick,
 * so we run them synchronously via run_wait_result.
 */

function windmillConfig(): { base: string; workspace: string; token: string } {
  const mcp = env.WINDMILL_MCP_URL;
  let base = env.WINDMILL_URL ?? '';
  let workspace = 'saas';
  if (mcp) {
    const url = new URL(mcp);
    if (!base) base = `${url.protocol}//${url.host}`;
    const m = url.pathname.match(/\/w\/([^/]+)/);
    if (m) workspace = m[1];
  }
  if (env.WINDMILL_WORKSPACE) workspace = env.WINDMILL_WORKSPACE;
  const token = env.WINDMILL_TOKEN ?? '';
  if (!base) throw new Error('Windmill base URL is not configured (set WINDMILL_URL or WINDMILL_MCP_URL).');
  return { base, workspace, token };
}

/** Submit a Windmill script job without waiting. Returns the Windmill job UUID. */
export async function submitJobAsync(path: string, args: Record<string, unknown> = {}): Promise<string> {
  const wm = windmillConfig();
  if (!wm.token) throw new Error('WINDMILL_TOKEN is not set.');
  const res = await fetch(`${wm.base}/api/w/${wm.workspace}/jobs/run/p/${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${wm.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Windmill submit failed: HTTP ${res.status} ${body.slice(0, 300)}`);
  }
  const raw = await res.text();
  return raw.replace(/^"|"$/g, '').trim();
}

export interface WindmillJobPoll {
  completed: boolean;
  success?: boolean;
  result?: unknown;
  error?: string;
}

/**
 * Poll a Windmill job. Returns { completed: false } while the job is still
 * running; { completed: true, success, result } once it finishes.
 */
export async function pollWindmillJob(jobId: string): Promise<WindmillJobPoll> {
  const wm = windmillConfig();
  if (!wm.token) throw new Error('WINDMILL_TOKEN is not set.');
  // Use the unified endpoint — /jobs/{id} only returns queued/running jobs and
  // gives 404 once the job completes; /jobs_u/get/{id} works for all states.
  const res = await fetch(`${wm.base}/api/w/${wm.workspace}/jobs_u/get/${jobId}`, {
    headers: { Authorization: `Bearer ${wm.token}` }
  });
  if (!res.ok) throw new Error(`Windmill job poll failed: HTTP ${res.status}`);
  const data = await res.json() as {
    type?: string;
    success?: boolean;
    result?: unknown;
    [key: string]: unknown;
  };
  if (data.type !== 'CompletedJob') return { completed: false };
  // Windmill Python errors land in result.error.message (object) or result itself (string)
  let error: string | undefined;
  if (data.success === false) {
    const r = data.result as unknown;
    if (typeof r === 'string') {
      error = r;
    } else if (r && typeof r === 'object') {
      const ro = r as Record<string, unknown>;
      const e = ro.error;
      if (typeof e === 'string') {
        error = e;
      } else if (e && typeof e === 'object') {
        const eo = e as Record<string, unknown>;
        error = (typeof eo.message === 'string' ? eo.message : null)
          ?? (typeof eo.traceback === 'string' ? eo.traceback.split('\n').at(-2) : null)
          ?? JSON.stringify(e).slice(0, 300);
      } else {
        error = JSON.stringify(r).slice(0, 300);
      }
    }
  }
  return { completed: true, success: data.success ?? false, result: data.result, error };
}

/** Run a Windmill script by path and wait for its result. */
export async function runScript<T = unknown>(
  path: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const wm = windmillConfig();
  if (!wm.token) {
    throw new Error(
      'WINDMILL_TOKEN is not set. Create an API token in Windmill (Account settings → Tokens) and add it to your environment.'
    );
  }
  const res = await fetch(`${wm.base}/api/w/${wm.workspace}/jobs/run_wait_result/p/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${wm.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Windmill ${path}: ${res.status} — the WINDMILL_TOKEN lacks the "jobs:run:scripts" scope (or is an MCP-only token). Create a full API token in Account settings → Tokens.`
      );
    }
    throw new Error(`Windmill ${path} failed: HTTP ${res.status} ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/* -------------------------------------------------------------------------- */
/*  Typed wrappers around the deployed pipeline scripts                       */
/* -------------------------------------------------------------------------- */

export interface BreakdownShot {
  prompt: string;
  narration: string;
  durationSec: number;
  chainFromPrevious: boolean;
  cameraNotes?: string;
  referenceNames?: string[];
}
export interface BreakdownScene {
  title: string;
  summary: string;
  mood: string;
  narration: string;
  shots: BreakdownShot[];
}
export interface BreakdownReference {
  kind: string;
  name: string;
  description: string;
}
export interface Breakdown {
  title: string;
  logline: string;
  references: BreakdownReference[];
  scenes: BreakdownScene[];
}
export interface ScriptBreakdownResult {
  success: boolean;
  breakdown: Breakdown | null;
  model: string;
  error?: string;
}

/** Run the pre-production agent: brief → structured scenes/shots/references. */
export function scriptBreakdown(args: {
  brief: string;
  format?: string;
  targetDurationSec?: number;
  aspectRatio?: string;
  model?: string;
}): Promise<ScriptBreakdownResult> {
  return runScript<ScriptBreakdownResult>('u/brnkgabriel/script_breakdown', args as Record<string, unknown>);
}

export interface TtsResult {
  success: boolean;
  audioBase64: string;
  mimeType: string;
  voiceId: string;
  charCount: number;
  error?: string;
}

/** Generate narration audio (ElevenLabs only — low-level). */
export function elevenlabsTts(text: string, voiceId?: string, modelId?: string): Promise<TtsResult> {
  return runScript<TtsResult>('u/brnkgabriel/elevenlabs_tts', { text, voiceId, modelId });
}

export interface TtsGatewayResult {
  success: boolean;
  audioBase64: string;
  mimeType: string; // audio/mpeg (ElevenLabs) | audio/wav (Gemini)
  provider: 'elevenlabs' | 'gemini' | 'none';
  voice: string;
  charCount: number;
  error?: string;
}

/**
 * Generate narration audio with provider fallback: ElevenLabs first (if a
 * voiceId is given), otherwise/failing that → Gemini TTS over the Google key
 * pool. Pass voiceId='' to go straight to Gemini (free tier).
 */
export function ttsGateway(text: string, voiceId = '', geminiVoice = 'Kore'): Promise<TtsGatewayResult> {
  return runScript<TtsGatewayResult>('u/brnkgabriel/tts_gateway', { text, voiceId, geminiVoice });
}

import type { ProjectFormat } from '$lib/db/media';
import { Film, Clapperboard, Music, Megaphone, type Icon } from '@lucide/svelte';

/* -------------------------------------------------------------------------- */
/*  Project formats                                                           */
/* -------------------------------------------------------------------------- */
export interface FormatDef {
  key: ProjectFormat;
  label: string;
  tagline: string;
  icon: typeof Icon;
  available: boolean; // roadmap gating
}

export const FORMATS: FormatDef[] = [
  { key: 'narrated_short', label: 'Narrated short', tagline: 'Explainer / social — narration drives the cut', icon: Film, available: true },
  { key: 'cinematic', label: 'Cinematic story', tagline: 'Characters, dialogue, continuity', icon: Clapperboard, available: true },
  { key: 'music_video', label: 'Music video', tagline: 'Beat-synced visuals', icon: Music, available: true },
  { key: 'ad', label: 'Product ad', tagline: 'Hook → hero → CTA', icon: Megaphone, available: true }
];

export const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '21:9'] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/* -------------------------------------------------------------------------- */
/*  Model catalog — WaveSpeed AI model strings + credit cost per generation   */
/*  Costs are app credits; tune freely.                                       */
/* -------------------------------------------------------------------------- */
export type ModelKind = 'image' | 'video' | 'music';

/** Context the studio passes to a model's input builder. */
export interface GenContext {
  prompt: string;
  aspectRatio: string;
  durationSec: number;
  keyframeUrl?: string;
}

export interface ModelDef {
  key: string; // internal key stored on shot.modelKey / job.modelKey
  label: string;
  kind: ModelKind;
  wsModel: string; // WaveSpeed model slug — path segment after /api/v3/
  credits: number; // app credits charged per generation
  needsKeyframe?: boolean; // image→video models require an approved storyboard
  available?: boolean; // false = temporarily disabled
  notes?: string;
  buildInput: (ctx: GenContext) => Record<string, unknown>;
}

// Kling supports 5 or 10 second clips (as string).
const wsDuration = (sec: number) => (sec > 7 ? '10' : '5');

// WaveSpeed image size uses * not x (e.g. "1024*576").
const wsImageSize = (ar: string) => {
  if (ar === '9:16') return '576*1024';
  if (ar === '1:1') return '1024*1024';
  if (ar === '21:9') return '1024*448';
  return '1024*576'; // 16:9 default
};

const WAN_NEGATIVE =
  'animation, cartoon, CGI render, 3D graphics, digital painting, ' +
  'synthetic skin, plastic sheen, mannequin, uncanny valley, ' +
  'artificial studio lighting, watermark, text overlay, blurry, ' +
  'overexposed, flat colours, AI artifact, robotic motion, stiff movement';

const IMAGE_NEGATIVE =
  'cartoon, anime, illustration, 3D render, CGI, watermark, text, signature, ' +
  'logo, blurry, noisy, oversaturated, overexposed, underexposed, bad anatomy, ' +
  'extra limbs, deformed, disfigured, ugly, low quality, pixelated';

// Prefix every storyboard prompt with cinematic framing cues so the model
// produces properly-composed reference frames rather than generic snapshots.
const cinematic = (prompt: string) =>
  `Cinematic storyboard frame, photorealistic, film photography, professional lighting, ${prompt}`;

export const MODELS: Record<string, ModelDef> = {
  // ── Storyboard / reference images ──
  // Flux Schnell: 4-step distilled model — ~4× faster than Dev with near-identical
  // quality for storyboard reference frames. Default for rapid iteration.
  'image:flux-schnell': {
    key: 'image:flux-schnell',
    label: 'Flux Schnell (fast)',
    kind: 'image',
    wsModel: 'wavespeed-ai/flux-schnell',
    credits: 1,
    available: true,
    buildInput: ({ prompt, aspectRatio }) => ({
      prompt: cinematic(prompt),
      size: wsImageSize(aspectRatio),
    })
  },

  // Flux Dev: higher-quality alternative — more detail and prompt adherence
  // but ~4× slower. Use when visual accuracy matters more than speed.
  'image:flux': {
    key: 'image:flux',
    label: 'Flux Dev (quality)',
    kind: 'image',
    wsModel: 'wavespeed-ai/flux-dev',
    credits: 2,
    available: true,
    buildInput: ({ prompt, aspectRatio }) => ({
      prompt: cinematic(prompt),
      size: wsImageSize(aspectRatio),
      negative_prompt: IMAGE_NEGATIVE,
    })
  },

  // ── Shot video — Kling v3 (proven model slugs from wavespeedai.ts AI_MODELS) ──
  'video:kling-i2v': {
    key: 'video:kling-i2v',
    label: 'Kling v3 (image→video)',
    kind: 'video',
    wsModel: 'kwaivgi/kling-v3-turbo-std/image-to-video',
    credits: 40,
    needsKeyframe: true,
    available: true,
    buildInput: ({ prompt, keyframeUrl, durationSec }) => ({
      prompt: prompt.slice(0, 1000),
      image: keyframeUrl ?? '',
      duration: wsDuration(durationSec),
      negative_prompt: WAN_NEGATIVE
    })
  },
  'video:kling-t2v': {
    key: 'video:kling-t2v',
    label: 'Kling v3 (text→video)',
    kind: 'video',
    wsModel: 'kwaivgi/kling-v3-turbo-std/text-to-video',
    credits: 40,
    available: true,
    buildInput: ({ prompt, aspectRatio, durationSec }) => ({
      prompt: prompt.slice(0, 1000),
      aspect_ratio: aspectRatio,
      duration: wsDuration(durationSec),
      negative_prompt: WAN_NEGATIVE
    })
  }
};

export const DEFAULT_IMAGE_MODEL = 'image:flux-schnell';
export const DEFAULT_VIDEO_MODEL = 'video:kling-i2v';

export const modelsByKind = (kind: ModelKind): ModelDef[] =>
  Object.values(MODELS).filter((m) => m.kind === kind && m.available !== false);
export const modelCredits = (key: string | null | undefined): number => (key && MODELS[key]?.credits) || 0;

/* -------------------------------------------------------------------------- */
/*  Credits                                                                   */
/* -------------------------------------------------------------------------- */
export const STARTER_CREDITS = 500; // granted to every new wallet
export const VOICEOVER_CREDITS = 1; // per ElevenLabs narration line

/* -------------------------------------------------------------------------- */
/*  Status display helpers                                                    */
/* -------------------------------------------------------------------------- */
export const PROJECT_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  scripting: 'Scripting',
  storyboard: 'Storyboard',
  generating: 'Generating',
  assembling: 'Assembling',
  ready: 'Ready',
  archived: 'Archived'
};

export const SHOT_STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  storyboard_ready: 'Storyboard',
  queued: 'Queued',
  generating: 'Generating',
  ready: 'Ready',
  failed: 'Failed'
};

export const statusVariant = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  if (status === 'ready') return 'default';
  if (status === 'failed') return 'destructive';
  if (status === 'generating' || status === 'queued') return 'secondary';
  return 'outline';
};

import { pgTable, text, timestamp, boolean, integer, real, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './schema';

/* -------------------------------------------------------------------------- */
/*  Shared id helper                                                          */
/* -------------------------------------------------------------------------- */
// All media tables use text uuids generated app-side, matching the better-auth
// convention of text primary keys already used by user/session/account.
const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () => timestamp('created_at').notNull().defaultNow();
const updatedAt = () => timestamp('updated_at').notNull().defaultNow();

/* -------------------------------------------------------------------------- */
/*  Enumerated string types (kept as text + $type for painless migrations)    */
/* -------------------------------------------------------------------------- */
export type ProjectFormat = 'narrated_short' | 'cinematic' | 'music_video' | 'ad';
export type ProjectStatus = 'draft' | 'scripting' | 'storyboard' | 'generating' | 'assembling' | 'ready' | 'archived';
export type AssetKind = 'image' | 'video' | 'audio_voice' | 'audio_music' | 'audio_sfx' | 'caption' | 'other';
export type ReferenceKind = 'character' | 'style' | 'location' | 'object' | 'voice' | 'brand';
export type ShotStatus = 'pending' | 'storyboard_ready' | 'queued' | 'generating' | 'ready' | 'failed';
export type TrackKind = 'video' | 'voice' | 'music' | 'sfx' | 'caption' | 'overlay';
export type JobKind =
  | 'script_breakdown'
  | 'reference_image'
  | 'storyboard_image'
  | 'shot_video'
  | 'voiceover'
  | 'music'
  | 'sfx'
  | 'assemble_render';
export type JobStatus = 'queued' | 'running' | 'polling' | 'succeeded' | 'failed' | 'canceled';
export type JobProvider = 'wavespeed' | 'windmill' | 'openrouter' | 'render' | 'internal' | 'kie';

/* -------------------------------------------------------------------------- */
/*  project — the top-level "film" container (project-first model)            */
/* -------------------------------------------------------------------------- */
export const project = pgTable(
  'project',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    format: text('format').$type<ProjectFormat>().notNull().default('narrated_short'),
    status: text('status').$type<ProjectStatus>().notNull().default('draft'),

    // Global creative + render settings
    aspectRatio: text('aspect_ratio').notNull().default('16:9'), // 16:9 | 9:16 | 1:1 | 21:9
    fps: integer('fps').notNull().default(30),
    targetDurationSec: integer('target_duration_sec'), // user's desired length
    resolution: text('resolution').notNull().default('1080p'),

    // The raw idea/brief + the LLM-expanded script (markdown / structured)
    brief: text('brief'),
    scriptText: text('script_text'),

    // Free-form creative knobs: tone, palette, default video model, voice id, etc.
    settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),

    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('project_user_idx').on(t.userId), index('project_status_idx').on(t.status)]
);

/* -------------------------------------------------------------------------- */
/*  reference — locked consistency anchors (characters, style, voice, brand)  */
/* -------------------------------------------------------------------------- */
export const reference = pgTable(
  'reference',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    kind: text('kind').$type<ReferenceKind>().notNull(),
    name: text('name').notNull(), // "Maya (host)", "Brand teal", "Narrator voice"
    description: text('description'), // canonical prompt fragment injected into generations
    // Locked image(s) used as reference for image/video models
    primaryAssetId: text('primary_asset_id'),
    assetIds: jsonb('asset_ids').$type<string[]>().notNull().default([]),
    // Model-specific anchors: seed, voice id, style code, character id, etc.
    anchors: jsonb('anchors').$type<Record<string, unknown>>().notNull().default({}),
    locked: boolean('locked').notNull().default(false), // approved by user → reused everywhere
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('reference_project_idx').on(t.projectId)]
);

/* -------------------------------------------------------------------------- */
/*  scene — narrative grouping of shots                                       */
/* -------------------------------------------------------------------------- */
export const scene = pgTable(
  'scene',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull().default(0),
    title: text('title'),
    summary: text('summary'),
    mood: text('mood'),
    narration: text('narration'), // VO / dialogue text for this scene
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('scene_project_idx').on(t.projectId, t.orderIndex)]
);

/* -------------------------------------------------------------------------- */
/*  shot — the unit of generation (one keyframe → one video clip)             */
/* -------------------------------------------------------------------------- */
export const shot = pgTable(
  'shot',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    sceneId: text('scene_id')
      .notNull()
      .references(() => scene.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull().default(0),

    status: text('status').$type<ShotStatus>().notNull().default('pending'),

    // What to generate
    prompt: text('prompt').notNull(), // visual description for the model
    negativePrompt: text('negative_prompt'),
    narration: text('narration'), // VO line spoken over this shot (drives timing)
    cameraNotes: text('camera_notes'),
    durationSec: real('duration_sec').notNull().default(5),

    // Consistency wiring
    referenceIds: jsonb('reference_ids').$type<string[]>().notNull().default([]),
    chainFromPrevious: boolean('chain_from_previous').notNull().default(false), // continuity cut
    keyframeAssetId: text('keyframe_asset_id'), // storyboard image (cheap, approved first)
    videoAssetId: text('video_asset_id'), // generated clip
    voiceAssetId: text('voice_asset_id'), // narration audio for this shot
    lastFrameAssetId: text('last_frame_asset_id'), // extracted to seed the next shot

    // Which model + params produced (or will produce) this shot
    modelKey: text('model_key'), // e.g. "kie:veo3", "kie:runway-gen4"
    genParams: jsonb('gen_params').$type<Record<string, unknown>>().notNull().default({}),

    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [
    index('shot_project_idx').on(t.projectId),
    index('shot_scene_idx').on(t.sceneId, t.orderIndex),
    index('shot_status_idx').on(t.status)
  ]
);

/* -------------------------------------------------------------------------- */
/*  asset — every stored media object (MinIO)                                 */
/* -------------------------------------------------------------------------- */
export const asset = pgTable(
  'asset',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    kind: text('kind').$type<AssetKind>().notNull(),

    // MinIO location
    bucket: text('bucket').notNull(),
    objectKey: text('object_key').notNull(),
    url: text('url'), // resolved/cached public or presigned url
    mimeType: text('mime_type'),
    sizeBytes: integer('size_bytes'),

    // Media metadata
    width: integer('width'),
    height: integer('height'),
    durationSec: real('duration_sec'),

    // Provenance: which job/model created it, prompt, seed, etc.
    jobId: text('job_id'),
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),

    createdAt: createdAt()
  },
  (t) => [index('asset_project_idx').on(t.projectId), index('asset_kind_idx').on(t.projectId, t.kind)]
);

/* -------------------------------------------------------------------------- */
/*  track + clip — the normalized, non-destructive timeline (Remotion input)  */
/* -------------------------------------------------------------------------- */
export const track = pgTable(
  'track',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    kind: text('kind').$type<TrackKind>().notNull(),
    name: text('name'),
    orderIndex: integer('order_index').notNull().default(0), // z / vertical order
    muted: boolean('muted').notNull().default(false),
    locked: boolean('locked').notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('track_project_idx').on(t.projectId, t.orderIndex)]
);

export const clip = pgTable(
  'clip',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    trackId: text('track_id')
      .notNull()
      .references(() => track.id, { onDelete: 'cascade' }),
    // Source: an asset, optionally tied back to the shot it came from
    assetId: text('asset_id').references(() => asset.id, { onDelete: 'set null' }),
    shotId: text('shot_id').references(() => shot.id, { onDelete: 'set null' }),

    // Placement on the timeline (milliseconds)
    startMs: integer('start_ms').notNull().default(0),
    durationMs: integer('duration_ms').notNull(),
    trimInMs: integer('trim_in_ms').notNull().default(0), // in-point within the source
    trimOutMs: integer('trim_out_ms'), // out-point within the source

    // Per-clip render props: volume, transition, transform, text content, etc.
    props: jsonb('props').$type<Record<string, unknown>>().notNull().default({}),

    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('clip_track_idx').on(t.trackId, t.startMs), index('clip_project_idx').on(t.projectId)]
);

/* -------------------------------------------------------------------------- */
/*  render — a compiled output of the timeline (versioned)                    */
/* -------------------------------------------------------------------------- */
export const render = pgTable(
  'render',
  {
    id: id(),
    projectId: text('project_id')
      .notNull()
      .references(() => project.id, { onDelete: 'cascade' }),
    version: integer('version').notNull().default(1),
    status: text('status').$type<JobStatus>().notNull().default('queued'),
    // Frozen composition handed to the render worker (Remotion input props)
    composition: jsonb('composition').$type<Record<string, unknown>>().notNull().default({}),
    outputAssetId: text('output_asset_id'),
    durationMs: integer('duration_ms'),
    jobId: text('job_id'),
    error: text('error'),
    createdAt: createdAt(),
    updatedAt: updatedAt()
  },
  (t) => [index('render_project_idx').on(t.projectId)]
);

/* -------------------------------------------------------------------------- */
/*  job — the async orchestration spine (Windmill + kie.ai task polling)      */
/* -------------------------------------------------------------------------- */
export const job = pgTable(
  'job',
  {
    id: id(),
    projectId: text('project_id').references(() => project.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    kind: text('kind').$type<JobKind>().notNull(),
    status: text('status').$type<JobStatus>().notNull().default('queued'),
    provider: text('provider').$type<JobProvider>().notNull(),
    modelKey: text('model_key'),

    // What this job produces / is attached to
    shotId: text('shot_id').references(() => shot.id, { onDelete: 'cascade' }),
    renderId: text('render_id'),

    // Orchestration handles
    windmillJobId: text('windmill_job_id'), // Windmill run id
    providerTaskId: text('provider_task_id'), // kie.ai task id for polling
    providerKeyName: text('provider_key_name'), // which kie_ai_keys entry created the task (poll with same key)
    callbackToken: text('callback_token'), // verifies inbound webhook

    input: jsonb('input').$type<Record<string, unknown>>().notNull().default({}),
    output: jsonb('output').$type<Record<string, unknown>>().notNull().default({}),
    error: text('error'),

    attempts: integer('attempts').notNull().default(0),
    costCredits: integer('cost_credits').notNull().default(0),

    queuedAt: createdAt(),
    startedAt: timestamp('started_at'),
    finishedAt: timestamp('finished_at'),
    updatedAt: updatedAt()
  },
  (t) => [
    index('job_project_idx').on(t.projectId),
    index('job_status_idx').on(t.status),
    index('job_provider_task_idx').on(t.providerTaskId),
    index('job_shot_idx').on(t.shotId)
  ]
);

/* -------------------------------------------------------------------------- */
/*  credits — wallet (fast balance read) + ledger (audit trail)               */
/* -------------------------------------------------------------------------- */
export const creditWallet = pgTable('credit_wallet', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  balance: integer('balance').notNull().default(0),
  lifetimeSpent: integer('lifetime_spent').notNull().default(0),
  updatedAt: updatedAt()
});

export const creditLedger = pgTable(
  'credit_ledger',
  {
    id: id(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // positive = top-up/grant, negative = spend
    amount: integer('amount').notNull(),
    balanceAfter: integer('balance_after').notNull(),
    reason: text('reason').notNull(), // "topup", "shot_video", "voiceover", "render", "refund"
    jobId: text('job_id').references(() => job.id, { onDelete: 'set null' }),
    projectId: text('project_id').references(() => project.id, { onDelete: 'set null' }),
    modelKey: text('model_key'),
    meta: jsonb('meta').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt()
  },
  (t) => [index('ledger_user_idx').on(t.userId, t.createdAt)]
);

/* -------------------------------------------------------------------------- */
/*  Relations (for convenient drizzle query joins)                            */
/* -------------------------------------------------------------------------- */
export const projectRelations = relations(project, ({ many }) => ({
  scenes: many(scene),
  shots: many(shot),
  references: many(reference),
  assets: many(asset),
  tracks: many(track),
  clips: many(clip),
  renders: many(render),
  jobs: many(job)
}));

export const sceneRelations = relations(scene, ({ one, many }) => ({
  project: one(project, { fields: [scene.projectId], references: [project.id] }),
  shots: many(shot)
}));

export const shotRelations = relations(shot, ({ one, many }) => ({
  project: one(project, { fields: [shot.projectId], references: [project.id] }),
  scene: one(scene, { fields: [shot.sceneId], references: [scene.id] }),
  jobs: many(job)
}));

export const trackRelations = relations(track, ({ one, many }) => ({
  project: one(project, { fields: [track.projectId], references: [project.id] }),
  clips: many(clip)
}));

export const clipRelations = relations(clip, ({ one }) => ({
  track: one(track, { fields: [clip.trackId], references: [track.id] }),
  asset: one(asset, { fields: [clip.assetId], references: [asset.id] }),
  shot: one(shot, { fields: [clip.shotId], references: [shot.id] })
}));

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                            */
/* -------------------------------------------------------------------------- */
export type Project = typeof project.$inferSelect;
export type NewProject = typeof project.$inferInsert;
export type Reference = typeof reference.$inferSelect;
export type Scene = typeof scene.$inferSelect;
export type Shot = typeof shot.$inferSelect;
export type Asset = typeof asset.$inferSelect;
export type Track = typeof track.$inferSelect;
export type Clip = typeof clip.$inferSelect;
export type Render = typeof render.$inferSelect;
export type Job = typeof job.$inferSelect;
export type NewJob = typeof job.$inferInsert;
export type CreditWallet = typeof creditWallet.$inferSelect;
export type CreditLedger = typeof creditLedger.$inferSelect;

export const mediaSchema = {
  project,
  reference,
  scene,
  shot,
  asset,
  track,
  clip,
  render,
  job,
  creditWallet,
  creditLedger
};

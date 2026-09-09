import { db } from './drizzle';
import {
  project,
  scene,
  shot,
  reference,
  asset,
  job,
  render,
  creditWallet,
  creditLedger,
  type Project,
  type Scene,
  type Shot,
  type Reference,
  type Asset,
  type Job,
  type NewJob,
  type Render,
  type ProjectFormat,
  type ProjectStatus,
  type ShotStatus,
  type AssetKind
} from './media';
import { eq, and, desc, asc, inArray, sql } from 'drizzle-orm';
import { STARTER_CREDITS } from '$lib/constants/media';
import type { Breakdown } from '$lib/server/windmill';

/* -------------------------------------------------------------------------- */
/*  Projects                                                                  */
/* -------------------------------------------------------------------------- */
export async function createProject(input: {
  userId: string;
  title: string;
  brief: string;
  format: ProjectFormat;
  aspectRatio: string;
  targetDurationSec: number;
}): Promise<Project> {
  const [row] = await db
    .insert(project)
    .values({
      userId: input.userId,
      title: input.title,
      brief: input.brief,
      format: input.format,
      aspectRatio: input.aspectRatio,
      targetDurationSec: input.targetDurationSec,
      status: 'scripting'
    })
    .returning();
  return row;
}

export async function getProjectsByUser(userId: string): Promise<Project[]> {
  return db.select().from(project).where(eq(project.userId, userId)).orderBy(desc(project.updatedAt));
}

export async function getProject(projectId: string, userId: string): Promise<Project | null> {
  const rows = await db
    .select()
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export interface ProjectWorkspace {
  project: Project;
  scenes: Scene[];
  shots: Shot[];
  references: Reference[];
  assets: Asset[];
  render: Render | null;
}

/** Load everything needed to render the studio workspace for one project. */
export async function getProjectWorkspace(projectId: string, userId: string): Promise<ProjectWorkspace | null> {
  const proj = await getProject(projectId, userId);
  if (!proj) return null;
  const [scenes, shots, references, assets, renders] = await Promise.all([
    db.select().from(scene).where(eq(scene.projectId, projectId)).orderBy(asc(scene.orderIndex)),
    db.select().from(shot).where(eq(shot.projectId, projectId)).orderBy(asc(shot.orderIndex)),
    db.select().from(reference).where(eq(reference.projectId, projectId)),
    db.select().from(asset).where(eq(asset.projectId, projectId)).orderBy(desc(asset.createdAt)),
    db.select().from(render).where(eq(render.projectId, projectId)).orderBy(desc(render.createdAt)).limit(1)
  ]);
  return { project: proj, scenes, shots, references, assets, render: renders[0] ?? null };
}

/** Create a render record (a compiled output of the timeline). */
export async function createRender(input: {
  projectId: string;
  version: number;
  outputAssetId: string;
  durationMs: number;
  composition?: Record<string, unknown>;
}): Promise<Render> {
  const [row] = await db
    .insert(render)
    .values({
      projectId: input.projectId,
      version: input.version,
      status: 'succeeded',
      outputAssetId: input.outputAssetId,
      durationMs: input.durationMs,
      composition: input.composition ?? {}
    })
    .returning();
  return row;
}

export async function countRenders(projectId: string): Promise<number> {
  const rows = await db.select({ id: render.id }).from(render).where(eq(render.projectId, projectId));
  return rows.length;
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
  await db.update(project).set({ status, updatedAt: new Date() }).where(eq(project.id, projectId));
}

export async function renameProject(projectId: string, userId: string, title: string): Promise<boolean> {
  const res = await db
    .update(project)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .returning({ id: project.id });
  return res.length > 0;
}

/** Delete a project (scenes/shots/refs/assets/jobs cascade via FK). */
export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const res = await db
    .delete(project)
    .where(and(eq(project.id, projectId), eq(project.userId, userId)))
    .returning({ id: project.id });
  return res.length > 0;
}

/**
 * Persist a pre-production breakdown into scene/shot/reference rows.
 * Maps reference names → ids so shots carry referenceIds.
 */
export async function persistBreakdown(projectId: string, breakdown: Breakdown): Promise<void> {
  // Idempotent: clear any existing breakdown so re-runs don't duplicate.
  await db.delete(shot).where(eq(shot.projectId, projectId));
  await db.delete(scene).where(eq(scene.projectId, projectId));
  await db.delete(reference).where(eq(reference.projectId, projectId));

  // References first (so we can resolve names → ids)
  const refNameToId = new Map<string, string>();
  if (breakdown.references?.length) {
    const refRows = await db
      .insert(reference)
      .values(
        breakdown.references.map((r) => ({
          projectId,
          kind: (r.kind as Reference['kind']) ?? 'style',
          name: r.name,
          description: r.description
        }))
      )
      .returning();
    for (const r of refRows) refNameToId.set(r.name, r.id);
  }

  let shotOrder = 0;
  for (let si = 0; si < breakdown.scenes.length; si++) {
    const sc = breakdown.scenes[si];
    const [sceneRow] = await db
      .insert(scene)
      .values({
        projectId,
        orderIndex: si,
        title: sc.title,
        summary: sc.summary,
        mood: sc.mood,
        narration: sc.narration
      })
      .returning();

    if (sc.shots?.length) {
      await db.insert(shot).values(
        sc.shots.map((sh) => ({
          projectId,
          sceneId: sceneRow.id,
          orderIndex: shotOrder++,
          prompt: sh.prompt,
          narration: sh.narration ?? '',
          cameraNotes: sh.cameraNotes ?? '',
          durationSec: sh.durationSec ?? 5,
          chainFromPrevious: !!sh.chainFromPrevious,
          referenceIds: (sh.referenceNames ?? [])
            .map((n) => refNameToId.get(n))
            .filter((x): x is string => !!x),
          status: 'pending' as ShotStatus
        }))
      );
    }
  }

  // Persist a flat script + move to storyboard stage
  await db
    .update(project)
    .set({
      scriptText: breakdown.scenes.map((s) => s.narration).filter(Boolean).join('\n\n'),
      title: breakdown.title || undefined,
      status: 'storyboard',
      updatedAt: new Date()
    })
    .where(eq(project.id, projectId));
}

/* -------------------------------------------------------------------------- */
/*  Shots                                                                     */
/* -------------------------------------------------------------------------- */
export async function getShot(shotId: string): Promise<Shot | null> {
  const rows = await db.select().from(shot).where(eq(shot.id, shotId)).limit(1);
  return rows[0] ?? null;
}

export async function updateShot(shotId: string, patch: Partial<Shot>): Promise<void> {
  await db.update(shot).set({ ...patch, updatedAt: new Date() }).where(eq(shot.id, shotId));
}

/* -------------------------------------------------------------------------- */
/*  Assets                                                                    */
/* -------------------------------------------------------------------------- */
export async function createAsset(input: {
  projectId: string;
  kind: AssetKind;
  bucket: string;
  objectKey: string;
  url?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSec?: number;
  jobId?: string;
  meta?: Record<string, unknown>;
}): Promise<Asset> {
  const [row] = await db.insert(asset).values(input).returning();
  return row;
}

export async function getAssetsByIds(ids: string[]): Promise<Asset[]> {
  if (!ids.length) return [];
  return db.select().from(asset).where(inArray(asset.id, ids));
}

/* -------------------------------------------------------------------------- */
/*  Jobs                                                                      */
/* -------------------------------------------------------------------------- */
export async function createJob(input: NewJob): Promise<Job> {
  const [row] = await db.insert(job).values(input).returning();
  return row;
}

export async function getJob(jobId: string): Promise<Job | null> {
  const rows = await db.select().from(job).where(eq(job.id, jobId)).limit(1);
  return rows[0] ?? null;
}

export async function updateJob(jobId: string, patch: Partial<Job>): Promise<void> {
  await db.update(job).set({ ...patch, updatedAt: new Date() }).where(eq(job.id, jobId));
}

/* -------------------------------------------------------------------------- */
/*  Credits — wallet (fast balance) + ledger (audit)                          */
/* -------------------------------------------------------------------------- */
export async function getOrCreateWallet(userId: string): Promise<{ balance: number; lifetimeSpent: number }> {
  const rows = await db.select().from(creditWallet).where(eq(creditWallet.userId, userId)).limit(1);
  if (rows[0]) return { balance: rows[0].balance, lifetimeSpent: rows[0].lifetimeSpent };

  // First touch → create wallet with starter grant + ledger entry
  return db.transaction(async (tx) => {
    const existing = await tx.select().from(creditWallet).where(eq(creditWallet.userId, userId)).limit(1);
    if (existing[0]) return { balance: existing[0].balance, lifetimeSpent: existing[0].lifetimeSpent };
    await tx.insert(creditWallet).values({ userId, balance: STARTER_CREDITS, lifetimeSpent: 0 });
    await tx.insert(creditLedger).values({
      userId,
      amount: STARTER_CREDITS,
      balanceAfter: STARTER_CREDITS,
      reason: 'starter_grant'
    });
    return { balance: STARTER_CREDITS, lifetimeSpent: 0 };
  });
}

export class InsufficientCreditsError extends Error {
  constructor(public needed: number, public have: number) {
    super(`Insufficient credits: need ${needed}, have ${have}`);
    this.name = 'InsufficientCreditsError';
  }
}

/** Atomically debit credits, writing a ledger row. Throws if balance is too low. */
export async function debitCredits(input: {
  userId: string;
  amount: number;
  reason: string;
  jobId?: string;
  projectId?: string;
  modelKey?: string;
}): Promise<number> {
  if (input.amount <= 0) return (await getOrCreateWallet(input.userId)).balance;
  await getOrCreateWallet(input.userId); // ensure wallet exists
  return db.transaction(async (tx) => {
    const [w] = await tx.select().from(creditWallet).where(eq(creditWallet.userId, input.userId)).limit(1);
    if (!w || w.balance < input.amount) throw new InsufficientCreditsError(input.amount, w?.balance ?? 0);
    const balanceAfter = w.balance - input.amount;
    await tx
      .update(creditWallet)
      .set({ balance: balanceAfter, lifetimeSpent: w.lifetimeSpent + input.amount, updatedAt: new Date() })
      .where(eq(creditWallet.userId, input.userId));
    await tx.insert(creditLedger).values({
      userId: input.userId,
      amount: -input.amount,
      balanceAfter,
      reason: input.reason,
      jobId: input.jobId,
      projectId: input.projectId,
      modelKey: input.modelKey
    });
    return balanceAfter;
  });
}

/** Credit back (refund / top-up). */
export async function creditCredits(input: {
  userId: string;
  amount: number;
  reason: string;
  jobId?: string;
  projectId?: string;
  meta?: Record<string, unknown>;
}): Promise<number> {
  if (input.amount <= 0) return (await getOrCreateWallet(input.userId)).balance;
  await getOrCreateWallet(input.userId);
  return db.transaction(async (tx) => {
    const [w] = await tx.select().from(creditWallet).where(eq(creditWallet.userId, input.userId)).limit(1);
    const balanceAfter = (w?.balance ?? 0) + input.amount;
    await tx.update(creditWallet).set({ balance: balanceAfter, updatedAt: new Date() }).where(eq(creditWallet.userId, input.userId));
    await tx.insert(creditLedger).values({
      userId: input.userId,
      amount: input.amount,
      balanceAfter,
      reason: input.reason,
      jobId: input.jobId,
      projectId: input.projectId,
      meta: input.meta ?? {}
    });
    return balanceAfter;
  });
}

export async function getLedger(userId: string, limit = 50) {
  return db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId))
    .orderBy(desc(creditLedger.createdAt))
    .limit(limit);
}

/**
 * Check whether a Stripe checkout session has already been credited.
 * Used for idempotency — the webhook and the success page fallback both call
 * creditCredits with the same stripeSessionId; only the first one should land.
 */
export async function hasStripeSessionCredited(stripeSessionId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: creditLedger.id })
    .from(creditLedger)
    .where(sql`${creditLedger.meta}->>'stripeSessionId' = ${stripeSessionId}`)
    .limit(1);
  return !!row;
}

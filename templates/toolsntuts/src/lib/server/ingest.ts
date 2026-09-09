import { env } from '$env/dynamic/private';
import { uploadFromBuffer, uploadFromBufferWithProgress } from './minio';
import { createAsset } from '$lib/db/media-queries';
import type { Asset, AssetKind } from '$lib/db/media';

const BUCKET = env.MINIO_BUCKET;

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav'
};

function extFor(contentType: string, url = ''): string {
  if (EXT_BY_MIME[contentType]) return EXT_BY_MIME[contentType];
  const m = url.split('?')[0].match(/\.([a-z0-9]{2,5})$/i);
  return m ? m[1].toLowerCase() : 'bin';
}

/**
 * Download a remote media URL into MinIO and create an asset row.
 * If MinIO is unreachable the asset is still created with the source URL so
 * generation never fails due to storage being temporarily down.
 */
export async function ingestUrlToAsset(input: {
  projectId: string;
  kind: AssetKind;
  url: string;
  jobId?: string;
  meta?: Record<string, unknown>;
}): Promise<Asset> {
  const res = await fetch(input.url);
  if (!res.ok) throw new Error(`ingest: failed to download ${input.url} (HTTP ${res.status})`);
  const contentType = res.headers.get('content-type')?.split(';')[0] || 'application/octet-stream';
  const buffer = Buffer.from(await res.arrayBuffer());
  const objectKey = `projects/${input.projectId}/${input.kind}/${crypto.randomUUID()}.${extFor(contentType, input.url)}`;

  let assetUrl = input.url;
  let storedInMinio = false;

  try {
    const up = await uploadFromBuffer(BUCKET, objectKey, buffer, contentType);
    assetUrl = up.directUrl;
    storedInMinio = true;
  } catch (err) {
    console.error('[ingest] MinIO upload failed, using source URL as fallback:', err);
  }

  return createAsset({
    projectId: input.projectId,
    kind: input.kind,
    bucket: storedInMinio ? BUCKET : 'external',
    objectKey: storedInMinio ? objectKey : input.url,
    url: assetUrl,
    mimeType: contentType,
    sizeBytes: buffer.length,
    jobId: input.jobId,
    meta: { ...input.meta, sourceUrl: input.url, storedInMinio }
  });
}

export interface IngestProgressHooks {
  onDownload?: (loaded: number, total: number) => void;
  onUpload?: (loaded: number, total: number) => void;
}

/**
 * Like ingestUrlToAsset, but streams the download and upload so callers can
 * report byte-level progress (used by the SSE generation stream).
 */
export async function ingestUrlToAssetWithProgress(
  input: { projectId: string; kind: AssetKind; url: string; jobId?: string; meta?: Record<string, unknown> },
  hooks: IngestProgressHooks = {}
): Promise<Asset> {
  const res = await fetch(input.url);
  if (!res.ok) throw new Error(`ingest: failed to download ${input.url} (HTTP ${res.status})`);
  const contentType = res.headers.get('content-type')?.split(';')[0] || 'application/octet-stream';
  const total = Number(res.headers.get('content-length')) || 0;

  // Streamed download with byte progress
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  const reader = res.body?.getReader();
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        hooks.onDownload?.(loaded, total || loaded);
      }
    }
  }
  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  hooks.onDownload?.(buffer.length, buffer.length);

  const objectKey = `projects/${input.projectId}/${input.kind}/${crypto.randomUUID()}.${extFor(contentType, input.url)}`;

  let assetUrl = input.url;
  let storedInMinio = false;

  try {
    const up = await uploadFromBufferWithProgress(BUCKET, objectKey, buffer, contentType, (sent, t) => hooks.onUpload?.(sent, t));
    assetUrl = up.directUrl;
    storedInMinio = true;
  } catch (err) {
    console.error('[ingest] MinIO upload failed, using source URL as fallback:', err);
  }

  return createAsset({
    projectId: input.projectId,
    kind: input.kind,
    bucket: storedInMinio ? BUCKET : 'external',
    objectKey: storedInMinio ? objectKey : input.url,
    url: assetUrl,
    mimeType: contentType,
    sizeBytes: buffer.length,
    jobId: input.jobId,
    meta: { ...input.meta, sourceUrl: input.url, storedInMinio }
  });
}

/** Persist base64 bytes (e.g. ElevenLabs mp3) into MinIO + an asset row. */
export async function ingestBase64ToAsset(input: {
  projectId: string;
  kind: AssetKind;
  base64: string;
  mimeType: string;
  jobId?: string;
  durationSec?: number;
  meta?: Record<string, unknown>;
}): Promise<Asset> {
  const buffer = Buffer.from(input.base64, 'base64');
  const objectKey = `projects/${input.projectId}/${input.kind}/${crypto.randomUUID()}.${extFor(input.mimeType)}`;

  let assetUrl: string | undefined;
  let storedInMinio = false;

  try {
    const up = await uploadFromBuffer(BUCKET, objectKey, buffer, input.mimeType);
    assetUrl = up.directUrl;
    storedInMinio = true;
  } catch (err) {
    console.error('[ingest] MinIO upload failed for base64 asset:', err);
  }

  return createAsset({
    projectId: input.projectId,
    kind: input.kind,
    bucket: storedInMinio ? BUCKET : 'external',
    objectKey: storedInMinio ? objectKey : '',
    url: assetUrl,
    mimeType: input.mimeType,
    sizeBytes: buffer.length,
    durationSec: input.durationSec,
    jobId: input.jobId,
    meta: { ...input.meta, storedInMinio }
  });
}

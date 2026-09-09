/**
 * Pipeline error handling with role-aware messaging.
 *
 * - Server logs always get the full raw provider error (for debugging).
 * - Admins/super-admins get the detailed cause on the client (e.g. "OpenRouter
 *   out of credits — top up").
 * - Normal users get a clean message and never see provider names, URLs, or
 *   token math.
 */

const ADMIN_ROLES = ['admin', 'superadmin', 'super_admin'];

export function isPrivileged(user?: { role?: string | null } | null): boolean {
  const role = user?.role;
  if (!role) return false;
  return role
    .split(',')
    .map((r) => r.trim().toLowerCase())
    .some((r) => ADMIN_ROLES.includes(r));
}

export type PipelineErrorKind = 'provider_credits' | 'provider_auth' | 'provider_rate' | 'provider_error' | 'unknown';

export interface ClassifiedError {
  status: number;
  kind: PipelineErrorKind;
  userMessage: string;
  adminMessage: string;
  logMessage: string;
}

function rawText(raw: unknown): string {
  if (raw instanceof Error) return raw.message;
  if (typeof raw === 'string') return raw;
  try {
    return JSON.stringify(raw);
  } catch {
    return String(raw);
  }
}

/** Pull a human-readable message out of an embedded provider JSON error. */
function extractProviderMessage(text: string): string {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) {
      const obj = JSON.parse(m[0]);
      return obj?.message || obj?.error?.message || text;
    }
  } catch {
    /* not JSON — fall through */
  }
  return text;
}

export function classifyPipelineError(raw: unknown): ClassifiedError {
  const text = rawText(raw);
  const lower = text.toLowerCase();
  const detail = extractProviderMessage(text);

  // Provider out of credits / quota (e.g. OpenRouter or kie.ai 402)
  if (
    lower.includes('402') ||
    lower.includes('requires more credits') ||
    lower.includes('add more credits') ||
    lower.includes('insufficient balance') ||
    lower.includes('insufficient_quota') ||
    lower.includes('quota')
  ) {
    return {
      status: 503,
      kind: 'provider_credits',
      userMessage:
        'Generation is temporarily unavailable — the studio has hit a credits limit. Please try again later or contact support.',
      adminMessage: `AI provider is out of credits/quota — top up the provider account. Provider said: ${detail}`,
      logMessage: text
    };
  }

  // Provider auth / permission
  if (lower.includes('401') || lower.includes('403') || lower.includes('unauthorized') || lower.includes('permission')) {
    return {
      status: 503,
      kind: 'provider_auth',
      userMessage: 'Generation is temporarily unavailable. Please try again later or contact support.',
      adminMessage: `Provider auth/permission error — check API keys/scopes. Provider said: ${detail}`,
      logMessage: text
    };
  }

  // Rate limited
  if (lower.includes('429') || lower.includes('rate limit') || lower.includes('too many requests')) {
    return {
      status: 503,
      kind: 'provider_rate',
      userMessage: "We're generating a lot right now — please try again in a moment.",
      adminMessage: `Provider rate limit hit. Provider said: ${detail}`,
      logMessage: text
    };
  }

  // Other upstream provider error (5xx etc.)
  if (lower.includes('http 5') || lower.includes('500') || lower.includes('502') || lower.includes('timeout')) {
    return {
      status: 502,
      kind: 'provider_error',
      userMessage: 'The generation service had a hiccup. Please try again.',
      adminMessage: `Upstream provider error. Provider said: ${detail}`,
      logMessage: text
    };
  }

  return {
    status: 502,
    kind: 'unknown',
    userMessage: 'Something went wrong while generating. Please try again.',
    adminMessage: detail.slice(0, 600),
    logMessage: text
  };
}

/**
 * Classify a pipeline error, log the full detail server-side, and return the
 * status + message appropriate for the viewer's role.
 */
export function pipelineError(
  raw: unknown,
  user: { role?: string | null } | null | undefined,
  context = 'pipeline'
): { status: number; message: string; kind: PipelineErrorKind } {
  const c = classifyPipelineError(raw);
  console.error(`[pipeline:${context}] ${c.kind} → ${c.logMessage}`);
  return { status: c.status, message: isPrivileged(user) ? c.adminMessage : c.userMessage, kind: c.kind };
}

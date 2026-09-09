/**
 * Singleton state for a project breakdown that is in flight.
 * Persists across SvelteKit client-side navigation via module scope.
 * Survives hard refresh via sessionStorage.
 *
 * Lifecycle:
 *  1. Create page calls start(projectId, jobId) as soon as the SSE delivers IDs.
 *  2. The SSE consumer calls update(step, label) for each progress event.
 *  3. On minimize / page unload, the SSE closes but the server continues.
 *     Polling via /api/projects/:id/build-status takes over automatically.
 *  4. finish() or fail() terminates polling and clears storage.
 */

const STORAGE_KEY = 'xepho:pending-build';

interface Persisted {
  projectId: string;
  jobId: string | null;
  step: number;
  label: string;
}

class PendingBuildState {
  projectId = $state<string | null>(null);
  jobId = $state<string | null>(null);
  step = $state(0);
  label = $state('Building your project…');
  minimized = $state(false);
  done = $state(false);
  failed = $state(false);
  error = $state<string | null>(null);

  private timer: ReturnType<typeof setInterval> | null = null;

  get active(): boolean {
    return this.projectId !== null && !this.done;
  }

  /** Called when the SSE delivers the first jobId+projectId (within ~200ms of submit). */
  start(projectId: string, jobId: string | null, step = 1, label = 'Building your project…') {
    this.projectId = projectId;
    this.jobId = jobId;
    this.step = step;
    this.label = label;
    this.minimized = false;
    this.done = false;
    this.failed = false;
    this.error = null;
    this._save();
    this._startPolling();
  }

  /** Called for each progress step received from the SSE stream. */
  update(step: number, label: string, jobId?: string | null) {
    this.step = step;
    this.label = label;
    if (jobId) this.jobId = jobId;
    this._save();
  }

  minimize() {
    this.minimized = true;
  }

  expand() {
    this.minimized = false;
  }

  finish(projectId: string) {
    this.step = 5;
    this.label = 'Launching your studio';
    this.done = true;
    this.projectId = projectId;
    this.minimized = true; // show the "ready" chip
    this._stopPolling();
    this._clear();
  }

  fail(errMsg: string) {
    this.failed = true;
    this.error = errMsg;
    this.done = true;
    this.minimized = true;
    this._stopPolling();
    this._clear();
  }

  dismiss() {
    this.projectId = null;
    this.jobId = null;
    this.step = 0;
    this.label = '';
    this.minimized = false;
    this.done = false;
    this.failed = false;
    this.error = null;
    this._stopPolling();
    this._clear();
  }

  /** Call from layout onMount — re-attaches polling after a hard refresh. */
  restoreFromStorage() {
    if (typeof sessionStorage === 'undefined') return;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const val = JSON.parse(raw) as Persisted;
      if (!val.projectId) { this._clear(); return; }
      this.projectId = val.projectId;
      this.jobId = val.jobId ?? null;
      this.step = val.step ?? 1;
      this.label = val.label ?? 'Building…';
      this.minimized = true;
      this.done = false;
      this.failed = false;
      this.error = null;
      this._startPolling();
    } catch {
      this._clear();
    }
  }

  // ── internals ────────────────────────────────────────────────────────────────

  private _startPolling(intervalMs = 2_500) {
    this._stopPolling();
    this.timer = setInterval(() => this._poll(), intervalMs);
    // Poll immediately on start
    this._poll();
  }

  _stopPolling() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  private async _poll() {
    if (!this.projectId || this.done) return;
    try {
      const res = await fetch(`/api/projects/${this.projectId}/build-status`);
      if (!res.ok) return;
      const data = await res.json() as {
        ok: boolean; done?: boolean; failed?: boolean;
        step?: number; label?: string; error?: string;
        projectId?: string; jobId?: string;
      };
      if (!data.ok) return;
      if (data.jobId && !this.jobId) this.jobId = data.jobId;
      if (data.step) this.step = data.step;
      if (data.label) this.label = data.label;
      if (data.done) {
        if (data.failed) this.fail(data.error ?? 'Build failed');
        else this.finish(data.projectId ?? this.projectId!);
      }
    } catch { /* network error — keep polling */ }
  }

  private _save() {
    if (typeof sessionStorage === 'undefined') return;
    const val: Persisted = {
      projectId: this.projectId!,
      jobId: this.jobId,
      step: this.step,
      label: this.label
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(val));
  }

  private _clear() {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export const pendingBuild = new PendingBuildState();

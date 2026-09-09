type CreditsData = { remaining: number | null };

class CreditsState {
  data = $state<CreditsData | null>(null);
  loading = $state(false);
  error = $state<string | null>(null);

  private timer: ReturnType<typeof setInterval> | null = null;

  async refresh() {
    this.loading = true;
    try {
      const res = await fetch('/api/admin/wavespeed-balance', { credentials: 'include' });
      const text = await res.text();
      let payload: any = null;
      try { payload = text ? JSON.parse(text) : null; } catch { /* ignore */ }
      if (!res.ok || !payload?.ok) {
        this.error = payload?.error || `HTTP ${res.status}`;
        return;
      }
      this.data = { remaining: payload.remaining ?? null };
      this.error = null;
    } catch (err: any) {
      this.error = err?.message || 'Network error';
    } finally {
      this.loading = false;
    }
  }

  startPolling(intervalMs = 60_000) {
    this.stopPolling();
    this.timer = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) this.refresh();
    }, intervalMs);
  }

  stopPolling() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }
}

export const creditsState = new CreditsState();

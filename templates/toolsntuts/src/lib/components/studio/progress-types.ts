export type StepKey = 'submit' | 'generate' | 'download' | 'upload' | 'done';

export interface Step {
  key: StepKey;
  label: string;
  status: 'pending' | 'active' | 'done';
  startedAt?: number;
  durationMs?: number;
  detail?: string;
  pctBytes?: number | null;
}

export interface Prog {
  kind: 'video' | 'image';
  steps: Step[];
  pct: number; // generation % from the model
  error?: string;
  startedAt: number;
}

export const STEP_ORDER: StepKey[] = ['submit', 'generate', 'download', 'upload', 'done'];

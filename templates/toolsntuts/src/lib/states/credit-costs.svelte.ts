type CostEntry = { credits: number; description: string };

const COST_TABLE: Record<string, CostEntry> = {
  image_generate: { credits: 2, description: 'Storyboard image' },
  storyboard_image: { credits: 2, description: 'Storyboard image' },
  video_generate: { credits: 40, description: 'Video clip' },
  shot_video: { credits: 40, description: 'Video clip' },
  voiceover: { credits: 1, description: 'Voiceover line' },
  audio_voice: { credits: 1, description: 'Voiceover line' },
  assemble: { credits: 0, description: 'Video assembly' },
};

class CreditCostsState {
  cost(operation: string): CostEntry {
    return COST_TABLE[operation] ?? { credits: 0, description: operation };
  }
}

export const creditCosts = new CreditCostsState();

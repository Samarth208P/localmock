/// <reference lib="webworker" />

import type { GenerationJob } from '@localmock/core/jobs';
import { runDatasetLoop, type CanonicalDataset } from '@localmock/core/loops';

interface ValidationRequest {
  type: 'validate-dataset';
  job: GenerationJob;
  dataset: CanonicalDataset;
  maxIterations: number;
}

self.onmessage = async (event: MessageEvent<ValidationRequest>) => {
  if (event.data.type !== 'validate-dataset') return;
  try {
    const result = await runDatasetLoop(event.data.job, event.data.dataset, event.data.maxIterations, (entry) => {
      self.postMessage({ type: 'validation-transition', entry });
    });
    self.postMessage({ type: 'validation-complete', result });
  } catch (cause) {
    self.postMessage({
      type: 'validation-error',
      message: cause instanceof Error ? cause.message : 'Dataset validation worker failed.',
    });
  }
};

export {};

import { describe, expect, it } from 'vitest';
import { applyChaos } from './applyChaos';
import type { ChaosConfig } from './types';

const config: ChaosConfig = {
  rate: 30,
  types: {
    nullInjection: true,
    whitespace: false,
    encoding: false,
    casing: false,
    formatStrip: false,
  },
};

describe('applyChaos', () => {
  it('uses the injected random source deterministically', () => {
    expect(applyChaos('value', config, () => 0)).toBeNull();
    expect(applyChaos('value', config, () => 0.99)).toBe('value');
  });
});

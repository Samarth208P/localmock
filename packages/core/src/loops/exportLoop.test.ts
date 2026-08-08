import { describe, expect, it } from 'vitest';
import { verifyExportArtifact } from './exportLoop';

describe('verifyExportArtifact', () => {
  it('verifies JSON and JSONL row counts', () => {
    expect(verifyExportArtifact({ content: '[{"id":1}]', format: 'json', expectedRows: 1 }).ok).toBe(true);
    expect(verifyExportArtifact({ content: '{"id":1}\n{"id":2}\n', format: 'jsonl', expectedRows: 2 }).ok).toBe(true);
  });

  it('rejects malformed or incomplete artifacts', () => {
    expect(verifyExportArtifact({ content: '{bad json}', format: 'json', expectedRows: 1 }).ok).toBe(false);
    const mismatch = verifyExportArtifact({ content: '[]', format: 'json', expectedRows: 1 });
    expect(mismatch.errors[0].code).toBe('EXPORT_ROW_COUNT_MISMATCH');
  });
});

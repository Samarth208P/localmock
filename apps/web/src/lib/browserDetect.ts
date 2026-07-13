/**
 * Detects whether the File System Access API is available (Chromium only).
 * Used to determine the export engine strategy.
 */
export function supportsFileSystemAccess(): boolean {
  return 'showSaveFilePicker' in window;
}

/**
 * Returns the maximum recommended row count based on browser capabilities.
 * Chromium: unlimited (streams to disk)
 * Others: 50,000 (in-memory Blob)
 */
export function getMaxRowCount(schemaColumnCount: number): number {
  if (supportsFileSystemAccess()) {
    return Infinity;
  }

  // Scale down for wide schemas to avoid OOM
  // Base: 50k rows for ~10 columns, reduce proportionally
  const baseRows = 50_000;
  const baseColumns = 10;

  if (schemaColumnCount <= baseColumns) return baseRows;
  return Math.max(10_000, Math.floor(baseRows * (baseColumns / schemaColumnCount)));
}

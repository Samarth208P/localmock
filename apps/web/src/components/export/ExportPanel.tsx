import { useState } from 'react';
import { SQL_DIALECTS } from '@/lib/constants';
import { serializeCSV, serializeJSON, serializeJSONL, serializeSQL, serializeMSW, serializeTSArray, serializeTSV, serializeCassandraCQL, serializeFirebase, serializeInfluxDB, serializeXML, serializeDBUnitXML, serializeExcelXML, serializeCustom } from '@localmock/core/exports';
import { verifyExportArtifact, type LoopDiagnostic } from '@localmock/core/loops';
import { supportsFileSystemAccess } from '@/lib/browserDetect';
import { showToast } from '@/components/shared/Toast';
import { useStreamingExport } from '@/hooks/useStreamingExport';
import { StreamingProgress } from './StreamingProgress';
import { IconFile, IconBraces, IconNewline, IconDatabase, IconPlug, IconPackage } from '@/components/shared/Icons';
import type { FieldDef } from '@/workers/generation.worker';

interface ExportPanelProps {
  rows: Record<string, unknown>[];
  tableName: string;
  fieldDefs?: FieldDef[];
  totalRowCount?: number;
  canExport: boolean;
  validationErrors?: LoopDiagnostic[];
}

interface SaveFileHandle {
  createWritable: () => Promise<{
    write: (content: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

interface FilePickerWindow {
  showSaveFilePicker: (options: {
    suggestedName: string;
    types: Array<{ description: string; accept: Record<string, string[]> }>;
  }) => Promise<SaveFileHandle>;
}
const FORMATS = [
  { id: 'csv', label: 'CSV', Icon: IconFile, desc: 'Comma-separated values' },
  { id: 'json', label: 'JSON', Icon: IconBraces, desc: 'Array of objects' },
  { id: 'jsonl', label: 'JSON Lines', Icon: IconNewline, desc: 'One object per line' },
  { id: 'tsv', label: 'Tab-Delimited', Icon: IconFile, desc: 'Tab-separated values' },
  { id: 'sql', label: 'SQL', Icon: IconDatabase, desc: 'Ready for your database' },
  { id: 'cql', label: 'Cassandra CQL', Icon: IconDatabase, desc: 'Cassandra inserts' },
  { id: 'firebase', label: 'Firebase', Icon: IconBraces, desc: 'Firebase JSON tree' },
  { id: 'influx', label: 'InfluxDB', Icon: IconDatabase, desc: 'Line protocol format' },
  { id: 'custom', label: 'Custom', Icon: IconFile, desc: 'Custom template' },
  { id: 'excel', label: 'Excel', Icon: IconFile, desc: 'XML Spreadsheet 2003' },
  { id: 'xml', label: 'XML', Icon: IconBraces, desc: 'Basic XML dataset' },
  { id: 'dbunit', label: 'DBUnit XML', Icon: IconBraces, desc: 'DBUnit dataset format' },
  { id: 'msw', label: 'MSW Handler', Icon: IconPlug, desc: 'Mock Service Worker' },
  { id: 'ts', label: 'TS Array', Icon: IconPackage, desc: 'TypeScript constant' },
] as const;

export function ExportPanel({ rows, tableName, fieldDefs, totalRowCount, canExport, validationErrors = [] }: ExportPanelProps) {
  const [sqlDialect, setSqlDialect] = useState<(typeof SQL_DIALECTS)[number]>('postgres');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  const [allowInvalidExport, setAllowInvalidExport] = useState(false);
  const hasFSAA = supportsFileSystemAccess();
  const { startStreaming, isStreaming, progress: streamProgress, error: streamError, isAvailable: streamAvailable } = useStreamingExport();

  const rowCount = totalRowCount || rows.length;
  const exportAllowed = canExport || allowInvalidExport;
  const canStream = streamAvailable && rowCount > 50000 && fieldDefs && fieldDefs.length > 0;

  const doDownload = async (formatId: string) => {
    if (rows.length === 0 || !exportAllowed) return;
    setIsExporting(formatId);

    try {
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (formatId) {
        case 'csv':
          content = serializeCSV(rows);
          filename = `localmock.csv`;
          mimeType = 'text/csv';
          break;
        case 'json':
          content = serializeJSON(rows);
          filename = `localmock.json`;
          mimeType = 'application/json';
          break;
        case 'jsonl':
          content = serializeJSONL(rows);
          filename = `localmock.jsonl`;
          mimeType = 'application/jsonl';
          break;
        case 'tsv':
          content = serializeTSV(rows);
          filename = `localmock.tsv`;
          mimeType = 'text/tab-separated-values';
          break;
        case 'sql':
          content = serializeSQL(rows, tableName, sqlDialect);
          filename = `localmock.sql`;
          mimeType = 'text/sql';
          break;
        case 'cql':
          content = serializeCassandraCQL(rows, tableName);
          filename = `localmock.cql`;
          mimeType = 'text/plain';
          break;
        case 'firebase':
          content = serializeFirebase(rows, tableName);
          filename = `localmock.firebase.json`;
          mimeType = 'application/json';
          break;
        case 'influx':
          content = serializeInfluxDB(rows, tableName);
          filename = `localmock.influx.txt`;
          mimeType = 'text/plain';
          break;
        case 'custom':
          // Using a simple default template for Custom
          content = serializeCustom(rows, `{{id}} - {{name}}`);
          filename = `localmock.custom.txt`;
          mimeType = 'text/plain';
          break;
        case 'excel':
          content = serializeExcelXML(rows);
          filename = `localmock.xls`;
          mimeType = 'application/vnd.ms-excel';
          break;
        case 'xml':
          content = serializeXML(rows);
          filename = `localmock.xml`;
          mimeType = 'application/xml';
          break;
        case 'dbunit':
          content = serializeDBUnitXML(rows, tableName);
          filename = `localmock.dbunit.xml`;
          mimeType = 'application/xml';
          break;
        case 'msw':
          content = serializeMSW(rows, `/api/${tableName}`);
          filename = `localmock.handlers.ts`;
          mimeType = 'text/typescript';
          break;
        case 'ts':
          content = serializeTSArray(rows, tableName);
          filename = `localmock.data.ts`;
          mimeType = 'text/typescript';
          break;
        default:
          content = serializeJSON(rows);
          filename = `localmock.json`;
          mimeType = 'application/json';
      }

      const verificationFormat = formatId === 'ts' ? 'typescript' : formatId;
      const verification = verifyExportArtifact({
        content,
        format: verificationFormat as Parameters<typeof verifyExportArtifact>[0]['format'],
        expectedRows: rows.length,
      });
      if (!verification.ok) throw new Error(verification.errors[0]?.message ?? 'Export verification failed.');

      if (hasFSAA && rows.length > 10000) {
        try {
          const handle = await (window as unknown as FilePickerWindow).showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'Export file', accept: { [mimeType]: [`.${filename.split('.').pop()}`] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();
          setIsExporting(null);
          setExpandedFormat(null);
          return;
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === 'AbortError') {
            setIsExporting(null);
            return;
          }
        }
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed.';
      console.error('Export failed:', err);
      showToast(message, 'error');
    }

    setIsExporting(null);
    setExpandedFormat(null);
  };

  const doCopy = async () => {
    if (rows.length === 0 || !exportAllowed) return;
    try {
      const content = serializeJSON(rows);
      const verification = verifyExportArtifact({ content, format: 'json', expectedRows: rows.length });
      if (!verification.ok) throw new Error(verification.errors[0]?.message ?? 'Copy verification failed.');
      await navigator.clipboard.writeText(content);
      showToast('Copied to clipboard');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-text-primary">Download</h3>
        <p className="mt-1 text-xs text-text-muted">
          {rows.length.toLocaleString()} rows ready
        </p>
      </div>

      {/* Copy to clipboard (small datasets) */}
      {rows.length > 0 && rows.length <= 100 && (
        <button
          onClick={doCopy}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-bg-secondary py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-accent/40 hover:bg-accent/[0.03] transition-all duration-200 active:scale-[0.98]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy JSON to Clipboard
        </button>
      )}

      {!canExport && (
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-[11px] text-amber-300">
          <p className="font-semibold">Export blocked until validation passes</p>
          <p className="mt-1 opacity-80">{validationErrors[0]?.message ?? 'The canonical dataset is not ready.'}</p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-[10px] text-text-secondary">
            <input
              type="checkbox"
              checked={allowInvalidExport}
              onChange={(event) => setAllowInvalidExport(event.target.checked)}
              className="mt-0.5 accent-accent"
            />
            I understand the validation failures and explicitly want to export this dataset.
          </label>
        </div>
      )}

      {/* Streaming export for large datasets */}
      {canStream && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-text-secondary">Stream to File</span>
            <span className="rounded-md bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">1M+ rows</span>
          </div>

          {isStreaming && streamProgress ? (
            <StreamingProgress
              generated={streamProgress.generated}
              total={streamProgress.total}
              eta={streamProgress.eta}
              percent={streamProgress.percent}
            />
          ) : (
            <div className="flex gap-1.5">
              {(['csv', 'json', 'jsonl', 'sql'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => startStreaming(fieldDefs!, rowCount, fmt, tableName, sqlDialect)}
                  disabled={isStreaming || !exportAllowed}
                  className="flex-1 rounded-lg border border-border-subtle bg-bg-secondary py-2 text-[11px] font-medium text-text-secondary hover:border-accent/40 hover:text-accent transition-all disabled:opacity-50"
                >
                  .{fmt}
                </button>
              ))}
            </div>
          )}

          {streamError && (
            <p className="text-[11px] text-error">{streamError}</p>
          )}
        </div>
      )}

      {/* Format cards */}
      <div className="space-y-2">
        {FORMATS.map((f) => {
          const isExpanded = expandedFormat === f.id;

          return (
            <div
              key={f.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-accent/40 bg-accent/[0.03]'
                  : 'border-border-subtle bg-bg-secondary hover:border-accent/30'
              }`}
            >
              {/* Card header — clickable to expand */}
              <button
                onClick={() => setExpandedFormat(isExpanded ? null : f.id)}
                disabled={isExporting !== null || !exportAllowed}
                className="w-full flex items-center gap-3 p-3.5 text-left transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
              >
                <span className="text-text-muted flex-shrink-0 w-6 flex items-center justify-center">
                  <f.Icon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{f.label}</p>
                  <p className="text-[11px] text-text-muted">{f.desc}</p>
                </div>
                <span className={`text-xs text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {/* Expanded: confirm download inline */}
              {isExpanded && (
                <div className="animate-scale-in border-t border-border-subtle/50 px-3.5 pb-3.5 pt-3 space-y-3">
                  <p className="text-xs text-text-muted">
                    {rows.length.toLocaleString()} rows → <span className="font-mono text-text-secondary">localmock.{f.id === 'msw' ? 'handlers.ts' : f.id === 'ts' ? 'data.ts' : f.id}</span>
                  </p>

                  {/* SQL dialect picker (only for SQL) */}
                  {f.id === 'sql' && (
                    <div className="flex gap-1.5">
                      {SQL_DIALECTS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setSqlDialect(d)}
                          className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition-all duration-200 ${
                            sqlDialect === d
                              ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                              : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Download + Cancel */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => doDownload(f.id)}
                      disabled={isExporting !== null || !exportAllowed}
                      className="flex-1 rounded-lg bg-accent py-2 text-xs font-medium text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:opacity-60"
                    >
                      {isExporting === f.id ? 'Downloading...' : `Download .${f.id === 'msw' ? 'ts' : f.id === 'ts' ? 'ts' : f.id}`}
                    </button>
                    <button
                      onClick={() => setExpandedFormat(null)}
                      className="rounded-lg border border-border-subtle px-3 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

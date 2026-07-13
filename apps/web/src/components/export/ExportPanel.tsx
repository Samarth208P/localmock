import { useState } from 'react';
import { SQL_DIALECTS } from '@/lib/constants';
import { serializeCSV, serializeJSON, serializeJSONL, serializeSQL, serializeMSW, serializeTSArray } from '@localmock/core/exports';
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
}

const FORMATS = [
  { id: 'csv', label: 'CSV', Icon: IconFile, desc: 'Comma-separated values' },
  { id: 'json', label: 'JSON', Icon: IconBraces, desc: 'Array of objects' },
  { id: 'jsonl', label: 'JSON Lines', Icon: IconNewline, desc: 'One object per line' },
  { id: 'sql', label: 'SQL INSERT', Icon: IconDatabase, desc: 'Ready for your database' },
  { id: 'msw', label: 'MSW Handler', Icon: IconPlug, desc: 'Mock Service Worker' },
  { id: 'ts', label: 'TS Array', Icon: IconPackage, desc: 'TypeScript constant' },
] as const;

export function ExportPanel({ rows, tableName, fieldDefs, totalRowCount }: ExportPanelProps) {
  const [sqlDialect, setSqlDialect] = useState<string>('postgres');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);
  const hasFSAA = supportsFileSystemAccess();
  const { startStreaming, isStreaming, progress: streamProgress, error: streamError, isAvailable: streamAvailable } = useStreamingExport();

  const rowCount = totalRowCount || rows.length;
  const canStream = streamAvailable && rowCount > 50000 && fieldDefs && fieldDefs.length > 0;

  const doDownload = async (formatId: string) => {
    if (rows.length === 0) return;
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
        case 'sql':
          content = serializeSQL(rows, tableName, sqlDialect as 'postgres' | 'mysql' | 'sqlite');
          filename = `localmock.sql`;
          mimeType = 'text/sql';
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

      if (hasFSAA && rows.length > 10000) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'Export file', accept: { [mimeType]: [`.${filename.split('.').pop()}`] } }],
          });
          const writable = await handle.createWritable();
          await writable.write(content);
          await writable.close();
          setIsExporting(null);
          setExpandedFormat(null);
          return;
        } catch (err: any) {
          if (err.name === 'AbortError') {
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
      console.error('Export failed:', err);
    }

    setIsExporting(null);
    setExpandedFormat(null);
  };

  const doCopy = async () => {
    if (rows.length === 0) return;
    try {
      const content = serializeJSON(rows);
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
                  onClick={() => startStreaming(fieldDefs!, rowCount, fmt, tableName, sqlDialect as any)}
                  disabled={isStreaming}
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
                disabled={isExporting !== null}
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
                      disabled={isExporting !== null}
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

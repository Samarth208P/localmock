import type { FieldRow } from '@/components/editor/FieldBuilder';

/**
 * Encode fields to a URL-safe base64 string and update the browser URL.
 */
export function encodeSchemaToUrl(fields: FieldRow[]): void {
  const stripped = fields
    .filter((f) => f.name.trim())
    .map((f) => ({
      n: f.name,
      t: f.typeId,
      o: Object.keys(f.options).length > 0 ? f.options : undefined,
      u: f.unique || undefined,
    }));

  const json = JSON.stringify(stripped);
  const encoded = btoa(unescape(encodeURIComponent(json)));
  window.history.replaceState(null, '', '?s=' + encoded);
}

/**
 * Decode fields from the current URL's `?s=` parameter.
 * Returns null if no valid schema is found in the URL.
 */
export function decodeSchemaFromUrl(): FieldRow[] | null {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('s');

  if (!encoded) return null;

  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);

    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    return parsed.map((f: { n: string; t: string; o?: Record<string, unknown>; u?: boolean }, i: number) => ({
      id: `url-${i}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.n,
      typeId: f.t,
      options: f.o || {},
      unique: f.u || false,
    }));
  } catch {
    return null;
  }
}

/**
 * Clear the schema parameter from the URL without reload.
 */
export function clearSchemaFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('s');
  window.history.replaceState(null, '', url.pathname + url.search || '/');
}

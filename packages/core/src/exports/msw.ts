/**
 * Serializes rows as a Mock Service Worker (MSW) handler.
 */
export function serializeMSW(
  rows: Record<string, unknown>[],
  endpoint: string = '/api/data',
): string {
  const jsonData = JSON.stringify(rows, null, 2);

  return `import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('${endpoint}', () => {
    return HttpResponse.json(${jsonData});
  }),
];
`;
}

/**
 * LocalMock Analytics Worker
 * Deployed to stats.localmock.in
 *
 * Endpoints:
 *   POST /increment  — { rows: number } — increment total generation count
 *   GET  /stats      — returns { totalRows, totalGenerations }
 */

/// <reference types="@cloudflare/workers-types" />

interface Env {
  STATS: KVNamespace;
  ALLOWED_ORIGIN: string;
}

const KV_TOTAL_ROWS = 'total_rows';
const KV_TOTAL_GENERATIONS = 'total_generations';

function corsHeaders(origin: string, allowedOrigin: string): Record<string, string> {
  const isAllowed = origin === allowedOrigin || allowedOrigin === '*';
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin, env.ALLOWED_ORIGIN);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers });
    }

    // POST /increment
    if (request.method === 'POST' && url.pathname === '/increment') {
      try {
        const body = await request.json<{ rows?: number }>();
        const rows = typeof body.rows === 'number' && body.rows > 0 ? body.rows : 0;

        if (rows === 0) {
          return Response.json(
            { error: 'Invalid rows count' },
            { status: 400, headers },
          );
        }

        // Atomic-ish increment (KV is eventually consistent, acceptable for analytics)
        const currentRows = parseInt(await env.STATS.get(KV_TOTAL_ROWS) || '0', 10);
        const currentGens = parseInt(await env.STATS.get(KV_TOTAL_GENERATIONS) || '0', 10);

        await env.STATS.put(KV_TOTAL_ROWS, String(currentRows + rows));
        await env.STATS.put(KV_TOTAL_GENERATIONS, String(currentGens + 1));

        return Response.json(
          { success: true, totalRows: currentRows + rows, totalGenerations: currentGens + 1 },
          { headers },
        );
      } catch {
        return Response.json(
          { error: 'Invalid request body' },
          { status: 400, headers },
        );
      }
    }

    // GET /stats
    if (request.method === 'GET' && url.pathname === '/stats') {
      const totalRows = parseInt(await env.STATS.get(KV_TOTAL_ROWS) || '0', 10);
      const totalGenerations = parseInt(await env.STATS.get(KV_TOTAL_GENERATIONS) || '0', 10);

      return Response.json(
        { totalRows, totalGenerations },
        { headers },
      );
    }

    // 404 for everything else
    return Response.json(
      { error: 'Not found' },
      { status: 404, headers },
    );
  },
} satisfies ExportedHandler<Env>;

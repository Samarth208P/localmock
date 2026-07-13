# Product Requirements Document (PRD): LocalMock

## 1. Vision & Overview

LocalMock is a privacy-first, zero-latency data generation and chaos-testing utility. By offloading 100% of compute to the client's machine via Web Workers, it eliminates traditional server-side row limits (Mockaroo's 1,000-row cap), enabling developers to generate and stream unlimited rows of relational, complex data directly to disk. It merges the minimalist aesthetic of modern dev tools with enterprise-grade data corruption testing.

**V1 ships 100% free.** No paywalls. The strategy is SEO dominance and user-base capture before monetization.

## 2. Target Audience

- **Full-Stack Developers:** Needing rapid mock data for SaaS apps, APIs, and Web3/dApp environments.
- **QA Engineers:** Requiring chaotic, malformed data to stress-test UI bounds and database constraints.
- **Data Analysts:** Needing massive relational CSVs/SQL for local testing and schema prototyping.

## 3. Core Feature Specifications

### 3.1 Smart Schema Ingestion (Incremental Parser Pipeline)

**Input:** Users paste raw JSON, TypeScript interfaces, or Prisma schemas into a paste-first code editor.

**Parser Architecture:**
```
[User Input] → [Lexer/Tokenizer <15KB] → [AST Filter Matrix] → [Heuristic Classifier] → [Review & Confirm UI]
```

1. **Lexer/Tokenizer:** Lightweight, single-file TS scanner. Strips comments, decorators, metadata. Yields clean key-value primitives.
2. **AST Filter Matrix:**
   - Generics/complex types → fallback primitives
   - Unions (`'active' | 'pending'`) → `arrayElement(['active', 'pending'])`
   - Intersections/mapped types → flattened line-by-line
   - Prisma `@relation` → auto-DAG edge creation
3. **Heuristic Classifier:** Regex lookbehinds on field names:
   - `/.*(email|mail).*/i` → `Internet.email`
   - `/.*(wallet|addr|crypto).*/i` → `Crypto.ethAddress`
   - `/.*(uuid|id).*/i` → `UUID v4`
   - `/.*(created|updated|date).*/i` → `ISO Timestamp`
4. **Review & Confirm UI:**
   - High-confidence inferences: Green indicator, auto-locked
   - Ambiguous inferences: Yellow border, "Confirm Type" prompt
   - "Accept All" button clears ambiguities in one click
   - Unknown types degrade to `string.alphanumeric()` — never crashes

**Goal:** Time-to-First-Preview under 3 seconds for standard schemas.

### 3.2 Relational Engine (Directed Acyclic Graph)

**Architecture:**
```
[Define Tables] → [Topological Sort] → [Leaf Nodes First] → [ID Pool Extraction] → [FK Sampling in Children]
```

**UI Pattern:**
- Users build tables in parent-child hierarchy
- "Link to Table" dropdown shows existing tables
- Cardinality selection: 1:1 (strict index) or 1:N (user-specified range, e.g., 1-5)
- Prisma `@relation` auto-detection builds DAG automatically from pasted schema

**Circular Reference Prevention:**
- Dropdown disables tables that would create cycles
- Tooltip: "Linking to this table creates a circular reference"
- Error state is prevented, not handled after the fact

**Generation Logic:**
1. Topological sort determines execution order
2. Leaf nodes generated first, primary keys pushed to in-memory ID pool
3. Child nodes sample from parent ID pool via `arrayElement(parent_id_pool)`
4. 100% referential integrity guaranteed client-side

### 3.3 The Chaos Engine

- **Global slider:** 0% to 30% corruption rate
- **Column-level toggles** for selective corruption
- **Corruption types:**
  - Null injection (drops values to `null`/`undefined`)
  - Whitespace chaos (leading/trailing spaces, tabs, newlines)
  - Encoding stress (UTF-8 edge cases, emoji in text fields)
  - Mixed casing (inconsistent capitalization)
  - Format stripping (removes expected formatting)
- **Preview:** Chaos-affected rows visible in 1k sample buffer

### 3.4 Set-Based Unique & Sequential Constraints

- **Unique:** In-memory JavaScript `Set` tracking — no duplicates across 100k+ rows
- **Sequential:** Auto-incrementing custom strings (`ORD-001`, `ORD-002`, ...)

### 3.5 Export Engine (Dual-Mode)

| Browser | Engine | Row Limit | Transfer Mechanism |
|---------|--------|-----------|-------------------|
| Chromium (Chrome/Edge/Arc) | File System Access API | Unlimited (disk-bound) | Transferable Uint8Array (zero-copy) |
| Firefox/Safari | Blob Memory Engine | 50,000 (scaled by schema width) | Standard postMessage |

**Streaming Architecture (Chromium):**
```
[Generation Loop] → [Chunk Buffer (1000 rows)] → [TextEncoder → Uint8Array] → [Transfer to Main] → [FileSystemWritableFileStream]
```
- Heap never exceeds ~200KB per chunk
- Row limit = disk space, not RAM

**Fallback (Non-Chromium):**
- Dynamic row cap based on schema complexity
- Clean info badge explaining browser memory constraints
- Standard Blob download

**Preview vs. Export:**
- Preview: Fixed 1,000-row sample buffer (always in memory)
- Export: Completely separate streaming path
- During large exports, preview replaced with terminal-style progress log

**Error Recovery:**
- Worker crash mid-stream → partial file saved to disk
- Toast: "Generation halted at row X. Partial file saved."
- No resume in V1

### 3.6 Export Formats

| Format | Details |
|--------|---------|
| CSV | Standard comma-separated with proper escaping |
| JSON | Array of objects or JSON Lines (`.jsonl`) |
| SQL INSERT | Dialect-aware (Postgres/MySQL/SQLite), `BEGIN;...COMMIT;` per 1k rows |
| MSW Handler | Copy-pasteable `http.get('/api/...', () => HttpResponse.json([...]))` |
| JS/TS Array | Formatted literal for seed files |

## 4. UI/UX Philosophy: "Calm Complexity"

### Onboarding (Paste-First + Quick-Start)
- **Primary:** Giant code editor textarea: "Paste your TypeScript interface, Prisma schema, or JSON here"
- **Secondary:** 3 quick-start cards below the editor:
  - SaaS Multi-Tenant Schema
  - Web3 Transaction Payload
  - E-Commerce Relational Graph
- Clicking a card populates editor + generates 1k preview in <500ms

### Layout
- Split view: Schema Builder (left) + Real-time Virtualized Preview (right)
- Preview renders via `@tanstack/react-virtual` (only visible rows in DOM)

### Progressive Disclosure
- Column rows show Name + Data Type only
- Advanced options (Chaos, Regex, Uniqueness, FK linking) behind Settings icon
- Prevents visual clutter while preserving power-user depth

### Keyboard Shortcuts
- `Ctrl+Enter` → Generate/Export
- `Ctrl+S` → Save schema to IndexedDB
- `Ctrl+N` → Add new column
- `Esc` → Close modals/popovers

### Theme
- Dark mode native (default)
- High-contrast, low-eyestrain palette
- Tailwind CSS + shadcn/ui components

### Mobile
- Read-only: Browse templates, view stats
- Generation locked to desktop with clean messaging

## 5. State Management & Persistence

- **Store:** Zustand + Immer middleware
  - Atomic external store (no Context re-render issues)
  - Immer handles deep nested mutations (`state.tables[id].columns[cid].modifiers`)
- **Persistence:** IndexedDB via `idb-keyval`
  - Debounced auto-save on every UI interaction
  - Full workspace recovery on tab close/reopen
  - Toast: "Workspace recovered from local cache"

## 6. Technical Architecture

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | TypeScript (strict) | Schema parser type safety |
| Framework | React 18+ | Ecosystem (shadcn/ui), compute off-thread |
| Build | Vite 5+ | Instant HMR, tree-shaking, ESM |
| Styling | Tailwind CSS 3+ | Utility-first, dark-mode, zero runtime |
| Components | shadcn/ui (Radix) | Accessible, composable |
| State | Zustand + Immer | External atomic store, deep mutations |
| Virtualization | @tanstack/react-virtual | Only visible rows rendered |
| Persistence | IndexedDB (idb-keyval) | Async, unlimited capacity |
| Generation | Custom (<50KB) + tree-shaken Faker (Worker-only) | Fast first-paint |
| Worker Comms | postMessage + Transferable Uint8Array | Zero-copy for streaming |
| Hosting | Cloudflare Pages | Edge-cached, free tier |
| Analytics | Plausible / Umami | Privacy-respecting |
| Monorepo | Turborepo + pnpm 9.x | Parallel builds, workspaces |
| Node | v22 LTS | Latest V8 optimizations |

### Why NOT These Alternatives

| Rejected | Reason |
|----------|--------|
| Next.js | SSR = server costs. We're a pure client-side SPA. |
| Svelte/SolidJS | No shadcn/ui. React ecosystem wins speed-to-market. |
| Redux | Boilerplate. Zustand is lighter. |
| localStorage | 5MB limit. IndexedDB is superior. |
| Full Faker main thread | 800KB blocks first paint. Worker-only. |
| Node.js backend | Violates $0 mandate. Client CPU is free. |
| Vercel | Cloudflare has better free tier + Workers. |

## 7. Accessibility (WCAG 2.1 AA)

- Committed from V1
- shadcn/ui provides Radix accessible primitives
- Keyboard navigation for all builder interactions
- Screen reader live region announcements for dynamic content
- Focus trapping in modals
- Color contrast compliance in dark/light themes

## 8. Deployment

- **Platform:** Netlify (free tier)
- **Domain:** `localmock.in`
- **App:** Netlify site for `apps/web` (React SPA)
- **Marketing:** Netlify site for `apps/marketing` (Astro SSG)
- Same GitHub repo, two Netlify sites
- Turborepo caching: unchanged apps skip rebuild
- Environment: Node 22 (`.nvmrc`), pnpm 9 (`packageManager` field), `engine-strict=true`
- **Auth:** None. No accounts. Completely open.
- **Payments:** None. Buy Me a Coffee link only.

## 9. Testing

| Type | Tool | Strategy |
|------|------|----------|
| Unit | Vitest | Seeded Faker for deterministic snapshots |
| Property | Vitest + custom matchers | Structural invariants (format, FK integrity, uniqueness) |
| E2E | Playwright | Full user flows: paste → confirm → generate → export |
| CI | GitHub Actions | lint → type-check → test → build |

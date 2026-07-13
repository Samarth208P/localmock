# LocalMock — Complete Product Specification & Decision Log

## Product Summary

**LocalMock** is a privacy-first, zero-latency, client-side data generation engine. It runs entirely in the browser using Web Workers, generates unlimited rows of relational mock data via chunked streaming, and exports to CSV, JSON, SQL, MSW handlers, and JS/TS arrays.

**Positioning:** Not an API mocking tool. The **data source** that feeds MSW, json-server, Mockoon. Fills the gap between "I need 50,000 realistic users" and "Mockaroo caps me at 1,000 rows free."

**Primary Goals (Ordered):**
1. SEO dominance for mock data generation queries
2. Zero infrastructure cost (no backend, no auth, no payments)
3. Sleekest, fastest developer UX in the category

**Domain:** `localmock.in`
**Deployment:** Netlify (free tier)
**Auth:** None. Completely open. Anyone can use it freely.
**Monetization:** Buy Me a Coffee link only. Everything is free.

---

## Architecture Overview (Simplified — No Backend)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND — localmock.in (React + Vite SPA on Netlify)               │
│                                                                       │
│  ┌────────────────┐   ┌─────────────────────┐   ┌────────────────┐  │
│  │ Paste-First    │   │ Web Worker Pool      │   │ Preview Table  │  │
│  │ Schema Editor  │──▶│                      │──▶│ (1k sample)    │  │
│  │                │   │ • Custom generators   │   │ @tanstack/     │  │
│  │ + Quick-Start  │   │   (<50KB primitives) │   │ react-virtual  │  │
│  │   Cards (x3)  │   │ • Tree-shaken Faker  │   │                │  │
│  │                │   │   (complex types)    │   │                │  │
│  │ Review &       │   │ • DAG Topo Sort      │   │                │  │
│  │ Confirm UI     │   │ • Chunked Streaming  │   │                │  │
│  └────────────────┘   └─────────────────────┘   └────────────────┘  │
│         │                       │                                     │
│         ▼                       ▼                                     │
│  ┌────────────────┐   ┌────────────────────────┐                    │
│  │ Zustand +      │   │ Export Engine           │                    │
│  │ Immer Store    │   │ Chromium: FSAA +        │                    │
│  │                │   │   Transferable Uint8    │                    │
│  │ IndexedDB      │   │ Others: Blob DL         │                    │
│  │ (idb-keyval)   │   │   (50k row cap)        │                    │
│  └────────────────┘   └────────────────────────┘                    │
│                                                                       │
│  Keyboard Shortcuts | Dark Mode Native | Buy Me a Coffee Link        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  MARKETING — localmock.in (Astro SSG on Netlify)                     │
│                                                                       │
│  • Landing page with value proposition                               │
│  • 50 manually curated Schema Hub pages                              │
│  • Security & Privacy page                                           │
│  • Documentation                                                     │
└─────────────────────────────────────────────────────────────────────┘

NO BACKEND. NO AUTH. NO PAYMENTS. PURELY CLIENT-SIDE.
```

---

## Monorepo Structure

```
localmock/
├── apps/
│   ├── web/                  # React + Vite SPA (app.localmock.in or localmock.in/app)
│   │   ├── src/
│   │   │   ├── components/       # UI components (shadcn/ui based)
│   │   │   ├── workers/          # Web Worker files (generation engine)
│   │   │   ├── store/            # Zustand stores
│   │   │   ├── lib/              # Utilities, constants, types
│   │   │   └── App.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   │
│   └── marketing/            # Astro site (localmock.in landing/SEO pages)
│       ├── src/
│       │   ├── pages/            # Landing, schema hubs, docs
│       │   ├── layouts/
│       │   └── components/
│       └── astro.config.mjs
│
├── packages/
│   ├── core/                 # Parser + DAG engine + generators (shared)
│   │   ├── src/
│   │   │   ├── parser/           # Lexer, AST filter, heuristic classifier
│   │   │   ├── dag/              # Topological sort, FK sampling
│   │   │   ├── generators/       # Custom lightweight generators (<50KB)
│   │   │   ├── chaos/            # Chaos engine corruption logic
│   │   │   └── exports/          # Format serializers (CSV, JSON, SQL, MSW, TS)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ui/                   # Shared shadcn/ui + Tailwind components
│       ├── src/
│       │   └── components/
│       └── package.json
│
├── .nvmrc                    # v22
├── .npmrc                    # engine-strict=true
├── turbo.json
├── pnpm-workspace.yaml
├── package.json              # engines + packageManager fields
├── .gitignore
└── tsconfig.base.json
```

---

## Complete Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Language** | TypeScript (strict) | Schema parser type safety |
| **Framework** | React 18+ | Ecosystem leverage (shadcn/ui), compute off-thread |
| **Build** | Vite 5+ | Instant HMR, tree-shaking, ESM |
| **Styling** | Tailwind CSS 3+ | Utility-first, dark-mode, zero runtime |
| **Components** | shadcn/ui (Radix) | Accessible, composable |
| **State** | Zustand + Immer | External atomic store, deep mutations |
| **Virtualization** | @tanstack/react-virtual | Only visible rows rendered |
| **Persistence** | IndexedDB via `idb-keyval` | Async, unlimited capacity, workspace recovery |
| **Data Generation** | Custom generators (<50KB) + tree-shaken @faker-js/faker (Worker-only) | Fast first-paint |
| **Worker Comms** | postMessage (preview) + Transferable Uint8Array (streaming) | Zero-copy for exports |
| **Hosting** | Netlify (free tier) | Simple deploy, generous bandwidth, good DX |
| **Marketing** | Astro SSG on Netlify | Zero-JS default, perfect Lighthouse, SEO |
| **Analytics** | Plausible or self-hosted Umami | Privacy-respecting |
| **Testing** | Vitest (unit/property) + Playwright (E2E) | Seeded + invariants |
| **CI/CD** | GitHub Actions | Lint → type-check → test → build |
| **Monorepo** | Turborepo + pnpm 9.x | Parallel builds, workspaces |
| **Node** | v22 LTS | Latest V8 optimizations |
| **Monetization** | Buy Me a Coffee link | Zero friction, no payment infrastructure |

### What's NOT in This Project

| Removed | Reason |
|---------|--------|
| Auth/accounts | Not needed. Pure client-side tool. No data to protect. |
| Stripe/payments | Everything is free. Buy Me a Coffee for donations. |
| Cloudflare Workers | No backend needed. |
| Neon Postgres | No user data to store. |
| KV Store | No tokens to validate. |
| Enterprise tier | No Docker, no self-hosting. |
| CLI tool | Deferred indefinitely. |
| VS Code extension | Deferred indefinitely. |
| Stats counter | No backend to track it. Maybe add later with a simple analytics-based approach. |

### Why NOT These Alternatives

| Rejected | Reason |
|----------|--------|
| Next.js | SSR overkill for a client-side SPA. |
| Svelte/SolidJS | No shadcn/ui. React ecosystem wins speed-to-market. |
| Redux | Boilerplate. Zustand is lighter. |
| localStorage | 5MB limit. IndexedDB superior. |
| Full Faker main thread | 800KB blocks first paint. Worker-only. |
| Cloudflare Pages | Netlify is simpler for this use case, good free tier. |
| Any backend | Zero server cost mandate. Client CPU is free. |
| Vercel | Netlify preferred for simplicity and generous free tier. |

---

## Schema Parser Pipeline

```
[User Input] → [Lexer/Tokenizer <15KB] → [AST Filter Matrix] → [Heuristic Classifier] → [Review & Confirm UI]
```

- **Inputs:** TypeScript interfaces, Prisma schemas, raw JSON
- **Prisma `@relation` auto-detection:** Auto-builds DAG edges
- **Failure mode:** Unknown types → `string.alphanumeric()` + yellow "Confirm Type" prompt
- **Disambiguation:** Ambiguous fields highlighted, "Accept All" button to clear

---

## Relational Engine (DAG)

```
[Define Tables] → [Topological Sort] → [Leaf Nodes First] → [ID Pool Extraction] → [FK Sampling in Children]
```

- **1:1** — Strict index matching
- **1:N** — User-specified range (e.g., 1-5 per parent)
- **Circular prevention:** Invalid targets disabled in dropdown with tooltip
- **Integrity:** 100% referential FK guarantee, client-side

---

## Export Engine (Dual-Mode)

| Browser | Engine | Row Limit | Transfer |
|---------|--------|-----------|----------|
| Chromium | File System Access API | Unlimited (disk-bound) | Transferable Uint8Array |
| Firefox/Safari | Blob Memory Engine | 50,000 (dynamic) | postMessage |

- **Preview:** 1,000-row sample buffer (always in memory)
- **Progress:** Terminal-style log during large exports
- **Error:** Partial file saved + toast. No resume.

---

## Export Formats (All Free)

| Format | Details |
|--------|---------|
| CSV | Comma-separated, proper escaping |
| JSON | Array of objects or JSON Lines (`.jsonl`) |
| SQL INSERT | Dialect-aware (Postgres/MySQL/SQLite), batched transactions |
| MSW Handler | Copy-pasteable `http.get(...)` handler |
| JS/TS Array | Formatted literal for seed files |

---

## Chaos Engine (Free — No Paywall)

- Global slider: 0% to 30%
- Column-level toggles
- Types: Null injection, whitespace, encoding stress (UTF-8/emoji), mixed casing, format stripping
- Visible in 1k preview buffer

---

## Business Model (Simplified)

**Everything is free. No tiers. No gates. No accounts.**

| What | How |
|------|-----|
| Revenue | Buy Me a Coffee donations |
| Cost | ~$12/year domain + $0 Netlify hosting |
| Auth | None |
| Data storage | None (all client-side IndexedDB) |
| User tracking | Plausible/Umami (privacy-respecting, optional) |

**Future consideration (not V1):** If the tool gains significant traction, consider Pro tier. But for now, ship free and fast.

---

## UX Decisions

| Decision | Choice |
|----------|--------|
| **Onboarding** | Paste-first editor + 3 quick-start cards |
| **Quick-start cards** | SaaS Multi-Tenant / Web3 Transaction / E-Commerce Graph |
| **Shortcuts** | Ctrl+Enter (generate), Ctrl+S (save), Ctrl+N (add column), Esc (close) |
| **Mobile** | Read-only (browse, no generation) |
| **Theme** | Dark mode native (default) |
| **Layout** | Split view: Builder (left) + Preview (right) |
| **Progressive disclosure** | Name + Type visible; advanced options behind Settings icon |
| **Donation** | Buy Me a Coffee widget in footer/sidebar |

---

## SEO Strategy

- Astro marketing site for SEO-optimized landing + schema hub pages
- 50 manually curated pages with 400+ words of real architectural guidance
- "Open in LocalMock" deep-links to app with pre-loaded schema
- Content targets: "mock data generator," "fake data for testing," "generate SQL test data"

---

## Accessibility (WCAG 2.1 AA)

- Committed from V1
- shadcn/ui (Radix) accessible primitives
- Keyboard navigation for all interactions
- Screen reader live regions
- Focus management in modals
- Color contrast compliance

---

## Testing

| Type | Tool | Strategy |
|------|------|----------|
| Unit | Vitest | Seeded Faker for deterministic output |
| Property | Vitest | Structural invariants (format, FK integrity, uniqueness) |
| E2E | Playwright | Full user flows |
| CI | GitHub Actions | lint → type-check → test → build |

---

## Deployment (Netlify)

- **Single repo, two Netlify sites:**
  - Site 1: `apps/web` → `app.localmock.in` (or `localmock.in/app`)
  - Site 2: `apps/marketing` → `localmock.in` (root domain)
- **Build commands:**
  - Marketing: `pnpm build --filter=marketing`
  - App: `pnpm build --filter=web`
- **Environment:** Node 22 (`.nvmrc`), pnpm 9 (`packageManager`)
- **Deploys:** Push to `main` → Netlify auto-builds

---

## Phase 1 Checklist (Ship This)

- [ ] Monorepo scaffolding (Turborepo + pnpm + Node 22)
- [ ] React/Vite SPA with paste-first onboarding + quick-start cards
- [ ] Schema parser (Lexer → AST Filter → Heuristic Classifier → Confirm UI)
- [ ] Prisma `@relation` auto-detection → DAG builder
- [ ] DAG relational engine (topological sort, FK sampling)
- [ ] Custom generators (<50KB) + tree-shaken Faker in Workers
- [ ] Web Worker generation (1k preview buffer + streaming export)
- [ ] Dual export engine (FSAA for Chromium, Blob for others)
- [ ] All 5 export formats (CSV, JSON, SQL, MSW, JS/TS)
- [ ] Chaos Engine (free, ungated)
- [ ] Zustand + Immer state management
- [ ] IndexedDB persistence with workspace recovery
- [ ] Keyboard shortcuts
- [ ] Dark mode native, WCAG 2.1 AA
- [ ] Buy Me a Coffee widget
- [ ] Netlify deployment
- [ ] Astro marketing site with schema hub pages
- [ ] Plausible/Umami analytics
- [ ] Security & Privacy page

---

## Grilling Sessions Log

| Round | Key Outcomes |
|-------|-------------|
| 1 | Core positioning validated. Execution specifics vague. Business model risks flagged. |
| 2 | Parser pipeline, DAG engine, streaming, Zustand, Cloudflare infra locked. LTD killed. Scraping cut. |
| 3 | Dual-engine export, 1k preview, confirmation UI, Prisma @relation V1, circular ref prevention, WCAG, Astro SEO, phased rollout. |
| 4 | Hybrid Faker, Transferable Uint8Array, paste-first + quick-start, proprietary, Turborepo, programmatic SEO. |
| 5 | V1 = 100% free. 50 curated SEO pages. Node 22 + pnpm 9. CF dual-project deploy. Command palette deferred. |
| 6 | **Major simplification:** No auth, no Stripe, no backend. Deploy to localmock.in via Netlify. Buy Me a Coffee only. Pure client-side tool, zero infrastructure. |

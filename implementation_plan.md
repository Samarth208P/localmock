# LocalMock — Implementation Plan

## Design Philosophy: "Taste"

### Visual Identity

**Logo:** Geometric 3D isometric cube SVG — represents data structures, building blocks, modularity. Used as favicon, navbar brand, and GSAP-animated hero element (path draw-in on load).

**Design Language:** Dark, minimal, precise. Inspired by:
- Linear (clean spatial hierarchy)
- Raycast (command-driven, keyboard-first)
- Vercel Dashboard (monochrome + strategic accent)
- Arc Browser (playful yet professional)

### Color Palette (Dark Mode Native)

```
Backgrounds:
  --bg-primary:     #0a0a0b    (near-black, warm undertone)
  --bg-secondary:   #141416    (cards, panels)
  --bg-tertiary:    #1c1c1f    (elevated surfaces, hover states)

Borders:
  --border-subtle:  #2a2a2e    (card borders, dividers)
  --border-active:  #3a3a40    (focused inputs, active states)

Text:
  --text-primary:   #fafafa    (headings, important content)
  --text-secondary: #a1a1aa    (labels, descriptions)
  --text-muted:     #71717a    (placeholders, disabled)

Accent:
  --accent:         #6366f1    (indigo — primary actions, links)
  --accent-hover:   #818cf8    (hover state)
  --accent-subtle:  rgba(99, 102, 241, 0.1)  (background tints)

Semantic:
  --success:        #22c55e    (green — confirmed types, export complete)
  --warning:        #f59e0b    (amber — ambiguous inference, chaos active)
  --error:          #ef4444    (red — circular ref, parse failure)
  --info:           #3b82f6    (blue — browser info badge)
```

### Typography

```
Font Stack:
  --font-sans:  'Inter', system-ui, -apple-system, sans-serif
  --font-mono:  'JetBrains Mono', 'Fira Code', monospace

Scale (modular, 1.25 ratio):
  xs:   0.75rem / 1rem     (badges, micro labels)
  sm:   0.875rem / 1.25rem (secondary text, table cells)
  base: 1rem / 1.5rem      (body, inputs)
  lg:   1.125rem / 1.75rem (section headers)
  xl:   1.25rem / 1.75rem  (page titles)
  2xl:  1.5rem / 2rem      (hero subtitle)
  3xl:  2rem / 2.5rem      (hero headline — marketing)
  4xl:  2.5rem / 3rem      (landing hero — marketing)

Weight:
  Regular (400) — body, descriptions
  Medium (500)  — labels, nav items
  Semibold (600) — headings, buttons
  Bold (700) — hero text only (marketing)
```

### Spacing & Layout

```
Spacing Scale (4px base):
  1: 4px    |  2: 8px    |  3: 12px   |  4: 16px
  5: 20px   |  6: 24px   |  8: 32px   |  10: 40px
  12: 48px  |  16: 64px  |  20: 80px  |  24: 96px

Border Radius:
  sm: 6px    (badges, small chips)
  md: 8px    (buttons, inputs)
  lg: 12px   (cards, panels)
  xl: 16px   (modals, dialogs)
  full: 9999px (pills, avatars)

App Layout:
  Navbar height: 56px (fixed top)
  Sidebar/Builder: 45% width (left panel)
  Preview Table: 55% width (right panel)
  Panel gap: 1px (subtle border divider)
  Content padding: 24px
```

### Micro-Interaction Principles

1. **Nothing pops in.** Everything eases into existence with purpose.
2. **Speed over drama.** Animations are 150-300ms max. Never slow the user down.
3. **Physical metaphors.** Elements have weight — they slide, settle, compress. Not bounce or flip.
4. **Feedback is immediate.** Every click produces a visual response within 50ms.
5. **Progressive revelation.** Complexity unfolds; it doesn't dump.

---

## GSAP Animation Strategy

### Dependencies
```json
{
  "gsap": "^3.12.x",
  "@gsap/react": "^2.x"
}
```

GSAP is used strategically — not on every element. Animations serve UX clarity, not decoration.

### App Animations (apps/web)

| Trigger | Animation | GSAP API | Duration |
|---------|-----------|----------|----------|
| Page load | Logo SVG paths draw in sequentially | `gsap.fromTo` + `strokeDashoffset` | 800ms |
| Schema paste | Columns slide in staggered from left | `gsap.from` + `stagger: 0.05` | 300ms |
| Column add | New row slides down from 0 height + opacity | `gsap.from({ height: 0, opacity: 0 })` | 200ms |
| Column remove | Row compresses to 0 height + fades | `gsap.to({ height: 0, opacity: 0 })` | 200ms |
| Generate click | Button press scales down 0.95 → back | `gsap.to({ scale: 0.95 })` | 150ms |
| Preview populate | Table rows fade in with stagger from top | `gsap.from({ opacity: 0, y: 8 })` stagger 0.02 | 400ms |
| Export progress | Progress bar fills with easeOut | `gsap.to({ width })` | Real-time |
| Export complete | Success checkmark draws in (SVG path) | strokeDashoffset | 400ms |
| Toast notifications | Slide in from top-right, auto-dismiss | `gsap.fromTo` y → 0, reverse after 3s | 250ms in / 200ms out |
| Chaos slider high | Subtle shake on column rows | `gsap.to({ x: '+=2' })` yoyo | 100ms |

### Marketing Site Animations (apps/marketing)

| Trigger | Animation | GSAP API | Duration |
|---------|-----------|----------|----------|
| Hero load | Headline words reveal stagger + logo assembles | SplitText + gsap.from per path | 1200ms |
| Scroll: Features | Feature cards slide up + fade on scroll | ScrollTrigger + gsap.from | 500ms |
| Scroll: Code demo | Typing animation in preview mockup | TextPlugin | 2000ms |
| Scroll: Formats | Format icons flip in sequentially | gsap.from rotateY stagger | 600ms |
| CTA buttons | Hover glow pulse (box-shadow) | gsap.to on mouseEnter | 300ms |
| Schema hub cards | Grid items stagger-reveal | ScrollTrigger batch | 400ms |

### GSAP Configuration

```typescript
// lib/gsap.ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

gsap.defaults({
  ease: 'power2.out',
  duration: 0.3,
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(20); // Effectively instant
}

export { gsap, ScrollTrigger, TextPlugin };
```

### Animation Rules
1. **Respect `prefers-reduced-motion`.** If enabled, all animations complete instantly.
2. **No GSAP on the critical render path.** First paint is pure CSS. GSAP enhances after hydration.
3. **No animation on the Web Worker thread.** GSAP is main-thread only.
4. **Cleanup on unmount.** Every `useGSAP` hook returns cleanup via `context.revert()`.

---

## 12-Week Build Sequence

### Week 1-2: Foundation & Monorepo

| Task | Details | Output |
|------|---------|--------|
| 1.1 | Scaffold Turborepo + pnpm workspace | `turbo.json`, `pnpm-workspace.yaml`, root `package.json` |
| 1.2 | Create `apps/web` — Vite + React + TypeScript | Working dev server |
| 1.3 | Create `apps/marketing` — Astro setup | Working Astro dev server |
| 1.4 | Create `packages/core` — empty package with tsconfig | Importable from both apps |
| 1.5 | Create `packages/ui` — shadcn/ui + Tailwind setup | Shared component library |
| 1.6 | Configure shared tsconfig, ESLint, Prettier | Consistent code style |
| 1.7 | Setup `.nvmrc` (v22), `.npmrc` (engine-strict), `packageManager` field | Locked environment |
| 1.8 | Setup Tailwind with custom design tokens (colors, fonts, spacing) | Design system in code |
| 1.9 | Install GSAP + `@gsap/react`, configure `lib/gsap.ts` | Animation system ready |
| 1.10 | Add `localmock.svg` as favicon + animated logo component | Brand in place |
| 1.11 | GitHub Actions CI (lint + typecheck) | CI pipeline |

### Week 3-4: Core Engine (packages/core)

| Task | Details | Output |
|------|---------|--------|
| 2.1 | Build Lexer/Tokenizer for JSON input | Parses JSON → column defs |
| 2.2 | Build Lexer for TypeScript interfaces | Parses TS interfaces |
| 2.3 | Build Lexer for Prisma schemas | Parses Prisma models |
| 2.4 | Build AST Filter Matrix (unions, generics → primitives) | Flattens complex types |
| 2.5 | Build Heuristic Classifier (field name → Faker type) | Auto-mapping |
| 2.6 | Build Prisma `@relation` detector → DAG edge creation | Auto-links tables |
| 2.7 | Build DAG topological sort | Generation order |
| 2.8 | Build FK ID pool extraction + sampling | Referential integrity |
| 2.9 | Build custom lightweight generators (UUID, email, name, int, bool, date, URL, phone) | <50KB |
| 2.10 | Integrate tree-shaken Faker for complex types | Worker-only |
| 2.11 | Build Chaos Engine logic | Corruption pipeline |
| 2.12 | Vitest unit tests (seeded, deterministic) | Parser coverage |
| 2.13 | Property-based tests (format invariants, FK integrity) | Generator coverage |

### Week 5-6: Web Worker & Export Engine

| Task | Details | Output |
|------|---------|--------|
| 3.1 | Create Web Worker (`generation.worker.ts`) | Off-thread |
| 3.2 | Implement 1k-row preview generation (postMessage) | Preview buffer |
| 3.3 | Implement chunked streaming (1k rows → Uint8Array → Transferable) | Streaming |
| 3.4 | Implement File System Access API export (Chromium) | Disk streaming |
| 3.5 | Implement Blob fallback (Firefox/Safari) | Memory export |
| 3.6 | Browser capability detection | Auto-selects engine |
| 3.7 | CSV serializer (RFC 4180) | Export format |
| 3.8 | JSON serializer (array + JSONL) | Export format |
| 3.9 | SQL INSERT serializer (Postgres/MySQL/SQLite) | Export format |
| 3.10 | MSW handler serializer | Export format |
| 3.11 | JS/TS array literal serializer | Export format |
| 3.12 | Worker error handling (partial save) | Graceful failures |
| 3.13 | Scale testing 100k+ rows (Chromium) | Verify streaming |
| 3.14 | Test 50k rows Blob (Firefox) | Verify fallback |

### Week 7-9: App UI (apps/web)

| Task | Details | Output |
|------|---------|--------|
| 4.1 | App shell (navbar + animated logo, split panel, footer) | Skeleton |
| 4.2 | Paste-first schema editor | Primary input |
| 4.3 | Review & Confirm panel (green/yellow indicators) | Post-parse UI |
| 4.4 | Quick-start cards with GSAP entrance | Onboarding |
| 4.5 | Column editor row (name, type, settings) | Builder |
| 4.6 | Column add/remove with GSAP animations | Smooth CRUD |
| 4.7 | Relational linking UI (dropdown, cardinality) | FK definition |
| 4.8 | Circular reference prevention (disabled + tooltip) | DAG safety |
| 4.9 | Chaos Engine panel (slider + toggles) | Corruption UI |
| 4.10 | Preview table (@tanstack/react-virtual) | Virtual grid |
| 4.11 | Preview with GSAP row stagger | Polish |
| 4.12 | Export panel (format, rows, dialect) | Export controls |
| 4.13 | Export progress (terminal log + GSAP bar) | Feedback |
| 4.14 | Export complete (checkmark animation) | Success |
| 4.15 | Toast system with GSAP | Notifications |
| 4.16 | Zustand stores (schema, builder, chaos, export) | State |
| 4.17 | IndexedDB persistence (idb-keyval, debounced) | Auto-save |
| 4.18 | Workspace recovery | Session restore |
| 4.19 | Keyboard shortcuts | Power UX |
| 4.20 | Browser info badge (non-Chromium) | Degradation |
| 4.21 | Buy Me a Coffee widget | Donation |
| 4.22 | Dark mode (Tailwind dark:) | Theme |
| 4.23 | Mobile read-only view | Responsive |
| 4.24 | WCAG audit (keyboard, focus, ARIA, contrast) | A11y |

### Week 10-11: Marketing Site (apps/marketing)

| Task | Details | Output |
|------|---------|--------|
| 5.1 | Astro layout (header, footer, SEO meta) | Shell |
| 5.2 | Hero (headline, subtitle, CTA, animated logo) | Above fold |
| 5.3 | GSAP hero animation (word reveal + logo assembly) | Impact |
| 5.4 | Features section (ScrollTrigger cards) | Value prop |
| 5.5 | Code demo (typing animation) | Proof |
| 5.6 | Export formats section (icon flip) | Features |
| 5.7 | "How it works" (3-step) | Clarity |
| 5.8 | Comparison table (vs Mockaroo, Faker, json-server) | Position |
| 5.9 | CTA section (link to app) | Conversion |
| 5.10 | Security & Privacy page | Trust |
| 5.11 | Documentation pages | Onboarding |
| 5.12 | 10 initial schema hub pages | SEO seeds |
| 5.13 | SEO (meta, OG, structured data, sitemap) | Discovery |
| 5.14 | Lighthouse 95+ | Performance |

### Week 12: Polish & Deploy

| Task | Details | Output |
|------|---------|--------|
| 6.1 | Playwright E2E tests | Confidence |
| 6.2 | Cross-browser testing | Compatibility |
| 6.3 | Performance profiling | Optimization |
| 6.4 | GSAP animation audit (60fps) | Smoothness |
| 6.5 | Accessibility audit (NVDA/VoiceOver) | WCAG |
| 6.6 | Netlify deployment (both sites) | Live |
| 6.7 | Custom domain (localmock.in) | DNS + SSL |
| 6.8 | Plausible/Umami analytics | Tracking |
| 6.9 | Final content review | Quality |
| 6.10 | Launch | Ship it |

---

## File Architecture (apps/web/src)

```
src/
├── App.tsx                      # Root with providers
├── main.tsx                     # Entry point
├── index.css                    # Tailwind imports + custom properties
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx           # Fixed top bar with animated logo
│   │   ├── SplitPanel.tsx       # Resizable left/right layout
│   │   └── Footer.tsx           # Buy Me a Coffee + links
│   │
│   ├── editor/
│   │   ├── SchemaEditor.tsx     # Paste-first code textarea
│   │   ├── QuickStartCards.tsx  # 3 template cards with GSAP
│   │   └── ConfirmPanel.tsx     # Post-parse type confirmation
│   │
│   ├── builder/
│   │   ├── ColumnList.tsx       # Sortable column list
│   │   ├── ColumnRow.tsx        # Single column row
│   │   ├── ColumnSettings.tsx   # Expanded settings
│   │   ├── RelationLink.tsx     # FK linking dropdown
│   │   └── ChaosPanel.tsx       # Global slider + toggles
│   │
│   ├── preview/
│   │   ├── PreviewTable.tsx     # Virtualized table
│   │   ├── PreviewHeader.tsx    # Column headers
│   │   └── PreviewRow.tsx       # Data row
│   │
│   ├── export/
│   │   ├── ExportPanel.tsx      # Format, rows, dialect
│   │   ├── ExportProgress.tsx   # Terminal log + progress
│   │   └── ExportComplete.tsx   # Success animation
│   │
│   └── shared/
│       ├── Toast.tsx            # GSAP notification
│       ├── Badge.tsx            # Status badges
│       ├── AnimatedLogo.tsx     # SVG path draw animation
│       └── BrowserBadge.tsx     # Non-Chromium info
│
├── workers/
│   ├── generation.worker.ts    # Main generation Worker
│   └── types.ts                # Worker message types
│
├── store/
│   ├── schemaStore.ts          # Parsed schema
│   ├── builderStore.ts         # Columns, relationships
│   ├── chaosStore.ts           # Chaos settings
│   ├── exportStore.ts          # Export config + progress
│   └── persistenceStore.ts     # IndexedDB sync
│
├── lib/
│   ├── gsap.ts                 # GSAP config + plugins
│   ├── browserDetect.ts        # FSAA check
│   ├── shortcuts.ts            # Keyboard shortcut registry
│   └── constants.ts            # Defaults, templates
│
└── hooks/
    ├── useGSAP.ts              # Animation hook with cleanup
    ├── useWorker.ts            # Worker communication
    ├── usePersistence.ts       # IndexedDB hook
    └── useKeyboardShortcuts.ts # Shortcut listener
```

---

## Summary

| Aspect | Decision |
|--------|----------|
| UI Framework | React + shadcn/ui (Radix) + Tailwind |
| Animation | GSAP 3 (@gsap/react) |
| Animation Philosophy | Purposeful, fast (150-300ms), respects reduced-motion |
| Design Tone | Dark, minimal, precise. Developer-grade. |
| Logo | Geometric isometric SVG — animated path draw |
| Typography | Inter (sans) + JetBrains Mono (code) |
| Color | Near-black bg, indigo accent, semantic states |
| Timeline | 12 weeks to production |
| Deploy | Netlify free tier → localmock.in |
| Monetization | Buy Me a Coffee only |
| Auth | None |
| Backend | None |

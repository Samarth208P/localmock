# LocalMock 🚀

**The zero-cost, zero-backend, zero-latency client-side data generation engine.**

LocalMock is a privacy-first data generation and chaos-testing utility. By offloading 100% of compute to your machine via Web Workers, it eliminates traditional server-side row limits, enabling you to generate and stream unlimited rows of relational, complex data directly to disk. 

There are no paywalls, no login screens, and absolutely no data sent to any server. Everything happens right in your browser.

---

## 🌟 Why LocalMock? (vs Competitors)

Most mock data generators fall into two traps: they either cap your usage behind expensive paywalls (because server compute costs money) or they force you into a cloud ecosystem. LocalMock solves this by being purely client-side.

| Feature | LocalMock | Mockaroo | JSON-Generator | Other SaaS Generators |
|---------|-----------|----------|----------------|-----------------------|
| **Cost** | **100% Free** | Paid Tiers | Free (Limited) | Paid Tiers |
| **Row Limit** | **Unlimited** (Disk-bound) | 1,000 free / 100k paid | Limited | Hard Caps |
| **Privacy** | **Zero-data transfer** | Cloud processing | Cloud processing | Cloud processing |
| **Account Required** | **No** | Yes | Optional/Yes | Yes |
| **Latency** | **Zero** (Local execution) | Network dependent | Network dependent | Network dependent |
| **Infrastructure**| **Browser Web Workers**| Server Farms | Server Farms | Server Farms |

### The LocalMock Advantage
- **Unlimited Rows for Free:** Because your computer does the heavy lifting, we don't pay for compute. You can generate 50,000+ rows instantly.
- **Provably Private:** No backend exists. Your data schemas and generated mock data never leave the browser.
- **Zero Friction:** "No account required" is our promise. 

---

## ✨ Core Features

### 🧠 Smart Schema Ingestion
Paste your Prisma schema, TypeScript interface, or raw JSON. LocalMock's ultra-lightweight parser uses heuristic classification to instantly build your table structures and automatically infer data types.
- Auto-detects Prisma `@relation` tags.
- Identifies fields like `email`, `wallet_address`, or `uuid` seamlessly.

### 🔗 Relational DAG Engine (Directed Acyclic Graph)
Generate relational data with 100% referential integrity without a backend.
- Automatically handles 1:1 and 1:N relations.
- Circular reference prevention built-in.
- Topological sort ensures parent tables are generated before child tables.

### 🌪️ The Chaos Engine
Stress-test your UI bounds and database constraints.
- Inject nulls, whitespace chaos, and mixed casing.
- Stress-test with UTF-8 edge cases and emojis.
- Configurable global and column-level corruption rates (0% to 30%).

### ⚡ Dual-Mode Export Engine
- **Chromium Browsers (Chrome/Edge/Arc):** Uses the File System Access API with Transferable `Uint8Array`. Streams unlimited data directly to disk without crashing your browser tab.
- **Firefox/Safari:** Uses an optimized Blob memory engine capable of handling up to 50,000 rows.

### 📦 Export Formats Supported
- CSV
- JSON & JSON Lines (.jsonl)
- SQL INSERT (Dialect-aware batched transactions)
- MSW Handlers
- JS/TS Arrays

---

## 🛠️ Architecture & Tech Stack

LocalMock is built for speed and developer experience.

- **Framework:** React 18+ & Vite 5+ (Pure SPA, No SSR)
- **Monorepo:** Turborepo & pnpm
- **State Management:** Zustand + Immer
- **UI/Styling:** Tailwind CSS + shadcn/ui
- **Persistence:** IndexedDB (via `idb-keyval`) for instant workspace recovery
- **Web Workers:** Custom <50KB generators paired with a tree-shaken `@faker-js/faker`
- **Hosting:** Netlify (Free Tier)

**Repository Structure:**
```text
localmock/
├── apps/
│   └── web/           # React SPA (The App)
├── packages/
│   ├── core/          # Parser, DAG Engine, Chaos, Exports
│   └── ui/            # Shared shadcn/ui components
```

---

## 🚀 Quick Start (Local Development)

We use `pnpm` and Node `v22 LTS`.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/localmock.git
   cd localmock
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm turbo dev
   ```

4. **Open in browser:**
   - App: `http://localhost:5173`

---

## 💼 Business Model & Support

**LocalMock is 100% free.** 
There are no tiers, no locked features, and no Stripe integration. The goal is to build the sleekest, fastest developer utility and distribute it with zero friction.

If you love the tool and it saved you hours of writing fake data or paying for premium tools, consider supporting the project:
☕ [**Buy Me a Coffee**](#)

---

## 🤝 Contributing
Contributions are welcome! Please check out our [Issue Tracker](#) for open tasks. We especially welcome new generators, export formats, and UX improvements.

## 📝 License
MIT License. See `LICENSE` for more information.

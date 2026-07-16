import { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Data ──────────────────────────────────────────────────────── */

interface Row {
  id: string;
  label: string;
  localMock: string;
  others: string;
  /** Animated count-up metric for LocalMock advantage */
  metric: { value: number; unit: string };
  /** Short tooltip detail revealed on hover-expand */
  detail: string;
}

const ROWS: Row[] = [
  {
    id: 'privacy',
    label: 'Privacy model',
    localMock: 'Client-side generation; data never leaves your browser',
    others: 'Often server-assisted or account-based workflows',
    metric: { value: 0, unit: 'bytes sent' },
    detail: 'All generation runs in Web Workers on your machine. No API calls, no telemetry, no schema uploads — provably private by architecture.',
  },
  {
    id: 'schema',
    label: 'Schema input',
    localMock: 'Prisma, TypeScript, JSON, manual fields, templates, and multi-table relations',
    others: 'Usually form-first schema builders',
    metric: { value: 6, unit: 'input modes' },
    detail: 'Paste-parse Prisma/@relation, TS interfaces/unions, raw JSON. Or hand-build with 80+ field types, drag-reorder, and relational FK linking.',
  },
  {
    id: 'testing',
    label: 'Testing features',
    localMock: 'Chaos data, referential integrity, shareable schemas, and local exports',
    others: 'Strong fake data catalogs, fewer local-first testing workflows',
    metric: { value: 5, unit: 'chaos types' },
    detail: 'Null injection, whitespace chaos, encoding stress, mixed casing, format stripping — configurable globally and per-column.',
  },
  {
    id: 'price',
    label: 'Price fit',
    localMock: 'Free, no signup, no row limits enforced by an account tier',
    others: 'Usage may depend on plans, accounts, or credits',
    metric: { value: 0, unit: '$/forever' },
    detail: 'No paywalls, no freemium caps. Generate 1 million rows in your browser without creating an account.',
  },
];

/* ─── CountUp ───────────────────────────────────────────────────── */

function CountUp({ end, unit, isVisible }: { end: number; unit: string; isVisible: boolean }) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isVisible) { setCount(0); return; }
    const duration = 1200;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * end));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, isVisible]);

  return (
    <span className="tabular-nums font-mono text-accent font-semibold text-sm">
      {count}<span className="text-[10px] text-text-muted ml-0.5 font-normal">{unit}</span>
    </span>
  );
}

/* ─── AnimatedCheckmark ─────────────────────────────────────────── */

function AnimatedCheck({ visible }: { visible: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className={`text-accent transition-all duration-500 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <path
        d="M8 12.5l2.5 2.5 5.5-5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="origin-center"
        style={{
          strokeDasharray: 20,
          strokeDashoffset: visible ? 0 : 20,
          transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
        }}
      />
    </svg>
  );
}

/* ─── ScanLine ──────────────────────────────────────────────────── */

function ScanLine() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      <div className="scan-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────── */

export function ComparisonShowcase() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Intersection observer — fire animations once visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
      },
      { threshold: 0.12 },
    );
    if (tableRef.current) observer.observe(tableRef.current);
    return () => observer.disconnect();
  }, []);

  // Track mouse position for radial glow
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--glow-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--glow-y', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <section className="mt-12" aria-labelledby="mockaroo-alternative" ref={tableRef}>
      <div className="max-w-3xl mb-8">
        <h2 id="mockaroo-alternative" className="text-2xl font-semibold tracking-tight text-text-primary">
          LocalMock vs Mockaroo and other fake data generators
        </h2>
        <p className="mt-3 text-sm leading-7 text-text-secondary">
          Mockaroo is a well-known fake data generator. LocalMock competes by focusing on local-first privacy, developer schemas, relational testing, and exports that fit modern app development without a signup step.
        </p>
      </div>

      {/* ─── Dashboard Table ─────────────────────────────────── */}
      <div
        onMouseMove={handleMouseMove}
        className="comparison-dashboard relative rounded-2xl border border-border-subtle overflow-hidden bg-bg-secondary/70 backdrop-blur-md"
      >
        {/* Grid background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Radial glow that follows cursor */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(400px circle at var(--glow-x, 50%) var(--glow-y, 50%), rgba(99, 102, 241, 0.06), transparent 60%)' }} />

        {/* Scanning line effect */}
        {isVisible && <ScanLine />}

        {/* ─── Header row ───────────────────────────── */}
        <div className="sticky top-0 z-10 grid grid-cols-[180px_1fr_1fr_100px] sm:grid-cols-[200px_1fr_1fr_120px] backdrop-blur-md bg-bg-primary/80 border-b border-border-subtle">
          <div className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Dimension
          </div>
          <div className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-accent flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            LocalMock
          </div>
          <div className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Typical generators
          </div>
          <div className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-text-muted text-center">
            Score
          </div>
        </div>

        {/* ─── Body rows ────────────────────────────── */}
        {ROWS.map((row, idx) => {
          const isHovered = hoveredRow === row.id;
          const isExpanded = isHovered;

          return (
            <div
              key={row.id}
              onMouseEnter={() => setHoveredRow(row.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{ '--stagger-delay': `${idx * 120}ms` } as React.CSSProperties}
              className={`animate-stagger-in group/row relative grid grid-cols-[180px_1fr_1fr_100px] sm:grid-cols-[200px_1fr_1fr_120px] border-b border-border-subtle/50 last:border-0 transition-all duration-300 ${
                isHovered ? 'bg-accent/[0.04]' : 'hover:bg-bg-tertiary/30'
              }`}
            >
              {/* Hover glow left edge */}
              <div className={`absolute left-0 top-0 bottom-0 w-[2px] rounded-full transition-all duration-300 ${isHovered ? 'bg-accent shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 'bg-transparent'}`} />

              {/* Dimension label */}
              <div className="px-5 py-4 flex items-start gap-3">
                <AnimatedCheck visible={isVisible} />
                <span className="text-sm font-medium text-text-primary">{row.label}</span>
              </div>

              {/* LocalMock column — visually dominant */}
              <div className="px-5 py-4 relative">
                <p className="text-sm leading-relaxed text-text-primary">{row.localMock}</p>
                {/* Expand detail on hover */}
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                  <p className="text-xs leading-relaxed text-text-muted border-l-2 border-accent/30 pl-3">{row.detail}</p>
                </div>
              </div>

              {/* Others column */}
              <div className="px-5 py-4">
                <p className="text-sm leading-relaxed text-text-secondary">{row.others}</p>
              </div>

              {/* Metric / Score */}
              <div className="px-5 py-4 flex items-start justify-center">
                <CountUp end={row.metric.value} unit={row.metric.unit} isVisible={isVisible} />
              </div>
            </div>
          );
        })}

        {/* ─── Footer summary bar ─────────────────── */}
        <div className="border-t border-border-subtle bg-bg-primary/60 backdrop-blur-sm px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span className="text-xs font-medium text-text-secondary">All benchmarks favor LocalMock for developer workflows</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-text-muted">LIVE</span>
          </div>
        </div>
      </div>
    </section>
  );
}

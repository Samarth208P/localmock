import { QUICK_START_TEMPLATES } from '@/lib/constants';

interface QuickStartCardsProps {
  onSelect: (schema: string) => void;
}

export function QuickStartCards({ onSelect }: QuickStartCardsProps) {
  const templates = Object.values(QUICK_START_TEMPLATES);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {templates.map((template, idx) => (
        <button
          key={template.name}
          onClick={() => onSelect(template.schema)}
          style={{ '--stagger-delay': `${idx * 70}ms` } as React.CSSProperties}
          className="card-interactive animate-stagger-in group relative rounded-xl border border-border-subtle bg-bg-secondary p-4 text-left hover:border-accent/40 hover:bg-accent/[0.03]"
        >
          <p className="text-sm font-medium text-text-primary transition-colors duration-200 group-hover:text-accent">
            {template.name}
          </p>
          <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
            {template.description}
          </p>
          <span className="absolute right-3 bottom-3 text-accent opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 text-xs">
            →
          </span>
        </button>
      ))}
    </div>
  );
}

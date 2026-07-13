import { QUICK_START_TEMPLATES } from '@/lib/constants';

interface QuickStartCardsProps {
  onSelect: (schema: string) => void;
}

export function QuickStartCards({ onSelect }: QuickStartCardsProps) {
  const templates = Object.values(QUICK_START_TEMPLATES);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {templates.map((template) => (
        <button
          key={template.name}
          onClick={() => onSelect(template.schema)}
          className="group relative rounded-xl border border-border-subtle bg-bg-secondary p-4 text-left transition-all duration-300 ease-out hover:border-accent/40 hover:bg-accent/[0.03] hover:shadow-md hover:shadow-accent/5 hover:-translate-y-0.5"
        >
          <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
            {template.name}
          </p>
          <p className="mt-1.5 text-xs text-text-muted leading-relaxed">
            {template.description}
          </p>
        </button>
      ))}
    </div>
  );
}

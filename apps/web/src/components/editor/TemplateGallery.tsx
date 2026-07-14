import { useState, useMemo, useEffect } from 'react';
import { TEMPLATES, type SchemaTemplate } from '@/data/templates';
import type { FieldRow } from './FieldBuilder';
import { getHistory, type SchemaHistoryEntry } from '@/lib/schemaHistory';

interface TemplateGalleryProps {
  onSelect: (fields: FieldRow[]) => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'saved', label: 'Saved', match: [] },
  { id: 'people', label: 'People', match: ['Users', 'Employees', 'Students'] },
  { id: 'commerce', label: 'Commerce', match: ['Products', 'Orders', 'Payments', 'Invoices', 'Subscriptions', 'Inventory'] },
  { id: 'content', label: 'Content', match: ['Blog Posts', 'Comments', 'Social Posts', 'Chat Messages', 'Notifications', 'Recipes', 'Movies'] },
  { id: 'ops', label: 'Ops & Infra', match: ['API Logs', 'Server Metrics', 'IoT Sensors', 'Support Tickets', 'Tasks'] },
  { id: 'finance', label: 'Finance', match: ['Transactions', 'Crypto Wallets', 'Real Estate Listings'] },
  { id: 'other', label: 'Other', match: ['Addresses', 'Vehicles', 'Flight Bookings', 'Events', 'Restaurants', 'Medical Records'] },
] as const;

export function TemplateGallery({ onSelect }: TemplateGalleryProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [savedTemplates, setSavedTemplates] = useState<SchemaHistoryEntry[]>([]);

  useEffect(() => {
    const loadSaved = () => {
      getHistory().then(setSavedTemplates);
    };
    loadSaved();
    window.addEventListener('template-saved', loadSaved);
    return () => window.removeEventListener('template-saved', loadSaved);
  }, []);

  const filtered = useMemo(() => {
    const combinedTemplates = [
      ...savedTemplates.map(st => ({ name: st.name, description: 'Saved Custom Template', fields: st.fields } as SchemaTemplate)),
      ...TEMPLATES
    ];

    let results = combinedTemplates;

    // Filter by category
    if (category !== 'all') {
      if (category === 'saved') {
        results = results.filter(t => t.description === 'Saved Custom Template');
      } else {
        const cat = CATEGORIES.find((c) => c.id === category);
        if (cat && 'match' in cat) {
          results = results.filter((t) => (cat.match as readonly string[]).includes(t.name));
        }
      }
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.fields.some((f) => f.name.toLowerCase().includes(q)),
      );
    }

    return results;
  }, [search, category]);

  const handleSelect = (template: SchemaTemplate) => {
    const fields: FieldRow[] = template.fields.map((f, i) => ({
      id: `tpl-${i}-${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      typeId: f.typeId,
      options: f.options,
      unique: f.unique,
    }));
    onSelect(fields);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search templates..."
        className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all"
        aria-label="Search templates"
      />

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200 ${
              category === cat.id
                ? 'bg-accent/15 text-accent ring-1 ring-accent/30'
                : 'bg-bg-tertiary text-text-muted hover:text-text-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
        {filtered.map((template) => (
          <button
            key={template.name}
            onClick={() => handleSelect(template)}
            className="relative group rounded-xl border border-border-subtle bg-bg-secondary p-4 text-left transition-all duration-200 hover:border-accent/40 hover:bg-accent/[0.03] hover:-translate-y-0.5 hover:shadow-sm"
          >
            {template.description === 'Saved Custom Template' && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent ring-1 ring-accent/20 ring-inset">
                  Saved
                </span>
              </div>
            )}
            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors pr-12">
              {template.name}
            </p>
            <p className="mt-1 text-[11px] text-text-muted leading-relaxed line-clamp-2 pr-12">
              {template.description}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1">
              {template.fields.slice(0, 3).map((f) => (
                <span
                  key={f.name}
                  className="rounded bg-bg-tertiary px-1.5 py-0.5 text-[10px] font-mono text-text-muted"
                >
                  {f.name}
                </span>
              ))}
              {template.fields.length > 3 && (
                <span className="rounded bg-bg-tertiary px-1.5 py-0.5 text-[10px] text-text-muted">
                  +{template.fields.length - 3}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-xs text-text-muted py-6">
          No templates match your search.
        </p>
      )}

      <p className="text-[11px] text-text-muted text-center">
        {TEMPLATES.length} templates available &middot; Click to load into builder
      </p>
    </div>
  );
}

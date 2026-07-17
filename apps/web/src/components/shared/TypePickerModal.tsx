import { useState } from 'react';
import { ALL_DATA_TYPES, DATA_TYPE_CATEGORIES, type DataTypeOption } from '@/lib/dataTypes';
import { CATEGORY_ICONS } from '@/components/shared/Icons';

interface TypePickerModalProps {
  fieldName: string;
  onSelect: (type: DataTypeOption) => void;
  onClose: () => void;
}

export function TypePickerModal({ fieldName, onSelect, onClose }: TypePickerModalProps) {
  const [search, setSearch] = useState('');

  const filteredTypes = search.trim()
    ? ALL_DATA_TYPES.filter((t) =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()),
      )
    : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-subtle">
          <h3 className="text-lg font-semibold text-text-primary">
            Select Type for <span className="text-accent font-mono ml-1">{fieldName || 'field'}</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        
        <div className="p-4 border-b border-border-subtle bg-bg-tertiary/30">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 80+ types..."
            className="w-full rounded-xl border border-border-subtle bg-bg-secondary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)] transition-all duration-200"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {filteredTypes ? (
            <div className="space-y-1 pt-4">
              {filteredTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { onSelect(type); onClose(); }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-bg-tertiary transition-colors group"
                >
                  <span className="text-sm text-text-primary font-medium group-hover:text-accent transition-colors">{type.label}</span>
                  <span className="ml-auto text-xs text-text-muted">{type.category}</span>
                </button>
              ))}
              {filteredTypes.length === 0 && (
                <p className="text-sm text-text-muted text-center py-8">No types match "{search}"</p>
              )}
            </div>
          ) : (
            <div className="space-y-8">
            {DATA_TYPE_CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2 sticky top-0 bg-bg-secondary pt-5 pb-2 z-10 border-b border-border-subtle/50">
                  {CATEGORY_ICONS[cat.id] && (() => { const Icon = CATEGORY_ICONS[cat.id]; return <Icon size={14} className="opacity-60" />; })()}
                  <span>{cat.label}</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {cat.types.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { onSelect(type); onClose(); }}
                      className="rounded-xl px-4 py-3 text-left text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-all border border-transparent hover:border-border-subtle hover:shadow-sm"
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Select } from '@/components/shared/Select';
import { findDataType } from '@/lib/dataTypes';

interface SettingsModalProps {
  fieldName: string;
  typeId: string;
  options: Record<string, any>;
  nullPercentage: number;
  onUpdateOption: (key: string, value: any) => void;
  onUpdateNullPercentage: (percentage: number) => void;
  onClose: () => void;
}

export function SettingsModal({
  fieldName,
  typeId,
  options,
  nullPercentage,
  onUpdateOption,
  onUpdateNullPercentage,
  onClose
}: SettingsModalProps) {
  const typeDef = findDataType(typeId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-bg-primary/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-bg-secondary border border-border-subtle rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-tertiary/30">
          <h3 className="text-lg font-semibold text-text-primary">
            Edit <span className="text-accent font-mono mx-1">{fieldName || 'field'}</span> Options
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-tertiary hover:text-text-primary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-5 overflow-y-auto space-y-5" style={{ scrollbarWidth: 'none' }}>
          <div className="space-y-6 pb-2">
            {/* General Settings */}
            <div>
              <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">General Settings</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-primary">Null Percentage</label>
                    <span className="text-xs font-mono text-text-muted">{nullPercentage || 0}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={nullPercentage || 0}
                    onChange={(e) => onUpdateNullPercentage(parseInt(e.target.value) || 0)}
                    className="w-full accent-accent h-1.5 cursor-pointer"
                  />
                  <p className="mt-1.5 text-[11px] text-text-muted">Probability of this field being empty (null).</p>
                </div>
              </div>
            </div>

            {/* Type Specific Options */}
            {typeDef && typeDef.options.length > 0 && (
              <div className="pt-6 border-t border-border-subtle/50">
                <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-4">Type Options</h4>
                <div className="space-y-3">
                  {typeDef.options.map((opt) => (
                    <div key={opt.key} className={opt.type === 'boolean' ? "flex items-center justify-between py-1" : "flex flex-col gap-2"}>
                      <label className="text-sm font-medium text-text-primary">{opt.label}</label>

                      {opt.type === 'select' && (
                        <Select
                          value={String(options[opt.key] ?? opt.default)}
                          onChange={(val) => onUpdateOption(opt.key, val)}
                          options={opt.choices?.map(c => ({ value: c, label: c })) || []}
                          className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none transition-all duration-200"
                        />
                      )}

                      {opt.type === 'number' && (
                        <input
                          type="number"
                          value={Number(options[opt.key] ?? opt.default)}
                          onChange={(e) => onUpdateOption(opt.key, parseInt(e.target.value) || 0)}
                          min={opt.min}
                          max={opt.max}
                          className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm font-mono text-text-primary focus:border-accent focus:outline-none transition-all duration-200"
                        />
                      )}

                      {opt.type === 'text' && (
                        <input
                          type="text"
                          value={String(options[opt.key] ?? opt.default)}
                          onChange={(e) => onUpdateOption(opt.key, e.target.value)}
                          placeholder={opt.placeholder}
                          className="w-full rounded-xl border border-border-subtle bg-bg-tertiary px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:border-accent focus:outline-none transition-all duration-200"
                        />
                      )}

                      {opt.type === 'boolean' && (
                        <div>
                          <button
                            onClick={() => onUpdateOption(opt.key, !(options[opt.key] ?? opt.default))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              (options[opt.key] ?? opt.default) ? 'bg-accent' : 'bg-bg-tertiary border border-border-subtle'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                (options[opt.key] ?? opt.default) ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 border-t border-border-subtle bg-bg-tertiary/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-accent text-white hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

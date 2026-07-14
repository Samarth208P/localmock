import { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from './Icons';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, options, className = '', disabled }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || { label: value, value };

  // Try to extract width class to apply to container, otherwise default to w-full
  const widthMatch = className.match(/w-\[[^\]]+\]|w-\w+/);
  const containerWidthClass = widthMatch ? widthMatch[0] : 'w-full';

  return (
    <div className={`relative ${containerWidthClass}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full text-left appearance-none ${className}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <IconChevronDown size={14} className={`shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180 text-text-primary' : 'text-text-muted'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[120px] mt-1 bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => (
              <button
              key={opt.value}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-border-subtle hover:text-text-primary ${
                String(opt.value) === String(value) ? 'bg-bg-tertiary text-accent font-medium' : 'text-text-secondary'
              }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

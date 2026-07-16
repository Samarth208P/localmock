import { useState, useRef, useEffect, useCallback, useId } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus the listbox exactly once when it opens (not on every hover re-render)
  useEffect(() => {
    if (isOpen) listboxRef.current?.focus();
  }, [isOpen]);

  const selectedIndex = options.findIndex((opt) => String(opt.value) === String(value));
  const selectedOption = options[selectedIndex] || { label: value, value };

  const openWithActive = useCallback((idx: number) => {
    setIsOpen(true);
    setActiveIndex(idx);
  }, []);

  const commit = useCallback((idx: number) => {
    const opt = options[idx];
    if (opt) onChange(opt.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  }, [options, onChange]);

  const onButtonKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openWithActive(selectedIndex >= 0 ? selectedIndex : 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      openWithActive(selectedIndex >= 0 ? selectedIndex : options.length - 1);
    }
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(options.length - 1, (i < 0 ? -1 : i) + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, (i < 0 ? options.length : i) - 1));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) commit(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Try to extract width class to apply to container, otherwise default to w-full
  const widthMatch = className.match(/w-\[[^\]]+\]|w-\w+/);
  const containerWidthClass = widthMatch ? widthMatch[0] : 'w-full';

  return (
    <div className={`relative ${containerWidthClass}`} ref={containerRef} onKeyDown={isOpen ? onListKeyDown : undefined}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => (isOpen ? setIsOpen(false) : openWithActive(selectedIndex))}
        onKeyDown={onButtonKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={`flex items-center justify-between w-full text-left appearance-none ${className}`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <IconChevronDown size={14} className={`shrink-0 ml-2 transition-transform ${isOpen ? 'rotate-180 text-text-primary' : 'text-text-muted'}`} />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          ref={listboxRef}
          className="absolute z-50 w-full min-w-[120px] mt-1 bg-bg-secondary border border-border-subtle rounded-xl shadow-2xl overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar outline-none"
        >
          {options.map((opt, idx) => (
              <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={String(opt.value) === String(value)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-border-subtle hover:text-text-primary ${
                String(opt.value) === String(value) ? 'bg-bg-tertiary text-accent font-medium' : 'text-text-secondary'
              } ${activeIndex === idx ? 'ring-1 ring-inset ring-accent/40' : ''}`}
              onClick={() => commit(idx)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

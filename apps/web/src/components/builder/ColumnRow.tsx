import type { ParsedColumn } from '@/store/schemaStore';
import { Select } from '../shared/Select';

interface ColumnRowProps {
  column: ParsedColumn;
  onTypeChange: (columnId: string, newType: string, newFakerMethod: string) => void;
  onConfirm: (columnId: string) => void;
}

const TYPE_OPTIONS = [
  { label: 'UUID', type: 'uuid', method: 'string.uuid' },
  { label: 'Email', type: 'email', method: 'internet.email' },
  { label: 'Full Name', type: 'fullName', method: 'person.fullName' },
  { label: 'First Name', type: 'firstName', method: 'person.firstName' },
  { label: 'Last Name', type: 'lastName', method: 'person.lastName' },
  { label: 'Phone', type: 'phone', method: 'phone.number' },
  { label: 'URL', type: 'url', method: 'internet.url' },
  { label: 'Date', type: 'date', method: 'date.recent' },
  { label: 'Boolean', type: 'boolean', method: 'datatype.boolean' },
  { label: 'Integer', type: 'integer', method: 'number.int' },
  { label: 'Decimal', type: 'decimal', method: 'finance.amount' },
  { label: 'Address', type: 'address', method: 'location.streetAddress' },
  { label: 'City', type: 'city', method: 'location.city' },
  { label: 'Country', type: 'country', method: 'location.country' },
  { label: 'Company', type: 'company', method: 'company.name' },
  { label: 'Paragraph', type: 'text', method: 'lorem.paragraph' },
  { label: 'Sentence', type: 'sentence', method: 'lorem.sentence' },
  { label: 'ETH Address', type: 'ethAddress', method: 'finance.ethereumAddress' },
  { label: 'Hex Hash', type: 'hexHash', method: 'string.hexadecimal' },
  { label: 'String', type: 'string', method: 'string.alphanumeric' },
];

export function ColumnRow({ column, onTypeChange, onConfirm }: ColumnRowProps) {
  const confidenceColor =
    column.confidence === 'high'
      ? 'bg-success/10 text-success border-success/20'
      : column.confidence === 'medium'
        ? 'bg-warning/10 text-warning border-warning/20'
        : 'bg-error/10 text-error border-error/20';

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-lg border border-border-subtle bg-bg-secondary px-4 py-2.5 transition-colors hover:border-border-active">
      {/* Field name */}
      <input
        type="text"
        value={column.name}
        readOnly
        className="h-8 w-full rounded-lg border border-transparent bg-transparent px-2.5 font-mono text-xs text-text-primary focus:border-accent focus:bg-bg-tertiary focus:outline-none transition-all duration-200"
      />

      {/* Type selector */}
      <Select
        value={column.type}
        onChange={(val) => {
          const opt = TYPE_OPTIONS.find((o) => o.type === val);
          if (opt) onTypeChange(column.id, opt.type, opt.method);
        }}
        disabled={column.confidence === 'high'}
        options={TYPE_OPTIONS.map(o => ({ value: o.type, label: o.label }))}
        className={`h-8 w-[140px] rounded-lg border px-2.5 text-xs transition-all duration-200 text-text-primary font-medium focus:outline-none ${
          column.confidence === 'high' 
            ? 'opacity-60 cursor-not-allowed border-border-subtle bg-bg-tertiary' 
            : 'border-border-subtle bg-bg-tertiary hover:border-border-active focus:border-accent focus:bg-accent/[0.04]'
        }`}
      />

      {/* Confidence badge */}
      <span
        className={`inline-flex h-5 w-5 items-center justify-center rounded border text-[10px] font-medium ${confidenceColor}`}
      >
        {column.confidence === 'high' ? '✓' : column.confidence === 'medium' ? '~' : '?'}
      </span>

      {/* Confirm button for low/medium confidence */}
      {column.confidence !== 'high' ? (
        <button
          onClick={() => onConfirm(column.id)}
          className="text-[10px] text-accent hover:text-accent-hover transition-colors w-[50px] text-left"
        >
          Confirm
        </button>
      ) : (
        <span className="w-[50px]" />
      )}
    </div>
  );
}

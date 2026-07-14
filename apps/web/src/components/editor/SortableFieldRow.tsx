import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@/components/shared/Icons';

interface SortableFieldRowProps {
  id: string;
  isExpanded?: boolean;
  hideHandle?: boolean;
  children: React.ReactNode;
}

export function SortableFieldRow({ id, isExpanded, hideHandle, children }: SortableFieldRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.95 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative animate-in rounded-xl border transition-[border-color,background-color,box-shadow,opacity] duration-200 ${
        isDragging
          ? 'border-accent shadow-sm bg-bg-secondary cursor-grabbing'
          : isExpanded
            ? 'border-accent/30 bg-accent/[0.02]' 
            : 'border-border-subtle bg-bg-secondary hover:border-border-active'
      }`}
    >
      <div className="flex w-full items-stretch">
        {/* Drag handle */}
        {!hideHandle && (
          <div
            {...attributes}
            {...listeners}
            className="flex w-8 flex-shrink-0 cursor-grab items-center justify-center rounded-l-xl hover:bg-bg-tertiary text-text-muted hover:text-text-primary active:cursor-grabbing transition-colors"
            title="Drag to reorder"
          >
            <IconGripVertical size={14} />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

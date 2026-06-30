interface CustomSectionCardActionsProps {
  title: string;
  index: number;
  totalCount: number;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export default function CustomSectionCardActions({
  title,
  index,
  totalCount,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: CustomSectionCardActionsProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm font-semibold text-[var(--color-admin-muted)]">
        #{index + 1} {title}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
        >
          복제
        </button>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={index === 0}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)] disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

interface AdminFormErrorProps {
  error?: string;
}

export default function AdminFormError({ error }: AdminFormErrorProps) {
  if (!error) return null;

  return (
    <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-base font-medium text-[var(--color-danger)]">
      {error}
    </div>
  );
}

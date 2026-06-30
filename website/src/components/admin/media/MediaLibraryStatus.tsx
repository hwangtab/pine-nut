export function MediaLibraryStatus({
  message,
  error,
}: {
  message: string | null;
  error: string | null;
}) {
  if (!message && !error) return null;

  return (
    <div
      className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ?? message}
    </div>
  );
}

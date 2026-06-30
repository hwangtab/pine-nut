interface AdminDashboardWarningsProps {
  warnings: string[];
}

export default function AdminDashboardWarnings({
  warnings,
}: AdminDashboardWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-800">
      <h2 className="text-base font-bold">데이터 연결 경고</h2>
      <div className="mt-3 space-y-2">
        {warnings.map((warning) => (
          <p key={warning}>{warning}</p>
        ))}
      </div>
    </section>
  );
}

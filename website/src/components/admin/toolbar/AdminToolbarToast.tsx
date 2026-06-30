export function AdminToolbarToast({ saveError }: { saveError: string }) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9991] w-[min(92vw,24rem)] px-5 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl shadow-2xl text-center">
      {saveError}
    </div>
  );
}

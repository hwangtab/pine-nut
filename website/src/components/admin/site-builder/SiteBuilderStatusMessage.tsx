"use client";

interface SiteBuilderStatusMessageProps {
  saveMessage: string | null;
  saveError: string | null;
}

export default function SiteBuilderStatusMessage({
  saveMessage,
  saveError,
}: SiteBuilderStatusMessageProps) {
  if (!saveMessage && !saveError) return null;

  return (
    <div
      className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
        saveError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {saveError ?? saveMessage}
    </div>
  );
}

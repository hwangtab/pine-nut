"use client";

import { Check } from "lucide-react";

interface DonateToastProps {
  message: string;
  visible: boolean;
}

export default function DonateToast({ message, visible }: DonateToastProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 bg-[var(--color-text)] text-white px-5 py-3 rounded-xl shadow-lg text-[15px] font-medium">
        <Check className="w-4 h-4 shrink-0" />
        {message}
      </div>
    </div>
  );
}

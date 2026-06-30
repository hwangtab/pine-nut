export type AdminFormVariant = "forest" | "sky";

const focusClasses: Record<AdminFormVariant, string> = {
  forest:
    "focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)]",
  sky: "focus:ring-[var(--color-sky)]/40 focus:border-[var(--color-sky)]",
};

const fileColorClasses: Record<AdminFormVariant, string> = {
  forest:
    "file:bg-[var(--color-forest)]/10 file:text-[var(--color-forest)] hover:file:bg-[var(--color-forest)]/20",
  sky: "file:bg-[var(--color-sky)]/10 file:text-[var(--color-sky)] hover:file:bg-[var(--color-sky)]/20",
};

const submitClasses: Record<AdminFormVariant, string> = {
  forest: "bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)]",
  sky: "bg-[var(--color-sky)] hover:bg-[var(--color-forest)]",
};

const noticeTextClasses: Record<AdminFormVariant, string> = {
  forest: "text-[var(--color-forest)]",
  sky: "text-[var(--color-sky)]",
};

export function adminInputClassName(variant: AdminFormVariant): string {
  return `w-full rounded-xl border border-[var(--color-admin-border)] px-4 py-3.5 text-base outline-none focus:ring-2 ${focusClasses[variant]}`;
}

export function adminSurfaceInputClassName(variant: AdminFormVariant): string {
  return `${adminInputClassName(variant)} bg-[var(--color-admin-surface)]`;
}

export function adminFileInputClassName(variant: AdminFormVariant): string {
  return `w-full overflow-hidden rounded-xl border border-[var(--color-admin-border)] px-3 py-3 text-sm sm:px-4 sm:py-3.5 sm:text-base file:mr-3 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-sm file:font-medium file:cursor-pointer ${fileColorClasses[variant]}`;
}

export function adminSubmitButtonClassName(variant: AdminFormVariant): string {
  return `w-full rounded-xl px-8 py-4 text-lg font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${submitClasses[variant]}`;
}

export function adminNoticeTextClassName(variant: AdminFormVariant): string {
  return noticeTextClasses[variant];
}

import type { ShareEditableContext, ShareLocale } from "./types";
import { ShareButtonLabel } from "./ShareButtonLabel";

export function ShareCopiedToast({
  copied,
  editable,
  locale = "ko",
}: {
  copied: boolean;
  editable: ShareEditableContext | null;
  locale?: ShareLocale;
}) {
  if (!copied) return null;

  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--color-text)] text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in">
      <ShareButtonLabel labelKey="copied" editable={editable} locale={locale} />
    </div>
  );
}

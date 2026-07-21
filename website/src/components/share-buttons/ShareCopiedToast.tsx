import type { ShareEditableContext } from "./types";
import { ShareButtonLabel } from "./ShareButtonLabel";

export function ShareCopiedToast({
  copied,
  editable,
}: {
  copied: boolean;
  editable: ShareEditableContext | null;
}) {
  if (!copied) return null;

  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[var(--color-text)] text-white text-sm px-4 py-2 rounded-full shadow-lg animate-fade-in">
      <ShareButtonLabel labelKey="copied" editable={editable} />
    </div>
  );
}

import { EditableText } from "@/components/editable";
import type { ShareEditableContext, ShareLabelKey, ShareLocale } from "./types";

const LABELS: Record<ShareLocale, Record<ShareLabelKey, string>> = {
  ko: {
    label: "공유하기",
    kakao: "카카오톡",
    twitter: "트위터(X)",
    facebook: "페이스북",
    copy: "URL 복사",
    copied: "복사되었습니다!",
  },
  en: {
    label: "Share",
    kakao: "Share",
    twitter: "Twitter (X)",
    facebook: "Facebook",
    copy: "Copy link",
    copied: "Link copied",
  },
};

export function ShareButtonLabel({
  labelKey,
  editable,
  as = "span",
  className,
  locale = "ko",
}: {
  labelKey: ShareLabelKey;
  editable: ShareEditableContext | null;
  as?: "p" | "span";
  className?: string;
  locale?: ShareLocale;
}) {
  const defaultValue = LABELS[locale][labelKey];

  if (!editable) {
    return as === "p" ? <p className={className}>{defaultValue}</p> : defaultValue;
  }

  return (
    <EditableText
      contentKey={`${editable.contentPrefix}.${labelKey}`}
      defaultValue={defaultValue}
      as={as}
      page={editable.page}
      section={editable.section}
      className={className}
    />
  );
}

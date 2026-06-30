import { EditableText } from "@/components/editable";
import type { ShareEditableContext, ShareLabelKey } from "./types";

const defaultLabels: Record<ShareLabelKey, string> = {
  label: "공유하기",
  kakao: "카카오톡",
  twitter: "트위터(X)",
  facebook: "페이스북",
  copy: "URL 복사",
  copied: "복사되었습니다!",
};

export function ShareButtonLabel({
  labelKey,
  editable,
  as = "span",
  className,
}: {
  labelKey: ShareLabelKey;
  editable: ShareEditableContext | null;
  as?: "p" | "span";
  className?: string;
}) {
  const defaultValue = defaultLabels[labelKey];

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

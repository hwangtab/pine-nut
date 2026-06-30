import { EditableLink, EditableText } from "@/components/editable";

export function HomeInlineSignaturePrivacyNotice() {
  return (
    <p className="text-xs text-[var(--color-text-muted)] text-center">
      <EditableText
        contentKey="home.cta.privacyPrefix"
        defaultValue="서명 시"
        as="span"
        page="home"
        section="cta"
      />{" "}
      <EditableLink
        contentKey="home.cta.privacyHref"
        defaultHref="/privacy"
        page="home"
        section="cta"
        inline
        className="underline hover:text-[var(--color-warm)]"
      >
        개인정보처리방침
      </EditableLink>
      <EditableText
        contentKey="home.cta.privacySuffix"
        defaultValue="에 동의합니다"
        as="span"
        page="home"
        section="cta"
      />
    </p>
  );
}

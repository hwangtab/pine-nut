import { EditableLink, EditableText } from "@/components/editable";
import type { HomeInlineSignatureConsentProps } from "./types";

/**
 * 개인정보 수집·이용과 만 14세 이상 여부에 대한 동의를 받는다.
 *
 * 예전에는 "서명 시 개인정보처리방침에 동의합니다"라는 고지 문구만 두고 코드가
 * 동의값을 true로 하드코딩해 보냈다. 동의를 실제로 받지 않은 채 개인정보가
 * 저장되던 것이라, 명시적 체크박스로 바꿨다.
 */
export function HomeInlineSignaturePrivacyNotice({
  agreed,
  onAgreedChange,
}: HomeInlineSignatureConsentProps) {
  return (
    <label
      htmlFor="inline-signature-consent"
      className="flex items-start justify-center gap-2 text-xs text-[var(--color-text-muted)] cursor-pointer"
    >
      <input
        id="inline-signature-consent"
        type="checkbox"
        checked={agreed}
        onChange={(event) => onAgreedChange(event.target.checked)}
        required
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-warm)] cursor-pointer"
      />
      <span>
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
          defaultValue="에 따른 수집·이용에 동의하며, 만 14세 이상입니다."
          as="span"
          page="home"
          section="cta"
        />
      </span>
    </label>
  );
}

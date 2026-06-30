import { EditableText } from "@/components/editable";
import type { HomeInlineSignatureFieldsProps } from "./types";

export function HomeInlineSignatureFields({
  name,
  email,
  namePlaceholder,
  emailPlaceholder,
  submitting,
  error,
  onNameChange,
  onEmailChange,
}: HomeInlineSignatureFieldsProps) {
  const errorId = error ? "inline-signature-error" : undefined;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <label htmlFor="inline-name" className="sr-only">
        이름
      </label>
      <input
        id="inline-name"
        type="text"
        placeholder={namePlaceholder}
        autoComplete="name"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className="min-h-[48px] flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-base placeholder:text-[var(--color-text-muted)]/60 outline-none focus:border-[var(--color-warm)] focus:ring-2 focus:ring-[var(--color-warm)]/30 transition-all"
      />
      <label htmlFor="inline-email" className="sr-only">
        이메일
      </label>
      <input
        id="inline-email"
        type="email"
        placeholder={emailPlaceholder}
        autoComplete="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className="min-h-[48px] flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-base placeholder:text-[var(--color-text-muted)]/60 outline-none focus:border-[var(--color-warm)] focus:ring-2 focus:ring-[var(--color-warm)]/30 transition-all"
      />
      <button
        type="submit"
        disabled={submitting}
        className="min-h-[48px] px-8 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
      >
        <EditableText
          contentKey={submitting ? "home.cta.inlineSubmitting" : "home.cta.inlineSubmit"}
          defaultValue={submitting ? "서명 중…" : "서명하기"}
          as="span"
          page="home"
          section="cta"
        />
      </button>
    </div>
  );
}

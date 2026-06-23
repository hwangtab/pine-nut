"use client";

import { useCallback, useState, type FormEvent } from "react";
import { Heart, PenLine, Share2 } from "lucide-react";
import {
  EditableLink,
  EditableList,
  EditableText,
  EditableValue,
} from "@/components/editable";
import { AnimatedCounter, FadeIn } from "@/components/home/HomeMotion";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { isValidEmail, submitSignature } from "@/lib/signatures/client";

interface HomeCtaSectionProps {
  signatureCount: number | null;
  onSignatureCountChange: (count: number) => void;
}

export default function HomeCtaSection({
  signatureCount,
  onSignatureCountChange,
}: HomeCtaSectionProps) {
  const { getContent, isEditMode } = useAdminEdit();
  const [inlineName, setInlineName] = useState("");
  const [inlineEmail, setInlineEmail] = useState("");
  const [inlineSubmitting, setInlineSubmitting] = useState(false);
  const [inlineSuccess, setInlineSuccess] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const homeShareTitle = getContent("home.share.title") ?? "풍천리를 지켜주세요";
  const homeShareText =
    getContent("home.share.text") ?? "강원도 홍천 풍천리 주민들의 이야기를 들어주세요.";
  const homeShareCopyAlert =
    getContent("home.share.copyAlert") ?? "링크가 복사되었습니다.";
  const inlineNamePlaceholder = getContent("home.cta.inlineNamePlaceholder") ?? "이름";
  const inlineEmailPlaceholder = getContent("home.cta.inlineEmailPlaceholder") ?? "이메일";
  const inlineNameError =
    getContent("home.cta.inlineErrorName") ?? "이름을 입력해주세요.";
  const inlineEmailError =
    getContent("home.cta.inlineErrorEmail") ?? "올바른 이메일 주소를 입력해주세요.";
  const inlineSubmitError =
    getContent("home.cta.inlineErrorSubmit") ?? "서명에 실패했습니다. 다시 시도해주세요.";

  const handleShare = useCallback(async () => {
    const shareData = {
      title: homeShareTitle,
      text: homeShareText,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert(homeShareCopyAlert);
      }
    } catch {
      /* user cancelled */
    }
  }, [homeShareCopyAlert, homeShareText, homeShareTitle]);

  const handleInlineSign = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setInlineError(null);

      const trimmedName = inlineName.trim();
      const trimmedEmail = inlineEmail.trim();

      if (!trimmedName) {
        setInlineError(inlineNameError);
        return;
      }
      if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
        setInlineError(inlineEmailError);
        return;
      }

      setInlineSubmitting(true);
      try {
        const result = await submitSignature({
          name: trimmedName,
          email: trimmedEmail,
          agreePrivacy: true,
          agreeAge: true,
        });
        setInlineSuccess(true);
        setInlineName("");
        setInlineEmail("");
        onSignatureCountChange(result.count);
      } catch (err) {
        setInlineError(err instanceof Error ? err.message : inlineSubmitError);
      } finally {
        setInlineSubmitting(false);
      }
    },
    [
      inlineEmail,
      inlineEmailError,
      inlineName,
      inlineNameError,
      inlineSubmitError,
      onSignatureCountChange,
    ],
  );

  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn className="text-center mb-16">
        <EditableText
          contentKey="home.cta.heading"
          defaultValue="함께해주세요"
          as="h2"
          page="home"
          section="cta"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-4"
        />
        <EditableText
          contentKey="home.cta.subtitle"
          defaultValue="작은 관심이 큰 힘이 됩니다"
          as="p"
          page="home"
          section="cta"
          className="text-lg text-[var(--color-text-muted)]"
        />
      </FadeIn>

      {signatureCount !== null && (
        <FadeIn className="text-center mb-12">
          <EditableText
            contentKey="home.cta.countPrefix"
            defaultValue="현재"
            as="p"
            page="home"
            section="cta"
            className="text-lg text-[var(--color-text-muted)] mb-2"
          />
          <p className="text-5xl sm:text-6xl md:text-7xl font-black text-[var(--color-warm)]">
            <AnimatedCounter target={signatureCount} suffix="명" />
          </p>
          <EditableText
            contentKey="home.cta.countSuffix"
            defaultValue="이 함께하고 있습니다"
            as="p"
            page="home"
            section="cta"
            className="text-lg text-[var(--color-text-muted)] mt-2"
          />
        </FadeIn>
      )}

      <FadeIn className="mb-12">
        <div className="max-w-2xl mx-auto">
          {inlineSuccess ? (
            <div className="text-center py-6">
              <EditableText
                contentKey="home.cta.inlineSuccess"
                defaultValue="감사합니다! 서명이 완료되었습니다 🎉"
                as="p"
                page="home"
                section="cta"
                className="text-xl font-bold text-[var(--color-forest)]"
              />
            </div>
          ) : (
            <form onSubmit={handleInlineSign} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="inline-name" className="sr-only">
                  이름
                </label>
                <input
                  id="inline-name"
                  type="text"
                  placeholder={inlineNamePlaceholder}
                  autoComplete="name"
                  value={inlineName}
                  onChange={(event) => {
                    setInlineName(event.target.value);
                    setInlineError(null);
                  }}
                  aria-invalid={Boolean(inlineError)}
                  aria-describedby={inlineError ? "inline-signature-error" : undefined}
                  className="min-h-[48px] flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-base placeholder:text-[var(--color-text-muted)]/60 outline-none focus:border-[var(--color-warm)] focus:ring-2 focus:ring-[var(--color-warm)]/30 transition-all"
                />
                <label htmlFor="inline-email" className="sr-only">
                  이메일
                </label>
                <input
                  id="inline-email"
                  type="email"
                  placeholder={inlineEmailPlaceholder}
                  autoComplete="email"
                  value={inlineEmail}
                  onChange={(event) => {
                    setInlineEmail(event.target.value);
                    setInlineError(null);
                  }}
                  aria-invalid={Boolean(inlineError)}
                  aria-describedby={inlineError ? "inline-signature-error" : undefined}
                  className="min-h-[48px] flex-1 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-base placeholder:text-[var(--color-text-muted)]/60 outline-none focus:border-[var(--color-warm)] focus:ring-2 focus:ring-[var(--color-warm)]/30 transition-all"
                />
                <button
                  type="submit"
                  disabled={inlineSubmitting}
                  className="min-h-[48px] px-8 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <EditableText
                    contentKey={
                      inlineSubmitting
                        ? "home.cta.inlineSubmitting"
                        : "home.cta.inlineSubmit"
                    }
                    defaultValue={inlineSubmitting ? "서명 중…" : "서명하기"}
                    as="span"
                    page="home"
                    section="cta"
                  />
                </button>
              </div>
              {inlineError && (
                <p id="inline-signature-error" className="text-sm text-red-600 text-center">
                  {inlineError}
                </p>
              )}
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
              {isEditMode && (
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <EditableValue
                    contentKey="home.cta.inlineNamePlaceholder"
                    defaultValue="이름"
                    page="home"
                    section="cta"
                    buttonLabel="이름 힌트"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="home.cta.inlineEmailPlaceholder"
                    defaultValue="이메일"
                    page="home"
                    section="cta"
                    buttonLabel="이메일 힌트"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="home.cta.inlineErrorName"
                    defaultValue="이름을 입력해주세요."
                    page="home"
                    section="cta"
                    buttonLabel="이름 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="home.cta.inlineErrorEmail"
                    defaultValue="올바른 이메일 주소를 입력해주세요."
                    page="home"
                    section="cta"
                    buttonLabel="이메일 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="home.cta.inlineErrorSubmit"
                    defaultValue="서명에 실패했습니다. 다시 시도해주세요."
                    page="home"
                    section="cta"
                    buttonLabel="제출 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                </div>
              )}
            </form>
          )}
        </div>
      </FadeIn>

      <EditableList
        contentKey="home.cta.cards"
        defaultItems={[
          {
            title: "서명하기",
            desc: "양수발전소 건설 반대 서명에 참여해주세요",
            href: "/petition",
          },
          {
            title: "후원하기",
            desc: "주민들의 법률 비용과 활동을 후원해주세요",
            href: "/donate",
          },
          {
            title: "공유하기",
            desc: "더 많은 사람들에게 풍천리의 이야기를 알려주세요",
            href: "#share",
          },
        ]}
        page="home"
        section="cta"
        fields={[
          { key: "title", label: "제목" },
          { key: "desc", label: "설명", type: "textarea" },
          { key: "href", label: "링크" },
        ]}
      >
        {(items) => {
          const icons = [PenLine, Heart, Share2];
          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
              {items.map((card, index) => {
                const IconComp = icons[index] || icons[0];
                return (
                  <FadeIn key={card.title} delay={index * 0.1}>
                    <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center h-full flex flex-col">
                      <IconComp className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-5" />
                      <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                      <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 flex-1">
                        {card.desc}
                      </p>
                      {card.href === "#share" ? (
                        <button
                          onClick={handleShare}
                          className="inline-block min-h-[44px] px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors cursor-pointer"
                        >
                          {card.title}
                        </button>
                      ) : (
                        <EditableLink
                          contentKey={`home.cta.cardLink.${index}`}
                          defaultHref={card.href}
                          page="home"
                          section="cta"
                          className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors"
                        >
                          {card.title}
                        </EditableLink>
                      )}
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          );
        }}
      </EditableList>
    </div>
  );
}

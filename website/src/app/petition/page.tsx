"use client";

import { useState, useRef, useCallback } from "react";
import SubHero from "@/components/SubHero";
import { EditableText, EditableList } from "@/components/editable";
import PetitionActionCards from "@/components/petition/PetitionActionCards";
import PetitionAnimatedCounter from "@/components/petition/PetitionAnimatedCounter";
import PetitionShareEditControls from "@/components/petition/PetitionShareEditControls";
import PetitionSignatureForm from "@/components/petition/PetitionSignatureForm";
import PetitionSuccess from "@/components/petition/PetitionSuccess";
import RecentSignatures from "@/components/petition/RecentSignatures";
import SignatureConfetti from "@/components/petition/SignatureConfetti";
import { usePetitionSignatureSummary } from "@/components/petition/usePetitionSignatureSummary";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

/* ──────────────────────── Main Page ──────────────────────── */
export default function PetitionPage() {
  const { getContent, isEditMode } = useAdminEdit();
  const {
    signatureCount,
    setSignatureCount,
    signatures,
    loadingSignatures,
    refreshSignatures,
  } = usePetitionSignatureSummary();
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const shareTitle = getContent("petition.share.title") ?? "풍천리를 지켜주세요";
  const shareText =
    getContent("petition.share.text") ?? "풍천리 주민들의 양수발전소 건설 반대 서명에 함께해주세요!";
  const shareCopyFallback =
    getContent("petition.share.copyFallback") ?? "링크가 복사되었습니다.";
  const formRef = useRef<HTMLFormElement>(null);

  const handleSignatureSubmitted = useCallback(
    ({ name, count }: { name: string; count: number }) => {
      setSignatureCount(count);
      setSubmittedName(name);
      setSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    },
    [setSignatureCount],
  );

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      events.shareClick("copy_url");
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  };

  const handleShareTwitter = useCallback(() => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(window.location.href);
    events.shareClick("twitter");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }, [shareText]);

  const handleShareKakao = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
        events.shareClick("web_share");
      } catch {
        /* 사용자가 공유를 취소한 경우 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(shareCopyFallback);
        events.shareClick("clipboard_share");
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch {
        /* fallback: do nothing */
      }
    }
  }, [shareCopyFallback, shareText, shareTitle]);

  const handleScrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showConfetti && <SignatureConfetti />}

      {/* ── Header ── */}
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        imageContentKey="petition.hero.image"
        imagePage="petition"
        imageSection="hero"
        title={<EditableText contentKey="petition.hero.title" defaultValue="함께해주세요" as="span" page="petition" section="hero" />}
        subtitle={<EditableText contentKey="petition.hero.subtitle" defaultValue="서명, 후원, 공유 중 지금 할 수 있는 행동으로 풍천리 주민들과 함께해주세요" as="span" page="petition" section="hero" />}
        eyebrow={<EditableText contentKey="petition.hero.eyebrow" defaultValue="참여하기" as="span" page="petition" section="hero" />}
        variant="emphasis"
        metric={
          <div className="flex flex-col items-center gap-1">
            <PetitionAnimatedCounter target={signatureCount} />
            <EditableText
              contentKey="petition.hero.metricLabel"
              defaultValue="명이 함께하고 있습니다"
              as="span"
              page="petition"
              section="hero"
              className="text-white/80 text-lg mt-1"
            />
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        <PetitionActionCards onScrollToForm={handleScrollToForm} />

        {/* Emotional prompt */}
        <EditableText
          contentKey="petition.emotional.prompt"
          defaultValue="680번의 외침에 당신의 이름을 더해주세요"
          as="p"
          page="petition"
          section="emotional"
          className="text-center text-xl font-serif-display text-[var(--color-text-muted)] mb-6"
        />

        {/* ── Form / Success ── */}
        {!submitted ? (
          <section className="fade-in" id="signature-form" aria-label="서명 양식">
            <PetitionSignatureForm
              formRef={formRef}
              onSubmitted={handleSignatureSubmitted}
              onRefreshSignatures={refreshSignatures}
            />
          </section>
        ) : (
          <div className="fade-in">
            <PetitionSuccess
              submittedName={submittedName}
              signatureCount={signatureCount}
              urlCopied={urlCopied}
              onPrimaryShare={handleShareKakao}
              onShareTwitter={handleShareTwitter}
              onCopyUrl={handleCopyUrl}
              onReset={() => {
                setSubmitted(false);
                setSubmittedName("");
                setUrlCopied(false);
              }}
            />
          </div>
        )}

        {/* ── Recent Signatures ── */}
        <RecentSignatures signatures={signatures} loading={loadingSignatures} />

        {/* ── Why Sign ── */}
        <section aria-label="서명이 왜 중요한가요">
          <EditableText
            contentKey="petition.reasons.heading"
            defaultValue="서명이 왜 중요한가요?"
            as="h2"
            page="petition"
            section="reasons"
            className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]"
          />
          <EditableList
            contentKey="petition.reasons.items"
            defaultItems={[
              { title: "국회와 정부에 전달됩니다", desc: "모아진 서명은 국회 환경노동위원회와 산업통상자원부에 공식 제출되어, 주민들의 목소리가 정책 결정 과정에 반영될 수 있도록 합니다." },
              { title: "숫자가 곧 주민들의 힘입니다", desc: "서명 참여자가 많을수록 언론과 여론의 관심이 커집니다. 한 명 한 명의 서명이 모여 거대한 변화를 만듭니다." },
              { title: "주민들에게 큰 위안이 됩니다", desc: "\u201C우리만의 싸움이 아니구나\u201D라는 사실이 풍천리 어르신들에게 가장 큰 힘이 됩니다." },
            ]}
            page="petition"
            section="reasons"
            fields={[
              { key: "title", label: "제목" },
              { key: "desc", label: "설명", type: "textarea" },
            ]}
          >
            {(items) => (
              <div className="bg-white border border-[var(--color-border)] rounded-[var(--radius-panel)] shadow-card p-6 sm:p-8 space-y-5">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <span
                      className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] font-bold"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)] mb-1">
                        {item.title}
                      </h3>
                      <p className="text-[var(--color-text-muted)] text-[15px]">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </EditableList>
        </section>
      </div>

      {isEditMode && <PetitionShareEditControls />}
    </div>
  );
}

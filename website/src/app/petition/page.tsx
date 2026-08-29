"use client";

import { useCallback, useRef, useState } from "react";
import SubHero from "@/components/SubHero";
import ShareButtons from "@/components/ShareButtons";
import { EditableText } from "@/components/editable";
import PetitionAnimatedCounter from "@/components/petition/PetitionAnimatedCounter";
import PetitionFAQ from "@/components/petition/PetitionFAQ";
import PetitionProgress from "@/components/petition/PetitionProgress";
import PetitionShareEditControls from "@/components/petition/PetitionShareEditControls";
import PetitionSignatureForm from "@/components/petition/PetitionSignatureForm";
import PetitionStatement from "@/components/petition/PetitionStatement";
import PetitionSuccess from "@/components/petition/PetitionSuccess";
import SignatureConfetti from "@/components/petition/SignatureConfetti";
import SignatureWall from "@/components/petition/SignatureWall";
import { koreanPetitionShareDefaults } from "@/components/petition/petition-copy";
import { usePetitionSignatureSummary } from "@/components/petition/usePetitionSignatureSummary";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { SIGNATURE_GOAL } from "@/lib/signatures/api/config";
import { SITE_URL } from "@/lib/site-config";

/* ──────────────────────── Main Page ──────────────────────── */
export default function PetitionPage() {
  const { getContent, isEditMode } = useAdminEdit();
  const { summary, loadingSummary, refreshSummary } = usePetitionSignatureSummary();
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  // 서명이 접수되면 값을 올려 명단 벽을 1페이지째부터 다시 불러오게 한다.
  // 재로드가 실패하면 SignatureWall은 이미 받아둔 항목을 에러 블록 뒤로 감추고
  // "다시 시도" 버튼을 보여준다(항목 상태 자체는 남아 재시도 성공 시 복귀한다).
  const [wallRefreshToken, setWallRefreshToken] = useState(0);

  // 폴백 문구는 CMS 편집 칩(PetitionShareEditControls)이 보여주는 기본값과
  // 같은 상수를 쓴다 — 여기서 리터럴을 따로 들고 있으면 관리자가 보는 기본값과
  // 실제로 공유되는 문구가 어긋난다.
  const shareTitle = getContent("petition.share.title") ?? koreanPetitionShareDefaults.title;
  const shareText = getContent("petition.share.text") ?? koreanPetitionShareDefaults.text;
  const shareCopyFallback =
    getContent("petition.share.copyFallback") ?? koreanPetitionShareDefaults.copyFallback;
  const formRef = useRef<HTMLFormElement>(null);

  const handleSignatureSubmitted = useCallback(({ name }: { name: string }) => {
    setSubmittedName(name);
    setSubmitted(true);
    setShowConfetti(true);
    setWallRefreshToken((token) => token + 1);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

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

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showConfetti && <SignatureConfetti />}

      {/* ── 1. 히어로 ── */}
      <SubHero
        imageUrl="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/ie003535383_std.jpg"
        imageContentKey="petition.hero.image"
        imagePage="petition"
        imageSection="hero"
        title={<EditableText contentKey="petition.hero.title" defaultValue="우리가 나무다" as="span" page="petition" section="hero" />}
        subtitle={<EditableText contentKey="petition.hero.subtitle" defaultValue="홍천 풍천리 양수발전소 백지화와 숲·계곡 보전을 위한 국민 연대서명" as="span" page="petition" section="hero" />}
        eyebrow={<EditableText contentKey="petition.hero.eyebrow" defaultValue="국민 연대서명" as="span" page="petition" section="hero" />}
        variant="emphasis"
        metric={
          <div className="stamp-badge inline-block">
            <div className="stamp-badge__inner">
              <PetitionAnimatedCounter target={summary.count} />
              <EditableText
                contentKey="petition.hero.metricLabel"
                defaultValue="명이 함께하고 있습니다"
                as="p"
                page="petition"
                section="hero"
                className="text-sm text-[var(--color-text-muted)] mt-1"
              />
            </div>
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        {/* ── 2. 진행률 ── */}
        <PetitionProgress
          count={summary.count}
          goal={SIGNATURE_GOAL}
          regionCount={summary.regionCount}
          recent24h={summary.recent24h}
          loading={loadingSummary}
        />

        {/* ── 3. 성명서 (숫자 카드 포함) ── */}
        <PetitionStatement />

        {/* ── 4. 서명 폼 / 제출 후 성공 화면 ── */}
        {!submitted ? (
          <section className="fade-in" id="signature-form" aria-label="서명 양식">
            <PetitionSignatureForm
              formRef={formRef}
              onSubmitted={handleSignatureSubmitted}
              onRefreshSignatures={refreshSummary}
            />
          </section>
        ) : (
          <div className="fade-in">
            {/* 서명 수는 제출 응답이 아니라 방금 다시 불러온 요약에서 온다 —
                응답 계약에 카운트가 없어 예전에는 0이 한 순간 보였다. */}
            <PetitionSuccess
              submittedName={submittedName}
              signatureCount={summary.count}
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

        {/* ── 5. 명단 벽 ── */}
        <SignatureWall
          heading="함께한 사람들"
          emptyText="아직 공개된 서명이 없습니다. 첫 번째로 이름을 남겨주세요!"
          moreText="더 보기"
          refreshToken={wallRefreshToken}
        />

        {/* ── 6. 공유 ── */}
        <ShareButtons
          title={shareTitle}
          url={`${SITE_URL}/petition`}
          page="petition"
          section="share"
          locale="ko"
        />

        {/* ── 7. FAQ ── */}
        <PetitionFAQ />
      </div>

      {isEditMode && <PetitionShareEditControls />}
    </div>
  );
}

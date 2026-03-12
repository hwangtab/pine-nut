"use client";

import { useState, useEffect, useRef, useCallback, type FormEvent, type ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Send, Check, Copy, Loader2, HeartHandshake, Megaphone } from "lucide-react";
import SubHero from "@/components/SubHero";
import { EditableLink, EditableText, EditableList, EditableValue } from "@/components/editable";
import { events } from "@/lib/analytics";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";

/* ──────────────────────── Types ──────────────────────── */
interface Signature {
  name: string;
  message: string;
  created_at: string;
}

/* ──────────────────────── Animated Counter ──────────────────────── */
function AnimatedCounter({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString("ko-KR"));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target, count, rounded]);

  return (
    <motion.span
      className="text-5xl sm:text-6xl font-black text-[var(--color-warm)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {display}
    </motion.span>
  );
}

/* ──────────────────────── Confetti ──────────────────────── */
function Confetti() {
  const colors = ["#C75000", "#FF6B1A", "#2D5016", "#4A7A2E", "#D4A843", "#1B4965"];
  const confettiPieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: (i * 17.3) % 100,
    delay: (i % 10) * 0.05,
    size: 6 + (i % 8),
    rotation: (i * 37) % 360,
    borderRadius: i % 2 === 0 ? "50%" : "2px",
    color: colors[i % colors.length],
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {confettiPieces.map((piece) => {
        return (
          <span
            key={piece.id}
            className="absolute animate-confetti"
            style={{
              left: `${piece.left}%`,
              top: "-10px",
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.borderRadius,
              animationDelay: `${piece.delay}s`,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall 2.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}

/* ──────────────────────── Rolling Signatures ──────────────────────── */
function RecentSignatures({ signatures, loading }: { signatures: Signature[]; loading: boolean }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (signatures.length === 0) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % signatures.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [signatures.length]);

  const ordered = signatures.length > 0
    ? [...signatures.slice(offset), ...signatures.slice(0, offset)]
    : [];

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="w-full" aria-label="최근 서명">
      <EditableText
        contentKey="petition.recent.heading"
        defaultValue="최근 서명"
        as="h2"
        page="petition"
        section="recent"
        className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]"
      />
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <EditableText
            contentKey="petition.recent.loading"
            defaultValue="불러오는 중..."
            as="span"
            page="petition"
            section="recent"
          />
        </div>
      ) : signatures.length === 0 ? (
        <EditableText
          contentKey="petition.recent.empty"
          defaultValue="아직 서명이 없습니다. 첫 번째로 서명해주세요!"
          as="p"
          page="petition"
          section="recent"
          className="text-center py-8 text-[var(--color-text-muted)]"
        />
      ) : (
        <div className="space-y-3 overflow-hidden max-h-[320px]">
          <AnimatePresence mode="popLayout">
            {ordered.slice(0, 5).map((sig, i) => (
              <motion.div
                key={`${sig.name}-${(offset + i) % signatures.length}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white border border-[var(--color-border)] rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text)]">{sig.name}</span>
                  <time dateTime={sig.created_at} className="text-sm text-[var(--color-text-muted)]">{formatDate(sig.created_at)}</time>
                </div>
                {sig.message && (
                  <p className="mt-1 text-[var(--color-text-muted)] text-[15px]">
                    &ldquo;{sig.message}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */
export default function PetitionPage() {
  const { getContent, isEditMode } = useAdminEdit();
  const [signatureCount, setSignatureCount] = useState(0);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [signatureStartedTracked, setSignatureStartedTracked] = useState(false);

  const shareTitle = getContent("petition.share.title") ?? "풍천리를 지켜주세요";
  const shareText =
    getContent("petition.share.text") ?? "풍천리 주민들의 양수발전소 건설 반대 서명에 함께해주세요!";
  const shareCopyFallback =
    getContent("petition.share.copyFallback") ?? "링크가 복사되었습니다.";
  const formNamePlaceholder = getContent("petition.form.namePlaceholder") ?? "홍길동";
  const formEmailPlaceholder =
    getContent("petition.form.emailPlaceholder") ?? "example@email.com";
  const formMessagePlaceholder =
    getContent("petition.form.messagePlaceholder") ?? "주민분들께 응원의 말씀을 남겨주세요";
  const formNameError =
    getContent("petition.form.errorName") ?? "이름을 입력해주세요.";
  const formEmailRequiredError =
    getContent("petition.form.errorEmailRequired") ?? "이메일을 입력해주세요.";
  const formEmailInvalidError =
    getContent("petition.form.errorEmailInvalid") ?? "올바른 이메일 형식을 입력해주세요.";
  const formPrivacyError =
    getContent("petition.form.errorPrivacy") ?? "개인정보 수집·이용에 동의해주세요.";
  const formAgeError =
    getContent("petition.form.errorAge") ?? "만 14세 이상 확인이 필요합니다.";
  const formSubmitFallbackError =
    getContent("petition.form.errorSubmit") ?? "서명 제출에 실패했습니다. 다시 시도해주세요.";

  const formRef = useRef<HTMLFormElement>(null);

  const fetchSignatures = useCallback(async () => {
    try {
      const res = await fetch("/api/signatures");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSignatureCount(data.count);
      setSignatures(data.signatures || []);
    } catch (err) {
      console.error("Failed to fetch signatures:", err);
    } finally {
      setLoadingSignatures(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = formNameError;
    }
    if (!email.trim()) {
      newErrors.email = formEmailRequiredError;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = formEmailInvalidError;
    }
    if (!agreePrivacy) {
      newErrors.agreePrivacy = formPrivacyError;
    }
    if (!agreeAge) {
      newErrors.agreeAge = formAgeError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [agreeAge, agreePrivacy, email, formAgeError, formEmailInvalidError, formEmailRequiredError, formNameError, formPrivacyError, name]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          agreePrivacy,
          agreeAge,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || formSubmitFallbackError);
      }

      setSignatureCount(data.count);
      setSubmittedName(name.trim());
      setSubmitted(true);
      setShowConfetti(true);

      events.signatureComplete();

      // Refresh signatures list
      fetchSignatures();

      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : formSubmitFallbackError
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      {showConfetti && <Confetti />}

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
            <AnimatedCounter target={signatureCount} />
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
        <section aria-label="함께할 방법">
          <EditableList
            contentKey="petition.cta.cards"
            defaultItems={[
              { title: "서명하기", desc: "이름을 남겨 주민들의 목소리에 힘을 보태주세요." },
              { title: "후원하기", desc: "교통비와 법률비용 등 투쟁에 필요한 실질적 힘을 보태주세요." },
              { title: "공유하기", desc: "카드뉴스를 저장해 더 많은 사람에게 풍천리 이야기를 알려주세요." },
            ]}
            page="petition"
            section="cta"
            fields={[
              { key: "title", label: "제목" },
              { key: "desc", label: "설명", type: "textarea" },
            ]}
          >
            {(items) => {
              const icons = [
                { Icon: Send, colorClass: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]" },
                { Icon: HeartHandshake, colorClass: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]" },
                { Icon: Megaphone, colorClass: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]" },
              ];
              const wrappers = [
                (children: ReactNode) => (
                  <button key="cta-0" type="button" onClick={handleScrollToForm} className="text-left bg-white border border-[var(--color-border)] rounded-2xl p-6 transition-colors hover:bg-[var(--color-bg-warm)] cursor-pointer">
                    {children}
                  </button>
                ),
                (children: ReactNode) => (
                  <EditableLink
                    key="cta-1"
                    contentKey="petition.cta.cards.1.href"
                    defaultHref="/donate"
                    page="petition"
                    section="cta"
                    className="block rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:bg-[var(--color-bg-warm)]"
                  >
                    {children}
                  </EditableLink>
                ),
                (children: ReactNode) => (
                  <EditableLink
                    key="cta-2"
                    contentKey="petition.cta.cards.2.href"
                    defaultHref="/share"
                    page="petition"
                    section="cta"
                    className="block rounded-2xl border border-[var(--color-border)] bg-white p-6 transition-colors hover:bg-[var(--color-bg-warm)]"
                  >
                    {children}
                  </EditableLink>
                ),
              ];
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {items.map((item, i) => {
                    const icon = icons[i] || icons[0];
                    const wrap = wrappers[i] || wrappers[0];
                    return wrap(
                      <>
                        <div className={`w-11 h-11 rounded-full ${icon.colorClass} flex items-center justify-center mb-4`}>
                          <icon.Icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">{item.title}</h2>
                        <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
                      </>
                    );
                  })}
                </div>
              );
            }}
          </EditableList>
        </section>

        {/* Emotional prompt */}
        <EditableText
          contentKey="petition.emotional.prompt"
          defaultValue="680번의 외침에 당신의 이름을 더해주세요"
          as="p"
          page="petition"
          section="emotional"
          className="text-center text-xl font-serif text-[var(--color-text-muted)] mb-6"
        />

        {/* ── Form / Success ── */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              id="signature-form"
              aria-label="서명 양식"
            >
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                onFocusCapture={() => {
                  if (!signatureStartedTracked) {
                    events.signatureStart();
                    setSignatureStartedTracked(true);
                  }
                }}
                noValidate
                className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
              >
                {/* 이름 */}
                <div>
                  <label
                    htmlFor="sig-name"
                    className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
                  >
                    <EditableText
                      contentKey="petition.form.nameLabel"
                      defaultValue="이름"
                      as="span"
                      page="petition"
                      section="form"
                    /> <span className="text-[var(--color-warm)]">*</span>
                  </label>
                  <input
                    id="sig-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "sig-name-error" : undefined}
                    placeholder={formNamePlaceholder}
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)] transition"
                  />
                  {errors.name && (
                    <p id="sig-name-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* 이메일 */}
                <div>
                  <label
                    htmlFor="sig-email"
                    className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
                  >
                    <EditableText
                      contentKey="petition.form.emailLabel"
                      defaultValue="이메일"
                      as="span"
                      page="petition"
                      section="form"
                    /> <span className="text-[var(--color-warm)]">*</span>
                  </label>
                  <input
                    id="sig-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "sig-email-error" : undefined}
                    placeholder={formEmailPlaceholder}
                    className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)] transition"
                  />
                  {errors.email && (
                    <p id="sig-email-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 응원 메시지 */}
                <div>
                  <label
                    htmlFor="sig-message"
                    className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
                  >
                    <EditableText
                      contentKey="petition.form.messageLabel"
                      defaultValue="응원 메시지"
                      as="span"
                      page="petition"
                      section="form"
                    />{" "}
                    <EditableText
                      contentKey="petition.form.messageOptional"
                      defaultValue="(선택)"
                      as="span"
                      page="petition"
                      section="form"
                      className="font-normal text-[var(--color-text-muted)]"
                    />
                  </label>
                  <textarea
                    id="sig-message"
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) setMessage(e.target.value);
                    }}
                    maxLength={100}
                    rows={3}
                    placeholder={formMessagePlaceholder}
                    aria-describedby="sig-message-count"
                    className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-warm)] resize-none transition"
                  />
                  <p
                    id="sig-message-count"
                    className="mt-1 text-right text-sm text-[var(--color-text-muted)]"
                  >
                    {message.length}/100
                  </p>
                </div>

                {/* 동의 체크박스들 */}
                <div className="space-y-3">
                  {/* 개인정보 동의 */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => {
                          setAgreePrivacy(e.target.checked);
                          if (errors.agreePrivacy)
                            setErrors((prev) => ({ ...prev, agreePrivacy: "" }));
                        }}
                        aria-invalid={!!errors.agreePrivacy}
                        aria-describedby={
                          errors.agreePrivacy ? "sig-privacy-error" : undefined
                        }
                        className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
                      />
                      <span className="text-[15px] text-[var(--color-text)]">
                        <button
                          type="button"
                          className="underline text-[var(--color-sky)] hover:text-[var(--color-sky)]/80"
                          onClick={() => setShowPrivacy(!showPrivacy)}
                        >
                          <EditableText
                            contentKey="petition.form.privacyToggle"
                            defaultValue="개인정보 수집·이용"
                            as="span"
                            page="petition"
                            section="form"
                          />
                        </button>
                        <EditableText
                          contentKey="petition.form.privacyConsentSuffix"
                          defaultValue="에 동의합니다."
                          as="span"
                          page="petition"
                          section="form"
                        />{" "}
                        <span className="text-[var(--color-warm)]">*</span>
                      </span>
                    </label>
                    {showPrivacy && (
                      <div className="ml-8 mt-2 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm text-[var(--color-text-muted)] leading-relaxed">
                        <EditableText
                          contentKey="petition.form.privacyLine1"
                          defaultValue="수집 항목: 이름, 이메일"
                          as="p"
                          page="petition"
                          section="form"
                          className="mb-1"
                        />
                        <EditableText
                          contentKey="petition.form.privacyLine2"
                          defaultValue="수집 목적: 서명 확인 및 캠페인 안내"
                          as="p"
                          page="petition"
                          section="form"
                          className="mb-1"
                        />
                        <EditableText
                          contentKey="petition.form.privacyLine3"
                          defaultValue="보유 기간: 캠페인 종료 후 즉시 파기"
                          as="p"
                          page="petition"
                          section="form"
                          className="mb-1"
                        />
                        <EditableText
                          contentKey="petition.form.privacyLine4"
                          defaultValue="동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다."
                          as="p"
                          page="petition"
                          section="form"
                        />
                      </div>
                    )}
                    {errors.agreePrivacy && (
                      <p
                        id="sig-privacy-error"
                        className="ml-8 mt-1 text-sm text-red-600"
                        role="alert"
                      >
                        {errors.agreePrivacy}
                      </p>
                    )}
                  </div>

                  {/* 14세 이상 */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={agreeAge}
                        onChange={(e) => {
                          setAgreeAge(e.target.checked);
                          if (errors.agreeAge)
                            setErrors((prev) => ({ ...prev, agreeAge: "" }));
                        }}
                        aria-invalid={!!errors.agreeAge}
                        aria-describedby={errors.agreeAge ? "sig-age-error" : undefined}
                        className="mt-1 w-5 h-5 shrink-0 accent-[var(--color-warm)] cursor-pointer"
                      />
                      <span className="text-[15px] text-[var(--color-text)]">
                        <EditableText
                          contentKey="petition.form.ageLabel"
                          defaultValue="만 14세 이상입니다."
                          as="span"
                          page="petition"
                          section="form"
                        />{" "}
                        <span className="text-[var(--color-warm)]">*</span>
                      </span>
                    </label>
                    {errors.agreeAge && (
                      <p
                        id="sig-age-error"
                        className="ml-8 mt-1 text-sm text-red-600"
                        role="alert"
                      >
                        {errors.agreeAge}
                      </p>
                    )}
                  </div>
                </div>

                {/* 제출 에러 */}
                {submitError && (
                  <p className="text-sm text-red-600 text-center" role="alert">
                    {submitError}
                  </p>
                )}

                {/* 제출 */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full min-h-[52px] rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <EditableText
                        contentKey="petition.form.submitting"
                        defaultValue="서명 중..."
                        as="span"
                        page="petition"
                        section="form"
                      />
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <EditableText
                        contentKey="petition.form.submit"
                        defaultValue="서명하기"
                        as="span"
                        page="petition"
                        section="form"
                      />
                    </>
                  )}
                </button>
              </form>
              {isEditMode && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <EditableValue
                    contentKey="petition.form.namePlaceholder"
                    defaultValue="홍길동"
                    page="petition"
                    section="form"
                    buttonLabel="이름 힌트"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.emailPlaceholder"
                    defaultValue="example@email.com"
                    page="petition"
                    section="form"
                    buttonLabel="이메일 힌트"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.messagePlaceholder"
                    defaultValue="주민분들께 응원의 말씀을 남겨주세요"
                    page="petition"
                    section="form"
                    multiline
                    buttonLabel="메시지 힌트"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.errorName"
                    defaultValue="이름을 입력해주세요."
                    page="petition"
                    section="form"
                    buttonLabel="이름 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.errorEmailRequired"
                    defaultValue="이메일을 입력해주세요."
                    page="petition"
                    section="form"
                    buttonLabel="이메일 필수"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.errorEmailInvalid"
                    defaultValue="올바른 이메일 형식을 입력해주세요."
                    page="petition"
                    section="form"
                    buttonLabel="이메일 형식"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.errorPrivacy"
                    defaultValue="개인정보 수집·이용에 동의해주세요."
                    page="petition"
                    section="form"
                    buttonLabel="개인정보 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.errorAge"
                    defaultValue="만 14세 이상 확인이 필요합니다."
                    page="petition"
                    section="form"
                    buttonLabel="연령 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                  <EditableValue
                    contentKey="petition.form.errorSubmit"
                    defaultValue="서명 제출에 실패했습니다. 다시 시도해주세요."
                    page="petition"
                    section="form"
                    buttonLabel="제출 오류"
                    wrapperClassName="relative"
                    buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {(value, editButton) => editButton ?? <span>{value}</span>}
                  </EditableValue>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[var(--color-border)] rounded-2xl p-8 sm:p-10 text-center"
              aria-live="polite"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-forest)]/10 flex items-center justify-center">
                <Check className="w-8 h-8 text-[var(--color-forest)]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-text)] mb-2">
                <EditableText
                  contentKey="petition.success.titlePrefix"
                  defaultValue="감사합니다,"
                  as="span"
                  page="petition"
                  section="success"
                />{" "}
                {submittedName}
                <EditableText
                  contentKey="petition.success.titleSuffix"
                  defaultValue="님!"
                  as="span"
                  page="petition"
                  section="success"
                />
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8">
                <span className="font-bold text-[var(--color-warm)]">
                  {signatureCount.toLocaleString("ko-KR")}
                </span>
                <EditableText
                  contentKey="petition.success.countSuffix"
                  defaultValue="번째로 함께해주셨습니다."
                  as="span"
                  page="petition"
                  section="success"
                />
              </p>

              {/* Share buttons */}
              <div className="space-y-3">
                <p className="text-[15px] font-semibold text-[var(--color-text)] mb-4">
                  <EditableText
                    contentKey="petition.success.sharePrompt"
                    defaultValue="더 많은 사람에게 알려주세요"
                    as="span"
                    page="petition"
                    section="success"
                  />
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleShareKakao}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#FEE500] text-[#191919] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  >
                    <EditableText
                      contentKey="petition.success.shareKakao"
                      defaultValue="카카오톡 공유"
                      as="span"
                      page="petition"
                      section="success"
                    />
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1DA1F2] text-white font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  >
                    <EditableText
                      contentKey="petition.success.shareTwitter"
                      defaultValue="트위터 공유"
                      as="span"
                      page="petition"
                      section="success"
                    />
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-border)]"
                  >
                    {urlCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <EditableText
                          contentKey="petition.success.copied"
                          defaultValue="복사됨!"
                          as="span"
                          page="petition"
                          section="success"
                        />
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <EditableText
                          contentKey="petition.success.copy"
                          defaultValue="URL 복사"
                          as="span"
                          page="petition"
                          section="success"
                        />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setMessage("");
                  setAgreePrivacy(false);
                  setAgreeAge(false);
                  setErrors({});
                  setSubmitError("");
                }}
                className="mt-8 text-[var(--color-text-muted)] underline text-sm hover:text-[var(--color-text)] transition-colors min-h-[44px]"
              >
                <EditableText
                  contentKey="petition.success.reset"
                  defaultValue="다른 사람도 서명하기"
                  as="span"
                  page="petition"
                  section="success"
                />
              </button>
            </motion.section>
          )}
        </AnimatePresence>

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
              <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5">
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

      {isEditMode && (
        <div className="fixed bottom-4 left-4 z-40 flex flex-wrap gap-2 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur">
          <EditableValue
            contentKey="petition.share.title"
            defaultValue="풍천리를 지켜주세요"
            page="petition"
            section="share"
            buttonLabel="공유 제목"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.share.text"
            defaultValue="풍천리 주민들의 양수발전소 건설 반대 서명에 함께해주세요!"
            page="petition"
            section="share"
            multiline
            buttonLabel="공유 설명"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
          <EditableValue
            contentKey="petition.share.copyFallback"
            defaultValue="링크가 복사되었습니다."
            page="petition"
            section="share"
            buttonLabel="복사 알림"
            wrapperClassName="relative"
            buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {(value, editButton) => editButton ?? <span>{value}</span>}
          </EditableValue>
        </div>
      )}
    </div>
  );
}

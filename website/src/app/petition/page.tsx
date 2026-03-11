"use client";

import { useState, useEffect, useRef, useCallback, FormEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Send, Check, Copy, Loader2 } from "lucide-react";
import SubHero from "@/components/SubHero";

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
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
        최근 서명
      </h2>
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          불러오는 중...
        </div>
      ) : signatures.length === 0 ? (
        <p className="text-center py-8 text-[var(--color-text-muted)]">
          아직 서명이 없습니다. 첫 번째로 서명해주세요!
        </p>
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
                  <span className="text-sm text-[var(--color-text-muted)]">{formatDate(sig.created_at)}</span>
                </div>
                {sig.message && (
                  <p className="mt-1 text-[var(--color-text-muted)] text-[15px]">
                    \u201C{sig.message}\u201D
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }
    if (!email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }
    if (!agreePrivacy) {
      newErrors.agreePrivacy = "개인정보 수집·이용에 동의해주세요.";
    }
    if (!agreeAge) {
      newErrors.agreeAge = "만 14세 이상 확인이 필요합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "서명 제출에 실패했습니다.");
      }

      setSignatureCount(data.count);
      setSubmittedName(name.trim());
      setSubmitted(true);
      setShowConfetti(true);

      // Track successful signature
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "signature_complete", {
          event_category: "conversion",
          event_label: "form_submit",
        });
      }

      // Refresh signatures list
      fetchSignatures();

      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "서명 제출에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch {
      /* fallback: do nothing */
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      "풍천리 주민들의 양수발전소 건설 반대 서명에 함께해주세요!"
    );
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const handleShareKakao = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "풍천리를 지켜주세요",
          text: "풍천리 주민들의 양수발전소 건설 반대 서명에 함께해주세요!",
          url: window.location.href,
        });
      } catch {
        /* 사용자가 공유를 취소한 경우 */
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2000);
      } catch {
        /* fallback: do nothing */
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showConfetti && <Confetti />}

      {/* ── Header ── */}
      <SubHero
        imageUrl="https://ojsfile.ohmynews.com/STD_IMG_FILE/2025/1016/IE003535383_STD.jpg"
        title="서명으로 함께해주세요"
        subtitle="당신의 이름 하나가 풍천리 주민들에게 큰 힘이 됩니다"
        variant="emphasis"
        metric={
          <div className="flex flex-col items-center gap-1">
            <AnimatedCounter target={signatureCount} />
            <span className="text-white/80 text-lg mt-1">
              명이 함께하고 있습니다
            </span>
          </div>
        }
      />

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        {/* Emotional prompt */}
        <p className="text-center text-xl font-serif text-[var(--color-text-muted)] mb-6">
          680번의 외침에 당신의 이름을 더해주세요
        </p>

        {/* ── Form / Success ── */}
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.section
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              aria-label="서명 양식"
            >
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-6"
              >
                {/* 이름 */}
                <div>
                  <label
                    htmlFor="sig-name"
                    className="block text-[15px] font-semibold mb-2 text-[var(--color-text)]"
                  >
                    이름 <span className="text-[var(--color-warm)]">*</span>
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
                    placeholder="홍길동"
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
                    이메일 <span className="text-[var(--color-warm)]">*</span>
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
                    placeholder="example@email.com"
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
                    응원 메시지{" "}
                    <span className="font-normal text-[var(--color-text-muted)]">(선택)</span>
                  </label>
                  <textarea
                    id="sig-message"
                    value={message}
                    onChange={(e) => {
                      if (e.target.value.length <= 100) setMessage(e.target.value);
                    }}
                    maxLength={100}
                    rows={3}
                    placeholder="주민분들께 응원의 말씀을 남겨주세요"
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
                          개인정보 수집·이용
                        </button>
                        에 동의합니다.{" "}
                        <span className="text-[var(--color-warm)]">*</span>
                      </span>
                    </label>
                    {showPrivacy && (
                      <div className="ml-8 mt-2 p-4 bg-[var(--color-bg-warm)] rounded-xl text-sm text-[var(--color-text-muted)] leading-relaxed">
                        <p className="mb-1"><strong>수집 항목:</strong> 이름, 이메일</p>
                        <p className="mb-1"><strong>수집 목적:</strong> 서명 확인 및 캠페인 안내</p>
                        <p className="mb-1"><strong>보유 기간:</strong> 캠페인 종료 후 즉시 파기</p>
                        <p>동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다.</p>
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
                        만 14세 이상입니다.{" "}
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
                  className="w-full min-h-[52px] rounded-xl bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      서명 중...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      서명하기
                    </>
                  )}
                </button>
              </form>
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
                감사합니다, {submittedName}님!
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8">
                <span className="font-bold text-[var(--color-warm)]">
                  {signatureCount.toLocaleString("ko-KR")}
                </span>
                번째로 함께해주셨습니다.
              </p>

              {/* Share buttons */}
              <div className="space-y-3">
                <p className="text-[15px] font-semibold text-[var(--color-text)] mb-4">
                  더 많은 사람에게 알려주세요
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleShareKakao}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#FEE500] text-[#191919] font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  >
                    카카오톡 공유
                  </button>
                  <button
                    onClick={handleShareTwitter}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#1DA1F2] text-white font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  >
                    트위터 공유
                  </button>
                  <button
                    onClick={handleCopyUrl}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[var(--color-bg)] text-[var(--color-text)] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-[var(--color-border)]"
                  >
                    {urlCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        복사됨!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        URL 복사
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
                다른 사람도 서명하기
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Recent Signatures ── */}
        <RecentSignatures signatures={signatures} loading={loadingSignatures} />

        {/* ── Why Sign ── */}
        <section aria-label="서명이 왜 중요한가요">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
            서명이 왜 중요한가요?
          </h2>
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] font-bold"
                aria-hidden="true"
              >
                1
              </span>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">
                  국회와 정부에 전달됩니다
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px]">
                  모아진 서명은 국회 환경노동위원회와 산업통상자원부에 공식 제출되어,
                  주민들의 목소리가 정책 결정 과정에 반영될 수 있도록 합니다.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] font-bold"
                aria-hidden="true"
              >
                2
              </span>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">
                  숫자가 곧 주민들의 힘입니다
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px]">
                  서명 참여자가 많을수록 언론과 여론의 관심이 커집니다.
                  한 명 한 명의 서명이 모여 거대한 변화를 만듭니다.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)] font-bold"
                aria-hidden="true"
              >
                3
              </span>
              <div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">
                  주민들에게 큰 위안이 됩니다
                </h3>
                <p className="text-[var(--color-text-muted)] text-[15px]">
                  \u201C우리만의 싸움이 아니구나\u201D라는 사실이
                  풍천리 어르신들에게 가장 큰 힘이 됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

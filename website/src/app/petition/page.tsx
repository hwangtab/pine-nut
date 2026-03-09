"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { Send, Check, Copy, X } from "lucide-react";

/* ──────────────────────── Demo data ──────────────────────── */
const DEMO_SIGNATURES = [
  { name: "김*수", message: "풍천리 주민분들 힘내세요!", date: "2026-03-10" },
  { name: "박*영", message: "자연을 지키는 일에 함께합니다.", date: "2026-03-09" },
  { name: "이*현", message: "응원합니다. 끝까지 싸워주세요.", date: "2026-03-09" },
  { name: "정*미", message: "작은 힘이라도 보태고 싶습니다.", date: "2026-03-08" },
  { name: "최*호", message: "", date: "2026-03-08" },
];

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
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        const rotation = Math.random() * 360;
        return (
          <span
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${left}%`,
              top: "-10px",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animationDelay: `${delay}s`,
              transform: `rotate(${rotation}deg)`,
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
function RecentSignatures() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % DEMO_SIGNATURES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const ordered = [
    ...DEMO_SIGNATURES.slice(offset),
    ...DEMO_SIGNATURES.slice(0, offset),
  ];

  return (
    <section className="w-full" aria-label="최근 서명">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]">
        최근 서명
      </h2>
      <div className="space-y-3 overflow-hidden max-h-[320px]">
        <AnimatePresence mode="popLayout">
          {ordered.slice(0, 5).map((sig, i) => (
            <motion.div
              key={`${sig.name}-${(offset + i) % DEMO_SIGNATURES.length}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[var(--color-border)] rounded-xl px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--color-text)]">{sig.name}</span>
                <span className="text-sm text-[var(--color-text-muted)]">{sig.date}</span>
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
    </section>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */
export default function PetitionPage() {
  const [signatureCount, setSignatureCount] = useState(2847);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeAge, setAgreeAge] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newCount = signatureCount + 1;
    setSignatureCount(newCount);
    setSubmittedName(name.trim());
    setSubmitted(true);
    setShowConfetti(true);

    setTimeout(() => setShowConfetti(false), 3000);
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

  const handleShareKakao = () => {
    /* 카카오 SDK가 연동되면 여기에 구현 */
    alert("카카오톡 공유 기능은 곧 연동될 예정입니다.");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {showConfetti && <Confetti />}

      {/* ── Header ── */}
      <section className="bg-[var(--color-bg-warm)] py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)] mb-3">
            서명으로 함께해주세요
          </h1>
          <p className="text-lg text-[var(--color-text-muted)] mb-8">
            당신의 이름 하나가 풍천리 주민들에게 큰 힘이 됩니다
          </p>
          <div className="flex flex-col items-center gap-1">
            <AnimatedCounter target={signatureCount} />
            <span className="text-[var(--color-text-muted)] text-lg mt-1">
              명이 함께하고 있습니다
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-16">
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
                          onClick={() =>
                            alert(
                              "수집 항목: 이름, 이메일\n수집 목적: 서명 확인 및 캠페인 안내\n보유 기간: 캠페인 종료 후 즉시 파기\n\n동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다."
                            )
                          }
                        >
                          개인정보 수집·이용
                        </button>
                        에 동의합니다.{" "}
                        <span className="text-[var(--color-warm)]">*</span>
                      </span>
                    </label>
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

                {/* 제출 */}
                <button
                  type="submit"
                  className="w-full min-h-[52px] rounded-xl bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-5 h-5" />
                  서명하기
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
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-gray-100 text-[var(--color-text)] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-gray-200"
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
                }}
                className="mt-8 text-[var(--color-text-muted)] underline text-sm hover:text-[var(--color-text)] transition-colors min-h-[44px]"
              >
                다른 사람도 서명하기
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Recent Signatures ── */}
        <RecentSignatures />

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
                  &ldquo;우리만의 싸움이 아니구나&rdquo;라는 사실이
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

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, animate } from "framer-motion";
import Link from "next/link";
import { TreePine, Volume2, Home, Sprout, PenLine, Heart, Share2, ChevronDown } from "lucide-react";

/* ───────────────────────── helpers ───────────────────────── */

function AnimatedCounter({
  target,
  suffix = "",
  duration = 2,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayed(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {displayed}
      {suffix}
    </span>
  );
}

function FadeIn({
  children,
  delay = 0,
  className = "",
  y = 40,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────── pine tree SVG icon ──────────────────── */

function PineTreeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 96"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <polygon points="32,0 12,28 22,28 8,52 18,52 4,76 60,76 46,52 56,52 42,28 52,28" />
      <rect x="28" y="76" width="8" height="20" />
    </svg>
  );
}

/* ─────────────── mountain silhouette SVG ─────────────────── */

function MountainSilhouette() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="block w-full h-[120px] md:h-[200px]"
      >
        {/* Back range */}
        <path
          d="M0,320 L0,220 Q120,120 240,180 Q360,100 480,160 Q600,60 720,140 Q840,80 960,130 Q1080,50 1200,120 Q1320,70 1440,160 L1440,320 Z"
          fill="rgba(45,80,22,0.3)"
        />
        {/* Front range */}
        <path
          d="M0,320 L0,260 Q180,180 360,240 Q540,150 720,210 Q900,140 1080,200 Q1260,160 1440,220 L1440,320 Z"
          fill="rgba(45,80,22,0.5)"
        />
        {/* Tree line */}
        <path
          d="M0,320 L0,280 Q100,250 200,270 Q300,240 400,265 Q500,235 600,260 Q700,230 800,255 Q900,225 1000,250 Q1100,230 1200,260 Q1300,240 1440,270 L1440,320 Z"
          fill="rgba(26,50,12,0.7)"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/*                        PAGE                                */
/* ═══════════════════════════════════════════════════════════ */

export default function HomePage() {
  const storyRef = useRef<HTMLDivElement>(null);

  const scrollToStory = useCallback(() => {
    storyRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "풍천리를 지켜주세요",
      text: "강원도 홍천 풍천리 주민들의 이야기를 들어주세요.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("링크가 복사되었습니다.");
      }
    } catch {
      /* user cancelled */
    }
  }, []);

  return (
    <>
      {/* ════════════════ SECTION 1 — HERO ════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#1a3a0a] via-[#142e08] to-[#0a0a0a] text-white px-6 text-center">
        <MountainSilhouette />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-tight mb-6"
          >
            7년, 680번의 외침
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            강원도 홍천 풍천리 주민들은
            <br className="hidden sm:inline" /> 양수발전소 건설에 맞서{" "}
            <strong className="text-white">7년 넘게</strong> 싸우고 있습니다
          </motion.p>

          {/* Counters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-8 sm:gap-16 mb-14"
          >
            {[
              { target: 7, suffix: "년+", label: "투쟁 기간" },
              { target: 680, suffix: "회+", label: "집회 횟수" },
              { target: 140, suffix: "개+", label: "연대 단체" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--color-earth-light)]">
                  <AnimatedCounter
                    target={item.target}
                    suffix={item.suffix}
                  />
                </span>
                <span className="text-sm sm:text-base text-white/60 mt-2">
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            onClick={scrollToStory}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold text-lg transition-colors cursor-pointer"
          >
            이야기 보기 ↓
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 z-10"
        >
          <ChevronDown className="w-8 h-8 text-white/40" />
        </motion.div>
      </section>

      {/* ════════ SECTION 2 — 풍천리를 아시나요? ════════ */}
      <section
        ref={storyRef}
        className="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]"
      >
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <PineTreeIcon className="w-16 h-16 mx-auto mb-8 text-[var(--color-forest)]" />
          </FadeIn>

          <FadeIn delay={0.15}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 text-[var(--color-forest)]">
              풍천리를 아시나요?
            </h2>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="space-y-6 text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed">
              <p>
                <strong className="text-[var(--color-text)]">
                  강원도 홍천군 화촌면
                </strong>
                에 위치한 작은 마을, 풍천리. 산림청 지정{" "}
                <strong className="text-[var(--color-text)]">
                  &lsquo;100대 명품숲&rsquo;, 1,800ha 규모 국내 최대 잣나무 숲
                </strong>
                에 둘러싸인 가리산 자락의 산촌입니다.
              </p>
              <p>
                <strong className="text-[var(--color-text)]">
                  주민 약 70%가 잣 생산으로 생계를 유지
                </strong>
                하는 이 마을은, 숲과 사람이 함께 숨 쉬는 곳입니다.
              </p>
              <p>
                이 숲에는{" "}
                <strong className="text-[var(--color-text)]">
                  산양(천연기념물), 까막딱다구리, 수달
                </strong>{" "}
                등 멸종위기종이 서식하고 있습니다.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════ SECTION 3 — 무엇이 위협하고 있나요? ════════ */}
      <section className="py-24 md:py-36 px-6 bg-[var(--color-bg)]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              무엇이 위협하고 있나요?
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              양수발전소 건설이 풍천리에 가져올 피해
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
            {[
              {
                icon: TreePine,
                title: "생태계 파괴",
                desc: "잣나무 약 11만 그루 벌채 예정, 153ha 산림 파괴. 산양·까막딱다구리·수달 서식지가 사라집니다",
                delay: 0,
              },
              {
                icon: Volume2,
                title: "소음·분진",
                desc: "84개월(7년) 공사, 총사업비 1.59조원 규모. 대규모 공사로 고령 주민들의 건강이 위협받습니다",
                delay: 0.1,
              },
              {
                icon: Home,
                title: "공동체 와해",
                desc: "51가구 수몰·이주 예정. 수십 년간 이어온 마을 공동체가 해체됩니다",
                delay: 0.2,
              },
              {
                icon: Sprout,
                title: "생계 위협",
                desc: "주민 70%가 잣 생산에 의존. 이미 2024년 10월 이설도로 건설로 2,256그루 벌채가 시작되었습니다",
                delay: 0.3,
              },
            ].map((card) => (
              <FadeIn key={card.title} delay={card.delay}>
                <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] hover:shadow-lg transition-shadow h-full">
                  <card.icon className="w-10 h-10 text-[var(--color-warm)] mb-5" />
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SECTION 4 — 주민들의 목소리 ════════ */}
      <section className="py-24 md:py-36 px-6 bg-[var(--color-sky)] text-white">
        <div className="max-w-4xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              주민들의 목소리
            </h2>
            <p className="text-white/60 text-lg">
              풍천리에서 평생을 살아온 사람들의 이야기
            </p>
          </FadeIn>

          <div className="space-y-12 md:space-y-16">
            {[
              {
                quote:
                  "100년 된 잣나무 숲, 야생동물, 마을 공동체 모두 지키고 싶어요.",
                name: "허순이 주민",
                delay: 0,
              },
              {
                quote:
                  "매주 군청 앞에 섭니다. 우리가 아니면 누가 이 숲을 지킵니까.",
                name: "풍천리 주민",
                delay: 0.15,
              },
              {
                quote:
                  "퇴거불응 혐의로 벌금 300만원을 구형받았습니다. 70 평생 남에게 해를 끼친 적 없는 사람이, 내 땅을 지키겠다는 이유로.",
                name: "기소된 주민",
                delay: 0.3,
              },
            ].map((item) => (
              <FadeIn key={item.name} delay={item.delay}>
                <blockquote className="relative pl-8 md:pl-12">
                  {/* Large quote mark */}
                  <span
                    className="absolute top-0 left-0 text-6xl md:text-8xl font-serif leading-none text-white/20 select-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-relaxed mb-4">
                    {item.quote}
                  </p>
                  <footer className="text-white/50 text-base md:text-lg">
                    — {item.name}
                  </footer>
                </blockquote>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SECTION 5 — 함께해주세요 ════════ */}
      <section className="py-24 md:py-36 px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              함께해주세요
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              작은 관심이 큰 힘이 됩니다
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: PenLine,
                title: "서명하기",
                desc: "양수발전소 건설 반대 서명에 참여해주세요",
                href: "/petition",
                delay: 0,
              },
              {
                icon: Heart,
                title: "후원하기",
                desc: "주민들의 법률 비용과 활동을 후원해주세요",
                href: "/donate",
                delay: 0.1,
              },
              {
                icon: Share2,
                title: "공유하기",
                desc: "더 많은 사람들에게 풍천리의 이야기를 알려주세요",
                href: "#share",
                delay: 0.2,
              },
            ].map((card) => (
              <FadeIn key={card.title} delay={card.delay}>
                <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] text-center h-full flex flex-col">
                  <card.icon className="w-10 h-10 text-[var(--color-warm)] mx-auto mb-5" />
                  <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                  <p className="text-[var(--color-text-muted)] leading-relaxed mb-6 flex-1">
                    {card.desc}
                  </p>
                  {card.href === "#share" ? (
                    <button
                      onClick={handleShare}
                      className="inline-block px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors cursor-pointer"
                    >
                      {card.title}
                    </button>
                  ) : (
                    <Link
                      href={card.href}
                      className="inline-block px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors"
                    >
                      {card.title}
                    </Link>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SECTION 6 — Key Numbers Bar ════════ */}
      <section className="py-16 md:py-20 px-6 bg-[#0a0a0a] text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {[
              { number: "2019년~", label: "투쟁 시작" },
              { number: "680회+", label: "집회 횟수" },
              { number: "140개+", label: "연대 단체" },
              { number: "11만+", label: "벌채 예정 잣나무" },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black text-[var(--color-earth-light)] mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-white/50">
                    {stat.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

interface UtilityHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  tone?: "warm" | "forest" | "slate";
}

const toneStyles: Record<NonNullable<UtilityHeaderProps["tone"]>, {
  section: string;
  subtitle: string;
  eyebrow: string;
  overlay: string;
}> = {
  warm: {
    section:
      "bg-gradient-to-b from-[var(--color-bg-warm)] via-[#f8f4ea] to-[var(--color-bg)] text-[var(--color-text)]",
    subtitle: "text-[var(--color-text-muted)]",
    eyebrow: "text-[var(--color-warm)]/80",
    overlay:
      "radial-gradient(circle at 15% 12%, rgba(255, 176, 89, 0.14), transparent 45%), radial-gradient(circle at 84% 18%, rgba(33, 77, 56, 0.14), transparent 46%)",
  },
  forest: {
    section:
      "bg-gradient-to-b from-[var(--color-forest)] via-[#2f5d21] to-[#203e1a] text-white",
    subtitle: "text-white/78",
    eyebrow: "text-white/66",
    overlay:
      "radial-gradient(circle at 20% 14%, rgba(255, 200, 128, 0.18), transparent 42%), radial-gradient(circle at 80% 20%, rgba(139, 197, 117, 0.16), transparent 46%)",
  },
  slate: {
    section:
      "bg-gradient-to-b from-[#eef2f4] via-[#f5f7f8] to-[var(--color-bg)] text-[var(--color-text)]",
    subtitle: "text-[var(--color-text-muted)]",
    eyebrow: "text-[var(--color-sky)]/82",
    overlay:
      "radial-gradient(circle at 16% 16%, rgba(103, 150, 176, 0.18), transparent 44%), radial-gradient(circle at 84% 18%, rgba(70, 99, 125, 0.16), transparent 48%)",
  },
};

export default function UtilityHeader({
  title,
  subtitle,
  eyebrow,
  tone = "warm",
}: UtilityHeaderProps) {
  const styles = toneStyles[tone];

  return (
    <section
      className={`relative overflow-hidden px-4 sm:px-6 pt-32 md:pt-40 pb-16 md:pb-20 text-center ${styles.section}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background: styles.overlay,
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl">
        {eyebrow && (
          <p className={`mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.22em] ${styles.eyebrow}`}>
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className={`max-w-2xl mx-auto text-base md:text-lg leading-relaxed ${styles.subtitle}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

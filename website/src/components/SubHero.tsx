import type { ReactNode } from "react";

interface SubHeroProps {
  /** Background image URL */
  imageUrl: string;
  /** Main heading text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Optional content rendered above the title (e.g. icon, badge) */
  above?: ReactNode;
  /** Optional content rendered below the subtitle (e.g. counter, CTA) */
  below?: ReactNode;
}

export default function SubHero({
  imageUrl,
  title,
  subtitle,
  above,
  below,
}: SubHeroProps) {
  return (
    <section className="relative text-white pt-32 md:pt-40 pb-20 md:pb-28 px-4 sm:px-6 text-center overflow-hidden">
      <img
        src={imageUrl}
        alt=""
        role="presentation"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative max-w-3xl mx-auto">
        {above}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
        {below}
      </div>
    </section>
  );
}

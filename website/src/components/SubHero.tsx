"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

interface SubHeroProps {
  /** Background image URL */
  imageUrl: string;
  fallbackImageUrl?: string;
  /** Main heading text */
  title: ReactNode;
  /** Optional subtitle text */
  subtitle?: ReactNode;
  eyebrow?: string;
  metric?: ReactNode;
  variant?: "standard" | "emphasis";
}

export default function SubHero({
  imageUrl,
  fallbackImageUrl,
  title,
  subtitle,
  eyebrow,
  metric,
  variant = "standard",
}: SubHeroProps) {
  const defaultFallbackImageUrl = "/images/forest-aerial.jpg";
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const hasEyebrow = Boolean(eyebrow?.trim());
  const sectionSpacingClass =
    variant === "emphasis"
      ? "pt-32 md:pt-40 pb-24 md:pb-32"
      : "pt-32 md:pt-40 pb-20 md:pb-28";
  const titleAnchorClass = hasEyebrow
    ? variant === "emphasis"
      ? "-translate-y-2 md:-translate-y-3"
      : "-translate-y-1 md:-translate-y-2"
    : "";

  useEffect(() => {
    setCurrentImage(imageUrl);
  }, [imageUrl]);

  const handleImageError = () => {
    const nextImage = fallbackImageUrl || defaultFallbackImageUrl;

    if (currentImage !== nextImage) {
      setCurrentImage(nextImage);
      return;
    }
    setCurrentImage("");
  };

  return (
    <section
      className={`relative overflow-hidden px-4 sm:px-6 text-center text-white ${sectionSpacingClass}`}
    >
      {currentImage && (
        <Image
          src={currentImage}
          alt=""
          role="presentation"
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          onError={handleImageError}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 16% 20%, rgba(255, 173, 76, 0.2), transparent 48%), radial-gradient(circle at 82% 16%, rgba(74, 122, 46, 0.22), transparent 52%), linear-gradient(180deg, rgba(12, 20, 18, 0.8), rgba(9, 16, 15, 0.72) 42%, rgba(9, 16, 15, 0.82) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute -top-28 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/8 blur-3xl" aria-hidden="true" />
      <div className={`relative mx-auto max-w-3xl ${titleAnchorClass}`}>
        <div className="relative inline-block">
          {hasEyebrow && (
            <p className="absolute bottom-full left-1/2 mb-3 w-max max-w-[min(92vw,34rem)] -translate-x-1/2 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold uppercase tracking-[0.26em] text-white/72 md:text-sm">
              {eyebrow}
            </p>
          )}
          <h1 className="mb-4 text-3xl font-black tracking-tight text-white md:text-5xl">
            {title}
          </h1>
        </div>
        {subtitle && (
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/84 md:text-lg">
            {subtitle}
          </p>
        )}
        {metric && <div className="mt-8 md:mt-10">{metric}</div>}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { EditableImage } from "@/components/editable";
import { RidgeDivider } from "@/components/visuals/ForestLetterMotifs";

interface SubHeroProps {
  /** Background image URL */
  imageUrl: string;
  fallbackImageUrl?: string;
  imageContentKey?: string;
  imagePage?: string;
  imageSection?: string;
  imageAlt?: string;
  /** Main heading text */
  title: ReactNode;
  /** Optional subtitle text */
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  metric?: ReactNode;
  variant?: "standard" | "emphasis";
}

export default function SubHero({
  imageUrl,
  fallbackImageUrl,
  imageContentKey,
  imagePage,
  imageSection,
  imageAlt = "",
  title,
  subtitle,
  eyebrow,
  metric,
  variant = "standard",
}: SubHeroProps) {
  const defaultFallbackImageUrl = "/images/forest-aerial.jpg";
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const hasEyebrow = Boolean(eyebrow);
  const sectionSpacingClass =
    variant === "emphasis"
      ? "pt-32 md:pt-40 pb-28 md:pb-36"
      : "pt-32 md:pt-40 pb-24 md:pb-32";
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
      {imageContentKey && imagePage ? (
        <EditableImage
          contentKey={imageContentKey}
          defaultSrc={imageUrl}
          alt={imageAlt}
          page={imagePage}
          section={imageSection}
          fill
          sizes="100vw"
          priority
          className="object-cover"
          fallbackSrc={fallbackImageUrl || defaultFallbackImageUrl}
        />
      ) : (
        currentImage && (
          <Image
            src={currentImage}
            alt=""
            role="presentation"
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            style={{ objectFit: "cover" }}
            onError={handleImageError}
          />
        )
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(12,20,12,0.62) 0%, rgba(12,20,12,0.38) 55%, rgba(12,20,12,0.25) 100%)",
        }}
        aria-hidden="true"
      />
      <RidgeDivider className="absolute bottom-0 left-0 z-[2] text-[var(--color-bg)]" />

      <div className="relative z-[3] mx-auto max-w-3xl">
        {hasEyebrow && (
          <span className="ink-chip mb-5 max-w-full overflow-hidden text-ellipsis whitespace-nowrap uppercase tracking-[0.12em]">
            {eyebrow}
          </span>
        )}
        <h1 className="font-serif-display mb-4 text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.5)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/88 md:text-lg [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">
            {subtitle}
          </p>
        )}
        {metric && <div className="mt-8 md:mt-10">{metric}</div>}
      </div>
    </section>
  );
}

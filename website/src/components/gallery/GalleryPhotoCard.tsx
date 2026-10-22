"use client";

import Image from "next/image";
import { useReveal } from "@/lib/use-reveal";
import type { GalleryPhoto } from "@/components/gallery/gallery-data";

export default function GalleryPhotoCard({
  photo,
  index,
  onOpen,
  creditLabel = "사진:",
  openAriaLabel = (title) => `${title} 이미지 크게 보기`,
  latinCaptions = false,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: (photo: GalleryPhoto, trigger: HTMLButtonElement) => void;
  creditLabel?: string;
  openAriaLabel?: (title: string) => string;
  latinCaptions?: boolean;
}) {
  const { ref, inView } = useReveal<HTMLDivElement>();
  const tiltClass =
    index % 6 === 1 ? "paper-tilt-l" : index % 6 === 4 ? "paper-tilt-r" : "";
  // 리빌(지연 스태거)은 바깥 래퍼에, hover-lift는 버튼에 따로 건다 — 한 요소에
  // 같이 두면 스태거 지연이 hover 리프트 전환에도 걸려 마우스를 올려도 한참 뒤에 뜬다.
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-visible" : ""}`}
      style={{ "--reveal-delay": `${index * 0.06}s` } as React.CSSProperties}
    >
      <button
        type="button"
        className={`photo-frame ${tiltClass} hover-lift group w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-warm)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]`}
        onClick={(event) => onOpen(photo, event.currentTarget)}
        aria-label={openAriaLabel(photo.title)}
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-[var(--color-bg)]">
          <Image
            src={photo.url}
            alt={photo.description}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>

        <div className="pt-3 px-1">
          <p className={`${latinCaptions ? "font-serif-display italic" : "font-hand"} text-lg text-[var(--color-text-muted)] leading-snug`}>
            {photo.title}
          </p>
          <p className={`${latinCaptions ? "font-serif-display italic" : "font-hand"} text-sm text-[var(--color-text-muted)]/70 mt-0.5`}>
            {creditLabel} {photo.credit}
          </p>
        </div>
      </button>
    </div>
  );
}

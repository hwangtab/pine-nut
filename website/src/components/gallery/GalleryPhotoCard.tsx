"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { GalleryPhoto } from "@/components/gallery/gallery-data";

export default function GalleryPhotoCard({
  photo,
  index,
  onOpen,
  creditLabel = "사진:",
  openAriaLabel = (title) => `${title} 이미지 크게 보기`,
}: {
  photo: GalleryPhoto;
  index: number;
  onOpen: (photo: GalleryPhoto, trigger: HTMLButtonElement) => void;
  creditLabel?: string;
  openAriaLabel?: (title: string) => string;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-warm)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      onClick={(event) => onOpen(photo, event.currentTarget)}
      aria-label={openAriaLabel(photo.title)}
    >
      <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden shadow-card hover-lift bg-[var(--color-bg)]">
        <Image
          src={photo.url}
          alt={photo.description}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />

        <div
          className="absolute bottom-0 left-0 right-0 p-4 pt-10"
          style={{
            background:
              "linear-gradient(to top, var(--color-overlay-medium) 0%, rgba(0, 0, 0, 0.35) 55%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          <p className="text-white text-sm font-medium leading-snug">
            {photo.title}
          </p>
          <p className="text-white/70 text-xs mt-1">
            {creditLabel} {photo.credit}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

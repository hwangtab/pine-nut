"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import type { GalleryPhoto } from "@/components/gallery/gallery-data";

export default function GalleryLightbox({
  photo,
  onClose,
}: {
  photo: GalleryPhoto;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const getFocusableElements = () => {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])",
        ),
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !dialogRef.current?.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--color-overlay-strong)" }}
        onClick={onClose}
      >
        <motion.div
          ref={dialogRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl w-full"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="gallery-lightbox-title"
          aria-describedby="gallery-lightbox-description"
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-[var(--color-overlay-soft)] hover:bg-[var(--color-overlay-soft-hover)] transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6 text-[var(--color-overlay-text)]" />
          </button>
          <Image
            src={photo.url}
            alt={photo.description}
            width={1600}
            height={1200}
            className="w-full max-h-[75vh] object-contain rounded-lg"
          />
          <div className="mt-4 text-center">
            <h3
              id="gallery-lightbox-title"
              className="text-[var(--color-overlay-text)] text-lg font-semibold break-words"
            >
              {photo.title}
            </h3>
            <p
              id="gallery-lightbox-description"
              className="text-[var(--color-overlay-text-muted)] text-sm mt-1 break-words"
            >
              {photo.description}
            </p>
            <p className="text-[var(--color-overlay-text-subtle)] text-xs mt-2 break-words">
              사진: {photo.credit}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

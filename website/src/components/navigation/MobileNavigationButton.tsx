"use client";

import type { RefObject } from "react";
import { Menu, X } from "lucide-react";
import { NAV_COPY, type ChromeLocale } from "@/lib/i18n/chrome";

interface MobileNavigationButtonProps {
  buttonRef: RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  isTransparent: boolean;
  onOpen: () => void;
  onClose: () => void;
  locale?: ChromeLocale;
}

export default function MobileNavigationButton({
  buttonRef,
  isOpen,
  isTransparent,
  onOpen,
  onClose,
  locale = "ko",
}: MobileNavigationButtonProps) {
  const copy = NAV_COPY[locale];
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`nav:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors duration-300 ${
        isTransparent ? "hover:bg-white/10" : "hover:bg-[var(--color-bg)]"
      }`}
      onClick={() => {
        if (isOpen) {
          onClose();
          return;
        }
        onOpen();
      }}
      aria-expanded={isOpen}
      aria-controls="mobile-menu"
      aria-label={isOpen ? copy.closeMenu : copy.openMenu}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-[var(--color-text)]" />
      ) : (
        <Menu
          className={`w-6 h-6 transition-colors duration-300 ${
            isTransparent ? "text-white" : "text-[var(--color-text)]"
          }`}
        />
      )}
    </button>
  );
}

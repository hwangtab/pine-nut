"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  isExternalEditableHref,
  isInternalEditableHref,
} from "@/lib/validation/editable-link";

interface NavigationLinkProps {
  href: string;
  className: string;
  label: string;
  onClick?: () => void;
  ariaCurrent?: "page";
  /** 라벨 뒤에 붙는 장식(드롭다운 화살표 등) */
  suffix?: ReactNode;
}

export default function NavigationLink({
  href,
  className,
  label,
  onClick,
  ariaCurrent,
  suffix,
}: NavigationLinkProps) {
  if (isInternalEditableHref(href)) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={className}
        aria-current={ariaCurrent}
      >
        {label}
        {suffix}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={onClick}
      className={className}
      aria-current={ariaCurrent}
      target={isExternalEditableHref(href) ? "_blank" : undefined}
      rel={isExternalEditableHref(href) ? "noopener noreferrer" : undefined}
    >
      {label}
      {suffix}
    </a>
  );
}

"use client";

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
}

export default function NavigationLink({
  href,
  className,
  label,
  onClick,
  ariaCurrent,
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
    </a>
  );
}

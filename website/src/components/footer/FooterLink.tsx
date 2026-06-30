"use client";

import Link from "next/link";
import {
  isExternalEditableHref,
  isInternalEditableHref,
} from "@/lib/validation/editable-link";

interface FooterLinkProps {
  href: string;
  className: string;
  label: string;
}

export default function FooterLink({ href, className, label }: FooterLinkProps) {
  if (isInternalEditableHref(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      target={isExternalEditableHref(href) ? "_blank" : undefined}
      rel={isExternalEditableHref(href) ? "noopener noreferrer" : undefined}
    >
      {label}
    </a>
  );
}

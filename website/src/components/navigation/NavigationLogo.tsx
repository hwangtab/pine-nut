"use client";

import { EditableLink, EditableText } from "@/components/editable";

interface NavigationLogoProps {
  isTransparent: boolean;
}

export default function NavigationLogo({ isTransparent }: NavigationLogoProps) {
  return (
    <EditableLink
      contentKey="nav.logoHref"
      defaultHref="/"
      page="nav"
      section="header"
      className={`text-lg font-bold shrink-0 min-h-[44px] flex items-center transition-colors duration-300 ${
        isTransparent ? "text-white" : "text-[var(--color-forest)]"
      }`}
    >
      <EditableText
        contentKey="nav.logo"
        defaultValue="풍천리를 지켜주세요"
        as="span"
        page="nav"
        section="header"
      />
    </EditableLink>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";

export const metadata: Metadata = {
  title: "Gallery — Save Pungcheon-ri",
  description: "Photographs of the pine forest, the protests, and the people of Pungcheon-ri.",
  alternates: englishAlternates("/en/gallery", "/gallery"),
};

export default function EnGalleryLayout({ children }: { children: ReactNode }) {
  return children;
}

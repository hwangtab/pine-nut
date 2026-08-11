import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";

export const metadata: Metadata = {
  title: "Press Release — Save Pungcheon-ri",
  description: "Press release on the Pungcheon-ri pumped-storage plant opposition campaign.",
  alternates: englishAlternates("/en/press/release", "/press/release"),
};

export default function EnPressReleaseLayout({ children }: { children: ReactNode }) {
  return children;
}

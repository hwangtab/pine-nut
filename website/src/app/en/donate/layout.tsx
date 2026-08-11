import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";

export const metadata: Metadata = {
  title: "Support the Campaign — Save Pungcheon-ri",
  description: "Help fund the residents' seven-year fight to protect Pungcheon-ri.",
  alternates: englishAlternates("/en/donate", "/donate"),
};

export default function EnDonateLayout({ children }: { children: ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";

export const metadata: Metadata = {
  title: "We Are the Trees — Save Pungcheon-ri",
  description:
    "A national solidarity petition to stop the Pungcheon-ri pumped-storage project. Read the statement in English, then sign the Korean-language petition.",
  alternates: englishAlternates("/en/petition", "/petition"),
};

export default function EnPetitionLayout({ children }: { children: ReactNode }) {
  return children;
}

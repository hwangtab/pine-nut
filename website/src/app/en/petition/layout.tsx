import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";

export const metadata: Metadata = {
  title: "Sign the Petition — Save Pungcheon-ri",
  description: "Add your name to the petition opposing the Pungcheon-ri pumped-storage plant.",
  alternates: englishAlternates("/en/petition", "/petition"),
};

export default function EnPetitionLayout({ children }: { children: ReactNode }) {
  return children;
}

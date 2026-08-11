import type { Metadata } from "next";
import type { ReactNode } from "react";
import { englishAlternates } from "@/lib/seo-alternates";

export const metadata: Metadata = {
  title: "Fact Sheet — Save Pungcheon-ri",
  description: "Key figures and issues of the Pungcheon-ri pumped-storage project.",
  alternates: englishAlternates("/en/press/factsheet", "/press/factsheet"),
};

export default function EnPressFactsheetLayout({ children }: { children: ReactNode }) {
  return children;
}

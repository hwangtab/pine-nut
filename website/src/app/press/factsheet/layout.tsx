import type { Metadata } from "next";
import type { ReactNode } from "react";
import { localeAlternates } from "@/lib/seo-alternates";

// page.tsx가 "use client"라 metadata를 export할 수 없어 레이아웃에서 선언한다.
export const metadata: Metadata = {
  title: "팩트시트 — 풍천리를 지켜주세요",
  description:
    "풍천리 양수발전소 사업의 핵심 수치와 쟁점을 한 장으로 정리한 팩트시트입니다.",
  alternates: localeAlternates("/press/factsheet", "/en/press/factsheet"),
};

export default function PressFactsheetLayout({ children }: { children: ReactNode }) {
  return children;
}

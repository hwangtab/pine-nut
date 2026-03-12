import type { Metadata } from "next";
import PressPageClient from "./PressPageClient";

export const metadata: Metadata = {
  title: "자료실 — 풍천리를 지켜주세요",
  description:
    "언론인, 연구자, 활동가를 위한 풍천리 양수발전소 반대 투쟁 관련 자료 모음. 보도자료, 팩트시트, 사진 자료를 다운로드하세요.",
};

export default function PressPage() {
  return <PressPageClient />;
}

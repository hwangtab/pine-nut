import type { Metadata } from "next";
import PrivacyPageClient from "./PrivacyPageClient";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 풍천리를 지켜주세요",
  description:
    "풍천리를 지켜주세요 웹사이트의 개인정보 수집, 이용, 보관에 관한 안내입니다.",
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

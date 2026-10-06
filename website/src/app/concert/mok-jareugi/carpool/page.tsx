import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import { MOK_PHONE_STAGE, MOK_PHONE_STAGE_NAME, MOK_PLACE } from "@/lib/concert";
import { CARPOOL_DATE_LABEL } from "@/lib/carpool";
import CarpoolBoard from "./CarpoolBoard";

const DESCRIPTION = "목자르기(10/10) 풍천리 가는 카풀 — 차량과 빈자리를 골라 이름과 연락처로 신청하세요.";

export const metadata: Metadata = {
  title: "카풀 신청 — 목자르기 | 풍천리를 지켜주세요",
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/concert/mok-jareugi/carpool` },
  openGraph: {
    title: "목자르기 카풀 신청",
    description: DESCRIPTION,
    url: `${SITE_URL}/concert/mok-jareugi/carpool`,
  },
};

export default function MokCarpoolPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/concert/mok-jareugi"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          목자르기 공연 안내
        </Link>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
          Carpool
        </p>
        <h1 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
          풍천리 같이 타고 가요
        </h1>
        <p className="mt-4 break-keep text-lg leading-relaxed text-[var(--color-text-muted)]">
          {CARPOOL_DATE_LABEL} 서울에서 {MOK_PLACE}까지 함께 가는 차량입니다. 출발지가 가까운 차를
          고르고, 빈자리를 눌러 이름과 연락처를 남겨주세요.
        </p>

        <CarpoolBoard />

        <p className="mt-10 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
          신청을 바꾸거나 취소하려면 {MOK_PHONE_STAGE_NAME}(
          <a href={`tel:${MOK_PHONE_STAGE}`} className="font-semibold text-[var(--color-text)] underline">
            {MOK_PHONE_STAGE}
          </a>
          )께 알려주세요. 남겨주신 이름과 연락처는 카풀 연락에만 쓰고 공연이 끝나면 지웁니다.
        </p>
      </div>
    </div>
  );
}

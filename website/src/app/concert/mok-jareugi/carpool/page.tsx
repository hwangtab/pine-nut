import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OG_SITE } from "@/lib/seo-alternates";
import { SITE_URL } from "@/lib/site-config";
import { MOK_PLACE } from "@/lib/concert";
import { CARPOOL_CONTACT_NAME, CARPOOL_CONTACT_PHONE, CARPOOL_DATE_LABEL } from "@/lib/carpool";
import CarpoolBoard from "./CarpoolBoard";

const PAGE_URL = `${SITE_URL}/concert/mok-jareugi/carpool`;
const TITLE = "목자르기 카풀 — 풍천리 같이 타고 가요";
const DESCRIPTION =
  "10월 10일(토) 목자르기 공연, 광화문·강변역·불광역·뚝섬역에서 풍천리까지 함께 가는 차량입니다. 빈자리를 골라 신청하세요.";

// og:image 는 같은 폴더의 opengraph-image.tsx 가 채운다.
export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    ...OG_SITE,
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
        <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
          ‘이미 타는 사람’에 이름이 있으면 자리가 정해진 것이니 따로 신청하지 않으셔도 됩니다.
        </p>

        <CarpoolBoard />

        <p className="mt-10 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
          신청을 바꾸거나 취소하려면 {CARPOOL_CONTACT_NAME}(
          <a href={`tel:${CARPOOL_CONTACT_PHONE}`} className="font-semibold text-[var(--color-text)] underline">
            {CARPOOL_CONTACT_PHONE}
          </a>
          )에게 알려주세요. 남겨주신 이름과 연락처는 카풀 연락에만 쓰고 공연이 끝나면 지웁니다.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

const quickLinks = [
  { label: "이야기", href: "/story" },
  { label: "타임라인", href: "/timeline" },
  { label: "소식", href: "/news" },
  { label: "갤러리", href: "/gallery" },
  { label: "자료실", href: "/press" },
  { label: "후원하기", href: "/donate" },
];

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="bg-[var(--color-forest)] text-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Branding & info */}
          <div>
            <Link href="/" className="text-xl font-bold block mb-3">
              풍천리를 지켜주세요
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              풍천리양수발전소건설반대위원회는 마을과 자연을 지키기 위해 양수발전소
              건설에 반대하는 주민들의 모임입니다.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-base font-bold mb-4">바로가기</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-bold mb-4">연락처</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <span className="block text-white/50 text-xs mb-0.5">전화 문의</span>
                <a
                  href="tel:010-8918-8933"
                  className="hover:text-white transition-colors"
                >
                  010-8918-8933 (이창후 총무)
                </a>
              </li>
              <li>
                <span className="block text-white/50 text-xs mb-0.5">후원 계좌</span>
                <span>농협 356-1559-4666-63 이창후</span>
              </li>
              <li>
                <span className="block text-white/50 text-xs mb-0.5">캠페인 페이지</span>
                <a
                  href="https://campaigns.do/campaigns/1328"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  빠띠 캠페인 페이지 바로가기
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} 풍천리 주민회. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setShowPrivacy(!showPrivacy)}
              className="hover:text-white transition-colors"
            >
              개인정보처리방침
            </button>
            <a
              href="https://campaigns.do/campaigns/1328"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              빠띠 캠페인
            </a>
            <Link href="/en" className="hover:text-white transition-colors">
              English
            </Link>
          </div>
        </div>

        {/* Privacy Policy Inline */}
        {showPrivacy && (
          <div className="mt-6 p-6 bg-white/10 rounded-xl text-sm text-white/80 leading-relaxed">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-white">개인정보처리방침</h4>
              <button
                type="button"
                onClick={() => setShowPrivacy(false)}
                className="text-white/50 hover:text-white transition-colors text-xs"
              >
                닫기
              </button>
            </div>
            <p className="mb-2">
              <strong>수집 항목:</strong> 이름, 이메일
            </p>
            <p className="mb-2">
              <strong>수집 목적:</strong> 서명 확인 및 캠페인 소식 안내
            </p>
            <p className="mb-2">
              <strong>보유 기간:</strong> 캠페인 종료 후 즉시 파기
            </p>
            <p>
              동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다.
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

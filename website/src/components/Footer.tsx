"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const quickLinks = [
  { label: "이야기", href: "/story" },
  { label: "타임라인", href: "/timeline" },
  { label: "소식", href: "/news" },
  { label: "자료실", href: "/press" },
  { label: "함께하기", href: "/petition" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Placeholder: no backend integration
    setSubmitted(true);
    setEmail("");
  };

  return (
    <footer className="bg-[var(--color-forest)] text-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          {/* Branding & info */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-bold block mb-3">
              풍천리를 지켜주세요
            </Link>
            <p className="text-white/70 text-sm leading-relaxed">
              풍천리 주민회는 마을과 자연을 지키기 위해 양수발전소 건설에 반대하는
              주민들의 모임입니다.
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
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <span className="block text-white/50 text-xs mb-0.5">이메일</span>
                <a
                  href="mailto:pungcheon@example.com"
                  className="hover:text-white transition-colors"
                >
                  pungcheon@example.com
                </a>
              </li>
              <li>
                <span className="block text-white/50 text-xs mb-0.5">전화</span>
                <a
                  href="tel:054-000-0000"
                  className="hover:text-white transition-colors"
                >
                  054-000-0000
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-base font-bold mb-4">소식 받기</h3>
            {submitted ? (
              <p className="text-sm text-white/70">
                감사합니다. 소식을 보내드리겠습니다.
              </p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <label htmlFor="footer-email" className="sr-only">
                  이메일 주소
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="이메일 주소"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 min-h-[44px]"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-white text-[var(--color-forest)] font-bold text-sm hover:bg-white/90 transition-colors min-h-[44px]"
                >
                  구독하기
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} 풍천리 주민회. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              개인정보처리방침
            </Link>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="페이스북"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
              aria-label="인스타그램"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

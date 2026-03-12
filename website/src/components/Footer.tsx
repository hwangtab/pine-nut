"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EditableText,
  EditableRichText,
  EditableList,
  EditableLink,
} from "@/components/editable";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { defaultFooterLinks, parseBuilderLinks } from "@/lib/custom-sections";

const privacyItems = [
  { label: "수집 항목", value: "이름, 이메일" },
  { label: "수집 목적", value: "서명 확인 및 캠페인 소식 안내" },
  { label: "보유 기간", value: "캠페인 종료 후 즉시 파기" },
];

export default function Footer() {
  const { getContent } = useAdminEdit();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const quickLinks = parseBuilderLinks(
    getContent("builder.global.footerLinks"),
    defaultFooterLinks(),
  );

  return (
    <footer className="bg-[var(--color-forest)] text-white" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Branding & info */}
          <div>
            <Link href="/" className="text-xl font-bold block mb-3">
              <EditableText
                contentKey="footer.brand.name"
                defaultValue="풍천리를 지켜주세요"
                as="span"
                page="footer"
                section="brand"
              />
            </Link>
            <EditableRichText
              contentKey="footer.brand.description"
              defaultValue="풍천리양수발전소건설반대위원회는 마을과 자연을 지키기 위해 양수발전소 건설에 반대하는 주민들의 모임입니다."
              page="footer"
              section="brand"
            >
              {(value) => (
                <p className="text-white/70 text-sm leading-relaxed">
                  {value}
                </p>
              )}
            </EditableRichText>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-base font-bold mb-4">바로가기</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center min-h-[44px] text-white/70 hover:text-white text-sm transition-colors"
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
                <EditableText
                  contentKey="footer.contact.phoneLabel"
                  defaultValue="전화 문의"
                  as="span"
                  page="footer"
                  section="contact"
                  className="block text-white/50 text-xs mb-0.5"
                />
                <a
                  href="tel:010-8918-8933"
                  className="inline-flex items-center min-h-[44px] hover:text-white transition-colors"
                >
                  <EditableText
                    contentKey="footer.contact.phone"
                    defaultValue="010-8918-8933 (이창후 총무)"
                    as="span"
                    page="footer"
                    section="contact"
                  />
                </a>
              </li>
              <li>
                <EditableText
                  contentKey="footer.contact.bankLabel"
                  defaultValue="후원 계좌"
                  as="span"
                  page="footer"
                  section="contact"
                  className="block text-white/50 text-xs mb-0.5"
                />
                <EditableText
                  contentKey="footer.contact.bankAccount"
                  defaultValue="농협 356-1559-4666-63 이창후"
                  as="span"
                  page="footer"
                  section="contact"
                />
              </li>
              <li>
                <EditableText
                  contentKey="footer.contact.campaignLabel"
                  defaultValue="캠페인 페이지"
                  as="span"
                  page="footer"
                  section="contact"
                  className="block text-white/50 text-xs mb-0.5"
                />
                <EditableLink
                  contentKey="footer.contact.campaignHref"
                  defaultHref="https://campaigns.do/campaigns/1328"
                  page="footer"
                  section="contact"
                  className="inline-flex items-center min-h-[44px] hover:text-white transition-colors"
                >
                  <EditableText
                    contentKey="footer.contact.campaignLink"
                    defaultValue="빠띠 캠페인 페이지 바로가기"
                    as="span"
                    page="footer"
                    section="contact"
                  />
                </EditableLink>
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
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              개인정보처리방침
            </button>
            <EditableLink
              contentKey="footer.bottom.campaignHref"
              defaultHref="https://campaigns.do/campaigns/1328"
              page="footer"
              section="bottom"
              className="min-h-[44px] inline-flex items-center hover:text-white transition-colors"
            >
              빠띠 캠페인
            </EditableLink>
            <Link href="/en" className="min-h-[44px] inline-flex items-center hover:text-white transition-colors">
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
                className="min-h-[44px] inline-flex items-center text-white/50 hover:text-white transition-colors text-xs"
              >
                닫기
              </button>
            </div>
            <EditableList
              contentKey="footer.privacy.items"
              defaultItems={privacyItems}
              page="footer"
              section="privacy"
              fields={[
                { key: "label", label: "항목" },
                { key: "value", label: "내용" },
              ]}
            >
              {(items) => (
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <p key={i} className="mb-2">
                      <strong>{item.label}:</strong> {item.value}
                    </p>
                  ))}
                </div>
              )}
            </EditableList>
            <EditableRichText
              contentKey="footer.privacy.notice"
              defaultValue="동의를 거부할 수 있으며, 거부 시 서명 참여가 제한됩니다."
              page="footer"
              section="privacy"
            >
              {(value) => (
                <p className="mt-2">
                  {value}
                </p>
              )}
            </EditableRichText>
          </div>
        )}
      </div>
    </footer>
  );
}

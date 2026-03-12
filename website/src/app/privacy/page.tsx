import type { Metadata } from "next";
import UtilityHeader from "@/components/UtilityHeader";
import { EditableLink, EditableText, EditableRichText } from "@/components/editable";
import { PrivacyPurposeList, PrivacyRightsList } from "./PrivacySectionsClient";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 풍천리를 지켜주세요",
  description:
    "풍천리를 지켜주세요 웹사이트의 개인정보 수집, 이용, 보관에 관한 안내입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <UtilityHeader
        title={<EditableText contentKey="privacy.header.title" defaultValue="개인정보처리방침" as="span" page="privacy" section="header" />}
        subtitle={<EditableText contentKey="privacy.header.subtitle" defaultValue="최종 수정일: 2026년 3월 10일" as="span" page="privacy" section="header" />}
        eyebrow={<EditableText contentKey="privacy.header.eyebrow" defaultValue="법적 안내" as="span" page="privacy" section="header" />}
        tone="warm"
      />

      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 md:p-10 space-y-10">
          <EditableRichText
            contentKey="privacy.intro"
            defaultValue={`"풍천리를 지켜주세요" 웹사이트(이하 "서비스")는 이용자의 개인정보를 소중히 보호하며, 관련 법령을 준수합니다. 본 방침은 서비스가 수집하는 개인정보의 항목, 수집 목적, 보유 기간, 이용자의 권리 등을 안내합니다.`}
            page="privacy"
            section="intro"
            renderMode="paragraph"
            className="text-[var(--color-text)] leading-relaxed"
          />

          <section>
            <EditableText
              contentKey="privacy.section1.title"
              defaultValue="1. 수집하는 개인정보"
              as="h2"
              page="privacy"
              section="section1"
              className="text-xl font-bold text-[var(--color-forest)] mb-4"
            />
            <div className="space-y-4">
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <EditableText
                  contentKey="privacy.section1.signupTitle"
                  defaultValue="서명 참여 시"
                  as="h3"
                  page="privacy"
                  section="section1"
                  className="font-semibold text-[var(--color-text)] mb-2"
                />
                <EditableRichText
                  contentKey="privacy.section1.signupContent"
                  defaultValue="이름, 이메일 주소, 응원 메시지(선택)"
                  page="privacy"
                  section="section1"
                  renderMode="paragraph"
                  className="text-[var(--color-text-muted)] text-[15px] leading-relaxed"
                />
              </div>
              <div className="bg-[var(--color-bg)] rounded-xl p-5">
                <EditableText
                  contentKey="privacy.section1.autoTitle"
                  defaultValue="웹사이트 이용 시 자동 수집"
                  as="h3"
                  page="privacy"
                  section="section1"
                  className="font-semibold text-[var(--color-text)] mb-2"
                />
                <EditableRichText
                  contentKey="privacy.section1.autoContent"
                  defaultValue="방문 페이지, 이용 시간, 브라우저 정보 등 웹사이트 이용 통계 (Google Analytics를 통해 익명 수집)"
                  page="privacy"
                  section="section1"
                  renderMode="paragraph"
                  className="text-[var(--color-text-muted)] text-[15px] leading-relaxed"
                />
              </div>
            </div>
          </section>

          <section>
            <EditableText
              contentKey="privacy.section2.title"
              defaultValue="2. 수집 목적"
              as="h2"
              page="privacy"
              section="section2"
              className="text-xl font-bold text-[var(--color-forest)] mb-4"
            />
            <PrivacyPurposeList />
          </section>

          <section>
            <EditableText
              contentKey="privacy.section3.title"
              defaultValue="3. 보유 및 이용 기간"
              as="h2"
              page="privacy"
              section="section3"
              className="text-xl font-bold text-[var(--color-forest)] mb-4"
            />
            <EditableRichText
              contentKey="privacy.section3.content"
              defaultValue="수집된 개인정보는 캠페인 종료 시까지 보유하며, 캠페인 종료 후 지체 없이 파기합니다. 이용자가 삭제를 요청하는 경우 요청일로부터 7일 이내에 해당 정보를 삭제합니다."
              page="privacy"
              section="section3"
              renderMode="paragraph"
              className="text-[var(--color-text)] text-[15px] leading-relaxed"
            />
          </section>

          <section>
            <EditableText
              contentKey="privacy.section4.title"
              defaultValue="4. 개인정보의 제3자 제공"
              as="h2"
              page="privacy"
              section="section4"
              className="text-xl font-bold text-[var(--color-forest)] mb-4"
            />
            <EditableRichText
              contentKey="privacy.section4.content"
              defaultValue="수집한 개인정보는 원칙적으로 제3자에게 제공하지 않습니다. 다만, 법령에 의해 요구되는 경우 또는 이용자의 사전 동의를 받은 경우에 한하여 제공할 수 있습니다."
              page="privacy"
              section="section4"
              renderMode="paragraph"
              className="text-[var(--color-text)] text-[15px] leading-relaxed"
            />
          </section>

          <section>
            <EditableText
              contentKey="privacy.section5.title"
              defaultValue="5. 정보주체의 권리"
              as="h2"
              page="privacy"
              section="section5"
              className="text-xl font-bold text-[var(--color-forest)] mb-4"
            />
            <EditableRichText
              contentKey="privacy.section5.intro"
              defaultValue="이용자는 언제든지 다음의 권리를 행사할 수 있습니다."
              page="privacy"
              section="section5"
              renderMode="paragraph"
              className="text-[var(--color-text)] text-[15px] leading-relaxed mb-4"
            />
            <PrivacyRightsList />
            <EditableRichText
              contentKey="privacy.section5.note"
              defaultValue="위 권리 행사는 아래 문의처를 통해 요청하실 수 있으며, 지체 없이 조치하겠습니다."
              page="privacy"
              section="section5"
              renderMode="paragraph"
              className="text-[var(--color-text-muted)] text-sm mt-4 leading-relaxed"
            />
          </section>

          <section>
            <EditableText
              contentKey="privacy.section6.title"
              defaultValue="6. 문의"
              as="h2"
              page="privacy"
              section="section6"
              className="text-xl font-bold text-[var(--color-forest)] mb-4"
            />
            <EditableRichText
              contentKey="privacy.section6.intro"
              defaultValue="개인정보 관련 문의 및 권리 행사 요청은 아래를 통해 접수해주세요."
              page="privacy"
              section="section6"
              renderMode="paragraph"
              className="text-[var(--color-text)] text-[15px] leading-relaxed mb-4"
            />
            <div className="bg-[var(--color-bg)] rounded-xl p-5 space-y-2">
              <p className="text-[var(--color-text)] text-[15px]">
                <strong>
                  <EditableText
                    contentKey="privacy.section6.campaignLabel"
                    defaultValue="빠띠 캠페인 페이지:"
                    as="span"
                    page="privacy"
                    section="section6"
                  />
                </strong>{" "}
                <EditableLink
                  contentKey="privacy.section6.campaignHref"
                  defaultHref="https://campaigns.do/campaigns/1328"
                  page="privacy"
                  section="section6"
                  inline
                  className="text-[var(--color-sky)] underline underline-offset-2 hover:text-[var(--color-sky)]/80 transition-colors"
                >
                  campaigns.do/campaigns/1328
                </EditableLink>
              </p>
              <p className="text-[var(--color-text)] text-[15px]">
                <strong>
                  <EditableText
                    contentKey="privacy.section6.phoneLabel"
                    defaultValue="전화:"
                    as="span"
                    page="privacy"
                    section="section6"
                  />
                </strong>{" "}
                <EditableLink
                  contentKey="privacy.section6.phoneHref"
                  defaultHref="tel:010-8918-8933"
                  page="privacy"
                  section="section6"
                  inline
                  className="text-[var(--color-sky)] underline underline-offset-2 hover:text-[var(--color-sky)]/80 transition-colors"
                >
                  <EditableText
                    contentKey="privacy.section6.phoneValue"
                    defaultValue="010-8918-8933 (이창후 총무)"
                    as="span"
                    page="privacy"
                    section="section6"
                  />
                </EditableLink>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <EditableLink
            contentKey="privacy.backHref"
            defaultHref="/"
            page="privacy"
            section="footer"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-[15px] underline underline-offset-4 transition-colors"
          >
            <EditableText contentKey="privacy.back" defaultValue="홈으로 돌아가기" as="span" page="privacy" section="footer" />
          </EditableLink>
        </div>
      </div>
    </div>
  );
}

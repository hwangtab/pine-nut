"use client";

import { EditableList, EditableRichText } from "@/components/editable";

const privacyItems = [
  { label: "수집 항목", value: "이름, 이메일" },
  { label: "수집 목적", value: "서명 확인 및 캠페인 소식 안내" },
  { label: "보유 기간", value: "캠페인 종료 후 즉시 파기" },
];

interface FooterPrivacyPanelProps {
  onClose: () => void;
}

export default function FooterPrivacyPanel({ onClose }: FooterPrivacyPanelProps) {
  return (
    <div className="mt-6 p-6 bg-white/10 rounded-xl text-sm text-white/80 leading-relaxed">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-white">개인정보처리방침</h4>
        <button
          type="button"
          onClick={onClose}
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
  );
}

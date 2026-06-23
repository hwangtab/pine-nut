"use client";

import { EditableValue } from "@/components/editable";

export default function HomeShareEditControls() {
  return (
    <div className="fixed bottom-20 sm:bottom-4 left-2 right-2 sm:left-4 sm:right-auto z-40 flex flex-wrap gap-2 rounded-2xl border border-blue-200 bg-white/95 p-3 shadow-xl backdrop-blur max-w-sm sm:max-w-none">
      <EditableValue
        contentKey="home.share.title"
        defaultValue="풍천리를 지켜주세요"
        page="home"
        section="hero"
        buttonLabel="공유 제목"
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey="home.share.text"
        defaultValue="강원도 홍천 풍천리 주민들의 이야기를 들어주세요."
        page="home"
        section="hero"
        multiline
        buttonLabel="공유 설명"
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey="home.share.copyAlert"
        defaultValue="링크가 복사되었습니다."
        page="home"
        section="hero"
        buttonLabel="복사 알림"
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey="home.toast.prefix"
        defaultValue="방금"
        page="home"
        section="cta"
        buttonLabel="토스트 앞문구"
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
      <EditableValue
        contentKey="home.toast.suffix"
        defaultValue="님이 서명했습니다"
        page="home"
        section="cta"
        buttonLabel="토스트 뒷문구"
        wrapperClassName="relative"
        buttonClassName="rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
      >
        {(value, editButton) => editButton ?? <span>{value}</span>}
      </EditableValue>
    </div>
  );
}

"use client";

import { EditableList, EditableText } from "@/components/editable";

export function StoryTransportSection() {
  return (
    <div className="mt-12">
      <EditableText
        contentKey="story.transport.heading"
        defaultValue="교통 안내"
        as="h3"
        page="story"
        section="transport"
        className="text-xl md:text-2xl font-bold text-[var(--color-forest)] mb-8 text-center"
      />
      <EditableList
        contentKey="story.transport.car"
        defaultItems={[
          {
            title: "서울 → 풍천리",
            route: "서울양양고속도로 → 동홍천IC → 44번 국도 → 화촌면 방면",
            duration: "약 1시간 30분",
          },
          {
            title: "춘천 → 풍천리",
            route: "5번 국도 → 홍천 → 44번 국도 → 화촌면 방면",
            duration: "약 50분",
          },
        ]}
        page="story"
        section="transport"
        fields={[
          { key: "title", label: "구간" },
          { key: "route", label: "경로" },
          { key: "duration", label: "소요시간" },
        ]}
      >
        {(items) => (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[var(--radius-card)] p-6 md:p-8 border-2 border-[var(--color-forest)]/15 shadow-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[var(--color-forest)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 17h.01M16 17h.01M5.2 17H4a1 1 0 01-1-1v-3.6a1 1 0 01.1-.44l1.5-3.2A2 2 0 016.4 7.5h11.2a2 2 0 011.8 1.3l1.5 3.2a1 1 0 01.1.44V16a1 1 0 01-1 1h-1.2M7 17a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-[var(--color-text)]">
                  자가용
                </h4>
              </div>
              <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                {items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest)]" />
                    <span>
                      <strong className="text-[var(--color-text)]">{item.title}</strong>
                      <br />
                      {item.route}
                      <br />
                      <span className="text-[var(--color-forest)] font-semibold">
                        {item.duration}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <EditableList
              contentKey="story.transport.public"
              defaultItems={[
                {
                  title: "서울 → 홍천",
                  route: "동서울터미널에서 홍천행 시외버스",
                  duration: "약 1시간 30분, 수시 운행",
                },
                {
                  title: "홍천 → 화촌면",
                  route: "홍천버스터미널에서 화촌면행 농어촌버스",
                  duration: "약 40분",
                },
                {
                  title: "화촌면 → 풍천리",
                  route: "마을버스 또는 도보",
                  duration: "",
                },
              ]}
              page="story"
              section="transport"
              fields={[
                { key: "title", label: "구간" },
                { key: "route", label: "경로" },
                { key: "duration", label: "소요시간" },
              ]}
            >
              {(publicItems) => (
                <div className="bg-white rounded-[var(--radius-card)] p-6 md:p-8 border-2 border-[var(--color-forest)]/15 shadow-card">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-[var(--color-forest)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7v10M16 7v10M6 7h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2zm0 10v2m12-2v2M9 4h6"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-[var(--color-text)]">
                      대중교통
                    </h4>
                  </div>
                  <ul className="space-y-4 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
                    {publicItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-forest)]" />
                        <span>
                          <strong className="text-[var(--color-text)]">{item.title}</strong>
                          <br />
                          {item.route}
                          {item.duration && (
                            <>
                              <br />
                              <span className="text-[var(--color-forest)] font-semibold">
                                {item.duration}
                              </span>
                            </>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </EditableList>
          </div>
        )}
      </EditableList>

      <EditableList
        contentKey="story.transport.notes"
        defaultItems={[
          { text: "풍천리는 가리산 자락 해발 400~700m 산촌입니다" },
          { text: "대중교통이 제한적이므로 자가용 이용을 권장합니다" },
        ]}
        page="story"
        section="transport"
        fields={[{ key: "text", label: "내용" }]}
      >
        {(noteItems) => (
          <div className="mt-6 bg-[var(--color-forest)]/5 rounded-[var(--radius-panel)] p-6 md:p-8 border border-[var(--color-forest)]/10">
            <h4 className="text-base font-bold text-[var(--color-forest)] mb-4">
              참고사항
            </h4>
            <ul className="space-y-2.5 text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed">
              {noteItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="shrink-0 mt-1">
                    <svg
                      className="w-4 h-4 text-[var(--color-forest)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
                      />
                    </svg>
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-start gap-3 bg-white/60 rounded-[var(--radius-card)] p-4 border border-[var(--color-forest)]/10">
              <span className="shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-[var(--color-forest)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <EditableText
                contentKey="story.transport.carpool"
                defaultValue="집회 참여 시 카풀이 가능합니다 — 캠페인 페이지에서 문의해주세요"
                as="p"
                page="story"
                section="transport"
                className="text-sm md:text-base text-[var(--color-text)]"
              />
            </div>
          </div>
        )}
      </EditableList>
    </div>
  );
}

"use client";

import { EditableImage, EditableList, EditableText } from "@/components/editable";
import { FadeIn } from "@/components/home/HomeMotion";
import { PineConeIcon } from "@/components/visuals/ForestLetterMotifs";

export default function HomeHopeSection() {
  return (
    <div className="max-w-5xl mx-auto">
      <FadeIn className="mb-6">
        <EditableText
          contentKey="home.hope.eyebrow"
          defaultValue="그러나 이야기는 여기서 끝나지 않습니다"
          as="p"
          page="home"
          section="hope"
          className="font-hand text-xl normal-case tracking-normal text-[var(--color-forest)] mb-4"
        />
        <EditableText
          contentKey="home.hope.heading"
          defaultValue="그럼에도, 포기하지 않았습니다"
          as="h2"
          page="home"
          section="hope"
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-6 text-[var(--color-forest)]"
        />
        <EditableText
          contentKey="home.hope.subtitle"
          defaultValue="7년간 705번. 일흔 넘은 어르신들이 매주 버스에 올라 홍천군청 앞에 섰습니다. 지팡이를 짚고서라도, 단 한 주도 거르지 않았습니다."
          as="p"
          page="home"
          section="hope"
          className="text-balance text-lg md:text-xl text-[var(--color-text-muted)] leading-relaxed max-w-2xl"
        />
      </FadeIn>

      <EditableList
        contentKey="home.hope.cards"
        defaultItems={[
          {
            title: "672차 기도회",
            desc: "비가 오나 눈이 오나, 매주 한자리에 모여 평화로운 기도를 이어왔습니다.",
          },
          {
            title: "140개 단체 연대",
            desc: "전국 140개 환경·시민단체가 풍천리의 손을 맞잡았습니다.",
          },
          {
            title: "시민공모전 대상",
            desc: "한국내셔널트러스트 '이곳만은 지키자' 공모전 대상. 지켜야 할 가치를 온 사회가 함께 인정했습니다.",
          },
        ]}
        page="home"
        section="hope"
        fields={[
          { key: "title", label: "제목" },
          { key: "desc", label: "설명", type: "textarea" },
        ]}
      >
        {(items) => (
          <div className="trail-line relative mt-14 ml-2 space-y-12 pl-10">
            {items.map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.1}>
                <div className="relative">
                  <PineConeIcon className="absolute -left-[52px] top-0 w-6 h-8 text-[var(--color-forest)]" />
                  <h3 className="font-serif-display font-bold text-2xl mb-2 text-[var(--color-text)]">{card.title}</h3>
                  <p className="max-w-xl leading-relaxed text-[var(--color-text-muted)]">{card.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </EditableList>

      <FadeIn delay={0.3}>
        <figure className="photo-frame paper-tilt-r mt-14">
          <EditableImage
            contentKey="home.hope.protestPhoto"
            defaultSrc="https://hxcoeowfjanltwrsqhyz.supabase.co/storage/v1/object/public/images/press/2025111117101271238_l.png"
            fallbackSrc="/images/mountain-village.jpg"
            alt="672차 결의대회 사진"
            page="home"
            section="hope"
            width={1200}
            height={800}
            className="w-full rounded-[2px]"
          />
          <figcaption>
            <EditableText
              contentKey="home.hope.protestPhotoCredit"
              defaultValue="사진: 풍천리양수발전소반대대책위 / 프레시안"
              as="p"
              page="home"
              section="hope"
              className="font-hand text-lg text-[var(--color-text-muted)] mt-2 text-right pr-1"
            />
          </figcaption>
        </figure>
      </FadeIn>
    </div>
  );
}

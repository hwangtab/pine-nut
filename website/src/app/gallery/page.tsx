"use client";

import { motion } from "framer-motion";
import { TreePine, Users, Heart, Camera } from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface PlaceholderCard {
  id: number;
  caption: string;
  bgColor: string;
  iconColor: string;
  Icon: LucideIcon;
}

const naturePlaceholders: PlaceholderCard[] = [
  { id: 1, caption: "100년 된 잣나무 군락지", bgColor: "bg-emerald-800", iconColor: "text-emerald-300", Icon: TreePine },
  { id: 2, caption: "풍천리 마을 전경", bgColor: "bg-emerald-700", iconColor: "text-emerald-200", Icon: TreePine },
  { id: 3, caption: "잣나무숲 산책로", bgColor: "bg-emerald-900", iconColor: "text-emerald-400", Icon: TreePine },
  { id: 4, caption: "멸종위기 산양 서식지", bgColor: "bg-green-800", iconColor: "text-green-300", Icon: TreePine },
  { id: 5, caption: "풍천리의 사계절", bgColor: "bg-teal-800", iconColor: "text-teal-300", Icon: TreePine },
  { id: 6, caption: "마을 공동체의 터전", bgColor: "bg-emerald-600", iconColor: "text-emerald-100", Icon: TreePine },
];

const protestPlaceholders: PlaceholderCard[] = [
  { id: 7, caption: "680여 차 정기 집회", bgColor: "bg-orange-700", iconColor: "text-orange-200", Icon: Users },
  { id: 8, caption: "홍천군청 앞 주민 시위", bgColor: "bg-amber-800", iconColor: "text-amber-200", Icon: Users },
  { id: 9, caption: "잣나무 벌채 현장", bgColor: "bg-orange-800", iconColor: "text-orange-300", Icon: Users },
  { id: 10, caption: "주민 철야 농성", bgColor: "bg-red-800", iconColor: "text-red-300", Icon: Users },
  { id: 11, caption: "이설도로 공사 현장", bgColor: "bg-orange-900", iconColor: "text-orange-200", Icon: Users },
  { id: 12, caption: "대책위원회 회의", bgColor: "bg-amber-700", iconColor: "text-amber-100", Icon: Users },
];

const solidarityPlaceholders: PlaceholderCard[] = [
  { id: 13, caption: "청소년직접행동 연대 방문", bgColor: "bg-sky-700", iconColor: "text-sky-200", Icon: Heart },
  { id: 14, caption: "전국 140여 개 단체 연대", bgColor: "bg-blue-800", iconColor: "text-blue-200", Icon: Heart },
  { id: 15, caption: "잣나무숲 음악회", bgColor: "bg-sky-800", iconColor: "text-sky-300", Icon: Heart },
  { id: 16, caption: "마을잔치", bgColor: "bg-indigo-700", iconColor: "text-indigo-200", Icon: Heart },
  { id: 17, caption: "강원녹색당 연대 성명", bgColor: "bg-blue-700", iconColor: "text-blue-100", Icon: Heart },
  { id: 18, caption: "시민 응원 메시지", bgColor: "bg-sky-900", iconColor: "text-sky-200", Icon: Heart },
];

function GalleryCard({ card, index }: { card: PlaceholderCard; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group cursor-pointer"
    >
      <div
        className={`relative aspect-[4/3] rounded-2xl ${card.bgColor} shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col items-center justify-center gap-3 hover:scale-[1.02]`}
      >
        {/* Icon */}
        <card.Icon className={`w-12 h-12 ${card.iconColor} opacity-60 group-hover:opacity-80 transition-opacity`} />

        {/* Placeholder overlay text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
          <Camera className="w-8 h-8 text-white/50 mb-2" />
          <span className="text-white/70 text-sm font-medium">
            사진 준비 중
          </span>
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
          <p className="text-white text-sm font-medium leading-snug">
            {card.caption}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function GallerySection({
  title,
  description,
  cards,
}: {
  title: string;
  description: string;
  cards: PlaceholderCard[];
}) {
  return (
    <section className="mb-16 md:mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {title}
        </h2>
        <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl">
          {description}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {cards.map((card, index) => (
          <GalleryCard key={card.id} card={card} index={index} />
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-amber-50/30">
      {/* Hero */}
      <section className="pt-16 pb-12 md:pt-24 md:pb-16 px-4 text-center bg-gradient-to-b from-stone-100 to-transparent">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4"
        >
          풍천리의 기록
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed"
        >
          잣나무숲의 아름다움, 투쟁의 현장, 연대의 순간을 사진으로 기록합니다
        </motion.p>
      </section>

      {/* Gallery sections */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <GallerySection
          title="풍천리의 아름다움"
          description="100년 넘은 잣나무 군락지와 멸종위기 산양이 살아가는 풍천리의 자연. 이 숲은 주민들의 삶의 터전이자, 지켜야 할 생태계의 보고입니다."
          cards={naturePlaceholders}
        />

        <GallerySection
          title="투쟁의 현장"
          description="2019년부터 7년이 넘도록 매주 이어온 정기 집회, 680여 차의 기록. 60~80대 어르신들이 마을을 지키기 위해 걸어온 길입니다."
          cards={protestPlaceholders}
        />

        <GallerySection
          title="연대의 순간"
          description="전국 140여 개 단체, 청소년에서 시민까지. 풍천리 주민들과 함께 손을 잡은 연대의 순간들입니다."
          cards={solidarityPlaceholders}
        />
      </div>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 text-center bg-gradient-to-t from-amber-50 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto"
        >
          <Camera className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            사진을 제보해주세요
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            풍천리의 아름다운 자연, 투쟁의 현장, 연대의 순간을 담은 사진이 있으시다면 제보해주세요. 함께 기록을 남깁니다.
          </p>
          <a
            href="https://campaigns.do"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          >
            사진 제보하기
          </a>
        </motion.div>
      </section>
    </main>
  );
}

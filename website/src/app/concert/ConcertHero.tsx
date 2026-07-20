"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CONCERT_DATE_LABEL,
  CONCERT_PLACE,
  CONCERT_TIME_LABEL,
} from "@/lib/concert";
import { useConcertStatus } from "@/lib/use-concert-status";

export default function ConcertHero() {
  const dday = useConcertStatus()?.label ?? null;

  return (
    <section className="relative flex min-h-[88svh] flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 text-center text-white sm:px-6">
      <Image
        src="/images/forest-aerial.jpg"
        alt="풍천리 잣나무 숲"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/60 to-black/80" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm sm:text-base"
        >
          <span>{CONCERT_DATE_LABEL}</span>
          <span aria-hidden>·</span>
          <span>{CONCERT_PLACE}</span>
          <span aria-hidden>·</span>
          <span>{CONCERT_TIME_LABEL}</span>
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-sans text-5xl font-black leading-[1.05] tracking-tight sm:text-7xl md:text-8xl"
        >
          <span className="block text-[#FF8CA0]">베어지기 전에</span>
          <span className="mt-2 block text-[#3BEF7C]">풍천리</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-xl"
        >
          잣나무 11만 그루가 베어지기 전에.
          <br className="hidden sm:block" /> 풍천리를 지키려는 음악가 12팀이
          청와대 앞에 모입니다.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-8 flex items-center justify-center"
          aria-label="공연까지 남은 날"
        >
          <span className="rounded-2xl border-2 border-[#3BEF7C]/60 bg-black/40 px-8 py-3 text-4xl font-black tracking-tight text-[#3BEF7C] sm:text-6xl">
            {dday ?? "8·1"}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/petition"
            className="min-h-[48px] rounded-full bg-[var(--color-warm)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-warm-light)] sm:text-lg"
          >
            서명으로 함께하기
          </Link>
          <a
            href="#poster"
            className="min-h-[48px] rounded-full border-2 border-white/60 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10 sm:text-lg"
          >
            포스터 보기
          </a>
        </motion.div>
      </div>
    </section>
  );
}

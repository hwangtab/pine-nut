"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

export default function PetitionAnimatedCounter({
  target,
  locale = "ko-KR",
}: {
  target: number;
  locale?: string;
}) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (value) =>
    Math.round(value).toLocaleString(locale),
  );
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, target, {
      duration: 2,
      ease: "easeOut",
    });
    const unsubscribe = rounded.on("change", (value) => setDisplay(value));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [target, count, rounded]);

  return (
    <motion.span
      className="text-5xl sm:text-6xl font-black text-[var(--color-warm)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {display}
    </motion.span>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";

export default function HomeSocialProofToast({
  visible,
  name,
  prefix,
  suffix,
}: {
  visible: boolean;
  name: string | null;
  prefix: string;
  suffix: string;
}) {
  return (
    <AnimatePresence>
      {visible && name && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-20 left-4 z-40 max-w-xs px-4 py-3 rounded-lg bg-[var(--color-text)]/90 backdrop-blur text-white text-sm shadow-lg pointer-events-none"
        >
          <span aria-hidden="true" className="mr-1.5">🎉</span>
          {prefix} {name}
          {suffix}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

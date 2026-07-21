"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { EditableText } from "@/components/editable";
import type { PublicSignature } from "@/lib/signatures/client";

function formatSignatureDate(dateStr: string, locale: string) {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: "numeric",
      month: locale === "ko-KR" ? "2-digit" : "short",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

interface RecentSignaturesProps {
  signatures: PublicSignature[];
  loading: boolean;
  ariaLabel?: string;
  page?: string;
  headingKey?: string;
  headingDefault?: string;
  loadingKey?: string;
  loadingDefault?: string;
  emptyKey?: string;
  emptyDefault?: string;
  dateLocale?: string;
}

export default function RecentSignatures({
  signatures,
  loading,
  ariaLabel = "최근 서명",
  page = "petition",
  headingKey = "petition.recent.heading",
  headingDefault = "최근 서명",
  loadingKey = "petition.recent.loading",
  loadingDefault = "불러오는 중...",
  emptyKey = "petition.recent.empty",
  emptyDefault = "아직 서명이 없습니다. 첫 번째로 서명해주세요!",
  dateLocale = "ko-KR",
}: RecentSignaturesProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (signatures.length === 0) return;
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % signatures.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [signatures.length]);

  const ordered =
    signatures.length > 0
      ? [...signatures.slice(offset), ...signatures.slice(0, offset)]
      : [];

  return (
    <section className="w-full" aria-label={ariaLabel}>
      <EditableText
        contentKey={headingKey}
        defaultValue={headingDefault}
        as="h2"
        page={page}
        section="recent"
        className="text-xl sm:text-2xl font-bold mb-6 text-[var(--color-text)]"
      />
      {loading ? (
        <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)]">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <EditableText
            contentKey={loadingKey}
            defaultValue={loadingDefault}
            as="span"
            page={page}
            section="recent"
          />
        </div>
      ) : signatures.length === 0 ? (
        <EditableText
          contentKey={emptyKey}
          defaultValue={emptyDefault}
          as="p"
          page={page}
          section="recent"
          className="text-center py-8 text-[var(--color-text-muted)]"
        />
      ) : (
        <div className="space-y-3 overflow-hidden max-h-[320px]">
          <AnimatePresence mode="popLayout">
            {ordered.slice(0, 5).map((sig, i) => (
              <motion.div
                key={`${sig.name}-${(offset + i) % signatures.length}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white border border-[var(--color-border)] rounded-[var(--radius-card)] shadow-card px-5 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--color-text)]">{sig.name}</span>
                  <time dateTime={sig.created_at} className="text-sm text-[var(--color-text-muted)]">
                    {formatSignatureDate(sig.created_at, dateLocale)}
                  </time>
                </div>
                {sig.message && (
                  <p className="mt-1 text-[var(--color-text-muted)] text-[15px]">
                    &ldquo;{sig.message}&rdquo;
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

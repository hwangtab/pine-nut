"use client";

import { EditableText } from "@/components/editable";
import {
  petitionStatementBlocks,
  petitionStatementClosing,
  petitionStatementStats,
  petitionStatementTitle,
  type StatementBlockCopy,
  type StatementStatCopy,
} from "./copy/statement";

const PAGE = "petition";
const SECTION = "statement";

function StatementBlock({ index, block }: { index: number; block: StatementBlockCopy }) {
  return (
    <div className="paper p-6 sm:p-8">
      <div className="relative z-[1] space-y-4">
        <div className="flex items-start gap-3">
          <span
            className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-forest)]/10 flex items-center justify-center text-[var(--color-forest)] font-bold text-sm"
            aria-hidden="true"
          >
            {index}
          </span>
          <EditableText
            contentKey={block.headingKey}
            defaultValue={block.headingDefault}
            as="h3"
            page={PAGE}
            section={SECTION}
            className="font-serif-display font-bold text-lg sm:text-xl text-[var(--color-text)] pt-0.5"
          />
        </div>
        <div className="space-y-3 pl-11">
          {block.paragraphs.map((p) => (
            <EditableText
              key={p.key}
              contentKey={p.key}
              defaultValue={p.defaultValue}
              as="p"
              page={PAGE}
              section={SECTION}
              className="text-[var(--color-text-muted)] text-[15px] leading-relaxed"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ stat }: { stat: StatementStatCopy }) {
  return (
    <div className="paper px-4 py-5 text-center">
      <div className="relative z-[1]">
        <EditableText
          contentKey={stat.valueKey}
          defaultValue={stat.valueDefault}
          as="p"
          page={PAGE}
          section={SECTION}
          className="font-serif-display font-bold text-2xl sm:text-3xl text-[var(--color-forest)]"
        />
        <EditableText
          contentKey={stat.labelKey}
          defaultValue={stat.labelDefault}
          as="p"
          page={PAGE}
          section={SECTION}
          className="mt-1 text-xs sm:text-sm text-[var(--color-text-muted)]"
        />
      </div>
    </div>
  );
}

export default function PetitionStatement() {
  return (
    <section aria-label="성명서" className="space-y-6">
      <div className="text-center">
        <EditableText
          contentKey={petitionStatementTitle.key}
          defaultValue={petitionStatementTitle.defaultValue}
          as="h2"
          page={PAGE}
          section={SECTION}
          className="font-serif-display font-bold text-lg sm:text-xl text-[var(--color-text)]"
        />
      </div>

      {petitionStatementBlocks.slice(0, 2).map((block, i) => (
        <StatementBlock key={block.headingKey} index={i + 1} block={block} />
      ))}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {petitionStatementStats.map((stat) => (
          <StatCard key={stat.valueKey} stat={stat} />
        ))}
      </div>

      {petitionStatementBlocks.slice(2).map((block, i) => (
        <StatementBlock key={block.headingKey} index={i + 3} block={block} />
      ))}

      <div className="text-center pt-2">
        {petitionStatementClosing.map((p, i) => (
          <EditableText
            key={p.key}
            contentKey={p.key}
            defaultValue={p.defaultValue}
            as="p"
            page={PAGE}
            section={SECTION}
            className={
              i === 0
                ? "font-serif-display text-lg sm:text-xl text-[var(--color-text)]"
                : "mt-2 font-serif-display font-bold text-xl sm:text-2xl text-[var(--color-text)]"
            }
          />
        ))}
      </div>
    </section>
  );
}

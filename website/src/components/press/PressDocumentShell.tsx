"use client";

import type { ReactNode } from "react";
import { Download } from "lucide-react";
import UtilityHeader from "@/components/UtilityHeader";
import { EditableLink, EditableText } from "@/components/editable";
import { events } from "@/lib/analytics";

interface EditableTextCopy {
  contentKey: string;
  defaultValue: string;
}

interface PressDocumentShellProps {
  section: string;
  downloadKind: "release" | "factsheet";
  header: {
    title: EditableTextCopy;
    subtitle: EditableTextCopy;
    eyebrow: EditableTextCopy;
  };
  action: {
    pdfLabel: EditableTextCopy;
    backHrefKey: string;
    backDefaultHref: string;
    backLabel: EditableTextCopy;
  };
  children: ReactNode;
}

export default function PressDocumentShell({
  section,
  downloadKind,
  header,
  action,
  children,
}: PressDocumentShellProps) {
  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            padding: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

      <div className="no-print">
        <UtilityHeader
          title={
            <EditableText
              contentKey={header.title.contentKey}
              defaultValue={header.title.defaultValue}
              as="span"
              page="press"
              section={section}
            />
          }
          subtitle={
            <EditableText
              contentKey={header.subtitle.contentKey}
              defaultValue={header.subtitle.defaultValue}
              as="span"
              page="press"
              section={section}
            />
          }
          eyebrow={
            <EditableText
              contentKey={header.eyebrow.contentKey}
              defaultValue={header.eyebrow.defaultValue}
              as="span"
              page="press"
              section={section}
            />
          }
          tone="slate"
        />
      </div>

      <div className="print-page max-w-3xl mx-auto px-6 py-12">
        <div className="no-print mb-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              events.pressKitDownload(downloadKind);
              window.print();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-forest)] text-white font-semibold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <EditableText
              contentKey={action.pdfLabel.contentKey}
              defaultValue={action.pdfLabel.defaultValue}
              as="span"
              page="press"
              section={section}
            />
          </button>
          <EditableLink
            contentKey={action.backHrefKey}
            defaultHref={action.backDefaultHref}
            page="press"
            section={section}
            className="inline-flex items-center min-h-[44px] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-forest)] transition-colors"
          >
            <EditableText
              contentKey={action.backLabel.contentKey}
              defaultValue={action.backLabel.defaultValue}
              as="span"
              page="press"
              section={section}
            />
          </EditableLink>
        </div>

        {children}
      </div>
    </>
  );
}

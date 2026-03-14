"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import {
  isExternalEditableHref,
  isInternalEditableHref,
  validateEditableHref,
} from "@/lib/validation/editable-link";

interface EditableLinkProps {
  contentKey: string;
  defaultHref: string;
  page: string;
  section?: string;
  className?: string;
  containerClassName?: string;
  inline?: boolean;
  onNavigate?: () => void;
  children: React.ReactNode;
}

function renderEditableHref(
  href: string,
  className: string,
  onClick: ((event: React.MouseEvent<HTMLAnchorElement>) => void) | undefined,
  children: React.ReactNode,
) {
  if (isInternalEditableHref(href)) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={onClick}
      target={isExternalEditableHref(href) ? "_blank" : undefined}
      rel={isExternalEditableHref(href) ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

export default function EditableLink({
  contentKey,
  defaultHref,
  page,
  section,
  className = "",
  containerClassName = "",
  inline = false,
  onNavigate,
  children,
}: EditableLinkProps) {
  const { isEditMode, getContent, stageChange } = useAdminEdit();
  const href = getContent(contentKey) ?? defaultHref;
  const [editing, setEditing] = useState(false);
  const [localState, setLocalState] = useState({ href, localHref: href });

  if (!editing && localState.href !== href) {
    setLocalState({ href, localHref: href });
  }

  const localHref = localState.localHref;

  const handleSave = useCallback(() => {
    const validation = validateEditableHref(localHref, "링크 주소");
    if (validation.error || !validation.value) {
      alert(validation.error ?? "링크 주소가 올바르지 않습니다.");
      return;
    }

    if (validation.value !== href) {
      stageChange({
        content_key: contentKey,
        content_type: "link",
        value: validation.value,
        page,
        section,
      });
    }

    setEditing(false);
  }, [contentKey, href, localHref, page, section, stageChange]);

  const Container = (inline ? "span" : "div") as ElementType;

  if (!isEditMode) {
    return renderEditableHref(href, className, () => onNavigate?.(), children);
  }

  return (
    <>
      <Container
        className={`relative group ${containerClassName}`}
        data-editable-key={contentKey}
      >
        {renderEditableHref(
          href,
          className,
          (event) => {
            event.preventDefault();
          },
          children,
        )}
        <button
          type="button"
          onClick={() => {
            setLocalState({ href, localHref: href });
            setEditing(true);
          }}
          className={`absolute z-20 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 ${
            inline ? "-top-6 right-0" : "-top-2 -right-2"
          }`}
        >
          링크
        </button>
      </Container>

      {editing && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(false);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-900 shrink-0">링크 편집</h3>
              <span className="text-xs font-mono text-gray-400 text-right break-all min-w-0">{contentKey}</span>
            </div>
            <input
              value={localHref}
              onChange={(event) =>
                setLocalState((prev) => ({
                  ...prev,
                  localHref: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="/path 또는 https://example.com"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
                if (event.key === "Escape") setEditing(false);
              }}
            />
            <p className="mt-3 text-sm text-gray-500">
              내부 경로(<code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">/story</code>), 외부 주소, <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">mailto:</code>, <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-700">tel:</code> 링크를 사용할 수 있습니다.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setLocalState({ href, localHref: href });
                  setEditing(false);
                }}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

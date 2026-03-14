"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { MediaItem } from "@/lib/data/media-library";
import {
  deleteMediaLibraryItemAction,
  uploadMediaLibraryAction,
} from "@/lib/actions/media-library";

interface MediaLibraryManagerProps {
  initialItems: MediaItem[];
}

export default function MediaLibraryManager({
  initialItems,
}: MediaLibraryManagerProps) {
  const [items, setItems] = useState(initialItems);
  const [folder, setFolder] = useState("library");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("업로드할 이미지를 선택해주세요.");
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("folder", folder);
      formData.append("file", file);
      const result = await uploadMediaLibraryAction(formData);

      if (result.error || !result.url || !result.path) {
        setError(result.error ?? "이미지 업로드에 실패했습니다.");
        return;
      }

      const uploadedUrl = result.url;
      const uploadedPath = result.path;

      setItems((prev) => [
        {
          id: `${folder}/${file.name}-${Date.now()}`,
          name: file.name,
          folder,
          path: uploadedPath,
          url: uploadedUrl,
          updatedAt: new Date().toISOString(),
          size: file.size,
          contentType: file.type,
        },
        ...prev,
      ]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setMessage("이미지를 업로드했습니다.");
    });
  };

  const handleDelete = (path: string) => {
    if (!window.confirm("이 이미지를 삭제하시겠습니까?")) return;

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await deleteMediaLibraryItemAction(path);
      if (result.error) {
        setError(result.error);
        return;
      }

      setItems((prev) => prev.filter((item) => item.path !== path));
      setMessage("이미지를 삭제했습니다.");
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">미디어 라이브러리</h1>
        <p className="mt-2 text-[var(--color-admin-muted)]">
          업로드한 이미지를 한곳에서 관리하고 URL을 복사해 페이지 편집에 재사용합니다.
        </p>
      </div>

      <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5 text-sm leading-relaxed text-[var(--color-admin-muted)]">
        권장 흐름: <strong className="text-[var(--color-admin-text)]">업로드</strong> → <strong className="text-[var(--color-admin-text)]">URL 복사</strong> → 공개 페이지 인라인 편집 또는 사이트 빌더에 붙여넣기. 현재 지원 형식은 JPG, PNG, WebP입니다.
      </section>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">새 이미지 업로드</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr_auto]">
          <select
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            className="min-w-0 rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)] outline-none focus:border-[var(--color-forest)]"
          >
            <option value="library">library</option>
            <option value="page-content">page-content</option>
            <option value="news">news</option>
            <option value="timeline">timeline</option>
          </select>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="min-w-0 w-full rounded-xl border border-[var(--color-admin-border)] bg-white px-4 py-3 text-base text-[var(--color-admin-text)]"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={isPending}
            className="w-full rounded-xl bg-[var(--color-forest)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40 md:w-auto"
          >
            {isPending ? "처리 중..." : "업로드"}
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-[var(--color-admin-text)]">저장된 이미지</h2>
          <p className="text-sm text-[var(--color-admin-muted)]">{items.length}개</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="overflow-hidden rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--color-bg)]">
                <Image
                  src={item.url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">
                    {item.folder}
                  </p>
                  <h3 className="mt-1 line-clamp-1 text-base font-bold text-[var(--color-admin-text)]">
                    {item.name}
                  </h3>
                </div>
                <div className="text-sm text-[var(--color-admin-muted)]">
                  {item.updatedAt
                    ? new Intl.DateTimeFormat("ko-KR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.updatedAt))
                    : "업데이트 시간 없음"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(item.url);
                      setMessage("이미지 URL을 복사했습니다.");
                    }}
                    className="min-h-[44px] rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
                  >
                    URL 복사
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-admin-border)]"
                  >
                    열기
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.path)}
                    className="min-h-[44px] rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import {
  deleteMediaLibraryItemAction,
  uploadMediaLibraryAction,
} from "@/lib/actions/media-library";
import type { MediaItem } from "@/lib/data/media-library";

export function useMediaLibraryManager(initialItems: MediaItem[]) {
  const [items, setItems] = useState(initialItems);
  const [folder, setFolder] = useState("library");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearStatus = () => {
    setError(null);
    setMessage(null);
  };

  const handleUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("업로드할 이미지를 선택해주세요.");
      return;
    }

    clearStatus();

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

    clearStatus();

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

  const handleCopyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setMessage("이미지 URL을 복사했습니다.");
    setError(null);
  };

  return {
    items,
    folder,
    setFolder,
    message,
    error,
    isPending,
    fileInputRef,
    handleUpload,
    handleDelete,
    handleCopyUrl,
  };
}

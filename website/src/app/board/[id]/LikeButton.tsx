"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { togglePostLike } from "@/lib/actions/board";

export default function LikeButton({
  postId,
  count,
  liked,
  canLike,
}: {
  postId: number;
  count: number;
  liked: boolean;
  canLike: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    if (!canLike) {
      router.push("/login");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await togglePostLike(postId);
      if (res?.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={liked}
        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
          liked
            ? "border-[var(--color-forest)] bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
            : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
        }`}
      >
        <Heart size={16} className={liked ? "fill-current" : ""} />
        <span>{count}</span>
      </button>
      {error && (
        <span className="text-sm text-[var(--color-danger)]">{error}</span>
      )}
    </div>
  );
}

"use client";

import { useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { uploadBoardImage, deleteBoardImage } from "@/lib/actions/board";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[var(--color-forest)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {pending ? "업로드 중..." : "이미지 추가"}
    </button>
  );
}

export default function BoardImageManager({
  postId,
  images,
}: {
  postId: number;
  images: { id: number; url: string }[];
}) {
  const upload = uploadBoardImage.bind(null, postId);
  const [state, formAction] = useActionState(upload, null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(imageId: number) {
    if (!confirm("이 이미지를 삭제할까요?")) return;
    // 서버 호출까지 전환 안에서 해야 isPending이 요청 내내 켜져 버튼이 잠긴다.
    // (예전에는 refresh만 감싸 삭제 요청 중에 버튼을 다시 누를 수 있었다.)
    startTransition(async () => {
      const result = await deleteBoardImage(imageId, postId);
      if (result?.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="paper mt-8 p-4">
     <div className="relative z-[1]">
      <h2 className="text-lg font-bold text-[var(--color-text)]">이미지</h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        JPG/PNG/WebP, 5MB 이하
      </p>

      <form action={formAction} className="mt-4 flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="image_file"
          accept="image/jpeg,image/png,image/webp"
          required
          className="text-sm text-[var(--color-text)]"
        />
        <SubmitButton />
      </form>
      {state?.error && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">{state.error}</p>
      )}

      {images.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {images.map((img) => (
            <div key={img.id} className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt=""
                loading="lazy"
                decoding="async"
                width={96}
                height={96}
                className="h-24 w-24 rounded-[var(--radius-card)] object-cover"
              />
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                disabled={isPending}
                className="text-xs font-medium text-[var(--color-danger)] disabled:opacity-60"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
     </div>
    </div>
  );
}

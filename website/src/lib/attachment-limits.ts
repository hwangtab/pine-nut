// 회의록 첨부파일 제약. 클라이언트(파일 선택 즉시 안내)와 서버(최종 방어)가 함께 쓴다.
//
// 주의: 이 값은 next.config.ts의 serverActions.bodySizeLimit보다 작아야 한다.
// 크면 서버 액션이 본문 크기에서 먼저 잘려, 앱의 에러 메시지가 뜨지 않고
// 아무 안내 없이 실패한다(사용자에게는 "눌러도 아무 일도 안 남"으로 보인다).
export const MAX_ATTACHMENT_MB = 20;
export const MAX_ATTACHMENT_BYTES = MAX_ATTACHMENT_MB * 1024 * 1024;

export function validateAttachmentSize(
  file: { size: number },
): { ok: true } | { ok: false; error: string } {
  if (file.size > MAX_ATTACHMENT_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      ok: false,
      error: `파일 용량은 ${MAX_ATTACHMENT_MB}MB 이하만 가능합니다. (선택한 파일: ${mb}MB)`,
    };
  }
  return { ok: true };
}

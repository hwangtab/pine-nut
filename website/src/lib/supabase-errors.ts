interface SupabaseLikeError {
  code?: string | null;
  message?: string | null;
  hint?: string | null;
}

function readMessage(error: unknown): string {
  if (!error || typeof error !== "object") return "";
  const candidate = error as SupabaseLikeError;
  return candidate.message ?? "";
}

export function isMissingSupabaseRelationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const candidate = error as SupabaseLikeError;
  if (candidate.code === "PGRST205") return true;

  const message = readMessage(error);
  return (
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  );
}

export function formatSupabaseRelationWarning(
  relationName: string,
  label: string,
): string {
  return `${label} 데이터를 Supabase에서 읽지 못했습니다. \`${relationName}\` 테이블 마이그레이션과 REST 노출 상태를 확인하세요.`;
}

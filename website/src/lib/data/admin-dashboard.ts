import {
  formatSupabaseRelationWarning,
  isMissingSupabaseRelationError,
} from "@/lib/supabase-errors";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

export interface AdminDashboardMetricStatus {
  value: string;
  warning: string | null;
}

export interface AdminDashboardData {
  newsStatus: AdminDashboardMetricStatus;
  timelineStatus: AdminDashboardMetricStatus;
  signatureStatus: AdminDashboardMetricStatus;
  warnings: string[];
}

async function getTableCountStatus(
  supabase: SupabaseServerClient,
  table: string,
  label: string,
  filterDeleted = false,
): Promise<AdminDashboardMetricStatus> {
  let countQuery = supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  let checkQuery = supabase.from(table).select("id").limit(1);

  if (filterDeleted) {
    countQuery = countQuery.eq("is_deleted", false);
    checkQuery = checkQuery.eq("is_deleted", false);
  }

  const [countResult, checkResult] = await Promise.all([countQuery, checkQuery]);
  const error = countResult.error ?? checkResult.error;

  if (error) {
    return {
      value: "확인 필요",
      warning: isMissingSupabaseRelationError(error)
        ? formatSupabaseRelationWarning(table, label)
        : `${label} 데이터를 불러오지 못했습니다. Supabase 연결 상태를 확인하세요.`,
    };
  }

  return {
    value: (countResult.count ?? 0).toLocaleString("ko-KR"),
    warning: null,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for admin dashboard.");
  }

  const [newsStatus, timelineStatus, signatureStatus] = await Promise.all([
    getTableCountStatus(supabase, "news", "소식", true),
    getTableCountStatus(supabase, "timeline_events", "타임라인", true),
    getTableCountStatus(supabase, "signatures", "서명"),
  ]);

  const warnings = [
    newsStatus.warning,
    timelineStatus.warning,
    signatureStatus.warning,
  ].filter((warning): warning is string => Boolean(warning));

  return {
    newsStatus,
    timelineStatus,
    signatureStatus,
    warnings,
  };
}

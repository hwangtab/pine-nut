import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Newspaper, Clock, Users, Blocks, Images, History } from "lucide-react";
import {
  formatSupabaseRelationWarning,
  isMissingSupabaseRelationError,
} from "@/lib/supabase-errors";

async function getTableCountStatus(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  table: string,
  label: string,
  filterDeleted = false,
): Promise<{ value: string; warning: string | null }> {
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

export default async function AdminDashboard() {
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

  const cards = [
    {
      href: "/admin/site-builder",
      label: "사이트 빌더",
      value: "링크/섹션",
      suffix: "",
      icon: Blocks,
      color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    },
    {
      href: "/admin/media",
      label: "미디어 라이브러리",
      value: "이미지",
      suffix: "",
      icon: Images,
      color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    },
    {
      href: "/admin/history",
      label: "버전 히스토리",
      value: "로그",
      suffix: "",
      icon: History,
      color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    },
    {
      href: "/admin/signatures",
      label: "총 서명 수",
      value: signatureStatus.value,
      suffix: signatureStatus.warning ? "" : "명",
      icon: Users,
      color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    },
    {
      href: "/admin/news",
      label: "게시된 소식",
      value: newsStatus.value,
      suffix: newsStatus.warning ? "" : "건",
      icon: Newspaper,
      color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    },
    {
      href: "/admin/timeline",
      label: "타임라인 이벤트",
      value: timelineStatus.value,
      suffix: timelineStatus.warning ? "" : "건",
      icon: Clock,
      color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">관리자 대시보드</h1>
      <p className="text-[var(--color-admin-muted)] mb-8">풍천리 웹사이트를 관리합니다</p>

      {warnings.length > 0 && (
        <section className="mb-8 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-relaxed text-amber-800">
          <h2 className="text-base font-bold">데이터 연결 경고</h2>
          <div className="mt-3 space-y-2">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        </section>
      )}

      <section className="mb-8 rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)]">빠른 가이드</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">1</div>
            <div className="mt-2 text-base font-bold text-[var(--color-admin-text)]">인라인 편집</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              공개 페이지에서 문구, 이미지, 링크, 섹션 표시 여부를 바로 수정합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">2</div>
            <div className="mt-2 text-base font-bold text-[var(--color-admin-text)]">사이트 빌더</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              내비/푸터 링크, 커스텀 섹션, 기존 섹션 순서와 배경/간격을 관리합니다.
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--color-bg)] p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">3</div>
            <div className="mt-2 text-base font-bold text-[var(--color-admin-text)]">히스토리 복원</div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
              저장 후 문제가 생기면 히스토리에서 페이지 콘텐츠, 소식, 타임라인을 이전 상태로 되돌립니다.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="text-sm text-[var(--color-admin-muted)] mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-[var(--color-admin-text)]">
              {card.value}
              <span className="text-lg font-normal text-[var(--color-admin-muted)]/70 ml-1">{card.suffix}</span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">빠른 작업</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/site-builder"
          className="flex items-center gap-4 bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-sky)]/10 flex items-center justify-center text-[var(--color-sky)]">
            <Blocks size={24} />
          </div>
          <div>
            <div className="font-bold text-[var(--color-admin-text)]">사이트 빌더</div>
            <div className="text-sm text-[var(--color-admin-muted)]">링크와 커스텀 섹션을 관리합니다</div>
          </div>
        </Link>
        <Link
          href="/admin/news/new"
          className="flex items-center gap-4 bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center text-[var(--color-forest)] text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-[var(--color-admin-text)]">새 소식 작성</div>
            <div className="text-sm text-[var(--color-admin-muted)]">뉴스, 공지사항을 작성합니다</div>
          </div>
        </Link>
        <Link
          href="/admin/timeline/new"
          className="flex items-center gap-4 bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-sky)]/10 flex items-center justify-center text-[var(--color-sky)] text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-[var(--color-admin-text)]">타임라인 추가</div>
            <div className="text-sm text-[var(--color-admin-muted)]">새로운 이벤트를 기록합니다</div>
          </div>
        </Link>
        <Link
          href="/admin/media"
          className="flex items-center gap-4 bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-warm)]/10 flex items-center justify-center text-[var(--color-warm)]">
            <Images size={24} />
          </div>
          <div>
            <div className="font-bold text-[var(--color-admin-text)]">미디어 라이브러리</div>
            <div className="text-sm text-[var(--color-admin-muted)]">업로드한 이미지를 재사용합니다</div>
          </div>
        </Link>
      </div>

      <section className="mt-10 rounded-3xl border border-dashed border-[var(--color-admin-border)] px-6 py-5 text-sm leading-relaxed text-[var(--color-admin-muted)]">
        `404 페이지`와 세부 문구처럼 사이트 빌더에 없는 특수 화면은 공개 페이지에서 인라인 편집 모드로 수정합니다. 저장 후에는 새 탭에서 공개 화면을 한 번 확인하는 흐름을 권장합니다.
      </section>
    </div>
  );
}

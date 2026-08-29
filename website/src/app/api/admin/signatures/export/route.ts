import { NextResponse } from "next/server";
import { logAudit } from "@/lib/actions/audit";
import { requireActiveAdmin } from "@/lib/actions/auth";
import { getAllSignaturesForExport, kstDateKey } from "@/lib/data/signatures";
import { toCsvRow } from "@/lib/csv";

// 이 라우트는 src/proxy.ts의 매처(`/admin/:path*`)에 걸리지 않는다 — /api/admin/*는
// 미들웨어 보호 밖이다. 그래서 requireActiveAdmin()이 이 요청의 유일한 방어선이다.
export const dynamic = "force-dynamic";

const CSV_HEADERS = [
  "id",
  "이름",
  "공개여부",
  "시도",
  "시군구",
  "소속",
  "이메일",
  "메시지",
  "서명일시",
];

export async function GET() {
  // 권한 확인이 데이터 조회보다 먼저다 — 실패하면 아래 쿼리에 닿지 않고 403으로 끝난다.
  // 이 if-블록은 반드시 return을 포함한 한 문장이어야 한다("error" in ctx일 때
  // NextResponse만 만들고 return을 빠뜨리면, 검사 순서 자체는 그대로라서 위치
  // 비교만으로는 못 잡고 모든 비관리자가 전체 CSV를 받는다 — scripts/
  // check-admin-signatures-export.mjs가 이 블록을 정규식으로 통째로 요구한다).
  const ctx = await requireActiveAdmin();
  if ("error" in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: 403 });
  }

  const { supabase, user } = ctx;

  const { rows, error, truncated } = await getAllSignaturesForExport(supabase);

  if (error) {
    console.error("signatures export: query failed", error.message);
    return NextResponse.json({ error: "서명 데이터를 불러오지 못했습니다." }, { status: 500 });
  }

  // 페이지네이션 안전판(100,000행)에 걸렸다는 뜻 — 일부만 모은 명부를 전체인 척
  // 내보내는 것보다, 실패를 알리고 개발자가 상한을 조정하게 하는 편이 낫다.
  if (truncated) {
    console.error(
      "signatures export: pagination safety cap reached — refusing to export a partial file as complete.",
    );
    return NextResponse.json(
      { error: "서명 수가 너무 많아 전체를 안전하게 내보낼 수 없습니다. 개발자에게 문의하세요." },
      { status: 500 },
    );
  }

  // 전체 명부 내보내기에서는 감사 기록 자체가 목적이다 — logAudit은 대부분의
  // 호출부에서 실패를 조용히 삼키지만(콘텐츠 저장 작업까지 감사 로그 하나로 막을
  // 필요는 없다는 판단), 여기서는 그 판단이 다르다. 기록에 실패했는데 그대로
  // 내보내면 1만 명분 이메일이 흔적 없이 나간다 — fail-closed로 막는다.
  const audited = await logAudit(supabase, "signatures", 0, "bulk_update", {
    entityKey: "csv_export",
    payload: { exportedCount: rows.length, exportedBy: user.email },
  });

  if (!audited) {
    return NextResponse.json(
      { error: "감사 기록에 실패해 내보내기를 중단했습니다." },
      { status: 500 },
    );
  }

  // 모든 필드가 toCsvRow(csvSafeCell)를 거친다 — 이름뿐 아니라 소속·메시지 등
  // 서명자가 자유 입력한 모든 칸이 수식 인젝션 경로가 될 수 있다. csvSafeCell은
  // null/undefined도 안전하게 빈 문자열로 다루므로(created_at은 스키마상
  // nullable) 여기서 따로 `?? ""`로 막지 않아도 던지지 않는다.
  const csvRows = rows.map((row) =>
    toCsvRow([
      String(row.id),
      row.name,
      row.namePublic ? "공개" : "비공개",
      row.regionTop,
      row.regionSub,
      row.affiliation,
      row.email,
      row.message,
      row.createdAt,
    ]),
  );

  // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM(U+FEFF)을 앞에 붙인다.
  const csv = "\uFEFF" + [toCsvRow(CSV_HEADERS), ...csvRows].join("\r\n");

  // 파일명 날짜는 이 프로젝트의 KST 규칙(src/lib/data/signatures.ts의 kstDateKey)을
  // 그대로 따른다 — new Date().toISOString()은 UTC라 KST 00:00~09:00 사이엔
  // 어제 날짜가 찍힌다.
  const filenameDate = kstDateKey(new Date().toISOString());

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="signatures-${filenameDate}.csv"`,
      // 서명자 전원의 PII가 담긴 응답이다 — 어떤 캐시(브라우저·프록시·CDN)에도
      // 남기지 않는다. force-dynamic은 Next.js 라우트 캐시만 막을 뿐, 응답 자체의
      // 캐시 가능 여부는 별개다.
      "Cache-Control": "no-store, private",
    },
  });
}

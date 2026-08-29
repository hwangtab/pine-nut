import { NextResponse } from "next/server";
import { logAudit } from "@/lib/actions/audit";
import { requireActiveAdmin } from "@/lib/actions/auth";
import { getAllSignaturesForExport } from "@/lib/data/signatures";
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
  const ctx = await requireActiveAdmin();
  if ("error" in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: 403 });
  }

  const { supabase, user } = ctx;

  const { rows, error } = await getAllSignaturesForExport(supabase);

  if (error) {
    console.error("signatures export: query failed", error.message);
    return NextResponse.json({ error: "서명 데이터를 불러오지 못했습니다." }, { status: 500 });
  }

  // 모든 필드가 toCsvRow(csvSafeCell)를 거친다 — 이름뿐 아니라 소속·메시지 등
  // 서명자가 자유 입력한 모든 칸이 수식 인젝션 경로가 될 수 있다.
  const csvRows = rows.map((row) =>
    toCsvRow([
      String(row.id),
      row.name,
      row.namePublic ? "공개" : "비공개",
      row.regionTop,
      row.regionSub,
      row.affiliation ?? "",
      row.email ?? "",
      row.message ?? "",
      row.createdAt,
    ]),
  );

  // 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM(U+FEFF)을 앞에 붙인다.
  const csv = "\uFEFF" + [toCsvRow(CSV_HEADERS), ...csvRows].join("\r\n");

  await logAudit(supabase, "signatures", 0, "bulk_update", {
    entityKey: "csv_export",
    payload: { exportedCount: rows.length, exportedBy: user.email },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="signatures-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

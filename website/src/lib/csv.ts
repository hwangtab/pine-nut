/**
 * 스프레드시트(엑셀·구글시트)가 셀 값을 수식으로 해석하지 않도록 방어한다.
 * =, +, -, @ 로 시작하거나 탭·캐리지리턴으로 시작하는 값은 수식 인젝션에 쓰일 수 있다
 * (예: 서명자가 이름 칸에 `=HYPERLINK("http://evil","클릭")`를 넣으면 운영자가 엑셀로
 * 열 때 실행된다). 앞에 작은따옴표를 붙이면 대부분의 스프레드시트가 텍스트로 취급한다.
 */
const DANGEROUS_PREFIX = /^[=+\-@\t\r]/;

// 스키마상 nullable인 컬럼(예: signatures.created_at — DEFAULT NOW()지만 NOT NULL은
// 아니다)이 TS 타입 선언과 어긋나 null/undefined로 들어올 수 있다. 호출부가 매번
// `?? ""`로 막을 것이라 기대하지 않는다 — 함수 자신이 어떤 입력에도 던지지 않게 한다.
export function csvSafeCell(value: string | null | undefined): string {
  const stringValue = String(value ?? "");
  const guarded = DANGEROUS_PREFIX.test(stringValue) ? `'${stringValue}` : stringValue;
  const escaped = guarded.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function toCsvRow(cells: (string | null | undefined)[]): string {
  return cells.map(csvSafeCell).join(",");
}

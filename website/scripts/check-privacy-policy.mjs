import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

/**
 * `source[fromIndex]` 이후 첫 `{`부터 짝이 맞는 `}`까지의 블록을 돌려준다.
 */
function extractBlockAfter(source, fromIndex) {
  const open = source.indexOf("{", fromIndex);
  if (open === -1) return null;
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return null;
}

const privacyPagePath = "src/app/privacy/page.tsx";
const privacySectionsPath = "src/app/privacy/PrivacySectionsClient.tsx";
const formCopyPath = "src/components/petition/copy/form.ts";
const validationPath = "src/lib/signatures/api/validation.ts";
const wallPath = "src/lib/signatures/api/wall.ts";
const storePath = "src/lib/signatures/api/store.ts";
const requestPath = "src/lib/signatures/api/request.ts";
const wallComponentPath = "src/components/petition/SignatureWall.tsx";
const migrationPath = "supabase/migrations/20260828000000_solidarity_signatures.sql";

const privacySource = read(privacyPagePath);
const sectionsSource = read(privacySectionsPath);
const formCopySource = read(formCopyPath);
const validationSource = read(validationPath);
const wallSource = read(wallPath);
const storeSource = read(storePath);
const requestSource = read(requestPath);
const wallComponentSource = read(wallComponentPath);
const migrationSource = read(migrationPath);

function extractDefaultValue(source, contentKey) {
  const keyIndex = source.indexOf(`contentKey="${contentKey}"`);
  assert(keyIndex !== -1, `${privacyPagePath} must declare an EditableText/EditableRichText with contentKey="${contentKey}".`);
  const match = source.slice(keyIndex).match(/defaultValue="((?:[^"\\]|\\.)*)"/);
  assert(match, `contentKey="${contentKey}" must carry a defaultValue="…" string.`);
  return match[1];
}

// ---------------------------------------------------------------------------
// 1. 최종 수정일 — 이번 개편일로 갱신됐는가.
// ---------------------------------------------------------------------------
const subtitle = extractDefaultValue(privacySource, "privacy.header.subtitle");
assert(
  subtitle.includes("2026년 8월"),
  `privacy.header.subtitle must reflect the 2026-08 solidarity-petition revision date, found: "${subtitle}".`,
);
assert(
  !subtitle.includes("2026년 3월"),
  "privacy.header.subtitle must no longer show the stale 2026년 3월 10일 date.",
);

// ---------------------------------------------------------------------------
// 2. 수집 항목 — 연대서명 폼 7필드가 전부 반영됐는가 (validation.ts 대조).
// ---------------------------------------------------------------------------
const signupContent = extractDefaultValue(privacySource, "privacy.section1.signupContent");
for (const term of ["이름", "거주 지역", "소속", "이메일", "제안 한마디", "공개"]) {
  assert(
    signupContent.includes(term),
    `privacy.section1.signupContent must mention "${term}" — it is a field the /petition form collects (see ${validationPath}).`,
  );
}
assert(
  !signupContent.includes("응원 메시지"),
  "privacy.section1.signupContent must not keep the pre-solidarity-petition copy (\"응원 메시지\") — the form has 7 fields now, not 3.",
);
// 이메일은 검증기에서 선택 필드다 — validation.ts는 emailText가 있을 때만 형식을 검사하고
// 없다고 거부하지 않는다. 방침 문구도 이메일을 "(선택)"으로 표시해야 한다.
assert(
  /if\s*\(emailText\s*&&\s*!EMAIL_PATTERN\.test\(emailText\)\)/.test(validationSource),
  `${validationPath} must only validate email format when provided (email stays optional) — this check's premise depends on it.`,
);
assert(
  /이메일[^가-힣]{0,4}\(선택\)|이메일 주소\(선택\)/.test(signupContent),
  'privacy.section1.signupContent must mark 이메일 as "(선택)" — email is optional per validation.ts.',
);
// 만 14세 확인 사실.
assert(
  signupContent.includes("만 14세"),
  "privacy.section1.signupContent must state the 만 14세 이상 확인 requirement.",
);
assert(
  /만 14세 이상/.test(formCopySource),
  `${formCopyPath} must still require 만 14세 이상 — this check's premise depends on it.`,
);

// ---------------------------------------------------------------------------
// 3. 서명자 명단 공개 — wall.ts의 실제 필터·노출 필드와 일치하는가.
// ---------------------------------------------------------------------------
const wallContent = extractDefaultValue(privacySource, "privacy.section1.wallContent");
assert(
  wallContent.includes("/petition"),
  "privacy.section1.wallContent must name the /petition page where the wall is shown.",
);
assert(
  /\.eq\("name_public",\s*true\)/.test(wallSource),
  `${wallPath} must filter the wall query on .eq("name_public", true) — this check's claim that only public-opt-in signatures appear depends on it.`,
);
assert(
  wallContent.includes("공개에 동의") || wallContent.includes("이름 공개에 동의"),
  "privacy.section1.wallContent must state that only name-public-consenting signers appear on the wall.",
);
assert(
  wallContent.includes("총 서명 수"),
  "privacy.section1.wallContent must state that non-public signatures still count toward the total signature count.",
);
// fetchSignatureSummary는 name_public으로 필터링하지 않는다 — 비공개 서명도 총계에 포함된다는
// 방침 문구의 전제.
const summaryFnStart = storeSource.indexOf("export async function fetchSignatureSummary");
assert(summaryFnStart !== -1, `${storePath} must define fetchSignatureSummary.`);
const summaryBody = extractBlockAfter(storeSource, summaryFnStart);
assert(summaryBody, `${storePath}'s fetchSignatureSummary must have a body.`);
assert(
  !summaryBody.includes("name_public"),
  `${storePath}'s fetchSignatureSummary must not filter on name_public — this check's claim that non-public signatures still count depends on it.`,
);
// 명단 벽은 시·도와 시·군·구를 모두 노출한다(SignatureWall.tsx: {entry.regionTop} {entry.regionSub}).
// 방침이 "시·도"만 공개된다고 축소해 쓰면 실제 노출 범위와 어긋난다.
assert(
  /\{entry\.regionTop\}\s*\{entry\.regionSub\}/.test(wallComponentSource),
  `${wallComponentPath} must render both regionTop and regionSub on the wall — this check's claim that both are disclosed depends on it.`,
);
assert(
  wallContent.includes("시·도") && wallContent.includes("시·군·구"),
  'privacy.section1.wallContent must disclose both 시·도 and 시·군·구 are shown on the wall — not just 시·도 (SignatureWall.tsx renders regionTop AND regionSub).',
);
// 비공개 시 노출되지 않는 항목(이메일·소속·제안·접속 정보)이 실제로 wall.ts 응답에
// 없는지 — WallEntry는 name/regionTop/regionSub/createdAt 네 필드만 갖는다.
assert(
  /export interface WallEntry \{\s*name: string;\s*regionTop: string;\s*regionSub: string;\s*createdAt: string;\s*\}/.test(
    wallSource,
  ),
  `${wallPath}'s WallEntry must stay limited to {name, regionTop, regionSub, createdAt} — this check's claim that email/affiliation/message/ip are never exposed on the wall depends on it.`,
);

// ---------------------------------------------------------------------------
// 4. 기존 65건 경과 — 명단에 없는 이유를 설명하는가.
// ---------------------------------------------------------------------------
assert(
  wallContent.includes("2026년 8월 28일"),
  "privacy.section1.wallContent must explain the 2026-08-28 cutover so pre-existing signers understand why they are absent from the wall.",
);
assert(
  /region_top = '미상'/.test(migrationSource) || /'미상'/.test(migrationSource),
  `${migrationPath} must still use the '미상' sentinel for legacy signatures — this check's premise for the transition note depends on it.`,
);

// ---------------------------------------------------------------------------
// 5. IP 해시 — 원본 IP를 저장하지 않는다는 서술이 실제 구현과 맞는가.
// ---------------------------------------------------------------------------
const antiAbuseContent = extractDefaultValue(privacySource, "privacy.section1.antiAbuseContent");
assert(
  antiAbuseContent.includes("해시") || antiAbuseContent.includes("hash"),
  "privacy.section1.antiAbuseContent must disclose that the collected IP is hashed.",
);
assert(
  antiAbuseContent.includes("원본 IP") && antiAbuseContent.includes("저장하지 않"),
  "privacy.section1.antiAbuseContent must state the raw IP address is not stored.",
);
assert(
  /export function hashIp\(ip: string\): string \{\s*return createHash\("sha256"\)/.test(requestSource),
  `${requestPath}'s hashIp must hash with sha256 — this check's claim of hashing (not storing raw IP) depends on it.`,
);
const insertCallStart = storeSource.indexOf(".from(\"signatures\").insert({");
assert(insertCallStart !== -1, `${storePath} must insert into signatures with an object literal.`);
const insertBlock = extractBlockAfter(storeSource, insertCallStart);
assert(insertBlock, `${storePath}'s signatures insert must have a body.`);
assert(
  /ip_hash:\s*ipHash/.test(insertBlock),
  `${storePath} must store ip_hash (not a raw ip column) — this check's claim that the original IP is never stored depends on it.`,
);
assert(
  !/\bip:\s*ip\b/.test(insertBlock),
  `${storePath} must not insert a raw "ip" field alongside ip_hash.`,
);

// ---------------------------------------------------------------------------
// 6. 이용 목적 — 연대서명 집계·성명서 발표·공론화 활동 + 이메일 별도 목적.
// ---------------------------------------------------------------------------
const purposeItemsStart = sectionsSource.indexOf("const privacyPurposeItems = [");
assert(purposeItemsStart !== -1, `${privacySectionsPath} must declare privacyPurposeItems.`);
const purposeItemsBlock = sectionsSource.slice(
  purposeItemsStart,
  sectionsSource.indexOf("];", purposeItemsStart),
);
const purposeTexts = [...purposeItemsBlock.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
assert(
  purposeTexts.some((t) => t.includes("연대서명") && (t.includes("집계") || t.includes("접수"))),
  "privacy.section2 purpose list must include 연대서명 집계/접수.",
);
assert(
  purposeTexts.some((t) => t.includes("성명서")),
  "privacy.section2 purpose list must include 성명서 발표.",
);
assert(
  purposeTexts.some((t) => t.includes("공론화")),
  "privacy.section2 purpose list must include 관련 공론화 활동.",
);
assert(
  purposeTexts.some((t) => t.includes("이메일") && t.includes("안내")),
  "privacy.section2 purpose list must state the email-specific purpose (활동 진행 상황 안내).",
);
// 이 목적 문구가 실제 폼의 이메일 안내 문구와 어긋나지 않는지.
assert(
  /활동 진행 상황.*안내/.test(formCopySource),
  `${formCopyPath}'s emailNote must still promise "활동 진행 상황 안내" — this check's cross-reference depends on it.`,
);

// ---------------------------------------------------------------------------
// 7. 보유 기간 — "목적을 달성할 때까지" (연대서명 및 관련 공론화 활동).
// ---------------------------------------------------------------------------
const section3Content = extractDefaultValue(privacySource, "privacy.section3.content");
assert(
  section3Content.includes("목적을 달성할 때까지"),
  'privacy.section3.content must state retention until "목적을 달성할 때까지" (matches copy/form.ts privacyLine3).',
);
assert(
  !section3Content.includes("캠페인 종료 시까지"),
  "privacy.section3.content must not keep the stale 캠페인 종료 시까지 wording.",
);
assert(
  /이용 범위:[\s\S]*?목적을 달성할 때까지/.test(formCopySource),
  `${formCopyPath}'s privacyLine3 must still promise retention until 목적을 달성할 때까지 — this check's cross-reference depends on it.`,
);

console.log("Privacy policy checks passed.");

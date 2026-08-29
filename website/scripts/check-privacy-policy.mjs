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
const enPrivacyPagePath = "src/app/en/privacy/page.tsx";
const enPrivacySectionsPath = "src/app/en/privacy/EnglishPrivacySectionsClient.tsx";

const privacySource = read(privacyPagePath);
const sectionsSource = read(privacySectionsPath);
const enPrivacySource = read(enPrivacyPagePath);
const enSectionsSource = read(enPrivacySectionsPath);
const formCopySource = read(formCopyPath);
const validationSource = read(validationPath);
const wallSource = read(wallPath);
const storeSource = read(storePath);
const requestSource = read(requestPath);
const wallComponentSource = read(wallComponentPath);
const migrationSource = read(migrationPath);

function extractDefaultValue(source, contentKey, fileLabel = privacyPagePath) {
  const keyIndex = source.indexOf(`contentKey="${contentKey}"`);
  assert(keyIndex !== -1, `${fileLabel} must declare an EditableText/EditableRichText with contentKey="${contentKey}".`);
  const match = source.slice(keyIndex).match(/defaultValue="((?:[^"\\]|\\.)*)"/);
  assert(match, `${fileLabel}'s contentKey="${contentKey}" must carry a defaultValue="…" string.`);
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
// 명단 벽은 이름·지역만이 아니라 **서명한 날짜**도 공개한다(SignatureWall.tsx의
// <time dateTime={entry.createdAt}>). 세 고지(폼 namePublicNote·국문 방침·영문
// 방침)가 모두 "이름과 지역"만 열거하면, 열거형 고지가 사실과 어긋나 고지 전체의
// 신뢰가 깨진다. 벽이 날짜를 렌더한다는 전제와 세 고지의 날짜 언급을 함께 못박아
// 어느 한쪽만 바뀌는 드리프트를 막는다.
assert(
  /<time dateTime=\{entry\.createdAt\}>/.test(wallComponentSource),
  `${wallComponentPath} must render <time dateTime={entry.createdAt}> — the three notices' claim that the signing date is published depends on it (see check-signature-wall.mjs, which also requires this element).`,
);
assert(
  wallContent.includes("서명한 날짜"),
  "privacy.section1.wallContent must disclose that the signing date is published on the wall — SignatureWall.tsx renders <time dateTime={entry.createdAt}>, so an enumerated notice that lists only name and region is factually wrong.",
);
const namePublicNoteDefault = formCopySource.match(
  /namePublicNote:\s*\{[\s\S]*?defaultValue:\s*\n?\s*((?:"[\s\S]*?"|`[\s\S]*?`))/,
);
assert(
  namePublicNoteDefault !== null,
  `${formCopyPath} must declare labels.namePublicNote with a defaultValue string.`,
);
assert(
  /서명한 날짜/.test(namePublicNoteDefault[1]),
  `${formCopyPath}'s namePublicNote must disclose the signing date alongside name and region — that notice sits at the moment consent is given, so it must not be narrower than the wall's actual disclosure.`,
);

// ---------------------------------------------------------------------------
// 3b. 폼 안 "수집 항목" 고지 ↔ /privacy §1 상호 대조.
//
//     동의를 받는 시점에 사람이 실제로 읽는 문장은 체크박스 옆 패널
//     (copy/form.ts의 privacyLines[0])이지 별도 페이지의 방침이 아니다. 그
//     패널이 방침보다 좁으면 — 예컨대 제안 한마디·이름 공개 동의 여부·IP
//     해시를 빼먹으면 — 실질적으로 작동하는 고지가 사실보다 좁아진다.
//     양쪽이 같은 항목을 열거하는지 상호 대조해 다음 드리프트를 막는다.
// ---------------------------------------------------------------------------
const privacyLinesMatch = formCopySource.match(/privacyLines:\s*\[([\s\S]*?)\n\s*\],/);
assert(privacyLinesMatch, `${formCopyPath} must declare a privacyLines array.`);
const privacyLineDefaults = [
  ...privacyLinesMatch[1].matchAll(/defaultValue:\s*\n?\s*"((?:[^"\\]|\\.)*)"/g),
].map((m) => m[1]);
assert(
  privacyLineDefaults.length >= 1,
  `${formCopyPath}'s privacyLines must carry defaultValue strings.`,
);
const formCollectionNotice = privacyLineDefaults[0];
assert(
  formCollectionNotice.startsWith("수집 항목:"),
  `${formCopyPath}'s privacyLines[0] must be the "수집 항목:" line, found: "${formCollectionNotice}".`,
);

// 각 항목은 (a) 폼 고지와 (b) /privacy §1(수집 항목 블록 + 부정 참여 방지 블록)
// 양쪽에 모두 있어야 한다. 어느 한쪽에서 사라지면 여기서 잡힌다.
// §1은 "국민 연대서명 참여 시" 블록과 "부정 참여 방지를 위한 자동 수집 정보"
// 블록으로 나뉜다 — IP 해시는 후자에만 있으므로 둘을 합쳐 대조한다.
// (antiAbuseContent는 아래 5절에서 다시 뽑아 그쪽 단언에 쓴다 — 여기서 미리
// 참조하면 TDZ에 걸리므로 지역 변수로 따로 읽는다.)
const section1AntiAbuse = extractDefaultValue(privacySource, "privacy.section1.antiAbuseContent");
const privacySection1Text = `${signupContent}\n${section1AntiAbuse}`;
for (const [term, why] of [
  ["이름 또는 닉네임", "the name field"],
  ["거주 지역", "the region fields"],
  ["소속", "the optional affiliation field"],
  ["이메일", "the optional email field"],
  ["제안 한마디", "the optional message field — it is stored, so the consent-point notice must say so"],
  ["이름 공개 동의 여부", "the name-publication consent flag stored on every row"],
  ["IP", "the hashed access IP stored for duplicate/rate-limit protection"],
]) {
  assert(
    formCollectionNotice.includes(term),
    `${formCopyPath}'s privacyLines[0] must list "${term}" (${why}) — /privacy §1 already discloses it, and the panel people actually read at the moment of consent must not be narrower than the policy page.`,
  );
  assert(
    privacySection1Text.includes(term),
    `privacy §1 (signupContent + antiAbuseContent) must list "${term}" (${why}) — copy/form.ts's privacyLines[0] discloses it, so the policy page must not fall behind.`,
  );
}
// 선택 항목 표기도 양쪽이 같아야 한다 — 필수/선택이 뒤바뀌면 동의의 의미가 달라진다.
for (const optional of ["이메일", "소속", "제안 한마디"]) {
  assert(
    new RegExp(`${optional}[^,]{0,20}\\(선택\\)`).test(formCollectionNotice),
    `${formCopyPath}'s privacyLines[0] must mark "${optional}" as (선택), matching /privacy §1.`,
  );
}

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
// 중복·남용 방지는 두 기제(이메일 중복 확인 + IP 해시 기반 레이트리밋)가 함께
// 작동한다 — 문구가 이메일만 언급하고 IP 쪽 레이트리밋을 뺀 채 다시 쓰이면
// "부정 참여 방지"의 절반이 사라진 셈이라 여기서 둘 다 assert한다.
assert(
  antiAbuseContent.includes("이메일") && antiAbuseContent.includes("중복"),
  "privacy.section1.antiAbuseContent must keep disclosing email-based duplicate detection.",
);
assert(
  antiAbuseContent.includes("반복 제출") || antiAbuseContent.includes("레이트리밋"),
  "privacy.section1.antiAbuseContent must keep disclosing the IP-hash based repeat-submission limit, not just email dedup.",
);
assert(
  antiAbuseContent.includes("60초"),
  `privacy.section1.antiAbuseContent must state the actual rate-limit window (60초) — see ${storePath}'s RATE_LIMIT_WINDOW_MS.`,
);
assert(
  /export const RATE_LIMIT_WINDOW_MS = 60 \* 1000;/.test(read("src/lib/signatures/api/config.ts")),
  "src/lib/signatures/api/config.ts's RATE_LIMIT_WINDOW_MS must still be 60 seconds — this check's claim of a 60-second window depends on it.",
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

// ---------------------------------------------------------------------------
// 8. /en/privacy — 국문과 같은 사실을 말하는가.
//
//    자연어 문서 두 벌을 문자열 동치로 비교할 수는 없다. 대신 핵심 사실이
//    영문 쪽에도 "존재하는지"만 앵커한다: 갱신일, 명단 공개 조건, 비공개 시
//    총계 반영, 2026-08-28 경과, 보유기간 표현, IP 해시 고지. 국문판이 이미
//    구현과 대조 검증됐으므로, 영문판이 같은 사실을 언급하는지만 확인하면
//    "다른 언어가 다른 말을 하는" 상황을 막을 수 있다.
// ---------------------------------------------------------------------------
const enSubtitle = extractDefaultValue(enPrivacySource, "en.privacy.header.subtitle", enPrivacyPagePath);
assert(
  enSubtitle.includes("August") && enSubtitle.includes("2026"),
  `en.privacy.header.subtitle must reflect the 2026-08 revision date, found: "${enSubtitle}".`,
);
assert(
  !enSubtitle.includes("March"),
  "en.privacy.header.subtitle must no longer show the stale March 10, 2026 date.",
);

const enSignupContent = extractDefaultValue(
  enPrivacySource,
  "en.privacy.section1.signupContent",
  enPrivacyPagePath,
);
for (const term of ["region", "email", "14 years old"]) {
  assert(
    enSignupContent.toLowerCase().includes(term.toLowerCase()),
    `en.privacy.section1.signupContent must mention "${term}" — the Korean signupContent covers the same fact.`,
  );
}
assert(
  !enSignupContent.includes("message of support"),
  "en.privacy.section1.signupContent must not keep the pre-solidarity-petition 3-field copy (\"message of support\").",
);

const enWallContent = extractDefaultValue(enPrivacySource, "en.privacy.section1.wallContent", enPrivacyPagePath);
assert(
  enWallContent.includes("/petition"),
  "en.privacy.section1.wallContent must name the /petition page, matching the Korean wallContent.",
);
assert(
  /publish/i.test(enWallContent),
  "en.privacy.section1.wallContent must disclose that consenting signers' names/regions are published on the wall.",
);
assert(
  /total signature count/i.test(enWallContent),
  "en.privacy.section1.wallContent must state non-public signatures still count toward the total, matching the Korean 총 서명 수 claim.",
);
assert(
  enWallContent.includes("August 28, 2026"),
  "en.privacy.section1.wallContent must disclose the 2026-08-28 cutover, matching the Korean wallContent's 이전 65건 note.",
);
// 국문·영문이 같은 컷오버 날짜를 말하는지 상호 anchoring — 한쪽만 날짜가
// 바뀌면(예: 국문만 갱신) 여기서 잡힌다.
assert(
  wallContent.includes("2026년 8월 28일") === enWallContent.includes("August 28, 2026"),
  "privacy.section1.wallContent (KO) and en.privacy.section1.wallContent (EN) must agree on whether the 2026-08-28 cutover is disclosed.",
);
// 국문 wallContent와 같은 이유로, 영문판도 "서명한 날짜"가 공개된다는 사실을
// 담아야 한다 — 한 언어만 고치면 다른 언어가 계속 좁은 고지를 하게 된다.
assert(
  /date you signed|signing date|date of (?:your )?signature/i.test(enWallContent),
  "en.privacy.section1.wallContent must disclose that the signing date is published, matching the Korean wallContent's 서명한 날짜 (SignatureWall.tsx renders <time dateTime={entry.createdAt}>).",
);

const enAntiAbuseContent = extractDefaultValue(
  enPrivacySource,
  "en.privacy.section1.antiAbuseContent",
  enPrivacyPagePath,
);
assert(
  /hash/i.test(enAntiAbuseContent),
  "en.privacy.section1.antiAbuseContent must disclose IP hashing, matching the Korean antiAbuseContent.",
);
assert(
  /original ip .*never stored|never store.*original ip/i.test(enAntiAbuseContent),
  "en.privacy.section1.antiAbuseContent must state the original IP is never stored.",
);

const enSection3Content = extractDefaultValue(enPrivacySource, "en.privacy.section3.content", enPrivacyPagePath);
assert(
  /purposes .*(have been )?achieved|until.*achieved/i.test(enSection3Content),
  'en.privacy.section3.content must state retention until the purpose is achieved ("목적을 달성할 때까지"), not a fixed campaign-end date.',
);
assert(
  !/campaign ends/i.test(enSection3Content),
  "en.privacy.section3.content must not keep the stale \"until the campaign ends\" wording.",
);

// 영문 목적 목록도 같은 4가지 사실(연대서명 집계·성명서 발표·이메일 안내·GA)을
// 담아야 한다 — 국문 section2와 항목 수·핵심어를 맞춘다.
const enPurposeItemsStart = enSectionsSource.indexOf("const privacyPurposeItems = [");
assert(enPurposeItemsStart !== -1, `${enPrivacySectionsPath} must declare privacyPurposeItems.`);
const enPurposeItemsBlock = enSectionsSource.slice(
  enPurposeItemsStart,
  enSectionsSource.indexOf("];", enPurposeItemsStart),
);
const enPurposeTexts = [...enPurposeItemsBlock.matchAll(/text:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
assert(
  enPurposeTexts.length === purposeTexts.length,
  `en.privacy.section2 purpose list must declare the same number of items as the Korean list (${purposeTexts.length}), found ${enPurposeTexts.length}.`,
);
assert(
  enPurposeTexts.some((t) => /solidarity petition/i.test(t)),
  "en.privacy.section2 purpose list must include the solidarity-petition tally purpose.",
);
assert(
  enPurposeTexts.some((t) => /statement/i.test(t) && /advocacy/i.test(t)),
  "en.privacy.section2 purpose list must include the public-statement / advocacy purpose.",
);
assert(
  enPurposeTexts.some((t) => /email/i.test(t) && /progress/i.test(t)),
  "en.privacy.section2 purpose list must include the email-specific update purpose.",
);

console.log("Privacy policy checks passed.");

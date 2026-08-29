import { existsSync, readFileSync } from "node:fs";
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
 * 고정 길이 윈도로 자르면(예: 앞뒤 500자) 함수가 조금만 길어져도 단언이
 * 조용히 무의미해지므로, 실제 중괄호 짝을 맞춘다.
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

const faqDataPath = "src/lib/petition-faq.ts";
const faqComponentPath = "src/components/petition/PetitionFAQ.tsx";
const layoutPath = "src/app/petition/layout.tsx";
const pagePath = "src/app/petition/page.tsx";
const shareCopyPath = "src/components/petition/copy/share.ts";

for (const p of [faqDataPath, faqComponentPath, layoutPath, pagePath, shareCopyPath]) {
  assert(existsSync(join(root, p)), `${p} must exist.`);
}

const faqSource = read(faqDataPath);
const componentSource = read(faqComponentPath);
const layoutSource = read(layoutPath);
const pageSource = read(pagePath);
const shareCopySource = read(shareCopyPath);

// ---------------------------------------------------------------------------
// 1. FAQ 데이터 모듈 — 5문항 {q, a}
// ---------------------------------------------------------------------------
assert(
  /export interface PetitionFaqItem\s*\{[\s\S]*?q:\s*string;[\s\S]*?a:\s*string;[\s\S]*?\}/.test(faqSource),
  "petition-faq.ts must export `interface PetitionFaqItem { q: string; a: string }`.",
);
assert(
  /export const PETITION_FAQ:\s*PetitionFaqItem\[\]\s*=\s*\[/.test(faqSource),
  "petition-faq.ts must export `PETITION_FAQ: PetitionFaqItem[]` as an array literal.",
);

const questions = [...faqSource.matchAll(/\bq:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
const answers = [...faqSource.matchAll(/\ba:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
assert(questions.length === 5, `PETITION_FAQ must declare exactly 5 questions, found ${questions.length}.`);
assert(answers.length === 5, `PETITION_FAQ must declare exactly 5 answers, found ${answers.length}.`);
assert(
  new Set(questions).size === questions.length,
  "PETITION_FAQ must not repeat a question (item.q is the React key in PetitionFAQ.tsx — duplicates collide).",
);

// ---------------------------------------------------------------------------
// 2. 단일 출처 계약 — 화면 답변과 FAQPage JSON-LD가 같은 상수를 본다.
//
//    이 가드의 핵심. FAQPage 구조화 데이터가 "화면에 없는 답변"을 주장하면
//    Google invisible-content 위반이다. 문자열이 있는지가 아니라, 두 소비자가
//    같은 상수를 import 해 map 하는지 + 어느 쪽도 답변 문구를 자기 파일에
//    복사해두지 않았는지를 검사한다.
// ---------------------------------------------------------------------------
for (const [label, source] of [
  ["PetitionFAQ.tsx", componentSource],
  ["petition/layout.tsx", layoutSource],
]) {
  assert(
    /import\s*\{[^}]*\bPETITION_FAQ\b[^}]*\}\s*from\s*["']@\/lib\/petition-faq["']/.test(source),
    `${label} must import PETITION_FAQ from "@/lib/petition-faq" — screen copy and JSON-LD must share one source.`,
  );
  assert(
    /\bPETITION_FAQ\b[^;]{0,40}?\.map\(/.test(source),
    `${label} must render/derive its entries via PETITION_FAQ.map(), not hand-duplicated literals.`,
  );
}

for (const text of [...questions, ...answers]) {
  for (const [label, source] of [
    ["PetitionFAQ.tsx", componentSource],
    ["petition/layout.tsx", layoutSource],
  ]) {
    assert(
      !source.includes(text),
      `${label} must not inline FAQ copy ("${text.slice(0, 24)}…") — it must come from PETITION_FAQ, or screen text and JSON-LD can drift apart.`,
    );
  }
}

// JSON-LD가 실제로 item.q/item.a에서 나오는지 (필드 이름만 맞고 값이 다른
// 상수에서 오는 상황을 배제).
assert(/"@type":\s*"FAQPage"/.test(layoutSource), "petition/layout.tsx must emit an @type FAQPage JSON-LD block.");
assert(
  /mainEntity:\s*PETITION_FAQ\.map\(/.test(layoutSource),
  "petition/layout.tsx's FAQPage mainEntity must be PETITION_FAQ.map(...).",
);
assert(
  /name:\s*item\.q/.test(layoutSource),
  "FAQPage Question.name must be `item.q` (the same question shown on screen).",
);
assert(
  /acceptedAnswer:\s*\{[^}]*text:\s*item\.a/.test(layoutSource),
  "FAQPage acceptedAnswer.text must be `item.a` (the same answer shown on screen).",
);
assert(
  /type="application\/ld\+json"/.test(layoutSource) &&
    /dangerouslySetInnerHTML=\{\{\s*__html:\s*JSON\.stringify\(faqJsonLd\)/.test(layoutSource),
  "petition/layout.tsx must render the FAQ JSON-LD in an application/ld+json script tag.",
);

// ---------------------------------------------------------------------------
// 3. 아코디언은 답변을 DOM에서 제거하지 않는다.
//
//    JSON-LD가 주장하는 답변이 DOM에 아예 없으면 위 2번의 단일 출처 계약이
//    무의미해진다. 조건부 렌더(`isOpen && ...`, `isOpen ? ... : null`)를 금지하고
//    aria-hidden + grid-template-rows 접기를 강제한다.
// ---------------------------------------------------------------------------
// JSX 자식 자리의 `{isOpen && …}` / `{isOpen ? … : …}` = 조건부 렌더.
// (`${isOpen ? …}` 같은 className 템플릿과 `style={{ … isOpen ? … }}` 은
//  DOM에서 노드를 없애지 않으므로 제외한다.)
assert(
  !/(?<!\$)\{\s*isOpen\s*(?:&&|\?)/.test(componentSource),
  "PetitionFAQ.tsx must not conditionally render with `{isOpen && …}` / `{isOpen ? … : …}` — the answer must stay in the DOM (the FAQPage schema in layout.tsx must not claim invisible content).",
);
// 답변·질문이 실제로 렌더되는지부터 확인한다. 이 두 단언이 없으면 답변 <p>를
// 통째로 지운 파일이 아래의 "분기 없음" 검사를 통과해버린다 —
// indexOf가 -1을 내고 slice(start, -1)이 파일 끝까지가 되면서 그 구간에
// 우연히 &&도 `? (`도 없기 때문이다. 그 상태야말로 이 가드가 막아야 할
// 최악(JSON-LD는 답변 5개를 주장하는데 화면엔 한 글자도 없음)이다.
const ANSWER_EXPR = "{item.a}";
const QUESTION_EXPR = "{item.q}";
assert(
  componentSource.includes(ANSWER_EXPR),
  "PetitionFAQ.tsx must render {item.a} — the FAQPage JSON-LD in layout.tsx claims these answers are on the page.",
);
// `{item.q}`가 파일 어딘가에 있는 것만으로는 부족하다 — React key(`key={item.q}`)로만
// 쓰이고 화면 문구는 딴 걸 보여줘도 통과해버린다. 실제로 토글 버튼의 자식으로
// 렌더되는지를 본다.
const buttonInnerStart = componentSource.indexOf("id={buttonId}");
assert(buttonInnerStart !== -1, "PetitionFAQ.tsx's toggle button must carry id={buttonId}.");
const buttonInnerEnd = componentSource.indexOf("</button>", buttonInnerStart);
assert(buttonInnerEnd !== -1, "PetitionFAQ.tsx must close its toggle button.");
assert(
  componentSource.slice(buttonInnerStart, buttonInnerEnd).includes(QUESTION_EXPR),
  "PetitionFAQ.tsx must render {item.q} as the toggle button's visible label — a React key alone does not put the question on the page the FAQPage JSON-LD claims it is on.",
);

// 패널 컨테이너부터 답변 텍스트까지 사이에 조건 분기가 끼어들 수 없다.
// 두 인덱스 모두 -1이 아님을 확인한 뒤에만 slice 한다(위 존재 단언 + 아래 방어).
const panelStart = componentSource.indexOf("id={panelId}");
const answerStart = componentSource.indexOf(ANSWER_EXPR);
assert(
  panelStart !== -1,
  "PetitionFAQ.tsx must give the collapsible answer panel id={panelId}.",
);
assert(
  answerStart > panelStart,
  "PetitionFAQ.tsx must render {item.a} inside the panel container (after id={panelId}), not before or outside it.",
);
const panelToAnswer = componentSource.slice(panelStart, answerStart);
assert(
  !panelToAnswer.includes("&&") && !/\?\s*\(/.test(panelToAnswer),
  "PetitionFAQ.tsx must render {item.a} unconditionally inside the panel — no branch may sit between the panel container and the answer text.",
);
assert(
  /aria-hidden=\{!isOpen\}/.test(componentSource),
  "PetitionFAQ.tsx must toggle the answer panel with aria-hidden={!isOpen} (not by unmounting it).",
);
assert(
  /gridTemplateRows:\s*isOpen\s*\?\s*"1fr"\s*:\s*"0fr"/.test(componentSource),
  'PetitionFAQ.tsx must collapse the answer with gridTemplateRows: isOpen ? "1fr" : "0fr".',
);
assert(
  /aria-expanded=\{isOpen\}/.test(componentSource) && /aria-controls=\{panelId\}/.test(componentSource),
  "PetitionFAQ.tsx's toggle button must expose aria-expanded and aria-controls.",
);
// 색 역할 규율: --color-warm은 CTA·서명 버튼 전용(CLAUDE.md + globals.css).
assert(
  !/--color-warm/.test(componentSource),
  "PetitionFAQ.tsx must not use --color-warm — it is reserved for CTA/signature actions.",
);

// ---------------------------------------------------------------------------
// 4. FAQ 답변이 실제 구현과 일치하는지 — 문구가 약속한 동작이 코드에 있는가.
//
//    개인정보 관련 답변은 사실이 아니면 신뢰 문제다. 답변이 주장하는 동작을
//    각각 담당 코드에서 확인한다.
// ---------------------------------------------------------------------------
const wallSource = read("src/lib/signatures/api/wall.ts");
const storeSource = read("src/lib/signatures/api/store.ts");
const formSource = read("src/lib/signatures/form.ts");
const regionsSource = read("src/lib/regions.ts");
const migrationSource = read("supabase/migrations/20260828000000_solidarity_signatures.sql");

// (1) "공개하지 않음을 고르시면 총 서명 수에만 반영되고 명단에는 나오지 않습니다."
assert(
  /\.eq\("name_public",\s*true\)/.test(wallSource),
  'FAQ claims non-public signatures never appear on the wall — wall.ts must filter .eq("name_public", true).',
);
const summaryFn = storeSource.slice(storeSource.indexOf("export async function fetchSignatureSummary"));
const summaryBody = extractBlockAfter(summaryFn, 0);
assert(summaryBody, "store.ts must define fetchSignatureSummary with a body.");
assert(
  !summaryBody.includes("name_public"),
  "FAQ claims non-public signatures still count toward the total — fetchSignatureSummary must not filter on name_public.",
);

// (2) "이메일을 꼭 적어야 하나요? 아닙니다."
assert(
  /if\s*\(email\s*&&\s*!EMAIL_PATTERN\.test\(email\)\)/.test(formSource),
  "FAQ says email is optional — validateSignatureForm must only validate email when one was entered (no required-email branch).",
);

// (3) "홍천 주민이 아니어도 됩니다. 해외에서도 참여할 수 있습니다."
assert(
  /"해외"/.test(regionsSource) && /'해외'/.test(migrationSource),
  "FAQ says overseas participants are welcome — 해외 must be a valid region in both regions.ts and the DB CHECK constraint.",
);

// (4) "이메일을 적으셨다면 중복은 자동으로 걸러집니다. 그 외에는…"
assert(
  /CREATE UNIQUE INDEX idx_signatures_unique_email[\s\S]*?WHERE\s+email\s+IS\s+NOT\s+NULL/i.test(migrationSource),
  "FAQ says duplicates are caught only when an email was given — the unique email index must be partial (WHERE email IS NOT NULL).",
);

// ---------------------------------------------------------------------------
// 5. 메타데이터 — canonical·hreflang 구조 유지 + 새 청원 문구
// ---------------------------------------------------------------------------
assert(
  /alternates:\s*localeAlternates\("\/petition",\s*"\/en\/petition"\)/.test(layoutSource),
  "petition/layout.tsx must keep alternates: localeAlternates(\"/petition\", \"/en/petition\").",
);
const metadataBlock = extractBlockAfter(layoutSource, layoutSource.indexOf("export const metadata"));
assert(metadataBlock, "petition/layout.tsx must export a metadata object.");
assert(
  /title:\s*"[^"]*연대서명[^"]*"/.test(metadataBlock),
  "petition/layout.tsx metadata.title must describe the new 연대서명 page.",
);
assert(
  /description:\s*\n?\s*["`][^"`]*연대서명/.test(metadataBlock),
  "petition/layout.tsx metadata.description must describe the new 연대서명 page.",
);

// ---------------------------------------------------------------------------
// 6. 페이지 조립 — 스펙 4절의 섹션 순서
// ---------------------------------------------------------------------------
const sectionOrder = [
  "SubHero",
  "PetitionProgress",
  "PetitionStatement",
  "PetitionSignatureForm",
  "SignatureWall",
  "ShareButtons",
  "PetitionFAQ",
];
let previousIndex = -1;
for (const name of sectionOrder) {
  const index = pageSource.search(new RegExp(`<${name}\\b`));
  assert(index !== -1, `/petition/page.tsx must render <${name} />.`);
  assert(
    index > previousIndex,
    `/petition/page.tsx must render sections in spec order: <${name} /> appears before the section that should precede it.`,
  );
  previousIndex = index;
}

for (const banned of [
  "PetitionActionCards",
  "RecentSignatures",
  "705번의 외침",
  "서명이 왜 중요한가요",
  "petition.reasons.",
  "petition.emotional.",
]) {
  assert(
    !pageSource.includes(banned),
    `/petition/page.tsx must no longer reference "${banned}" (removed by the spec's 8-section structure).`,
  );
}

// ---------------------------------------------------------------------------
// 7. `count: 0` 심 제거 — 성공 화면이 실제 카운트를 보여준다.
//
//    서명 직후 "0명"이 한 순간 보이던(그리고 재조회가 실패하면 계속 남던)
//    플레이스홀더. onSubmitted 계약에서 count가 사라졌는지, 성공 화면이
//    실제 요약값을 받는지를 검사한다.
// ---------------------------------------------------------------------------
const formTypesSource = read("src/components/petition/signature-form/types.ts");
const formHookSource = read("src/components/petition/signature-form/usePetitionSignatureForm.ts");

const onSubmittedDecl = formTypesSource.match(/onSubmitted:\s*\(result:\s*\{[^}]*\}\)\s*=>\s*void;/);
assert(onSubmittedDecl, "signature-form/types.ts must declare onSubmitted as `(result: { … }) => void`.");
assert(
  !onSubmittedDecl[0].includes("count"),
  `onSubmitted must not carry a \`count\` any more — the POST response no longer returns one, so it was always the placeholder 0. Found: ${onSubmittedDecl[0]}`,
);
assert(
  /onSubmitted\(\{\s*name\s*\}\)/.test(formHookSource),
  "usePetitionSignatureForm must call onSubmitted({ name }) — no count placeholder.",
);
assert(
  !/count:\s*0/.test(formHookSource),
  "usePetitionSignatureForm must not pass `count: 0` (the shim this task removes).",
);

const successTag = pageSource.match(/<PetitionSuccess\b[\s\S]*?\/?>/);
assert(successTag, "/petition/page.tsx must render <PetitionSuccess …>.");
const signatureCountProp = successTag[0].match(/signatureCount=\{([^}]*)\}/);
assert(signatureCountProp, "PetitionSuccess must receive a signatureCount prop.");
assert(
  /\bsummary\.count\b/.test(signatureCountProp[1]),
  `PetitionSuccess must read the real count from the summary hook (summary.count), not a locally seeded 0. Found: ${signatureCountProp[1]}`,
);
// 요약 조회가 실패해 카운트를 모르는 경우에는 0이 아니라 null을 넘겨야 한다 —
// 그래야 PetitionSuccess가 서수 문장을 감춘다. 0을 넘기면 방금 서명한 시민이
// "0번째로 함께해주셨습니다"를 읽게 된다.
assert(
  /\bnull\b/.test(signatureCountProp[1]),
  `PetitionSuccess's signatureCount must pass null when the count is unknown, never a 0 fallback. Found: ${signatureCountProp[1]}`,
);
const successPropsSource = read("src/components/petition/PetitionSuccess.tsx");
assert(
  /signatureCount:\s*number\s*\|\s*null;/.test(successPropsSource),
  "PetitionSuccess must accept `signatureCount: number | null` so an unknown count can be represented without lying with 0.",
);
assert(
  /\{signatureCount !== null &&/.test(successPropsSource),
  "PetitionSuccess must hide the ordinal count sentence entirely when signatureCount is null.",
);
for (const banned of ["setSignatureCount", "count: 0"]) {
  assert(
    !pageSource.includes(banned),
    `/petition/page.tsx must not keep the "${banned}" shim.`,
  );
}

// ---------------------------------------------------------------------------
// 8. SignatureWall refreshToken 배선 — 제출 성공 시 실제로 증가한다.
// ---------------------------------------------------------------------------
const wallTag = pageSource.match(/<SignatureWall\b[\s\S]*?\/>/);
assert(wallTag, "/petition/page.tsx must render <SignatureWall … />.");
const refreshTokenMatch = wallTag[0].match(/refreshToken=\{(\w+)\}/);
assert(
  refreshTokenMatch,
  "SignatureWall must receive refreshToken={…} so a successful submission reloads the wall from page 1.",
);
const tokenVar = refreshTokenMatch[1];
const tokenStateMatch = pageSource.match(
  new RegExp(`const \\[${tokenVar},\\s*(\\w+)\\]\\s*=\\s*useState\\(`),
);
assert(
  tokenStateMatch,
  `refreshToken={${tokenVar}} must be backed by a useState in /petition/page.tsx.`,
);
const tokenSetter = tokenStateMatch[1];
const handlerIndex = pageSource.indexOf("handleSignatureSubmitted");
assert(handlerIndex !== -1, "/petition/page.tsx must define handleSignatureSubmitted.");
const handlerBody = extractBlockAfter(pageSource, pageSource.indexOf("=>", handlerIndex));
assert(handlerBody, "handleSignatureSubmitted must have a block body.");
assert(
  new RegExp(`${tokenSetter}\\(`).test(handlerBody),
  `handleSignatureSubmitted must bump the wall refresh token (${tokenSetter}) so the list refreshes after a successful signature.`,
);

// ---------------------------------------------------------------------------
// 9. 공유 문구는 카피 모듈을 경유한다 — 페이지에 하드코딩 금지.
// ---------------------------------------------------------------------------
assert(
  /export const koreanPetitionShareDefaults/.test(shareCopySource),
  "copy/share.ts must export koreanPetitionShareDefaults so the page can reuse the same strings as the CMS edit chips.",
);
assert(
  /import\s*\{[^}]*koreanPetitionShareDefaults[^}]*\}\s*from\s*["']@\/components\/petition\/petition-copy["']/.test(
    pageSource,
  ),
  "/petition/page.tsx must take its share-copy fallbacks from petition-copy, not hardcode them.",
);
const shareDefaultsBlock = extractBlockAfter(
  shareCopySource,
  shareCopySource.indexOf("export const koreanPetitionShareDefaults"),
);
assert(shareDefaultsBlock, "koreanPetitionShareDefaults must be an object literal.");
const shareDefaults = [...shareDefaultsBlock.matchAll(/:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]);
assert(
  shareDefaults.length === 3,
  `koreanPetitionShareDefaults must declare exactly 3 strings (title, text, copyFallback), found ${shareDefaults.length}.`,
);
// 편집 칩이 같은 상수를 쓰는지 — 칩과 페이지 폴백이 갈라지면 관리자가 보는
// "현재 기본값"과 실제 공유 문구가 조용히 달라진다.
for (const key of ["title", "text", "copyFallback"]) {
  assert(
    new RegExp(`defaultValue:\\s*koreanPetitionShareDefaults\\.${key}\\b`).test(shareCopySource),
    `copy/share.ts's ${key} edit chip must use koreanPetitionShareDefaults.${key} as its defaultValue.`,
  );
}
for (const text of shareDefaults) {
  assert(
    !pageSource.includes(text),
    `/petition/page.tsx must not inline the share copy "${text.slice(0, 24)}…" — read it from koreanPetitionShareDefaults.`,
  );
}
for (const key of ["title", "text", "copyFallback"]) {
  assert(
    new RegExp(`\\?\\?\\s*koreanPetitionShareDefaults\\.${key}\\b`).test(pageSource),
    `/petition/page.tsx must fall back to koreanPetitionShareDefaults.${key}.`,
  );
}
assert(
  !pageSource.includes("풍천리를 지켜주세요"),
  '/petition/page.tsx must not keep the old share copy "풍천리를 지켜주세요" — this page is now the 연대서명 campaign.',
);

// ---------------------------------------------------------------------------
// 10. 요약 조회 실패를 "0"으로 위장하지 않는다.
//
//     훅의 catch가 콘솔 로그만 남기고 finally가 loading을 내려버리면, 실패와
//     "정말 0명"이 화면에서 구별되지 않는다. 최악은 성공 화면이다 — 방금
//     서명한 시민에게 "0번째로 함께해주셨습니다"가 나간다.
// ---------------------------------------------------------------------------
const summaryHookPath = "src/components/petition/usePetitionSignatureSummary.ts";
const summaryHookSource = read(summaryHookPath);

assert(
  /const \[summaryError, setSummaryError\] = useState\(false\)/.test(summaryHookSource),
  "usePetitionSignatureSummary must track a summaryError state — without it the page cannot tell a failed fetch from a real 0.",
);
const catchBody = extractBlockAfter(summaryHookSource, summaryHookSource.indexOf("} catch ("));
assert(catchBody, "usePetitionSignatureSummary's refreshSummary must have a catch block.");
assert(
  /setSummaryError\(true\)/.test(catchBody),
  "usePetitionSignatureSummary must set summaryError in the catch block — logging to the console does not reach the screen.",
);
assert(
  /setSummary\(data\);[\s\S]{0,80}setSummaryError\(false\)/.test(summaryHookSource),
  "usePetitionSignatureSummary must clear summaryError on a successful fetch, or a retry can never recover the UI.",
);
const summaryReturn = extractBlockAfter(summaryHookSource, summaryHookSource.lastIndexOf("return {"));
assert(
  summaryReturn && /\bsummaryError\b/.test(summaryReturn),
  "usePetitionSignatureSummary must return summaryError to its consumers.",
);

// 페이지가 그 신호를 실제로 소비하는가.
assert(
  /const countKnown = !loadingSummary && !summaryError;/.test(pageSource),
  "/petition/page.tsx must derive `countKnown` from both loadingSummary and summaryError — an unknown count must never render as 0.",
);
const progressIndex = pageSource.search(/<PetitionProgress\b/);
const progressGuardIndex = pageSource.indexOf("{summaryError ? (");
assert(
  progressGuardIndex !== -1 && progressGuardIndex < progressIndex,
  "/petition/page.tsx must branch on summaryError before rendering <PetitionProgress> — a failed fetch must not be shown as 0 / 0%.",
);
// 히어로 배지도 같은 거짓말을 한다("0명이 함께하고 있습니다").
assert(
  /\{countKnown && \([\s\S]{0,400}?stamp-badge/.test(pageSource),
  "/petition/page.tsx must hide the hero count badge while the count is unknown (home/HomeCtaSection's convention), not animate it to 0.",
);

// ---------------------------------------------------------------------------
// 11. 히어로에서 서명 폼으로 가는 경로가 존재한다.
//
//     PetitionActionCards의 "서명하기" 카드를 걷어내면서 #signature-form을
//     가리키는 링크가 저장소에서 사라졌다. 그대로 두면 시민이 폼에 닿으려면
//     성명서 전문을 끝까지 스크롤해야 한다.
// ---------------------------------------------------------------------------
assert(
  /const handleScrollToForm = useCallback\(\(\) => \{[\s\S]{0,200}?signatureSectionRef\.current\?\.scrollIntoView/.test(
    pageSource,
  ),
  "/petition/page.tsx must define handleScrollToForm that scrolls signatureSectionRef into view.",
);
const heroCtaMatch = pageSource.match(/<button[^>]*onClick=\{handleScrollToForm\}[\s\S]{0,200}?>/);
assert(
  heroCtaMatch,
  "/petition/page.tsx must render a hero CTA button wired to handleScrollToForm — otherwise the only way to the form is scrolling past the whole statement.",
);
assert(
  /letter-btn--primary/.test(heroCtaMatch[0]),
  "The hero signature CTA must use letter-btn--primary (--color-warm) — that colour role is reserved for exactly this: the CTA / signature action.",
);
// 스크롤 목표는 폼과 성공 화면을 **모두** 감싸는 안정적인 래퍼여야 한다.
// 폼 쪽 분기에만 달면 제출 후 ref가 null이 되어 CTA가 조용히 죽는다.
const anchorIndex = pageSource.indexOf('<div ref={signatureSectionRef} id="signature-form">');
assert(
  anchorIndex !== -1,
  '/petition/page.tsx must anchor the scroll target on a stable wrapper: <div ref={signatureSectionRef} id="signature-form">.',
);
const wallIndex = pageSource.search(/<SignatureWall\b/);
for (const inner of ["<PetitionSignatureForm", "<PetitionSuccess"]) {
  const innerIndex = pageSource.indexOf(inner);
  assert(
    innerIndex > anchorIndex && innerIndex < wallIndex,
    `${inner} must sit inside the signatureSectionRef wrapper — if the scroll anchor only covers one branch, the hero CTA breaks in the other state.`,
  );
}

console.log("PetitionFAQ checks passed.");

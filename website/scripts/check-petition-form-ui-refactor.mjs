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
 * `<Tag ... />` 한 개를 통째로 잘라낸다. 속성 값 안에는 `>`가 없다는 전제
 * (이 파일들의 JSX는 문자열/중괄호 속성만 쓴다). 요소 "안"을 봐야 하는
 * 단언 — required가 붙었는지, sr-only로 숨겼는지 — 을 위해 필요하다.
 */
function elementAt(source, index) {
  const start = source.lastIndexOf("<", index);
  const end = source.indexOf("/>", index);
  assert(start !== -1 && end !== -1, "could not isolate a JSX element around the anchor.");
  return source.slice(start, end + 2);
}

function elementContaining(source, anchor) {
  const index = source.indexOf(anchor);
  assert(index !== -1, `expected to find ${anchor}.`);
  return elementAt(source, index);
}

for (const path of [
  "src/components/petition/PetitionFormText.tsx",
  "src/components/petition/PetitionFormFields.tsx",
  "src/components/petition/PetitionConsentFields.tsx",
  "src/components/petition/PetitionFormEditControls.tsx",
  "src/components/petition/RegionSelect.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const formSource = read("src/components/petition/PetitionSignatureForm.tsx");
for (const componentName of [
  "PetitionFormText",
  "PetitionFormFields",
  "PetitionConsentFields",
  "PetitionFormEditControls",
]) {
  assert(
    formSource.includes(componentName),
    `PetitionSignatureForm must compose ${componentName}.`,
  );
}

for (const removedResponsibility of [
  "function FormText",
  "function EditControl",
  "EditableText",
  "EditableValue",
  "htmlFor={nameId}",
  "htmlFor={emailId}",
  "htmlFor={messageId}",
]) {
  assert(
    !formSource.includes(removedResponsibility),
    `PetitionSignatureForm should not own ${removedResponsibility}.`,
  );
}

const fieldsSource = read("src/components/petition/PetitionFormFields.tsx");
const consentSource = read("src/components/petition/PetitionConsentFields.tsx");

for (const expected of [
  "PetitionFormText",
  "SignatureFormErrors",
  "RegionSelect",
  "textarea",
  "message.length",
  "MESSAGE_MAX_LENGTH",
  "NAME_MAX_LENGTH",
  "AFFILIATION_MAX_LENGTH",
  'clearError("name")',
  'clearError("email")',
  'clearError("region")',
  'clearError("affiliation")',
  'clearError("namePublic")',
]) {
  assert(fieldsSource.includes(expected), `PetitionFormFields must include ${expected}.`);
}

for (const expected of [
  "PetitionFormText",
  "SignatureFormErrors",
  "privacyLines.map",
  'clearError("agreePrivacy")',
  'clearError("agreeAge")',
  'type="checkbox"',
]) {
  assert(consentSource.includes(expected), `PetitionConsentFields must include ${expected}.`);
}

// ---------------------------------------------------------------------------
// 값·형태 단언. "문자열이 있다"만 보는 가드는 이 워크스트림에서 여섯 번 연속
// 결함을 통과시켰다. 아래는 전부 실제 계약(무엇이 화면에 뜨는가 / 무엇이 서버로
// 가는가)을 검사한다.
// ---------------------------------------------------------------------------

// (1) 이메일은 선택 항목이다. `required`가 남아 있으면 이메일을 비운 시민이
// 브라우저 기본 검증에 막혀 서명을 제출하지 못한다(폼은 noValidate지만, 이
// 속성은 접근성 트리에도 '필수'로 노출된다).
const emailInput = elementContaining(fieldsSource, "id={ids.emailId}");
assert(
  emailInput.includes('type="email"'),
  "PetitionFormFields must render the email field as type=\"email\".",
);
assert(
  !/(^|\s)required(\s|=|\/|$)/.test(emailInput),
  "the email input must not be `required` — email is an optional field on the solidarity petition form.",
);

// (2) 이름은 필수다(서버·클라이언트 검증 모두 비어 있으면 거부).
const nameInput = elementContaining(fieldsSource, "id={ids.nameId}");
assert(
  /(^|\s)required(\s|=|\/|$)/.test(nameInput),
  "the name input must stay `required` — name is the one mandatory text field.",
);

// (3) 메시지 상한은 config의 MESSAGE_MAX_LENGTH(500)에서 와야 한다. 하드코딩된
// 100이 남아 있으면 상향이 UI에 도달하지 않는다.
const messageTextarea = elementContaining(fieldsSource, "id={ids.messageId}");
assert(
  messageTextarea.includes("maxLength={MESSAGE_MAX_LENGTH}"),
  "the message textarea must cap input with MESSAGE_MAX_LENGTH, not a literal.",
);
assert(
  !/\b100\b/.test(fieldsSource),
  "PetitionFormFields must not hardcode the old 100-character message limit anywhere.",
);
assert(
  fieldsSource.includes("{message.length}/{MESSAGE_MAX_LENGTH}"),
  "the message counter must read MESSAGE_MAX_LENGTH so it never drifts from the real cap.",
);

// (4) 명단 벽 공개 고지. 이 사이트는 공개에 동의한 서명자의 이름·지역을 페이지
// 하단 명단에 실시간으로 띄운다. 그 사실을 알리는 문장이 화면에 뜨지 않으면
// 동의 없는 공개다. 아래 두 단언이 (a) 고지 문구가 그 사실을 담고 있는지와
// (b) 그 문구가 실제로 렌더되는지를 함께 고정한다.
const copyFormSource = read("src/components/petition/copy/form.ts");
const namePublicNoteDefault = copyFormSource.match(
  /namePublicNote:\s*\{[\s\S]*?defaultValue:\s*((?:"[\s\S]*?"|`[\s\S]*?`))/,
);
assert(
  namePublicNoteDefault !== null && /하단 명단/.test(namePublicNoteDefault[1]),
  "copy.labels.namePublicNote must still disclose that consenting signers appear on this page's bottom list wall ('하단 명단').",
);
// 법적으로 작동하는 문장은 라디오 위의 **질문**이다. 질문이 "향후 성명서·서명
// 결과 발표 자료 등에 공개"만 물으면, 실제로 벌어지는 일 — 이름과 거주 지역이
// 지금 이 페이지 하단 명단에 즉시 뜨는 것 — 은 바로 아래 note에만 남는다.
// 노년 사용자에게 "발표 자료 등에"와 "지금 이 페이지에 즉시"는 체감이 전혀
// 다르다. 그래서 note뿐 아니라 질문 자체가 (a) 이 페이지의 명단 공개와
// (b) 공개 대상에 거주 지역이 포함된다는 사실을 담고 있어야 한다.
const namePublicLabelDefault = copyFormSource.match(
  /namePublicLabel:\s*\{[\s\S]*?defaultValue:\s*\n?\s*((?:"[\s\S]*?"|`[\s\S]*?`))/,
);
assert(
  namePublicLabelDefault !== null,
  "copy/form.ts must declare labels.namePublicLabel with a defaultValue string.",
);
assert(
  /이 페이지의 서명자 명단/.test(namePublicLabelDefault[1]),
  "copy.labels.namePublicLabel — the consent question itself, not just the note below it — must say the disclosure happens on this page's signer list ('이 페이지의 서명자 명단'), because that is what actually happens the moment the radio is chosen.",
);
assert(
  /거주 지역/.test(namePublicLabelDefault[1]),
  "copy.labels.namePublicLabel must state that the region is disclosed too, not just the name — SignatureWall.tsx renders regionTop and regionSub next to every name.",
);
// 벽은 이름·지역과 함께 **서명한 날짜**도 공개한다. 그 사실이 note에만 있고
// 질문에는 없으면, 질문을 열거형으로 쓴 이상 같은 틈이 남는다 — 동의를
// 구하는 문장 하나 안에서 공개 항목 셋을 모두 닫는다.
assert(
  /서명한 날짜/.test(namePublicLabelDefault[1]),
  "copy.labels.namePublicLabel must also name the signing date — SignatureWall.tsx renders <time dateTime={entry.createdAt}> for every entry, and the question enumerates what gets disclosed, so leaving the date to the note below reopens the exact gap this anchor exists to close.",
);

function renderAnchor(key) {
  const anchor = `text={copy.labels.${key}}`;
  const index = fieldsSource.indexOf(anchor);
  return { anchor, index };
}

// 파일 상단의 `const X = "…";` 클래스 상수를 값으로 해석해둔다. className이
// 상수 참조({NOTE_CLASS})면 정규식이 실제 클래스 문자열을 못 보기 때문에,
// 상수 하나만 "sr-only"로 바꿔도 법적 고지 두 개가 동시에 화면에서 사라지면서
// 가드는 통과해버린다. 그 우회를 막으려면 값을 따라가야 한다.
const classConstants = new Map(
  [...fieldsSource.matchAll(/^const (\w+) =\s*(?:\r?\n\s*)?"([^"]*)";/gm)].map((match) => [
    match[1],
    match[2],
  ]),
);

const INVISIBLE_CLASS = /\bsr-only\b|\bhidden\b|\binvisible\b|\bopacity-0\b|\bw-0\b|\bh-0\b/;

function resolveClassName(tag, what) {
  const literal = tag.match(/className="([^"]*)"/);
  if (literal) return literal[1];

  const reference = tag.match(/className=\{(\w+)\}/);
  assert(
    reference !== null,
    `${what}'s className must be a string literal or a single top-level class constant so this guard can read its real value. Found: ${tag}`,
  );
  const resolved = classConstants.get(reference[1]);
  assert(
    resolved !== undefined,
    `${what} uses className={${reference[1]}} but no top-level \`const ${reference[1]} = "…";\` exists in PetitionFormFields.tsx — this guard must be able to resolve it to a real class string.`,
  );
  return resolved;
}

// (4a) 고지 2종은 "상시 노출되는 문단"이어야 한다 — 사라지는 placeholder도,
// 조건부(&&·삼항)도, sr-only도 고지가 아니다.
for (const [label, key] of [
  ["the public-list-wall disclosure", "namePublicNote"],
  ["the email purpose notice", "emailNote"],
]) {
  const { index } = renderAnchor(key);
  assert(index !== -1, `PetitionFormFields must render ${label} (copy.labels.${key}).`);

  const element = elementAt(fieldsSource, index);
  assert(
    element.startsWith("<PetitionFormText"),
    `copy.labels.${key} must be rendered through PetitionFormText so admins can edit it in place.`,
  );

  const paragraphStart = fieldsSource.lastIndexOf("<p ", index);
  assert(
    paragraphStart !== -1,
    `${label} must sit in its own <p> block so it reads as a standing notice, not an inline aside.`,
  );
  const paragraphTag = fieldsSource.slice(
    paragraphStart,
    fieldsSource.indexOf(">", paragraphStart) + 1,
  );
  assert(
    !/aria-hidden|(?:^|\s)hidden(?:\s|=|>)/.test(paragraphTag),
    `${label} must be visible on screen — a hidden notice is not a notice. Found: ${paragraphTag}`,
  );

  const paragraphClass = resolveClassName(paragraphTag, label);
  assert(
    !INVISIBLE_CLASS.test(paragraphClass),
    `${label} must be visible on screen — a hidden notice is not a notice. Its <p> resolves to className "${paragraphClass}".`,
  );

  // 조건부 렌더 차단. `{cond && (<p …`뿐 아니라 `{cond ? (<p …`,
  // `{cond ? null : (<p …` 같은 삼항도 거부한다 — 어느 쪽이든 고지가 어떤
  // 상태에서는 화면에 없다는 뜻이다.
  const preceding = fieldsSource
    .slice(Math.max(0, paragraphStart - 300), paragraphStart)
    .replace(/\s+$/, "")
    .replace(/\($/, "")
    .replace(/\s+$/, "");
  assert(
    !/(?:&&|\|\||\?|:)$/.test(preceding),
    `${label} must be rendered unconditionally — found a conditional (&&, ||, or a ternary) immediately before it.`,
  );
}

// (4b) 라벨 안 인라인 마커도 실제로 렌더돼야 한다.
for (const [label, key] of [
  ["the name-disclosure question", "namePublicLabel"],
  ["the email optional marker", "emailOptional"],
  ["the affiliation optional marker", "affiliationOptional"],
  ["the message optional marker", "messageOptional"],
]) {
  const { index } = renderAnchor(key);
  assert(index !== -1, `PetitionFormFields must render ${label} (copy.labels.${key}).`);
  const element = elementAt(fieldsSource, index);
  assert(
    element.startsWith("<PetitionFormText"),
    `copy.labels.${key} must be rendered through PetitionFormText so admins can edit it in place.`,
  );
  assert(
    !/sr-only|aria-hidden/.test(element),
    `copy.labels.${key} must be visible on screen.`,
  );
}

// 이메일 이용 목적 고지는 사라지는 placeholder가 아니라 상시 노출이어야 한다.
assert(
  !fieldsSource.includes("placeholder={placeholders.formEmailNote"),
  "the email purpose notice must not be smuggled back into a placeholder.",
);

// (5) 이름 공개 라디오: fieldset/legend로 묶이고, 값은 boolean으로 나가야 한다
// (서버가 typeof namePublic !== "boolean"이면 400).
assert(fieldsSource.includes("<fieldset"), "the name-disclosure radios must be wrapped in a <fieldset>.");
assert(fieldsSource.includes("<legend"), "the name-disclosure <fieldset> must carry a <legend>.");
const radioCount = (fieldsSource.match(/type="radio"/g) ?? []).length;
assert(
  radioCount === 2,
  `the name-disclosure question must offer exactly two radios (yes/no); found ${radioCount}.`,
);
assert(
  fieldsSource.includes("onNamePublicChange(true)") &&
    fieldsSource.includes("onNamePublicChange(false)"),
  "namePublic must be set as a real boolean — the server 400s on a stringified \"true\".",
);
assert(
  !/onNamePublicChange\(\s*["'](?:true|false)["']\s*\)/.test(fieldsSource),
  "namePublic must never be set from a raw radio string value.",
);
assert(
  fieldsSource.includes("checked={namePublic === true}") &&
    fieldsSource.includes("checked={namePublic === false}"),
  "the radios must reflect namePublic's tri-state (null = not answered yet), not coerce it.",
);

// (5b) 오류 문단의 id는 반드시 어떤 입력의 aria-describedby가 실제로 가리켜야
// 한다. 그러지 않으면 화면에는 빨간 글씨가 뜨지만 스크린리더 사용자에게는 그
// 필드와 오류가 연결되지 않는 dangling id가 된다. 파일 어딘가에 그 id 문자열이
// 있는지만 보면 안 된다 — 쓰이지 않는 헬퍼 변수 안에 남아 있어도 통과해버리므로,
// aria-describedby가 참조하는 식(識)만 모아 그 안에서 찾는다.
function braceExpressionAt(source, openIndex) {
  let depth = 0;
  for (let cursor = openIndex; cursor < source.length; cursor += 1) {
    if (source[cursor] === "{") depth += 1;
    if (source[cursor] === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIndex + 1, cursor);
    }
  }
  return null;
}

let describedByPool = "";
for (const match of fieldsSource.matchAll(/aria-describedby=\{/g)) {
  const expression = braceExpressionAt(fieldsSource, match.index + match[0].length - 1);
  assert(expression !== null, "could not parse an aria-describedby expression.");
  describedByPool += `\n${expression}`;

  // 단순 식별자면 그 변수의 선언부까지 따라가 펼친다.
  const identifier = expression.trim();
  if (/^\w+$/.test(identifier)) {
    const declaration = fieldsSource.match(
      new RegExp(`const ${identifier} =[\\s\\S]*?;\\n`),
    );
    if (declaration) describedByPool += `\n${declaration[0]}`;
  }
}

for (const match of fieldsSource.matchAll(/<p id=\{/g)) {
  const openIndex = match.index + match[0].length - 1;
  const tag = fieldsSource.slice(match.index, fieldsSource.indexOf(">", openIndex) + 1);
  if (!tag.includes('role="alert"')) continue;

  const idExpression = braceExpressionAt(fieldsSource, openIndex);
  assert(idExpression !== null, `could not parse the id expression of ${tag}.`);
  assert(
    describedByPool.includes(idExpression),
    `the error message id ${idExpression} is never referenced by a live aria-describedby — the field and its error would not be linked for screen reader users.`,
  );
}

// (6) 모든 검증 오류 키가 화면 어딘가에 렌더돼야 한다. 키 목록은 form.ts에서
// 직접 뽑는다 — 나중에 새 오류 키가 추가되면 여기가 먼저 실패한다.
const signatureFormLib = read("src/lib/signatures/form.ts");
const errorsInterface = signatureFormLib.match(
  /export interface SignatureFormErrors\s*\{([\s\S]*?)\n\}/,
);
assert(errorsInterface !== null, "could not read SignatureFormErrors from src/lib/signatures/form.ts.");
const errorKeys = [...errorsInterface[1].matchAll(/^\s*(\w+)\?:/gm)].map((match) => match[1]);
assert(errorKeys.length >= 8, `expected at least 8 SignatureFormErrors keys, found ${errorKeys.length}.`);

const renderedBy = {
  name: /\{errors\.name\}/,
  email: /\{errors\.email\}/,
  message: /\{errors\.message\}/,
  // region 오류는 RegionSelect가 error prop을 받아 자기 <p role="alert">로 렌더한다.
  region: /error=\{errors\.region\}/,
  affiliation: /\{errors\.affiliation\}/,
  namePublic: /\{errors\.namePublic\}/,
  // 동의 체크박스는 1개로 합쳤으므로 두 키가 하나의 메시지로 합류한다.
  agreePrivacy: /errors\.agreePrivacy\s*\?\?\s*errors\.agreeAge/,
  agreeAge: /errors\.agreePrivacy\s*\?\?\s*errors\.agreeAge/,
};
const renderedMarkup = `${fieldsSource}\n${consentSource}`;
for (const key of errorKeys) {
  assert(
    Object.hasOwn(renderedBy, key),
    `SignatureFormErrors.${key} has no rendering rule in this guard — every validation error must reach the screen.`,
  );
  assert(
    renderedBy[key].test(renderedMarkup),
    `SignatureFormErrors.${key} is never rendered — a rejected submit would fail silently for that field.`,
  );
}
assert(
  consentSource.includes("{consentError}"),
  "PetitionConsentFields must render the merged consent error message.",
);

// (7) 동의 체크박스 1개 = DB 두 컬럼(consent_privacy·consent_age). 그래서 문구에
// 성명서 취지·개인정보 수집·이용·만 14세가 모두 들어가야 하고, 체크 상태는 두 값이
// 함께 true일 때만 켜져야 한다.
const checkboxCount = (consentSource.match(/type="checkbox"/g) ?? []).length;
assert(
  checkboxCount === 1,
  `PetitionConsentFields must render exactly one checkbox (privacy+age merged); found ${checkboxCount}.`,
);
for (const requiredCopy of ["privacyPrefix", "privacyToggle", "privacySuffix", "age"]) {
  assert(
    consentSource.includes(`copy.labels.${requiredCopy}`),
    `the single consent checkbox must state copy.labels.${requiredCopy} — merging the checkboxes must not drop any part of the consent sentence.`,
  );
}
assert(
  /agreePrivacy\s*&&\s*agreeAge/.test(consentSource),
  "the merged checkbox must be checked only when both consent columns are true.",
);
const ageAnchor = copyFormSource.match(
  /\bage:\s*\{[^}]*defaultValue:\s*((?:"[^"]*"|`[^`]*`))/,
);
assert(
  ageAnchor !== null && /14세 이상임을 확인/.test(ageAnchor[1]),
  "the merged consent sentence must keep the 만 14세 이상 confirmation (copy.labels.age).",
);

// (8) 지역 셀렉트는 Task 7의 RegionSelect를 소비한다(재구현 금지).
assert(
  /<RegionSelect[\s\S]*?top=\{regionTop\}[\s\S]*?sub=\{regionSub\}/.test(fieldsSource),
  "PetitionFormFields must feed RegionSelect the real regionTop/regionSub state.",
);
assert(
  !fieldsSource.includes("REGIONS") && !fieldsSource.includes("REGION_TOPS"),
  "PetitionFormFields must not reimplement the region list — RegionSelect owns it.",
);

const regionSelectSource = read("src/components/petition/RegionSelect.tsx");
for (const expected of [
  "OVERSEAS_REGION",
  "REGION_TOPS",
  "subsFor",
  "export interface RegionSelectProps",
]) {
  assert(regionSelectSource.includes(expected), `RegionSelect must include ${expected}.`);
}

const editControlsSource = read("src/components/petition/PetitionFormEditControls.tsx");
for (const expected of ["EditableValue", "PetitionEditableValueCopy", "fields.map"]) {
  assert(
    editControlsSource.includes(expected),
    `PetitionFormEditControls must include ${expected}.`,
  );
}

const textSource = read("src/components/petition/PetitionFormText.tsx");
for (const expected of ["EditableText", "PetitionEditableTextCopy", 'section="form"']) {
  assert(textSource.includes(expected), `PetitionFormText must include ${expected}.`);
}

console.log("Petition form UI refactor checks passed.");

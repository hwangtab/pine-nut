# 마을 잔치 리플렛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 9월 5일 「풍천리 잣나무 마을 잔치」 당일 배포용 A4 양면 3단 감싸접기 리플렛의 인쇄용 PDF 를 만든다.

**Architecture:** `docs/promo/leaflet/` 에 정적 HTML·CSS 한 벌을 두고 Chrome headless 로 PDF 를 뽑는다. 새 의존성도, 빌드 훅도, Next.js 라우트도 만들지 않는다. 폰트와 사진은 `website/public/` 에 이미 있는 것을 상대경로로 참조한다.

**Tech Stack:** HTML + CSS(`@page`, mm 단위) / Chrome headless `--print-to-pdf` / `npx qrcode`(일회성, 의존성 추가 없음) / 검증에 `pdfinfo`·`pdffonts`·`magick`

**Spec:** `docs/superpowers/specs/2026-09-02-village-feast-leaflet-design.md`

## Global Constraints

- 작업 크기 **303 × 216㎜** (재단 후 297 × 210㎜ + 사방 재단 여백 3㎜). PDF 는 정확히 2페이지.
- 면 폭: 플랩 **97.5㎜**, 뒤표지 **99.5㎜**, 표지 **100㎜**. 플랩이 안으로 말려 들어가므로 좁다.
- 접지선은 면마다 다르다 — **겉면 97.5㎜·197㎜**, **안면 100㎜·199.5㎜** (각 면 왼쪽 끝 기준, 재단 후 좌표).
- 색 기조는 짙은 초록 `#2D5016`. 강조는 `#C75000`. **포스터의 형광 연두(RGB)는 쓰지 않는다** — CMYK 에서 탁해진다.
- 표지에 포스터 JPG 를 얹지 않는다. 다시 조판한다.
- 사실·문구·사진은 저장소에 있는 것만 쓴다. **지어내지 않는다.** 출처는 `website/src/lib/concert.ts` 의 `FEAST_LINEUP`·`FEAST_TIMETABLE`, `docs/promo/보도자료-마을잔치.md`, `website/src/components/donate/DonateBankTransferSection.tsx`.
- 계좌: **농협 356-1559-4666-63 이창후**
- 문의: 대책위 이창후 총무 **010-8918-8933** / 공연 박성율 목사 **010-8748-3044**
- 모든 작업 경로는 저장소 루트 `/Users/hwang-gyeongha/pine-nut` 기준.

**출력 명령(모든 태스크에서 동일):**

```bash
cd /Users/hwang-gyeongha/pine-nut
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=docs/promo/leaflet/village-feast-leaflet.pdf \
  docs/promo/leaflet/leaflet.html
```

`CVDisplayLinkCreateWithCGDisplay failed` 경고는 무시한다 — 맥에서 항상 나오고 출력에 영향이 없다.

**눈으로 확인하는 방법(모든 태스크에서 동일):**

```bash
magick -density 150 docs/promo/leaflet/village-feast-leaflet.pdf[0] /tmp/side1.png
magick -density 150 docs/promo/leaflet/village-feast-leaflet.pdf[1] /tmp/side2.png
```

두 PNG 를 Read 도구로 **실제로 열어본다.** PDF 가 생겼다는 사실만으로 통과시키지 않는다.

---

### Task 1: 판형 뼈대와 폰트

6면의 내용은 아직 없다. 종이 크기·면 폭·접지선·폰트가 맞는지만 세운다. 여기가 틀리면 뒤의 모든 작업이 어긋난다.

**Files:**
- Create: `docs/promo/leaflet/leaflet.html`
- Create: `docs/promo/leaflet/leaflet.css`
- Create: `docs/promo/leaflet/fonts.css` (생성 명령으로 만든다 — 손으로 쓰지 않는다)

**Interfaces:**
- Produces: `.sheet`(303×216㎜ 한 면), `.trim`(재단 후 297×210 영역), `.panel-flap`/`.panel-back`/`.panel-cover`(겉면 세 칸), `.inside`(안면 297㎜ 한 판). 뒤 태스크는 이 클래스 안에 내용을 채운다.
- Produces: CSS 변수 `--forest: #2D5016`, `--warm: #C75000`, `--ink: #1a1a1a`

- [ ] **Step 1: 폰트 CSS 사본 만들기**

`website/src/app/fonts/pretendard.css` 는 `url(/fonts/...)` 절대경로라 `file://` 에서 깨진다. 경로만 바꾼 사본을 만든다.

```bash
cd /Users/hwang-gyeongha/pine-nut
mkdir -p docs/promo/leaflet
sed 's#url(/fonts/#url(../../../website/public/fonts/#g' \
  website/src/app/fonts/pretendard.css > docs/promo/leaflet/fonts.css
grep -c 'url(../../../website/public/fonts/' docs/promo/leaflet/fonts.css
```

Expected: 92 (서브셋 개수와 같아야 한다). 0 이나 다른 수가 나오면 원본 경로 형식이 바뀐 것이니 멈추고 `pretendard.css` 를 다시 본다.

- [ ] **Step 2: leaflet.css 작성**

```css
/* 마을 잔치 리플렛 — A4 가로 3단 감싸접기.
   좌표는 모두 재단 후(297×210) 기준이고, 재단 여백 3㎜는 .trim 이 흡수한다. */
@import url("fonts.css");

@font-face {
  font-family: 'MaruBuri';
  src: url("../../../website/public/fonts/maruburi/MaruBuri-Regular.woff2") format('woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'MaruBuri';
  src: url("../../../website/public/fonts/maruburi/MaruBuri-Bold.woff2") format('woff2');
  font-weight: 700;
}

:root {
  --forest: #2D5016;
  --warm: #C75000;
  --ink: #1a1a1a;
  --bleed: 3mm;
}

@page { size: 303mm 216mm; margin: 0; }

html, body { margin: 0; padding: 0; }
body {
  font-family: 'Pretendard Variable', 'Pretendard', sans-serif;
  color: var(--ink);
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* 한 면 = 재단 여백까지 포함한 실제 인쇄 크기 */
.sheet {
  position: relative;
  width: 303mm;
  height: 216mm;
  overflow: hidden;
  page-break-after: always;
}
.sheet:last-child { page-break-after: auto; }

/* 재단선 안쪽. 여기 좌표가 접지선 계산의 기준이다. */
.trim {
  position: absolute;
  left: var(--bleed);
  top: var(--bleed);
  width: 297mm;
  height: 210mm;
}

/* 겉면: 플랩 97.5 / 뒤표지 99.5 / 표지 100 */
.outside { display: flex; height: 100%; }
.panel-flap  { width: 97.5mm; height: 100%; }
.panel-back  { width: 99.5mm; height: 100%; }
.panel-cover { width: 100mm;  height: 100%; }

/* 안면: 세 칸을 나누지 않고 한 판으로 쓴다 */
.inside { width: 297mm; height: 100%; position: relative; }

/* 접지선 안내선 — 시험 출력용. 최종 출력 전에 body 에 .final 을 붙여 끈다. */
.fold {
  position: absolute; top: 0; bottom: 0;
  width: 0; border-left: 0.2mm dashed rgba(255,0,0,.6);
}
body.final .fold { display: none; }
```

- [ ] **Step 3: leaflet.html 작성**

접지선 안내선의 `left` 값이 면마다 다른 것에 주의한다. 겉면 97.5/197, 안면 100/199.5 다.

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>풍천리 잣나무 마을 잔치 리플렛</title>
<link rel="stylesheet" href="leaflet.css">
</head>
<body>

<!-- ── Side 1 (겉면) ── 좌→우: 플랩 / 뒤표지 / 표지 -->
<section class="sheet">
  <div class="trim">
    <div class="fold" style="left:97.5mm"></div>
    <div class="fold" style="left:197mm"></div>
    <div class="outside">
      <div class="panel-flap"></div>
      <div class="panel-back"></div>
      <div class="panel-cover"></div>
    </div>
  </div>
</section>

<!-- ── Side 2 (안면) ── 297㎜ 한 판. 접지선은 100 / 199.5 -->
<section class="sheet">
  <div class="trim">
    <div class="fold" style="left:100mm"></div>
    <div class="fold" style="left:199.5mm"></div>
    <div class="inside"></div>
  </div>
</section>

</body>
</html>
```

- [ ] **Step 4: 판형이 맞는지 확인**

Run:
```bash
cd /Users/hwang-gyeongha/pine-nut
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=docs/promo/leaflet/village-feast-leaflet.pdf \
  docs/promo/leaflet/leaflet.html
pdfinfo docs/promo/leaflet/village-feast-leaflet.pdf | grep -iE "pages|page size"
```

Expected: `Pages: 2` / `Page size: 858.96 x 612 pts` (= 303 × 216㎜). 다른 값이면 `@page size` 나 `.sheet` 크기를 고친다.

- [ ] **Step 5: 폰트가 PDF 에 박혔는지 확인**

이 단계에서는 아직 글자가 없으므로, 확인용 문장을 임시로 넣어 검사한다.

```bash
cd /Users/hwang-gyeongha/pine-nut
sed -i '' 's#<div class="panel-cover"></div>#<div class="panel-cover" style="font-size:20pt">폰트 확인 풍천리</div>#' docs/promo/leaflet/leaflet.html
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=docs/promo/leaflet/village-feast-leaflet.pdf \
  docs/promo/leaflet/leaflet.html
pdffonts docs/promo/leaflet/village-feast-leaflet.pdf
```

Expected: `Pretendard` 를 포함한 줄이 있고 `emb` 열이 `yes`. `no` 면 인쇄소에서 다른 활자로 바뀐다 — 폰트 경로를 다시 본다.

확인 후 임시 문장을 되돌린다:
```bash
sed -i '' 's#<div class="panel-cover" style="font-size:20pt">폰트 확인 풍천리</div>#<div class="panel-cover"></div>#' docs/promo/leaflet/leaflet.html
```

- [ ] **Step 6: 커밋**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add docs/promo/leaflet/
git commit -m "리플렛 판형 뼈대 — A4 가로 3단 감싸접기 303×216㎜

접지선은 면마다 다르다. 겉면 97.5·197㎜, 안면 100·199.5㎜ — 양면이 뒤집히기
때문이다. 한 값으로 잡으면 안면이 2.5㎜ 어긋난다."
```

---

### Task 2: QR 세 개

**Files:**
- Create: `docs/promo/leaflet/qr/petition.svg`
- Create: `docs/promo/leaflet/qr/site.svg`
- Create: `docs/promo/leaflet/qr/donate.svg`

**Interfaces:**
- Produces: 뒤표지(Task 3)가 `qr/petition.svg`, `qr/site.svg`, `qr/donate.svg` 를 `<img>` 로 참조한다.

- [ ] **Step 1: SVG 세 개 생성**

```bash
cd /Users/hwang-gyeongha/pine-nut/docs/promo/leaflet
mkdir -p qr
npx -y qrcode -t svg -o qr/petition.svg "https://pungcheonri.vercel.app/petition"
npx -y qrcode -t svg -o qr/site.svg     "https://pungcheonri.vercel.app/concert/village-feast"
npx -y qrcode -t svg -o qr/donate.svg   "https://pungcheonri.vercel.app/donate"
ls -l qr/
```

Expected: 세 파일 모두 1KB 이상.

- [ ] **Step 2: QR 이 실제로 읽히는지 확인**

QR 은 만들어졌다고 읽히는 게 아니다. 눈으로 보고, 가능하면 휴대폰으로 찍어본다.

```bash
cd /Users/hwang-gyeongha/pine-nut/docs/promo/leaflet
magick -density 150 qr/petition.svg /tmp/qr-petition.png
```

`/tmp/qr-petition.png` 를 Read 도구로 열어 QR 격자가 온전한지 본다. 흰 여백(quiet zone)이 없으면 인식률이 떨어지므로, 리플렛에서 QR 둘레에 최소 4㎜ 흰 여백을 둔다.

- [ ] **Step 3: 커밋**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add docs/promo/leaflet/qr/
git commit -m "리플렛 QR 3종 — 연대서명·잔치 페이지·후원"
```

---

### Task 3: 겉면 — 표지와 뒤표지

**Files:**
- Modify: `docs/promo/leaflet/leaflet.html` (`.panel-cover`, `.panel-back` 안을 채운다)
- Modify: `docs/promo/leaflet/leaflet.css` (표지·뒤표지 스타일 추가)

**Interfaces:**
- Consumes: Task 1 의 `.panel-cover`·`.panel-back`, CSS 변수 `--forest`/`--warm`. Task 2 의 `qr/*.svg`.

- [ ] **Step 1: 표지 채우기**

`.panel-cover` 안을 아래로 바꾼다. 출연진 이름은 포스터 게재 순서 그대로다(가나다 순이며, 무대 순서와 다르다 — 바꾸지 않는다).

```html
<div class="panel-cover">
  <div class="cover-body">
    <h1 class="cover-title">풍천리<br>잣나무<br>마을 잔치</h1>
    <p class="cover-when">2026. 9. 5. 토<br>오후 1시</p>
    <p class="cover-where">풍천리 마을회관<br><span>강원 홍천 화촌면</span></p>
    <ul class="cover-lineup">
      <li>경하와 세민</li><li>김동산과 블루이웃</li><li>길가는밴드 장현호</li>
      <li>마쓰모토 코타</li><li>박지휘</li><li>삼각전파사</li>
      <li>자이</li><li>최양다음 NEXT</li><li>ZSTHYGER</li>
    </ul>
    <p class="cover-foot">무료 · 예매 없음 <span>오늘 순서는 안쪽에</span></p>
  </div>
</div>
```

```css
.panel-cover { background: var(--forest); color: #fff; }
.cover-body { padding: 14mm 10mm; height: 100%; box-sizing: border-box;
  display: flex; flex-direction: column; }
.cover-title { font-size: 34pt; line-height: 1.08; font-weight: 800;
  margin: 0; letter-spacing: -0.02em; }
.cover-when { font-size: 15pt; font-weight: 700; margin: 8mm 0 0;
  line-height: 1.35; color: #EAF3D9; }
.cover-where { font-size: 11pt; margin: 4mm 0 0; line-height: 1.4; }
.cover-where span { font-size: 9pt; opacity: .75; }
.cover-lineup { list-style: none; padding: 0; margin: auto 0 0;
  font-size: 9.5pt; line-height: 1.55; opacity: .9; }
.cover-foot { margin: 6mm 0 0; font-size: 9pt; font-weight: 700;
  display: flex; justify-content: space-between; border-top: .3mm solid rgba(255,255,255,.35);
  padding-top: 3mm; }
.cover-foot span { font-weight: 400; opacity: .8; }
```

- [ ] **Step 2: 뒤표지 채우기**

계좌번호는 손으로 옮겨 적는 사람이 있으므로 크고 또렷하게 둔다.

```html
<div class="panel-back">
  <div class="back-body">
    <h2 class="back-h">돌아가서도<br>함께해주세요</h2>

    <div class="qr-row">
      <figure><img src="qr/petition.svg" alt=""><figcaption>연대서명<br><span>목표 111,999명</span></figcaption></figure>
      <figure><img src="qr/donate.svg" alt=""><figcaption>후원하기</figcaption></figure>
      <figure><img src="qr/site.svg" alt=""><figcaption>잔치 페이지</figcaption></figure>
    </div>

    <div class="account">
      <p class="account-label">후원 계좌</p>
      <p class="account-no">농협 356-1559-4666-63</p>
      <p class="account-holder">예금주 이창후</p>
    </div>

    <div class="contact">
      <p>문의</p>
      <p>대책위 이창후 총무 <b>010-8918-8933</b></p>
      <p>공연 박성율 목사 <b>010-8748-3044</b></p>
    </div>

    <p class="host">주최 · 홍천양수발전소 반대대책위원회</p>
    <p class="credit">출연진 프로필 사진 출처 — 벅스 아티스트 페이지, 강정피스앤뮤직캠프, 경기아트콜렉티브, 주최 측 제공</p>
  </div>
</div>
```

```css
.panel-back { background: var(--forest); color: #fff; }
.back-body { padding: 14mm 9mm; height: 100%; box-sizing: border-box;
  display: flex; flex-direction: column; }
.back-h { font-size: 17pt; line-height: 1.25; margin: 0 0 7mm; font-weight: 800; }
.qr-row { display: flex; gap: 4mm; }
.qr-row figure { margin: 0; text-align: center; flex: 1; }
/* QR 둘레 흰 여백이 없으면 인식률이 떨어진다 */
.qr-row img { width: 100%; background: #fff; padding: 1.5mm; box-sizing: border-box;
  border-radius: 1mm; display: block; }
.qr-row figcaption { font-size: 7.5pt; margin-top: 1.5mm; line-height: 1.3; }
.qr-row figcaption span { opacity: .7; }
.account { margin-top: 8mm; border: .4mm solid rgba(255,255,255,.5);
  border-radius: 1.5mm; padding: 4mm; }
.account-label { font-size: 8pt; margin: 0; opacity: .8; }
.account-no { font-size: 13.5pt; font-weight: 800; margin: 1.5mm 0 0;
  letter-spacing: .01em; }
.account-holder { font-size: 9pt; margin: 1mm 0 0; opacity: .85; }
.contact { margin-top: 7mm; font-size: 9pt; line-height: 1.6; }
.contact p { margin: 0; }
.contact p:first-child { font-size: 8pt; opacity: .7; margin-bottom: 1mm; }
.host { margin: auto 0 0; font-size: 8.5pt; font-weight: 700; }
.credit { font-size: 6.5pt; opacity: .65; margin: 2mm 0 0; line-height: 1.45; }
```

- [ ] **Step 3: 출력하고 눈으로 본다**

```bash
cd /Users/hwang-gyeongha/pine-nut
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=docs/promo/leaflet/village-feast-leaflet.pdf \
  docs/promo/leaflet/leaflet.html
magick -density 150 docs/promo/leaflet/village-feast-leaflet.pdf[0] /tmp/side1.png
```

`/tmp/side1.png` 를 Read 도구로 연다. 확인할 것:
- 표지 제목이 잘리지 않는가
- 표지·뒤표지 내용이 빨간 접지 안내선(97.5㎜·197㎜)을 넘지 않는가
- QR 세 개가 흰 바탕 위에 온전히 있는가
- 계좌번호가 한눈에 읽히는가

- [ ] **Step 4: 커밋**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add docs/promo/leaflet/
git commit -m "리플렛 겉면 — 표지와 뒤표지

표지는 포스터를 얹지 않고 다시 조판한다. 포스터의 형광 연두는 CMYK 에서
탁해지므로 짙은 초록으로 뒤집었다. 계좌번호는 손으로 옮겨 적는 사람을
생각해 크게 뒀다."
```

---

### Task 4: 겉면 — 플랩 (왜 이 잔치인가)

**Files:**
- Modify: `docs/promo/leaflet/leaflet.html` (`.panel-flap`)
- Modify: `docs/promo/leaflet/leaflet.css`

**Interfaces:**
- Consumes: Task 1 의 `.panel-flap`.

이 면의 주인공은 허순이 씨의 인용문이다. 통계는 인용문을 떠받치는 자리에 둔다. 숫자는 `docs/promo/보도자료-마을잔치.md` 에 있는 것만 쓴다.

- [ ] **Step 1: 플랩 채우기**

```html
<div class="panel-flap">
  <div class="flap-body">
    <p class="flap-eyebrow">왜 잔치인가</p>
    <h2 class="flap-h">7년을 싸운<br>마을입니다</h2>

    <blockquote class="flap-quote">
      사람답게 산 것 같다.<br>몇 년 만에 웃어봤는지<br>모르겠다.
      <cite>— 주민 허순이 씨, 2025년 「잣나무골 여름잔치」에서</cite>
    </blockquote>

    <ul class="flap-facts">
      <li><b>705회</b><span>2019년 3월 첫 집회 이후 이어온 집회. 예순에서 여든의 주민들이 지켰고, 그중 일곱 분이 지금 재판을 받고 있습니다.</span></li>
      <li><b>11만 그루</b><span>벌채될 잣나무. 산림청이 100대 명품숲으로 지정한 1,800㏊ 숲입니다.</span></li>
      <li><b>51가구</b><span>수몰되는 집. 풍천리 주민의 약 70%가 잣으로 먹고삽니다.</span></li>
    </ul>

    <p class="flap-tail">오늘 하루는, 웃자고 여는 자리입니다.</p>
  </div>
</div>
```

```css
.panel-flap { background: #F4F1E8; }
.flap-body { padding: 14mm 8mm; height: 100%; box-sizing: border-box;
  display: flex; flex-direction: column; }
.flap-eyebrow { font-size: 8pt; font-weight: 800; letter-spacing: .18em;
  color: var(--warm); margin: 0 0 3mm; }
.flap-h { font-size: 19pt; line-height: 1.25; margin: 0 0 7mm;
  font-weight: 800; color: var(--forest); }
.flap-quote { font-family: 'MaruBuri', serif; font-size: 13pt; line-height: 1.5;
  margin: 0 0 8mm; padding-left: 4mm; border-left: .8mm solid var(--forest);
  color: var(--forest); }
.flap-quote cite { display: block; font-family: 'Pretendard Variable', sans-serif;
  font-size: 7.5pt; font-style: normal; opacity: .7; margin-top: 3mm; line-height: 1.4; }
.flap-facts { list-style: none; padding: 0; margin: 0; }
.flap-facts li { margin-bottom: 5mm; }
.flap-facts b { display: block; font-size: 14pt; color: var(--warm); font-weight: 800; }
.flap-facts span { display: block; font-size: 8.5pt; line-height: 1.5; margin-top: 1mm; }
.flap-tail { margin: auto 0 0; font-size: 10pt; font-weight: 700;
  color: var(--forest); border-top: .3mm solid rgba(45,80,22,.3); padding-top: 4mm; }
```

- [ ] **Step 2: 출력하고 눈으로 본다**

Task 3 Step 3 과 같은 명령으로 `/tmp/side1.png` 를 다시 만들어 Read 로 연다. 확인할 것:
- 인용문이 이 면에서 가장 먼저 눈에 들어오는가
- 세 통계가 접지 안내선(97.5㎜)을 넘지 않는가
- 아래 여백이 남거나 넘치지 않는가

- [ ] **Step 3: 사실 대조**

```bash
cd /Users/hwang-gyeongha/pine-nut
grep -n "705회\|11만\|51가구\|70%\|허순이" docs/promo/보도자료-마을잔치.md
```

플랩에 적은 숫자와 인용문이 보도자료와 한 글자도 다르지 않은지 본다. 다르면 보도자료 쪽을 따른다.

- [ ] **Step 4: 커밋**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add docs/promo/leaflet/
git commit -m "리플렛 플랩 — 왜 이 잔치인가

숫자보다 허순이 씨의 문장이 오래 남는다. 인용을 위에 두고 통계를 아래
받침으로 돌렸다."
```

---

### Task 5: 안면 — 오늘의 순서

리플렛의 심장. 297㎜ 한 판에 시간이 왼쪽에서 오른쪽으로 흐른다.

**Files:**
- Modify: `docs/promo/leaflet/leaflet.html` (`.inside`)
- Modify: `docs/promo/leaflet/leaflet.css`

**Interfaces:**
- Consumes: Task 1 의 `.inside`. `website/public/images/concert/artists/*.jpg` 를 상대경로로 참조한다.

**소개 글은 `website/src/lib/concert.ts` 의 `FEAST_LINEUP` 에서 그대로 가져온다. 리플렛용으로 줄여야 하면 문장을 잘라 쓰되 새 문장을 쓰지 않는다.** 시각은 `FEAST_TIMETABLE` 그대로다.

- [ ] **Step 1: 안면 채우기**

접지선이 100㎜·199.5㎜ 이므로 세 칸이 각각 100 / 99.5 / 97.5㎜ 다. 팀을 세 칸에 셋씩 나눠 담으면 접힌 채로 봐도 끊겨 읽힌다.

```html
<div class="inside">
  <header class="in-head">
    <h2>오늘의 순서</h2>
    <p>한 팀이 15분씩 노래하고 5분씩 무대를 바꿉니다. 현장 사정에 따라 조금씩 밀릴 수 있습니다.</p>
  </header>

  <div class="in-cols">
    <!-- 1칸 (100㎜) -->
    <div class="in-col">
      <div class="slot slot-open">
        <p class="t">13:00 – 14:00</p>
        <p class="n">식사 · 댄스 · 수다</p>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/kyungha-semin.jpg" alt="">
        <div><p class="t">14:00 – 14:15</p><p class="n">경하와 세민</p>
        <p class="b">재개발로 쫓겨나는 자리, 세상에게 죽임당한 이를 기리는 자리에서 노래해온 듀오.</p></div>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/parkjihwi.jpg" alt="">
        <div><p class="t">14:20 – 14:35</p><p class="n">박지휘</p>
        <p class="b">프리포크 싱어송라이터. 로파이한 프리포크로 시작해, 근래에는 엘리엇 스미스의 새드코어에 기운 곡을 씁니다.</p></div>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/gilganun.jpg" alt="">
        <div><p class="t">14:40 – 14:55</p><p class="n">길가는밴드 장현호</p>
        <p class="b">싱어송라이터 장현호를 중심으로 2011년 결성된 거리 밴드. 세월호, 강정마을, KTX 해고 승무원 — 십수 년을 현장에서 불러왔습니다.</p></div>
      </div>
    </div>

    <!-- 2칸 (99.5㎜) -->
    <div class="in-col">
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/next.jpg" alt="">
        <div><p class="t">15:00 – 15:15</p><p class="n">최양다음 NEXT</p>
        <p class="b">싱어송라이터. 이름을 여러 나라 말로 씁니다 — 다음, NEXT, 次, Nächste, 翌.</p></div>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/jai.jpg" alt="">
        <div><p class="t">15:20 – 15:35</p><p class="n">자이</p>
        <p class="b">인디 1세대 밴드 헤디마마의 보컬·베이스를 거쳐, 지금은 낮은 중저음과 정직한 선율의 네오소울 포크를 씁니다.</p></div>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/kimdongsan.jpg" alt="">
        <div><p class="t">15:40 – 15:55</p><p class="n">김동산과 블루이웃</p>
        <p class="b">수원의 포크·블루스 음악가 김동산과 밴드 블루이웃. 해고 노동자와 쫓겨나는 상인들의 이야기를 노래해 '한국의 우디거스리'로 불립니다.</p></div>
      </div>
    </div>

    <!-- 3칸 (97.5㎜) -->
    <div class="in-col">
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/matsumoto-kota.jpg" alt="">
        <div><p class="t">16:00 – 16:15</p><p class="n">마쓰모토 코타</p>
        <p class="b">일본과 베를린을 오가며 이주와 여행을 거듭해온 음악가. 거친 결의 목소리에 일본어 노랫말을 얹고 기타·피아노·아카펠라를 오갑니다.</p></div>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/zsthyger.jpg" alt="">
        <div><p class="t">16:20 – 16:35</p><p class="n">ZSTHYGER</p>
        <p class="b">전자음악·메탈·클래식을 아우르는 연주자이자 프로듀서. '악기와 악사의 가치를 증명하는 방법은 연주뿐'이라는 태도로 작업합니다.</p></div>
      </div>
      <div class="slot">
        <img src="../../../website/public/images/concert/artists/samgak.jpg" alt="">
        <div><p class="t">16:40 – 16:55</p><p class="n">삼각전파사</p>
        <p class="b">전자음악가이자 SF 작가 장호진의 솔로 프로젝트. 예측 불가능한 사운드와 비선형적 작곡으로 한국 사회의 구조적 모순을 담습니다.</p></div>
      </div>
      <div class="slot slot-open">
        <p class="t">17:00</p>
        <p class="n">다 함께 단체사진</p>
      </div>
    </div>
  </div>
</div>
```

```css
.inside { background: #fff; box-sizing: border-box; padding: 12mm 0 10mm; }
.in-head { padding: 0 10mm; margin-bottom: 7mm; }
.in-head h2 { font-size: 20pt; font-weight: 800; color: var(--forest);
  margin: 0 0 2mm; }
.in-head p { font-size: 8.5pt; margin: 0; color: #555; }
.in-cols { display: flex; }
/* 칸 폭은 접지선과 같아야 한다 — 안면 접지선은 100 / 199.5 */
.in-col:nth-child(1) { width: 100mm; }
.in-col:nth-child(2) { width: 99.5mm; }
.in-col:nth-child(3) { width: 97.5mm; }
.in-col { box-sizing: border-box; padding: 0 8mm; }
/* 접지선에 글자가 닿지 않도록 칸 사이에 숨 쉴 자리를 둔다 */
.slot { display: flex; gap: 3.5mm; margin-bottom: 5.5mm; align-items: flex-start; }
.slot img { width: 18mm; height: 18mm; border-radius: 50%; object-fit: cover;
  flex: 0 0 18mm; }
.slot .t { font-size: 9pt; font-weight: 800; color: var(--warm);
  margin: 0; font-variant-numeric: tabular-nums; }
.slot .n { font-size: 11.5pt; font-weight: 800; margin: .5mm 0 0;
  color: var(--ink); }
.slot .b { font-size: 7.5pt; line-height: 1.5; margin: 1.5mm 0 0; color: #444; }
.slot-open { display: block; background: #F4F1E8; border-radius: 2mm;
  padding: 4mm; }
.slot-open .n { font-size: 12pt; color: var(--forest); }
```

- [ ] **Step 2: 소개 글이 원본과 같은지 대조**

```bash
cd /Users/hwang-gyeongha/pine-nut
sed -n '/export const FEAST_LINEUP/,/^];/p' website/src/lib/concert.ts
sed -n '/export const FEAST_TIMETABLE/,/^];/p' website/src/lib/concert.ts
```

리플렛의 시각 아홉 줄이 `FEAST_TIMETABLE` 과 같은지, 소개 글이 `FEAST_LINEUP` 의 문장에서 잘라낸 것뿐인지 확인한다. 새로 쓴 문장이 있으면 지운다.

- [ ] **Step 3: 출력하고 눈으로 본다**

```bash
cd /Users/hwang-gyeongha/pine-nut
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=docs/promo/leaflet/village-feast-leaflet.pdf \
  docs/promo/leaflet/leaflet.html
magick -density 150 docs/promo/leaflet/village-feast-leaflet.pdf[1] /tmp/side2.png
```

`/tmp/side2.png` 를 Read 로 연다. 확인할 것:
- 아홉 팀 사진이 모두 나왔는가 (경로가 틀리면 빈 자리로 나온다 — 빈 자리는 실패다)
- 어느 팀도 빨간 접지 안내선(100㎜·199.5㎜)에 걸치지 않는가
- 세 칸이 각각 위아래로 넘치지 않는가
- 마지막 칸이 17:00 단체사진으로 끝나는가

- [ ] **Step 4: 커밋**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add docs/promo/leaflet/
git commit -m "리플렛 안면 — 오늘의 순서 297㎜ 한 판

접힌 채로 봐도 한 칸에 세 팀씩 끊겨 읽히도록 나눴다. 소개 글은 concert.ts 의
FEAST_LINEUP 에서 그대로 가져왔다."
```

---

### Task 6: 마무리 — 안내선 끄기, 접어보기, 인쇄용 PDF

**Files:**
- Modify: `docs/promo/leaflet/leaflet.html` (`<body class="final">`)
- Create: `docs/promo/leaflet/village-feast-leaflet.pdf` (최종본)
- Modify: `docs/superpowers/specs/2026-09-02-village-feast-leaflet-design.md` (실제와 달라진 값이 있으면)

- [ ] **Step 1: 접지 안내선 끄기**

```bash
cd /Users/hwang-gyeongha/pine-nut
sed -i '' 's#^<body>#<body class="final">#' docs/promo/leaflet/leaflet.html
grep -n '<body' docs/promo/leaflet/leaflet.html
```

Expected: `<body class="final">`

- [ ] **Step 2: 최종 PDF 출력과 기계 검증**

```bash
cd /Users/hwang-gyeongha/pine-nut
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' \
  --headless --disable-gpu --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=docs/promo/leaflet/village-feast-leaflet.pdf \
  docs/promo/leaflet/leaflet.html
pdfinfo docs/promo/leaflet/village-feast-leaflet.pdf | grep -iE "pages|page size"
pdffonts docs/promo/leaflet/village-feast-leaflet.pdf
```

Expected: `Pages: 2`, `858.96 x 612 pts`, 모든 폰트의 `emb` 가 `yes`.

- [ ] **Step 3: 사실 대조 — 두 번 확인한다**

```bash
cd /Users/hwang-gyeongha/pine-nut
grep -n "DONATION_BANK_ACCOUNT_FULL" website/src/components/donate/DonateBankTransferSection.tsx
grep -n "010-8918-8933\|010-8748-3044" docs/promo/보도자료-마을잔치.md
sed -n '/export const FEAST_TIMETABLE/,/^];/p' website/src/lib/concert.ts
```

계좌번호·전화번호·시각을 리플렛과 한 자씩 대조한다. **계좌번호는 CMS 로 덮어쓸 수 있는 기본값이므로, 운영 중인 `https://pungcheonri.vercel.app/donate` 페이지도 열어 같은지 본다.** 종이는 고칠 수 없다.

- [ ] **Step 4: 접어본다 — 이 단계 없이 인쇄소에 넘기지 않는다**

사용자에게 요청한다:

> `docs/promo/leaflet/village-feast-leaflet.pdf` 를 A4 양면(짧은 쪽 넘김 아님 — **긴 쪽 넘김**)으로 한 장 뽑아, 오른쪽 표지가 겉으로 오도록 감싸접기로 접어주세요. 확인할 것 세 가지입니다.
> 1. 플랩이 걸리지 않고 안으로 들어가는가
> 2. 접은 자리에 얼굴이나 글자가 잘리지 않는가
> 3. 양면이 어긋나지 않는가 (겉면 접지선과 안면 접지선이 같은 자리에서 만나는가)

어긋나면 되돌아가 해당 태스크를 고친다. **PDF 가 예뻐 보인다는 이유로 이 단계를 건너뛰지 않는다.** 3단 접지는 화면에서 맞아 보여도 접으면 어긋나는 일이 흔하다.

- [ ] **Step 5: 커밋**

```bash
cd /Users/hwang-gyeongha/pine-nut
git add docs/promo/leaflet/
git commit -m "리플렛 최종 PDF — 접지 안내선 제거, 인쇄 발주본

시험 인쇄로 접어 확인했다. 계좌번호는 운영 중인 /donate 페이지와 대조했다."
git push origin main
```

- [ ] **Step 6: 인쇄소에 넘길 때 함께 전달할 사항**

파일만 보내면 인쇄소가 임의로 판단한다. 아래를 같이 적어 보낸다.

- 재단 후 297 × 210㎜, 재단 여백 사방 3㎜ 포함된 파일(303 × 216㎜)
- 3단 **감싸접기(롤폴드)**. 접지선은 재단 후 기준 겉면 97.5㎜·197㎜
- 안으로 말려 들어가는 면이 2.5㎜ 좁게 설계돼 있음
- 양면 컬러, CMYK
- 종이는 스노우지 150g 내외 권장 (인쇄소 판단에 따름)

---

## 자기 점검 결과

- **스펙 대조** — 판형(Task 1), 색·활자(Task 1·3), 표지(Task 3), 플랩(Task 4), 안면(Task 5), 뒤표지(Task 3), QR(Task 2), 제작 방법(전체), 검증 4항목(Task 1·5·6). 빠진 절이 없다.
- **미결 사항** — 스펙 7절의 "인쇄 부수와 종이"는 인쇄소 견적 사항이라 계획에 태스크가 없다. Task 6 Step 6 에 발주 시 전달 사항으로 옮겨 적었다.
- **이름 일관성** — `.panel-flap`/`.panel-back`/`.panel-cover`/`.inside`/`.slot`/`.slot-open` 이 Task 1 정의와 Task 3·4·5 사용에서 일치한다.

# 관리자 기능 전수 적대적 감사 보고서

- 일시: 2026-08-11
- 방식: 9개 도메인 병렬 탐지 → 도메인별 독립 반증 검증 → 누락 비평 → 재반증 (에이전트 20개)
- 원시 발견 67건 → 반증 통과 52건 → 중복 제거 49건
- 심각도: high 8 / medium 17 / low 24 (critical 0)

---

## 1. [HIGH] 서버 검증 실패 시 React 19가 폼을 자동 리셋해 작성 중이던 소식 본문이 통째로 사라짐

- **위치**: `src/components/admin/NewsForm.tsx:31`
- **분류**: data-loss · 소식/언론보도 CRUD, 미디어·업로드

**무엇이 잘못됐나**

React 19의 `<form action={fn}>`은 액션 함수가 호출될 때 항상 폼 리셋을 예약한다. node_modules/react-dom/cjs/react-dom-client.development.js:8940 `startHostTransition`이 액션을 `function(){ requestFormReset$1(formFiber); return action(formData); }`로 감싸고, 커밋 단계(같은 파일 15152행 `fiber.stateNode.reset()`)에서 실제 DOM `form.reset()`이 실행된다. 즉 액션이 `{error}`를 반환해도(성공/실패 구분 없음) 폼은 리셋된다. NewsForm의 모든 필드는 `defaultValue`만 쓰는 비제어 입력이고, ActionState(src/lib/actions/state.ts)는 `{error: string} | null`이라 제출값을 되돌려주지 않는다. 결과적으로 새 소식 작성 화면에서는 모든 칸이 빈칸으로, 수정 화면에서는 저장 전 편집 내용이 원본 값으로 되돌아간다. validateNewsForm의 제목 200자 제한(src/lib/actions/news/form.ts:24)은 input에 maxLength가 없어 클라이언트에서 걸러지지 않고, 이미지 업로드 실패·requireEditor 거부·Supabase 오류도 모두 같은 경로를 탄다.

**재현**

1) editor 계정으로 /admin/news/new 접속. 2) 제목에 201자 이상(예: 긴 기사 제목 붙여넣기) 입력, 본문에 수천 자 분량 기사 작성, 날짜·카테고리 선택. 3) '게시하기' 클릭. 4) 서버가 '제목은 200자 이내로 입력해주세요.' 에러를 반환 → 에러 배너는 뜨지만 제목·요약·본문·날짜·카테고리 입력칸이 전부 비워진다. 작성한 본문은 복구 불가. (같은 현상이 '사진 업로드에 실패했습니다', 중복 슬러그, RLS/네트워크 오류에서도 발생하고, 수정 폼에서는 편집 내용이 원본으로 되돌아간다.)

**수정 방향**

ActionState에 제출값을 함께 실어 보내고(예: `{ error, values }`) 각 필드를 `defaultValue={state?.values?.title ?? initialData?.title}` 식으로 다시 채운다. 폼 리셋은 새 defaultValue(=value 속성)로 되돌아가므로 값이 보존된다. 또는 필드를 useState 기반 제어 컴포넌트로 바꾼다. 부수적으로 title input에 maxLength={200}을 추가해 서버 왕복 전에 걸러라.

<details><summary>반증 검증 근거</summary>

node_modules 소스로 메커니즘을 직접 확인했다. react-dom-client.development.js:8940 startHostTransition이 <form action={fn}>의 액션을 function(){ requestFormReset$1(formFiber); return action(formData); }로 무조건 감싸고(19077/19100행에서 함수형 action일 때 이 경로로 진입), requestFormReset$1(8995행)이 리셋 훅 큐에 새 {}를 dispatch → 7775행 TransitionAwareHostComponent에서 currentlyRenderingFiber.flags |= 1024 → 커밋 단계 15152행 '5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset()'로 실제 DOM form.reset()이 실행된다. 성공/실패 분기가 없다. 앱 쪽 조건도 모두 성립: NewsForm.tsx:31이 <form action={formAction}>이고 useActionState(28행) 초기값 null, 모든 필드가 AdminTextField(42행 defaultValue)·AdminTextareaField(40행 defaultValue)의 비제어 입력이며 ActionState는 {error}만 돌려주므로 제출값 복원 경로가 없다. AdminTextField에 maxLength 속성이 없어 form.ts:24의 200자 제한은 서버에서만 걸린다. react/react-dom 19.2.3 확인. 도달 가능한 서버 에러 경로도 다수: validateNewsForm 각종 반환(form.ts:23~47), requireEditor 거부(auth.ts:109 — proxy.ts는 is_active_admin만 보므로 viewer도 /admin/news/new 진입 가능), uploadImageFromFormData 실패, friendlyNewsError(mutations.ts:55·109). 새 글 화면에서는 전 필드가 빈칸으로, 수정 화면에서는 원본값으로 되돌아간다. 반증 실패 — 재현 가능한 실제 버그.

</details>

---

## 2. [HIGH] fill 이미지가 편집 모드 진입 즉시 사라지고 편집 UI도 클릭 불가 (홈 히어로 + 모든 서브히어로)

- **위치**: `src/components/editable/EditableImage.tsx:115`
- **분류**: ui-state · 인라인 편집(page-content)

**무엇이 잘못됐나**

비편집 모드에서는 `<Image fill>`이 부모 섹션(relative, min-h-screen 등)의 직접 자식으로 렌더링돼 섹션 전체를 채운다. 편집 모드로 바뀌면 115행의 `<div className="relative group">` 래퍼가 새로 끼어드는데, 이 래퍼는 크기 지정이 전혀 없고 내부 자식이 전부 absolute(Next `fill` 이미지 = position:absolute, 오버레이 `absolute inset-0`, 배지 absolute, file input은 `hidden`)이라 flow 콘텐츠가 0개다. 결과적으로 래퍼는 높이 0(홈 히어로는 flex column + items-center라 폭까지 0)이 되고, `inset-0`이 그 0px 박스를 기준으로 해석돼 이미지가 화면에서 사라진다. 동시에 `absolute inset-0`인 hover 오버레이(파일 업로드/URL 입력 버튼)도 0px가 되어 hover·클릭이 불가능하고, `data-editable-key`가 붙은 래퍼를 클릭할 수 없으니 툴바의 '기본값 복원'용 선택도 되지 않는다. 즉 fill 이미지는 인라인 편집 기능 자체가 동작하지 않는다. width/height를 쓰는 이미지는 이미지가 flow에 있으므로 영향 없다.

**재현**

1) owner/editor로 로그인해 홈(/)에서 툴바의 '편집 모드'를 켠다. 2) 화면 상단 히어로 배경 사진(home.hero.bgImage, HomeHeroSection.tsx:16-25, fill)이 즉시 사라지고 검은 그라데이션만 남는다. 3) 사진이 있던 자리에 마우스를 올려도 '파일 업로드'/'URL 입력' 오버레이가 뜨지 않는다. 4) /story, /petition, /press, /gallery 등 SubHero(SubHero.tsx:62-73, fill)를 쓰는 모든 서브페이지에서도 동일하게 배경 사진이 사라지고 편집이 불가능하다. 5) 편집 모드를 끄면 사진이 다시 나타난다.

**수정 방향**

fill일 때는 래퍼가 부모를 그대로 덮도록 해야 한다. `fill ? "absolute inset-0" : "relative"`처럼 래퍼 클래스를 분기하거나(부모가 relative임을 전제), 래퍼에 전달용 wrapperClassName prop을 추가해 호출부(HomeHeroSection/SubHero)에서 `absolute inset-0`을 지정하게 한다.

<details><summary>반증 검증 근거</summary>

EditableImage.tsx:106-116을 직접 확인했다. className은 imageProps로 <Image>에만 전달되고(106-108행), 편집 모드 래퍼는 크기 지정이 전혀 없는 `<div className="relative group">`(115행)다. 이 래퍼의 자식은 (a) Next fill 이미지 = position:absolute, (b) 오버레이 `absolute inset-0`(119행), (c) URL 입력 `absolute`(141행), (d) `className="hidden"` 파일 input(165-171행, display:none), (e) 배지 `absolute`(174행) — flow 콘텐츠가 0개라 래퍼 높이는 0이다. 소비처도 대조했다: SubHero.tsx:59-73은 블록 <section>의 직접 자식이라 래퍼 폭 100%/높이 0, HomeHeroSection.tsx:16-26은 부모 섹션이 app/page.tsx:47의 `flex flex-col items-center`라 래퍼가 flex item(align-items:center → 교차축 fit-content)이 되어 폭까지 0이 된다. 비편집 모드에서는 111행이 <Image fill>을 섹션의 직접 자식으로 렌더하므로 섹션 전체를 채운다 — 즉 편집 모드 전환에서만 붕괴한다. 상위 완충 장치도 없다: globals.css에 [data-editable-key]/editable 관련 규칙이 0건이고, ManagedSection→EditableSection(편집 모드 시 `<div className="relative">` 추가)은 섹션 바깥을 감쌀 뿐 섹션 내부 flex 레이아웃을 바꾸지 않는다. fill을 쓰는 곳은 SubHero와 홈 히어로 둘뿐이며(다른 6개 EditableImage는 모두 width/height라 flow에 있어 영향 없음 — 보고자의 단서도 정확), 결과적으로 오버레이가 0px라 hover/클릭 불가 → fill 이미지는 인라인 편집 자체가 불가능하다. 다만 영향 범위가 '관리자가 편집 모드를 켠 동안'으로 한정되고 공개 화면은 정상이므로 critical이 아니라 high로 정정한다.

</details>

---

## 3. [HIGH] 명부에서 삭제한 회원이 비로그인 상태에서 스스로 회원 자격을 복구할 수 있다 (healOrphanMember)

- **위치**: `src/lib/actions/admin-signup.ts:65`
- **분류**: auth-bypass · 인증·권한

**무엇이 잘못됐나**

removeAdminMemberAction(src/lib/actions/admin-members.ts:74-96)은 role이 'pending'이 아닌 경우(viewer/editor/owner) 또는 게시판 콘텐츠가 있는 경우 auth 계정을 남기고 admin_members 행만 삭제한다. 주석에도 '실제 기획단원은 명부에서만 제거해 auth 계정/게시글을 보존한다'고 명시돼 있다.

그런데 claimAdminAccount는 바로 그 상태(auth.users에는 있으나 admin_members 행이 없음)를 '과거 보상 삭제 실패로 생긴 고스트'로 간주하고 healOrphanMember(src/lib/actions/admin-signup.ts:23-36)로 명부에 자동 복구한다. healOrphanMember는 비밀번호를 검증하지 않고(계정 생성 실패 경로에서 호출됨) service-role 클라이언트로 RLS를 우회해 admin_members에 {role:'pending', active:true, user_id:<피해자 auth id>} 행을 INSERT한다.

즉 owner가 의도적으로 제거한 회원을, 인증되지 않은 아무 요청이나 이메일만 알면 명부에 되살릴 수 있다. 복구된 행은 active=true + user_id가 채워져 있으므로 DB의 is_member()(user_id 기준, role 무관)가 true를 반환하고, requireMember(src/lib/actions/auth.ts:122)도 통과한다. 결과적으로 제거된 사용자는 기존 비밀번호로 로그인만 하면 게시판 글/댓글/좋아요/신고 권한을 그대로 되찾는다. 또한 명부 목록에 '대기중'으로 다시 나타나 owner가 실수로 역할을 부여할 위험도 생긴다.

부수 효과로, 존재하는 auth 계정 이메일을 넣으면 claimAdminAccount가 null(성공)을 반환하므로 /signup 화면이 '가입은 완료됐어요'라는 잘못된 메시지를 띄우고, 이메일 존재 여부까지 노출된다(명부에 있는 이메일: '이미 가입된 이메일입니다' / auth에만 있는 이메일: 성공).

**재현**

1) owner로 /admin/members에 접속해 editor 역할의 회원 A(이메일 a@x.com, 게시판 글 있음)를 '삭제' 한다. → admin_members 행만 삭제되고 A의 auth 계정은 남는다.
2) 로그아웃(또는 시크릿 창)에서 /signup으로 이동해 이메일 a@x.com, 비밀번호는 아무 값(예: 12345678)으로 '가입하기'를 누른다.
3) claimAdminAccount: existing 조회 없음 → service.auth.admin.createUser가 'already registered'로 실패 → healOrphanMember가 a@x.com의 auth user id를 찾아 admin_members에 role='pending', active=true, user_id=A로 INSERT → null(성공) 반환.
4) 화면에는 '가입은 완료됐어요. 로그인 페이지에서 로그인해 주세요.'가 뜬다.
5) A가 예전 비밀번호로 /login 하면 is_member()=true가 되어 /board에서 글쓰기·댓글·좋아요가 다시 가능하다. owner가 수행한 회원 자격 박탈이 무효화된다.

**수정 방향**

healOrphanMember의 자동 복구를 제거하거나, 최소한 (a) 복구 대상을 '가입 직후 보상 삭제 실패' 로 한정할 수 있는 표식(예: created_by='self-signup'인 행이 원래 존재했다는 증거)이 있을 때만 수행하고, (b) 복구 전에 service.auth.admin으로 비밀번호 검증(또는 해당 계정으로 signInWithPassword 성공)을 요구하도록 바꾼다. 더 안전한 방향은 removeAdminMemberAction이 명부 행 삭제 대신 'revoked' 상태(예: active=false + role='pending')로 남겨 재가입 경로에서 existing 검사에 걸리게 하는 것이다. 그러면 고스트 상태 자체가 생기지 않는다.

<details><summary>반증 검증 근거</summary>

반증 시도 실패. 모든 연결 고리가 코드/DB에서 실제로 확인된다.
(1) removeAdminMemberAction(admin-members.ts:69)은 role과 무관하게 admin_members 행을 DELETE하고, auth 계정 삭제는 `if (t?.role === 'pending' && t.user_id)`(74-95행) 안에서만 한다. 즉 editor/viewer/owner를 삭제하면 auth.users 행은 남고 명부 행만 사라진다 → 정확히 '고아' 상태가 만들어진다.
(2) /signup(app/signup/page.tsx:60)은 비로그인 공개 페이지이고 claimAdminAccount를 인증 없이 직접 호출한다(로그인 사용자는 useEffect에서 리다이렉트되므로 오히려 비로그인만 도달 가능).
(3) claimAdminAccount: 명부 조회 미스 → service.auth.admin.createUser가 'already been registered'(문자열에 'already' 포함) 실패 → admin-signup.ts:65에서 healOrphanMember 호출. healOrphanMember(23-36행)는 비밀번호를 전혀 검증하지 않고 service-role(RLS 우회) 클라이언트로 {role:'pending', active:true, user_id:<피해자 auth id>, created_by:'self-heal'}를 INSERT한다. admin_members에 걸린 제약(role CHECK에 'pending' 포함 — 20260701010001, email lowercase CHECK — 20260701000001)은 전부 통과하고, enforce_min_one_owner 트리거는 BEFORE UPDATE OR DELETE라 INSERT를 막지 않는다.
(4) 복구 후 권한이 실제로 되살아난다: 20260721010001_audit_hardening.sql의 is_member()는 `m.active AND m.user_id = auth.uid()`만 보고 role을 보지 않으므로 pending 행으로 true가 되고, board_posts/board_comments의 member_insert 정책이 통과된다. 앱 쪽 requireMember(auth.ts:122-143)도 role 검사가 없어 통과한다. /login에도 회원 여부 게이트가 없다(app/login/page.tsx). 삭제 전에는 명부 행이 없어 is_member()=false로 글쓰기가 막혔으므로, heal이 곧 권한 복원이다.
(5) 부수 효과도 사실이다: healOrphanMember가 true를 반환하면 claimAdminAccount가 null(성공)을 반환하고, 화면은 signInWithPassword 실패 후 '가입은 완료됐어요…'를 띄운다(signup/page.tsx:79-83) → 이메일 존재 여부까지 구분 노출된다.
상위 레이어 방어(RLS·트리거·페이지 가드) 어디에도 이 경로를 막는 것이 없다. 위치(admin-signup.ts:65)도 정확하다. 인증되지 않은 요청이 owner의 자격 박탈 조치를 무효화하므로 high 유지.

</details>

---

## 4. [HIGH] 자식 레코드 delete-then-insert가 트랜잭션 없이 실행 — insert 중 한 번만 실패해도 참석자/안건/결정/액션아이템 전체가 영구 소실

- **위치**: `src/lib/actions/meetings/children.ts:10`
- **분류**: data-loss · 회의록

**무엇이 잘못됐나**

replaceMeetingChildren은 4개 자식 테이블(meeting_attendees/agendas/decisions/action_items)을 **먼저 전부 DELETE**한 뒤에야 INSERT를 시작한다. 8번의 독립적인 PostgREST 왕복이며 트랜잭션이 없다. 따라서 어느 INSERT 하나라도 실패하면 (1) 이미 지워진 4개 테이블의 기존 데이터는 복구되지 않고, (2) early return 때문에 뒤쪽 카테고리(결정사항·액션아이템)는 INSERT 시도조차 못 하며, (3) updateMeeting에서는 부모 meetings 행이 이미 커밋된 뒤라 제목/날짜만 새 값이고 본문은 통째로 빈 회의록이 된다. 사용자에게는 '회의록 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'라는, 아무것도 저장되지 않았다는 의미의 메시지만 표시되어 데이터가 이미 파괴된 사실을 알 수 없다. 되돌리기 수단도 없다(audit payload에 before가 없고 history 복원은 meetings를 지원하지 않음).

**재현**

1) 참석자 5명·안건 3개·결정사항 4개·액션아이템 3개가 들어있는 기존 회의록의 /admin/meetings/[id]/edit 진입. 2) 안건 '논의내용' 칸에 NUL 문자(U+0000)나 짝 없는 서로게이트가 섞인 텍스트를 붙여넣는다(PDF·외부 시스템에서 복사한 텍스트에 흔함). 3) 저장. → meetings UPDATE 성공 → 4개 테이블 DELETE 성공 → attendees INSERT 성공 → agendas INSERT에서 Postgres가 'unsupported Unicode escape sequence   cannot be converted to text'로 거부 → 함수가 즉시 return. 결과: 결정사항 4개와 액션아이템 3개는 DELETE만 되고 INSERT되지 않아 완전 소실, 안건 3개도 소실, 화면에는 '저장에 실패했습니다'만 표시. 목록으로 돌아가 회의록을 열면 참석자만 남고 본문이 비어 있다. (NUL/서로게이트가 아니어도 Supabase 일시 오류·함수 타임아웃 등 8회 왕복 중 아무 지점의 실패로 동일 결과)

**수정 방향**

delete+insert 전체를 하나의 Postgres 함수(SECURITY DEFINER + admin_can_edit() 체크)로 옮겨 RPC 한 번으로 원자적으로 처리한다. 차선책으로도 최소한 (a) 모든 INSERT를 먼저 수행할 수 있도록 신규 행을 삽입한 뒤 예전 행을 삭제하거나, (b) 실패 시 삭제한 원본을 메모리에 보관했다가 재삽입하는 보상 로직을 넣고, 실패 메시지에 '기존 항목이 손실되었을 수 있음'을 명시해야 한다.

<details><summary>반증 검증 근거</summary>

children.ts:10-21에서 4개 테이블을 for 루프로 전부 DELETE한 뒤, 23행부터 순차 INSERT한다. 각 호출은 별개의 PostgREST 왕복이고 트랜잭션·RPC 래핑이 전혀 없으며, 어느 단계든 `if (error) return { error: ... }`로 즉시 빠져나가면서 이미 지운 데이터를 복구하지 않는다. updateMeeting(mutations.ts:74-89)은 meetings UPDATE가 먼저 커밋된 뒤 replaceMeetingChildren을 부르므로, 중간 실패 시 부모는 새 값·본문은 빈 상태로 남는다. 상위 방어막도 없다: RLS는 meeting_* 4개 테이블 모두 `admin_can_edit()`로 DELETE/INSERT를 동일 조건으로 허용(20260630010002_admin_role_policies.sql:49-71)하므로 DELETE만 통과하고 INSERT만 막히는 비대칭 차단이 아니라, 오히려 어떤 원인(일시 오류·함수 타임아웃·  포함 텍스트로 인한 Postgres 22P05)으로든 INSERT가 깨지면 그대로 파괴된다. 스키마(20260630000001_meeting_minutes.sql:19-50)에도 부분 실패를 막는 제약이 없다. 되돌리기 경로도 없음(logAudit payload는 after만, restoreEntry는 meetings 미지원). 다만 보고서의 '영구 소실'은 다소 과장인데, 실패해도 브라우저의 참석자/안건 state(MeetingForm useState)는 남아 재저장으로 복구될 여지가 있다. 그래도 DB가 파손된 채 '저장에 실패했습니다'만 뜨는 것은 확실한 결함이라 high 유지.

</details>

---

## 5. [HIGH] 버전 복원(restoreNewsVersion)이 GENERATED ALWAYS 식별자 컬럼에 id를 명시 삽입해 항상 실패

- **위치**: `src/lib/actions/news/mutations.ts:191`
- **분류**: error-handling · 소식/언론보도 CRUD

**무엇이 잘못됐나**

news.id는 `BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`다(supabase/migrations/20260311_create_admin_tables.sql:3, 이후 이 컬럼을 바꾸는 마이그레이션 없음). restoreNewsVersion은 `supabase.from("news").upsert({ id: row.id, ... }, { onConflict: "id" })`를 호출하는데, postgrest-js의 upsert는 PATCH가 아니라 POST(=INSERT ... ON CONFLICT DO UPDATE)이며 본문에 담긴 id를 그대로 INSERT 대상 컬럼에 포함시킨다(node_modules/@supabase/postgrest-js/src/PostgrestQueryBuilder.ts:375~). PostgreSQL은 GENERATED ALWAYS 식별자 컬럼에 값을 명시하면 ON CONFLICT 분기에 도달하기 전 rewrite 단계에서 `cannot insert a non-DEFAULT value into column "id"`(SQLSTATE 428C9)로 실패한다. 따라서 소식 버전 복원은 데이터 상태와 무관하게 100% 실패하고, friendlyNewsError가 원인을 삼켜 '저장 중 오류가 발생했습니다. 다시 시도해주세요.'라는 무의미한 문구만 남는다. 실수로 지운/덮어쓴 소식을 되살리는 유일한 수단이 죽어 있다.

**재현**

1) editor로 /admin/news에서 아무 소식이나 수정하거나 삭제해 audit_log에 payload.before가 있는 news 항목을 만든다. 2) /admin/history 접속 → 해당 news 항목의 '이 버전 복원' 클릭 → confirm 확인. 3) 복원되지 않고 '저장 중 오류가 발생했습니다. 다시 시도해주세요.'만 표시된다. DB의 news 행은 전혀 변하지 않는다. (timeline_events도 같은 스키마·같은 upsert 패턴이라 동일하게 실패한다.)

**수정 방향**

소식은 소프트 삭제만 하므로 대상 행은 항상 존재한다. upsert 대신 `supabase.from("news").update({ slug, title, summary, content, date, category, source_url, source_name, thumbnail_url, is_deleted }).eq("id", row.id).select(...).single()`로 바꾸고, 매칭 행이 0건이면 '복원 대상 소식을 찾을 수 없습니다' 에러를 반환하라. upsert를 유지해야 한다면 payload에서 id를 빼고 onConflict를 slug로 하거나, 스키마를 GENERATED BY DEFAULT AS IDENTITY로 바꿔야 한다.

<details><summary>반증 검증 근거</summary>

세 층을 모두 확인했다. (1) 스키마: supabase/migrations/20260311_create_admin_tables.sql:3 'id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY', 이후 마이그레이션에서 news 컬럼을 바꾸는 ALTER는 'ALTER TABLE news ENABLE ROW LEVEL SECURITY' 하나뿐(grep 결과). timeline_events도 34행에서 동일. (2) 클라이언트: postgrest-js PostgrestQueryBuilder.ts:399~404 method='POST' + Prefer: resolution=merge-duplicates + on_conflict=id — 즉 PATCH가 아니라 INSERT ... ON CONFLICT DO UPDATE이고 본문에 담긴 id가 그대로 INSERT 대상 컬럼이 된다. OVERRIDING SYSTEM VALUE는 붙지 않는다. (3) PostgreSQL은 GENERATED ALWAYS 식별자에 non-DEFAULT 값을 넣으면 rewrite 단계에서 ERRCODE_GENERATED_ALWAYS(428C9) 'cannot insert a non-DEFAULT value into column id'로 실패하며, ON CONFLICT 분기 도달 여부와 무관하다. 보강 증거: 같은 코드베이스에서 실제로 동작하는 page-content.ts:51의 upsert는 id를 payload에 넣지 않고 content_key로만 onConflict한다(page_content.id도 GENERATED ALWAYS). 도달성도 확인: useVersionHistoryManager.ts의 handleRestore → restoreNewsVersionAction(entry.payload) → parseNewsAuditRow가 payload.before를 읽고(audit-row.ts:36), update/delete/restore 액션이 before를 남기므로(mutations.ts:112·139·167) 실제로 호출된다. friendlyNewsError(form.ts:65~73)는 'duplicate key'가 아니면 '저장 중 오류가 발생했습니다'로 원인을 삼킨다. 라이브 DB 조회는 권한 거부로 불가했으나 저장소 마이그레이션이 스키마의 유일한 소스이며 CLI db push로 적용된다는 점을 근거로 CONFIRMED.

</details>

---

## 6. [HIGH] 소식 버전 복원이 항상 실패한다 — GENERATED ALWAYS 식별자 컬럼에 id를 명시해 upsert

- **위치**: `src/lib/actions/news/mutations.ts:193`
- **분류**: data-loss · 감사로그·버전 히스토리

**무엇이 잘못됐나**

news.id는 `BIGINT GENERATED ALWAYS AS IDENTITY`(supabase/migrations/20260311_create_admin_tables.sql:3)로 정의돼 있다. restoreNewsVersion은 `upsert({ id: row.id, ... }, { onConflict: "id" })`로 id를 명시적으로 보내는데, PostgREST가 만드는 INSERT의 컬럼 목록에 id가 포함되므로 PostgreSQL이 rewrite 단계에서 `ERROR 428C9: cannot insert a non-DEFAULT value into column "id"`를 던진다. ON CONFLICT DO UPDATE로 충돌이 해소되는지와 무관하게 INSERT 문 자체가 거부된다. 즉 /admin/history의 '이 버전 복원'은 소식에 대해 단 한 번도 성공한 적이 없다. 에러 메시지에 'duplicate key'가 없으므로 friendlyNewsError가 원인을 숨긴 채 "저장 중 오류가 발생했습니다"만 노출한다. (로컬 postgres:16으로 동일 스키마·동일 SQL을 재현해 확인함.)

**재현**

1) editor로 로그인 → /admin/news에서 아무 소식이나 제목을 수정해 저장(감사 로그에 update 항목 + payload.before 생성). 2) /admin/history 이동 → 방금 항목의 '이 버전 복원' 클릭 → confirm 승인. 3) 결과: DB는 전혀 변경되지 않고 화면에 "저장 중 오류가 발생했습니다. 다시 시도해주세요."만 표시된다. 서버 로그의 Postgres 에러는 `cannot insert a non-DEFAULT value into column "id" / Column "id" is an identity column defined as GENERATED ALWAYS`. 몇 번을 눌러도 영원히 복원되지 않는다.

**수정 방향**

upsert 대신 `supabase.from("news").update({...필드}).eq("id", row.id)`로 바꾸고, 대상 행이 없을 때만 id 없이 insert 하도록 분기한다(하드 삭제가 없으므로 사실상 update만으로 충분). 굳이 upsert를 유지하려면 마이그레이션으로 `ALTER TABLE news ALTER COLUMN id SET GENERATED BY DEFAULT`로 바꾸고 시퀀스 충돌(setval) 대비까지 해야 한다. 어느 쪽이든 복원 성공 여부를 실제로 확인하는 스모크 절차가 필요하다.

<details><summary>반증 검증 근거</summary>

실증 검증했다. 로컬 Supabase 스택(postgrest v14.5 + postgres 17.6)에 `id bigint generated always as identity primary key` 프로브 테이블을 만들고 supabase-js와 동일한 요청(`?on_conflict=id` + `Prefer: resolution=merge-duplicates` + 본문에 id 포함)을 보낸 결과, PostgREST가 만든 SQL은 `INSERT INTO "public"."..."("id", "name") SELECT ... ON CONFLICT("id") DO UPDATE SET ...`였고 Postgres가 `ERROR: cannot insert a non-DEFAULT value into column "id" / DETAIL: Column "id" is an identity column defined as GENERATED ALWAYS / HINT: Use OVERRIDING SYSTEM VALUE`로 거부했다(HTTP 400). PostgREST는 OVERRIDING SYSTEM VALUE를 붙이지 않는다. 스키마 쪽도 확인: 20260311_create_admin_tables.sql:3 `id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`이고, 전체 마이그레이션에 `ALTER COLUMN id ... SET GENERATED`나 `DROP IDENTITY`가 전혀 없다(grep 결과 ALTER COLUMN은 admin_members.role DEFAULT 변경 1건뿐). 코드는 news/mutations.ts:191-206에서 `upsert({ id: row.id, ... }, { onConflict: "id" })`로 id를 명시하므로 충돌 해소 여부와 무관하게 rewrite 단계에서 거부된다. 도달 경로도 살아있다: VersionHistoryEntryCard.tsx:4-9의 isRestorable이 news+payload.before가 있으면 버튼을 렌더하고, useVersionHistoryManager.ts:19-21이 restoreNewsVersionAction(entry.payload)를 호출하며, parseNewsAuditRow가 before에서 id를 뽑는다. 에러 문자열에 'duplicate key'가 없으므로 friendlyNewsError(news/form.ts:65-73)가 "저장 중 오류가 발생했습니다. 다시 시도해주세요."만 반환하는 것도 그대로 맞다. 다만 심각도는 조정한다 — 기존 데이터가 손상·유실되지 않고 항상 소리내어 실패하므로 data-loss라기보다 '복구 기능 전면 불능'이다.

</details>

---

## 7. [HIGH] 타임라인 버전 복원이 항상 실패한다 — 동일한 GENERATED ALWAYS id upsert

- **위치**: `src/lib/actions/timeline/mutations.ts:209`
- **분류**: data-loss · 감사로그·버전 히스토리

**무엇이 잘못됐나**

timeline_events.id도 `BIGINT GENERATED ALWAYS AS IDENTITY`(20260311_create_admin_tables.sql:34)인데 restoreTimelineVersion이 `upsert({ id: row.id, ... }, { onConflict: "id" })`로 id를 명시한다. news와 같은 428C9 에러로 INSERT가 거부되어 타임라인 버전 복원 기능 전체가 무동작이다. friendlyTimelineError가 원인을 삼켜 "저장 중 오류가 발생했습니다" 계열 메시지만 나온다.

**재현**

1) editor로 로그인 → /admin/timeline에서 항목 하나의 설명을 수정해 저장. 2) /admin/history → 해당 timeline_events update 항목의 '이 버전 복원' 클릭. 3) 결과: 타임라인 데이터는 그대로이고 에러 메시지만 표시. Postgres 로그에 `cannot insert a non-DEFAULT value into column "id"`. 복원은 절대 성공하지 않는다.

**수정 방향**

news와 동일하게 `update(...).eq("id", row.id)`로 전환하거나 identity를 GENERATED BY DEFAULT로 변경한다. 두 파일이 같은 결함을 복제하고 있으므로 복원 로직을 공통 헬퍼로 뽑고 한 곳에서 고치는 편이 안전하다.

<details><summary>반증 검증 근거</summary>

1번과 동일한 실증 근거가 그대로 적용된다. 20260311_create_admin_tables.sql:34에서 `timeline_events.id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY`이고 이후 identity를 바꾸는 마이그레이션이 없다. timeline/mutations.ts:207-221이 `upsert({ id: row.id, date, year, ... }, { onConflict: "id" })`로 id를 본문에 실어 보내므로 PostgREST가 id를 INSERT 컬럼 목록에 포함시키고 Postgres가 428C9로 거부한다(로컬에서 동일 형태 SQL·에러 재현 완료). friendlyTimelineError(timeline/form.ts)도 'duplicate key'가 아니면 일반 메시지로 뭉개므로 원인이 감춰지는 것도 맞다. useVersionHistoryManager.ts:22-24가 timeline_events 항목을 restoreTimelineVersionAction으로 보내므로 경로도 실재한다. 심각도만 high로 조정(데이터 훼손 없음, 기능 전면 불능).

</details>

---

## 8. [HIGH] editor가 audit_log에 임의 행을 삽입해 감사 이력을 위조·은닉할 수 있다

- **위치**: `supabase/migrations/20260701000001_admin_role_security_hardening.sql:17`
- **분류**: auth-bypass · 감사로그·버전 히스토리

**무엇이 잘못됐나**

audit_log의 INSERT 정책은 `WITH CHECK (admin_can_edit())`뿐이고 컬럼 레벨 GRANT 제한이 없다(board_posts처럼 REVOKE/GRANT(컬럼)를 적용한 흔적이 없음). user_email·created_at·table_name·action·payload 전부 클라이언트가 지정한 값이 그대로 저장되며, 이를 서버 세션과 대조하는 트리거·CHECK·DEFAULT 강제가 없다. 따라서 editor는 브라우저의 anon 키 + 자기 JWT로 /rest/v1/audit_log에 직접 POST해 (a) 자기 변경을 다른 관리자(owner) 이메일로 귀속시키거나 (b) created_at을 미래로 둔 더미 150건을 넣어 실제 이력을 화면 밖으로 밀어낼 수 있다. UPDATE/DELETE 정책은 없어 막히지만, 조회가 최신 150건 고정(src/app/admin/history/page.tsx:5)이라 INSERT만으로도 감사 이력이 사실상 소거된다.

**재현**

1) editor 계정으로 로그인한 브라우저 콘솔에서 supabase-browser 클라이언트(또는 fetch + anon 키 + Authorization: Bearer <access_token>)로 다음을 실행: `supabase.from('audit_log').insert(Array.from({length:150},(_,i)=>({table_name:'news',record_id:1,action:'update',user_email:'owner@example.com',created_at:new Date(Date.now()+86400000*(i+1)).toISOString()})))`. 2) 요청이 201로 성공한다. 3) /admin/history를 열면 목록이 위조 항목 150건으로 가득 차고, 실제 변경 이력은 limit 150 밖으로 밀려나 어떤 필터로도 볼 수 없다. 또한 위조 항목은 owner가 한 것으로 표시된다.

**수정 방향**

(1) audit_log에서 authenticated의 INSERT 권한을 컬럼 단위로 축소하고(created_at 제외), `user_email`은 `DEFAULT (auth.jwt()->>'email')` + BEFORE INSERT 트리거로 세션 값을 강제 덮어쓴다. `created_at`도 트리거에서 now()로 강제한다. (2) INSERT 정책 WITH CHECK에 `user_email = auth.jwt()->>'email'` 조건을 추가한다. (3) 근본적으로는 logAudit을 SECURITY DEFINER RPC로 옮기고 authenticated의 audit_log 직접 INSERT를 회수한다.

<details><summary>반증 검증 근거</summary>

스키마와 정책을 전수 확인했고 반증 근거를 찾지 못했다. audit_log에 대한 마이그레이션은 grep 결과 20260313(생성) / 20260318(action CHECK) / 20260319(entity_key·payload 컬럼) / 20260630010002(역할 기반 정책) / 20260701000001(최종 INSERT 정책) 다섯 개뿐이고, 최종 상태는 20260701000001_admin_role_security_hardening.sql:17-19의 `CREATE POLICY "audit_editor_insert" ... FOR INSERT TO authenticated WITH CHECK (admin_can_edit())`가 전부다. UPDATE/DELETE 정책이 없어 수정·삭제는 막히지만, user_email·created_at·table_name·action·payload에 대한 컬럼 레벨 REVOKE/GRANT가 없고(같은 파일 151-155행에서 board_posts에는 정확히 그 기법을 적용해 둔 것과 대비된다) 서버 세션과 대조하는 트리거나 CHECK도 없다. created_at은 `TIMESTAMPTZ DEFAULT NOW()`(20260313_audit_log.sql:8)일 뿐이라 클라이언트 값이 그대로 들어간다. anon 키는 NEXT_PUBLIC_*이라 번들에 노출되고 editor는 자기 자격증명으로 직접 로그인해 JWT를 얻을 수 있으므로 /rest/v1/audit_log에 임의 행을 넣는 경로가 실재한다. 조회는 getAuditEntries가 created_at DESC + limit 150 고정(data/audit.ts:18-22, admin/history/page.tsx:5)이고 UI에 기간/페이지네이션이 없으므로, 미래 시각 150건 삽입만으로 실제 이력이 화면에서 완전히 사라지는 것도 맞다. 다만 editor는 이미 콘텐츠 편집 권한자이므로 '권한 상승'이 아니라 '감사 무결성 훼손·책임 전가'로 성격을 재분류한다.

</details>

---

## 9. [MEDIUM] 버전 히스토리가 audit_log 최신 150건만 읽어와 클라이언트에서 필터링 — 소식·타임라인 복원 지점이 조용히 사라지고 "기록 없음"이라는 거짓 안내가 뜬다

- **위치**: `src/app/admin/history/page.tsx:5`
- **분류**: data-loss · 누락 영역

**무엇이 잘못됐나**

`/admin/history`는 `getAuditEntries(150)`으로 audit_log 전체에서 created_at 내림차순 최신 150행만 서버에서 가져온다(src/lib/data/audit.ts:14-25). 그런데 '페이지/소식/타임라인' 필터는 서버 재조회가 아니라 그 150건 배열에 대한 클라이언트 필터다(useVersionHistoryManager.ts:38-41 `entries.filter(e => e.table_name === filter)`). audit_log은 page_content(인라인 편집·사이트 빌더 저장마다 bulk_update 1건), news, timeline_events, meetings, media_library, admin_members, board_posts, board_reports가 전부 공유하는 단일 테이블이다. 따라서 인라인 편집·회의록·미디어 작업이 150건 쌓이면 그보다 오래된 news/timeline 항목은 히스토리 화면에서 완전히 사라진다. 페이지네이션도 '더 보기'도 없어 복원 경로가 아예 끊긴다. 게다가 이때 목록은 VersionHistoryList.tsx:24-28의 빈 상태 문구 "아직 기록된 변경 내역이 없습니다."를 출력하는데, DB에는 해당 항목의 감사 기록이 멀쩡히 남아 있으므로 사실과 다른 안내다.

**재현**

1) editor로 로그인해 소식 1건을 수정한다(audit_log에 news update 1행 + payload.before 생성). 2) 이어서 홈/스토리 페이지에서 인라인 편집 저장을 150회 하거나(저장 1회당 page_content bulk_update 1행), 미디어 업로드·회의록 수정 등을 섞어 audit_log에 150행을 더 쌓는다. 3) /admin/history 접속 → '소식' 필터 클릭. → 기대: 1)에서 만든 news update 항목과 '이 버전 복원' 버튼이 보인다. 실제: 목록이 비고 "아직 기록된 변경 내역이 없습니다."가 표시되며, 해당 소식의 이전 버전으로 되돌릴 방법이 UI에서 완전히 사라진다.

**수정 방향**

필터를 서버 쿼리로 내린다. `getAuditEntries(limit, tableName?)`에 `.eq("table_name", filter)`를 추가하고 /admin/history를 `searchParams`(filter, page) 기반으로 바꿔 필터별로 최신 N건을 각각 조회한다. 최소한 '더 보기'(offset 페이지네이션)를 붙이고, 빈 상태 문구를 "현재 조회 범위(최근 N건)에 해당 항목이 없습니다"로 바꿔 잘림 사실을 드러낸다.

<details><summary>반증 검증 근거</summary>

모든 연결 고리를 코드에서 직접 확인했다. (1) src/app/admin/history/page.tsx:5 `const entries = await getAuditEntries(150);` — 서버는 150건만 넘긴다. (2) src/lib/data/audit.ts:18-22 `.from("audit_log").select("*").order("created_at", {ascending:false}).limit(limit)` — table_name 조건 없이 단일 테이블 전체에서 최신순 150행. (3) useVersionHistoryManager.ts:38-41 `filter === "all" ? entries : entries.filter((entry) => entry.table_name === filter)` — 필터는 서버 재조회가 아니라 그 150건 배열에 대한 순수 클라이언트 필터이고, 훅 어디에도 offset/더보기/재조회가 없다. (4) audit_log가 단일 공유 테이블이라는 점도 확인했다 — grep 결과 logAudit 호출부가 page_content(page-content.ts:60 bulk_update, :101 delete), news, timeline_events, meetings, storage.images, admin_members, board_posts, board_comments, board_reports 전부에 흩어져 있다. 특히 savePageContentAction은 인라인 편집 저장 1회당 audit_log 1행을 남긴다(page-content.ts:60, 조기 반환은 changes.length===0일 때뿐). (5) 빈 상태 문구도 실재한다 — VersionHistoryList.tsx:24-28 `filteredEntries.length === 0 && ... "아직 기록된 변경 내역이 없습니다."`. 필터가 클라이언트 배열 기준이므로 DB에 해당 테이블 감사 기록이 남아 있어도 이 문구가 출력된다. (6) 복원 경로가 여기뿐이라는 것도 확인했다 — restoreNewsVersionAction/restoreTimelineVersionAction/restorePageContentVersionAction의 lib/actions 외 유일한 호출부가 useVersionHistoryManager.ts:17-23이다(grep 확인). 즉 150건 윈도우 밖으로 밀려난 news/timeline 항목은 UI에서 되돌릴 방법이 전혀 없다. 반증 시도 실패: 페이지네이션·검색·서버 재조회·대체 복원 화면 어느 것도 존재하지 않았다. 다만 데이터 자체는 DB에 온전히 남아 있으므로 'data-loss'라기보다 '복구 경로 상실 + 거짓 빈 상태 안내'이며, 임계치(150행 누적) 도달이 필요하다는 점에서 medium을 유지한다.

</details>

---

## 10. [MEDIUM] 첨부파일 삭제 액션의 오류를 클라이언트가 버려서 실패가 완전히 무음 처리됨 (+스토리지 먼저 삭제로 DB 정합성 깨짐)

- **위치**: `src/app/admin/meetings/MeetingAttachments.tsx:34`
- **분류**: error-handling · 회의록

**무엇이 잘못됐나**

handleDelete는 `await deleteMeetingAttachmentAction(id, meetingId)`의 반환값을 전혀 확인하지 않는다. 이 액션은 권한 부족('편집 권한이 없습니다'), 행 없음('첨부 파일을 찾을 수 없습니다'), DB 삭제 실패('첨부 삭제에 실패했습니다')를 모두 ActionState로 돌려주는데 전부 버려지므로 UI에는 어떤 피드백도 없다(성공 시에만 revalidatePath로 목록이 갱신되므로, 실패하면 화면이 그대로여서 사용자는 클릭이 먹지 않는 것으로만 인지). 더불어 서버 쪽은 storage.remove()를 먼저 하고 DB delete를 나중에 하며 storage 실패는 console.error로 무시하므로, DB delete만 실패하면 파일은 사라지고 meeting_attachments 행은 남는 '깨진 첨부'가 만들어진다. 이 행의 다운로드 버튼은 createSignedUrl이 실패해 null을 반환하고 handleDownload가 조용히 아무것도 하지 않아, 사용자 입장에서는 목록에 보이지만 받을 수도 지울 수도 없는 항목이 된다.

**재현**

A) viewer(읽기 전용) 계정으로 /admin/meetings/[id]/edit에 직접 접근(페이지에 editor 가드가 없어 열람 가능) → 첨부파일의 휴지통 아이콘 클릭 → 확인창 확인. → requireEditor가 '편집 권한이 없습니다'를 반환하지만 화면에는 아무 메시지도 뜨지 않고 파일도 그대로여서, 삭제가 왜 안 되는지 알 수 없다. B) 같은 회의록 편집 화면을 두 탭에서 열고 같은 첨부를 양쪽에서 삭제 → 두 번째 탭은 '첨부 파일을 찾을 수 없습니다'를 반환하지만 무음 처리되고, revalidate도 일어나지 않아 이미 없는 파일이 목록에 계속 남는다.

**수정 방향**

handleDelete를 useTransition + 에러 state로 감싸 `const res = await deleteMeetingAttachmentAction(...); if (res?.error) setError(res.error);` 형태로 표시한다(MeetingListActions와 동일 패턴). 서버 쪽은 DB 행 삭제를 먼저 성공시킨 뒤 스토리지 객체를 제거하도록 순서를 바꾸고, 스토리지 삭제 실패는 별도 정리 대상으로 로깅한다. handleDownload도 url이 null이면 사용자에게 실패를 알려야 한다.

<details><summary>반증 검증 근거</summary>

MeetingAttachments.tsx:32-35의 handleDelete는 `await deleteMeetingAttachmentAction(id, meetingId);`만 하고 반환값을 어디에도 쓰지 않는다. 이 컴포넌트에 에러 state가 존재하지 않아(state는 업로드용 useActionState뿐, 56행에서만 렌더) 서버가 돌려주는 '편집 권한이 없습니다'(meeting-attachments.ts:69), '첨부 파일을 찾을 수 없습니다'(76), '첨부 삭제에 실패했습니다'(87)가 전부 사라진다. 재현 A의 전제도 확인됨: 뷰어는 admin_members.role='viewer', active=true면 is_active_admin()이 true라(20260630010001_admin_members.sql:22-30) proxy.ts:56-69를 통과하고, /admin/meetings/[id]/edit/page.tsx에는 editor 가드가 없어 화면이 열린다 → 휴지통 클릭 시 requireEditor가 에러를 반환하지만 화면은 무반응. 재현 B(두 탭 중복 삭제)도 성립하며 실패 경로엔 revalidatePath가 없어 목록이 갱신되지도 않는다. 부수 주장도 사실: 79-86행이 storage.remove()를 먼저 하고 storageError는 console.error로 무시한 뒤 DB delete를 하므로, DB delete만 실패하면 파일 없는 행이 남고 그 행의 다운로드는 getMeetingAttachmentUrl이 null을 반환해 handleDownload(27-30)가 조용히 무시한다.

</details>

---

## 11. [MEDIUM] 저장 실패 시 React 19가 폼을 자동 리셋해 제목·날짜·목적·비고 등 입력값이 전부 날아감

- **위치**: `src/components/admin/MeetingForm.tsx:59`
- **분류**: ui-state · 회의록

**무엇이 잘못됐나**

React 19(설치된 19.2.3)의 startHostTransition은 `<form action={...}>` 제출 시 액션 실행 전에 requestFormReset을 **무조건** 예약하고, 트랜잭션이 끝나면 폼을 리셋한다(react-dom-client 소스 확인). MeetingForm의 기본정보 필드(title/meeting_no/meeting_date/meeting_time/location/format/status/purpose/notes)는 전부 defaultValue를 쓰는 비제어 입력이므로, 서버 액션이 성공이든 에러든 상관없이 리셋되어 defaultValue로 되돌아간다. 반면 참석자·안건·결정사항·액션아이템은 useState 제어 컴포넌트라 살아남는다. 그래서 저장 실패 시 '에러 메시지 + 하위 항목은 그대로 + 기본정보만 백지'라는 상태가 되고, 사용자가 눈치채지 못한 채 다시 저장하면 제목이 빈(또는 예전) 값으로 덮어써질 위험까지 있다.

**재현**

1) viewer(읽기 전용) 계정으로 /admin/meetings/new에 직접 접근(페이지에 editor 가드 없음). 2) 제목·회차·날짜·장소·목적·비고를 모두 채우고 참석자/안건도 추가한 뒤 '회의록 저장' 클릭. 3) requireEditor가 '편집 권한이 없습니다. (읽기 전용 계정)'을 반환 → 에러 배너는 뜨지만 동시에 폼이 리셋되어 제목·회차·날짜·장소·목적·비고 입력이 전부 사라진다(참석자/안건 행만 남음). 편집 화면에서도 동일하게 미저장 수정분이 저장 전 값으로 되돌아간다.

**수정 방향**

기본정보 필드를 useState 제어 입력으로 바꾸거나, 서버 액션이 반환하는 ActionState에 입력값을 함께 실어 defaultValue를 그 값으로 되돌린다. 또는 폼 제출을 startTransition + requestFormReset 수동 제어 방식으로 바꿔 에러일 때는 리셋하지 않도록 한다.

<details><summary>반증 검증 근거</summary>

설치된 react-dom 19.2.3 소스에서 직접 확인했다. node_modules/react-dom/cjs/react-dom-client.development.js의 startHostTransition은 액션 래퍼 안에서 `requestFormReset$1(formFiber); return action(formData);` 순으로 **무조건** 리셋을 예약하고, 커밋 단계(같은 파일 15152행 `5 === fiber.tag && fiber.flags & 1024 && fiber.stateNode.reset()`)에서 DOM form.reset()이 실행된다. 액션이 에러 객체를 '반환'하는 것은 정상 완료이므로 리셋은 그대로 적용된다. MeetingForm.tsx:59가 `<form action={formAction}>`이고 기본정보 9개 필드(70~114행)는 전부 defaultValue 기반 비제어 입력이라 리셋 시 defaultValue로 되돌아간다 — new 페이지에서는 공백, edit 페이지에서는 저장 전 값으로 롤백(미저장 수정분 소실). 반면 참석자·안건·결정·액션아이템은 useState 제어값(42-55행)이라 살아남아, 보고서가 말한 '에러 배너 + 하위 항목 유지 + 기본정보만 백지' 상태가 실제로 만들어진다. 재현에 쓰인 viewer의 /admin/meetings/new 접근 가능성도 확인됨(new/page.tsx에 가드 없음, proxy는 viewer 통과).

</details>

---

## 12. [MEDIUM] 수정 화면이 옛 year를 hidden으로 재전송해, 날짜를 바꿔도 연도가 갱신되지 않는다

- **위치**: `src/components/admin/TimelineForm.tsx:64`
- **분류**: validation · 타임라인 CRUD

**무엇이 잘못됐나**

폼에는 연도 입력란이 없고 `<input type="hidden" name="year" value={initialData?.year ?? 0} />`만 있다. 신규 등록 시에는 year=0이 범위(2000~2100) 밖이라 validateTimelineForm이 date 텍스트에서 연도를 추출하지만(form.ts:30-33), 수정 시에는 기존 year가 범위 안이므로 그 값이 그대로 채택되고 새로 입력한 date 텍스트는 무시된다. 날짜 필드 도움말은 '화면에 그대로 표시됩니다'라고만 안내하므로 관리자는 연도가 따로 저장된다는 사실을 알 수 없다. 결과적으로 표시 날짜와 연도 필터 분류가 어긋나고, UI 어디에도 이를 교정할 수단이 없다.

**재현**

1) /admin/timeline/new 에서 날짜 '2019년 5월', 제목/설명/카테고리 입력 후 등록 → year=2019 저장. 2) 목록 → 수정 → 날짜를 '2026년 5월'로 고치고 저장. 3) /admin/timeline 목록에 '2026년 5월 · 2019년'으로 모순 표시. 4) /timeline 의 연도 필터에서 '2026년'을 눌러도 이 카드는 안 보이고 '2019년' 탭에 나타난다. 재수정해도 hidden year가 계속 2019를 재전송하므로 영구히 교정 불가.

**수정 방향**

수정 모드에서도 date 텍스트로부터 연도를 재추출하도록 validateTimelineForm의 우선순위를 바꾸거나(추출값 우선, hidden은 추출 실패 시 폴백), TimelineForm에 연도 select/number 입력란을 노출해 관리자가 직접 지정하게 한다. 최소한 저장 전에 '입력한 날짜에서 읽은 연도(2026)와 저장될 연도(2019)가 다릅니다' 경고를 띄워야 한다.

<details><summary>반증 검증 근거</summary>

TimelineForm.tsx:64 `<input type="hidden" name="year" value={initialData?.year ?? 0} />` 확인. 폼 어디에도 연도 입력 필드가 없다(34-96 전체 확인). 수정 경로에서 initialData는 [id]/edit/page.tsx:12,24의 `getTimelineById(eventId)` 결과이고 lib/data/timeline.ts:63-74 rowToTimelineEvent가 DB의 `row.year`를 그대로 실어 준다. 서버 측 form.ts:30-33은 `parsedYear >= 2000 && parsedYear <= 2100`이면 **그 값을 우선 채택**하고 그렇지 않을 때만 `extractYearFromDate(date)`로 폴백한다. 따라서 기존 year가 정상 범위인 수정 건은 date 텍스트를 아무리 고쳐도 year가 옛 값으로 고정되고, mutations.ts:113의 update가 그 값을 그대로 쓴다. 반면 신규 등록은 hidden year=0이라 date에서 추출된다 — 등록/수정 간 동작 불일치가 명백하고 의도된 설계로 보기 어렵다. 결과적으로 관리자 목록(admin/timeline/page.tsx:86 `{item.date} · {item.year}년`)에 모순 표기가 뜨고, TimelinePage.tsx:28의 `event.year === selectedYear` 연도 필터가 잘못된 탭에 배치한다. 재현 시나리오 그대로 성립.

</details>

---

## 13. [MEDIUM] OrderedSectionGroup이 sectionId 없는 자식을 통째로 버려 홈 소셜프루프 토스트·공유문구 편집 UI가 영구 미렌더

- **위치**: `src/components/builder/OrderedSectionGroup.tsx:47`
- **분류**: data-loss · 사이트 빌더

**무엇이 잘못됐나**

OrderedSectionGroup은 자식 중 `sectionId` prop이 있는 것만 childMap에 등록한 뒤, 최종 출력물을 `sectionOrder.map(id => childMap.get(id))`로만 구성한다(47~49행). 즉 sectionId가 없는 자식은 childMap에 들어가지 못하고 출력 배열에도 절대 포함되지 않아 **조용히 사라진다**. src/app/page.tsx는 `<OrderedSectionGroup>`을 홈 페이지의 최상위 래퍼로 쓰면서 그 안에 `<HomeSocialProofToast>`(115행)와 `{isEditMode && <HomeShareEditControls />}`(122행)를 넣어두었는데, 두 컴포넌트 모두 sectionId prop이 없다. 결과적으로 (1) useHomeSignatureActivity가 5초 후부터 8초 간격으로 최대 5회 토스트 상태를 켜지만 화면에는 아무것도 뜨지 않고(타이머·fetch만 낭비), (2) 편집 모드에서 HomeShareEditControls가 렌더되지 않는다. HomeShareEditControls는 home.share.title / home.share.text / home.share.copyAlert / home.toast.prefix / home.toast.suffix 5개 콘텐츠 키의 **유일한** 편집 진입점이므로(grep 확인: 해당 키를 stageChange하는 곳이 이 파일뿐), 이 문구들은 소비만 되고 관리자가 어디서도 수정할 수 없는 상태다.

**재현**

1) 공개 홈(/)에 접속해 서명이 1건 이상 있는 상태로 20초 이상 머문다 → '방금 OOO님이 서명했습니다' 토스트가 한 번도 뜨지 않는다(정상이면 5초 후 첫 토스트).
2) editor 이상 계정으로 로그인 후 홈에서 인라인 편집 모드를 켠다 → 좌측 하단 파란 테두리 공유문구 편집 패널(HomeShareEditControls)이 나타나지 않는다.
3) 그 결과 '공유 제목/공유 설명/복사 알림/토스트 앞문구/토스트 뒷문구' 5개 항목을 관리자 화면 어디에서도 수정할 수 없다.
(원인 확인: React DevTools 없이도 OrderedSectionGroup 47~49행이 sectionOrder에 있는 id만 출력하는 것으로 확정됨. 다른 페이지(story/press/gallery/en)는 OrderedSectionGroup 자식이 전부 ManagedSection이라 영향 없음 — 홈만 해당.)

**수정 방향**

OrderedSectionGroup에서 sectionId가 없는 자식을 버리지 말고 별도 배열(passthrough)로 모아 정렬된 섹션 뒤에 그대로 이어 붙여 렌더하도록 수정한다. 또는 즉시 조치로 src/app/page.tsx에서 HomeSocialProofToast와 HomeShareEditControls를 OrderedSectionGroup 바깥(프래그먼트 형제)으로 빼낸다. 추가로 개발 환경에서 sectionId 없는 자식이 들어오면 console.warn을 남겨 같은 실수가 재발하지 않게 한다.

<details><summary>반증 검증 근거</summary>

반증 시도 실패. 코드로 전부 확인됨. (1) OrderedSectionGroup.tsx 38~45행은 `typeof child.props.sectionId === "string"`인 자식만 childMap에 넣고, 47~49행 `sectionOrder.map((sectionId) => childMap.get(sectionId)).filter(...!== undefined)`가 최종 출력이다. 즉 childMap에 없는 자식은 출력에서 완전히 배제된다 — fallback으로 '나머지 자식 뒤에 붙이기' 같은 경로가 코드에 없다. (2) sectionOrder는 parseExistingSectionOrder(existing-section-data.ts:34-36)가 `defaultOrder.includes(id)`로 필터하므로 defaultOrder(HOME_SECTION_ORDER 7개) 밖의 id는 절대 들어올 수 없다 → DB 값으로도 우회 불가. (3) src/app/page.tsx:115-120 `<HomeSocialProofToast ... />`와 122행 `{isEditMode && <HomeShareEditControls />}`는 둘 다 sectionId prop이 없고, 함수형 컴포넌트라 React 19에서 defaultProps도 적용되지 않는다. (4) grep 결과 두 컴포넌트는 src/app/page.tsx 외 어디에서도 렌더되지 않는다(레이아웃·다른 페이지에 중복 렌더 경로 없음) → '상위 레이어가 이미 처리' 반증 불가. (5) useHomeSignatureActivity.ts는 5초 후 첫 토스트, 8초 간격 최대 5회로 setToastVisible(true)를 실제로 켜지만 소비처인 토스트 컴포넌트가 트리에서 제거돼 화면에 아무것도 뜨지 않는다. (6) home.share.title/text/copyAlert, home.toast.prefix/suffix 5개 키를 stageChange 가능한 편집 UI는 grep상 HomeShareEditControls.tsx 뿐이고(소비처는 HomeCtaSection.tsx:20-24, page.tsx:33-34), /admin 하위에 임의 content_key를 편집하는 범용 화면도 없다(page_content를 직접 쓰는 admin 라우트는 site-builder뿐이며 builder.* 키만 저장) → '다른 편집 진입점이 있다'는 반증도 성립하지 않는다. 다만 카테고리는 data-loss가 아니라 렌더링/기능 소실이고, 저장된 데이터가 파괴되지는 않으므로 심각도는 medium으로 정정한다.

</details>

---

## 14. [MEDIUM] 게시판 신고 생성에 대상 존재·사유 검증과 건수 제한이 없어 검토큐를 임의로 마비시킬 수 있다

- **위치**: `src/lib/actions/board.ts:165`
- **분류**: validation · 대시보드·서명·신고

**무엇이 잘못됐나**

reportTarget()은 REPORT_REASONS 화이트리스트만 앱 계층에서 검사하고, target_id가 실제 글/댓글인지 확인하지 않는다. 그런데 20260721040001 마이그레이션이 authenticated 역할에 board_reports의 (target_type, target_id, reporter_user_id, reason) 컬럼 INSERT를 직접 GRANT했고, RLS board_reports_member_insert는 is_member() AND reporter_user_id = auth.uid()만 검사한다. reason에 CHECK 제약도, 길이 제한도, target_id에 FK도 없다. 따라서 회원은 앱을 거치지 않고 REST로 존재하지 않는 target_id와 임의 문자열 사유를 무제한 삽입할 수 있다. UNIQUE 제약은 (target_type, target_id, reporter_user_id)라 target_id만 바꾸면 한 계정으로 무한 생성이 가능하다. 수신 측인 getReportQueue()(src/lib/data/board-reports.ts:26)는 limit도 status 필터도 없이 전체 신고를 읽어 JS로 그룹핑하므로 방어가 전혀 없다. 게다가 /admin/signup은 email_confirm:true로 이메일 확인 없이 즉시 활성 회원(pending)을 만들어 주므로 공격 문턱이 사실상 0이다. 신고 삽입에는 서명 API와 달리 rate limit도 없다.

**재현**

1) 누구나 /admin/signup에서 가입한다(admin-signup.ts:60 email_confirm:true → 이메일 확인 없이 즉시 active=true, role=pending 회원). 2) 로그인 후 브라우저 콘솔에서 클라이언트 번들에 들어 있는 anon 키와 본인 access token으로 POST /rest/v1/board_reports 를 반복 호출한다: body = {target_type:'post', target_id:i (i=1..20000), reporter_user_id:<내 uid>, reason:'X'.repeat(5000)}. RLS·GRANT를 모두 통과해 2만 건이 들어간다. 3) editor가 /admin/board-reports를 열면 getReportQueue가 2만 개 행을 전부 읽어 2만 개 카드를 렌더 → 페이지가 사실상 열리지 않고, 진짜 신고는 스팸에 파묻힌다. 4) 댓글 대상으로 같은 짓을 하면 board-reports.ts:65의 .in("id", [수만 건]) URL이 한계를 넘어 조회가 실패하는데 에러를 무시하므로(구조분해에서 error를 받지 않음) 모든 댓글 카드가 스니펫 없이 postId=0으로 렌더되고 '내용 보기'가 /board/0(404)로 간다.

**수정 방향**

(1) reportTarget에서 대상 행 존재를 select로 확인한 뒤 삽입. (2) DB에 CHECK (reason IN (...))와 length(reason) 상한을 추가하고, target_id 유효성은 트리거로 강제. (3) 사용자·시간당 신고 건수 rate limit 추가(서명 API의 트리거 방식 재사용). (4) getReportQueue에 status='pending' 기본 필터 + limit/페이지네이션 추가, 댓글/글 배치 조회의 error를 실제로 확인해 실패 시 화면에 경고 노출.

<details><summary>반증 검증 근거</summary>

반증하려 했으나 상위 레이어가 어디에서도 막지 못한다. (1) src/lib/actions/board.ts:165-177 reportTarget은 REPORT_REASONS 화이트리스트만 보고 target_id 존재 확인·건수 제한이 없다. (2) 20260707010001_board_reports.sql:2-11 — target_id는 BIGINT NOT NULL일 뿐 FK가 없고, reason은 제약 없는 TEXT이며 UNIQUE는 (target_type,target_id,reporter_user_id)뿐이라 target_id만 바꾸면 한 계정으로 무제한 삽입된다. (3) 20260721040001:34-36 `REVOKE INSERT ... GRANT INSERT (target_type, target_id, reporter_user_id, reason) ON public.board_reports TO authenticated` — status만 막았을 뿐 나머지 4컬럼 직접 INSERT는 허용된다. RLS board_reports_member_insert는 `is_member() AND reporter_user_id = auth.uid()`뿐이고(20260707010001:18-20), is_member()는 20260721010001:40-47에서 `active AND user_id = auth.uid()`만 보므로 role='pending'도 통과한다. (4) 공격 문턱: /signup(page.tsx)→claimAdminAccount(admin-signup.ts:57-61 email_confirm:true, 72-78 role:'pending', active:true)로 누구나 즉시 활성 회원이 된다. 보고가 쓴 '/admin/signup'은 실제로 redirect('/signup')일 뿐(src/app/admin/signup/page.tsx:4)이라 경로 표기만 다르고 결과는 동일하다. (5) 수신측 src/lib/data/board-reports.ts:26-29에 limit도 status 필터도 없고, board_reports 테이블에 트리거·rate limit이 전무하다(전체 마이그레이션 grep 결과 board_reports 관련 파일은 위 2개뿐). 따라서 '회원이 앱을 우회해 검증 없는 신고를 무제한 생성 → 검토큐가 스팸으로 뒤덮여 진짜 신고가 묻힌다'는 본체는 재현 가능하다. 다만 두 부분은 과장으로 정정한다: (a) Supabase 호스팅 PostgREST의 기본 max-rows(1000) 때문에 '2만 개 카드 렌더'는 보장되지 않는다(대신 최신 1000건이 전부 스팸이 되어 진짜 신고가 아예 사라지는 형태). (b) 그에 따라 board-reports.ts:64-65 `.in("id", commentIds)` URL 길이 초과 시나리오는 확증하지 못했다 — 단 error를 구조분해에서 받지 않아 실패를 삼키고 postId=0으로 남아 ReportsManager.tsx:64가 /board/0으로 링크하는 코드 사실 자체는 맞다. 인증 계정이 필요하고 권한 상승·정보 유출이 아니라 모더레이션 큐 가용성 훼손이므로 high→medium으로 조정한다.

</details>

---

## 15. [MEDIUM] 일반 회원의 게시판 활동은 audit_log RLS에 막혀 절대 기록되지 않는데, 코드는 실패를 삼키고 성공으로 진행한다

- **위치**: `src/lib/actions/board.ts:34`
- **분류**: error-handling · 누락 영역

**무엇이 잘못됐나**

게시판 액션 5곳(createBoardPost:34, updateBoardPost:49, deleteBoardPost:60, createBoardComment:88, deleteBoardComment:99)이 `logAudit(gate.supabase, ...)`를 호출한다. 여기서 `gate.supabase`는 `requireMember()`가 돌려준 '해당 회원'의 쿠키 클라이언트다(auth.ts:122-143 — requireMember는 active만 검사하므로 role이 pending/viewer인 회원도 통과). 그런데 audit_log의 INSERT 정책은 supabase/migrations/20260701000001_admin_role_security_hardening.sql:17-19에서 `audit_editor_insert ... WITH CHECK (admin_can_edit())`로 좁혀졌고, `admin_can_edit()`는 role이 owner/editor일 때만 true다(20260630010001:42-45, 20260721010001:30-38). 즉 pending·viewer 회원의 audit_log INSERT는 RLS에 100% 거부된다. logAudit(audit.ts:18-29)은 `supabase.from("audit_log").insert(...)`의 반환값을 검사하지 않고, postgrest-js는 RLS 거부 시 throw가 아니라 `{ error }`를 resolve하므로 try/catch도 아무것도 잡지 않는다. 결과적으로 회원의 글·댓글 작성/수정/삭제는 영구히 무기록으로 남고, 서버 로그에도 흔적이 없다. 신고 대응(누가 언제 무엇을 썼다가 지웠는지)에 필요한 근거가 통째로 비는데 모더레이션 UI는 이를 알 수 없다.

**재현**

1) /admin/signup으로 자가 가입한다(role=pending, active=true). 2) /mypage에서 닉네임을 설정한다. 3) /board/new에서 글을 쓴다 → 글은 정상 등록되고 오류도 없다. 4) owner로 /admin/history를 연다. → 기대: `board_posts create` 항목이 보인다. 실제: 아무 항목도 없다. 5) 대조군으로 editor가 같은 글에 '숨김'을 누르면(setPostHidden → requireEditor) `board_posts update` 항목은 정상으로 남는다. 즉 모더레이터의 행위만 기록되고 회원의 원 행위는 전혀 남지 않는다.

**수정 방향**

둘 중 하나로 정한다. (a) 회원 활동도 감사 대상이라면 audit_log 기록을 SECURITY DEFINER RPC(`log_audit(table_name, record_id, action, entity_key, payload)`)로 옮겨 회원 권한과 무관하게 삽입되게 하고, 그 RPC 안에서 user_email을 auth.jwt()로 서버가 채운다(감사로그 위조 이슈 동시 해결). (b) 회원 활동을 감사 대상에서 제외한다면 board 액션의 logAudit 호출을 제거해 '기록되고 있다'는 오해를 없앤다. 어느 쪽이든 logAudit은 insert의 `error`를 확인해 최소한 console.error로 남겨야 한다.

<details><summary>반증 검증 근거</summary>

체인 전체가 코드·마이그레이션에서 그대로 확인된다. (1) 호출 주체: board.ts:34,49,60,88,99가 `logAudit(gate.supabase, ...)`를 쓰고, gate는 requireMember()의 결과다. auth.ts:122-143의 requireMember는 admin_members에서 `.eq("active", true)`만 검사하고 role을 전혀 보지 않는다(`select("id, display_name")` — role 컬럼조차 읽지 않음). 따라서 role=pending/viewer도 통과한다. (2) 자가 가입 기본값이 pending인 것도 확인 — 20260701010001_signup_first_pending_role.sql:5 `ALTER COLUMN role SET DEFAULT 'pending'`. (3) RLS: 20260701000001_admin_role_security_hardening.sql:13-19가 기존 `audit_admin_insert`(is_active_admin)를 DROP하고 `audit_editor_insert ... WITH CHECK (admin_can_edit())`만 남긴다. admin_can_edit()는 20260630010001:42-45에서 `admin_role() IN ('owner','editor')`이고, admin_role()은 20260721010001:30-38에서 `role IN ('owner','editor','viewer')` 필터라 pending이면 NULL을 반환한다. pending → NULL IN (...) → NULL → WITH CHECK 실패, viewer → false → 실패. 즉 pending·viewer 회원의 audit_log INSERT는 예외 없이 거부된다. (4) 삼킴: lib/actions/audit.ts:18-29 `try { await supabase.from("audit_log").insert({...}); } catch { }` — 반환된 { error }를 확인하지 않고, postgrest-js는 RLS 거부(42501) 시 throw가 아니라 error를 담아 resolve하므로 catch도 로그도 걸리지 않는다. 호출부 역시 `await logAudit(...)`의 반환값을 쓰지 않고 바로 revalidatePath/redirect로 진행한다(board.ts:34-36 등). 결과적으로 회원 글·댓글 CRUD는 100% 무기록이고, 대조적으로 requireEditor를 쓰는 setPostHidden(board.ts:66-71)·setCommentHidden(:104-109)·resolveReports(:179-186)만 기록에 남는다. 반증 시도 실패: 이후 마이그레이션에서 audit_log INSERT 정책을 다시 넓히는 곳은 없었다(20260630010002:34-40의 audit_admin_insert는 20260701000001:14에서 DROP됨). 임계치 없이 항상 발생하는 결함이므로 medium 유지. 다만 board_posts/board_comments 행 자체는 소프트 삭제로 보존되어 최소한의 추적은 가능하므로 high는 아니다.

</details>

---

## 16. [MEDIUM] 첨부파일 20MB 안내와 실제 한도 불일치 — serverActions bodySizeLimit 6MB에 막혀 6MB 초과 파일은 오류 메시지 없이 실패

- **위치**: `src/lib/actions/meeting-attachments.ts:8`
- **분류**: upload · 회의록

**무엇이 잘못됐나**

uploadMeetingAttachmentAction은 MAX_SIZE를 20MB로 두고 UI도 '20MB 이하'라고 안내하지만, next.config.ts의 experimental.serverActions.bodySizeLimit이 '6mb'다. Next 16의 action-handler는 요청 본문 스트림이 이 한도를 넘는 순간 ApiError(413, 'Body exceeded 6mb limit')로 끊어버리므로 서버 액션 본문(=파일)이 6MB를 넘으면 액션 코드가 실행조차 되지 않는다. 즉 6MB~20MB 파일은 절대 업로드할 수 없고, 413 응답은 유효한 RSC/flight 페이로드가 아니어서 useActionState의 state에 담기지 못한다. 결과적으로 사용자에게는 친화적 오류 대신 아무 메시지도 없이 업로드가 실패하거나 에러 바운더리로 튄다. 뉴스·타임라인·미디어 폼에는 최근 커밋으로 클라이언트 용량 검증이 추가됐지만 회의록 첨부 폼(MeetingAttachments.tsx)에는 없어 사전 안내도 못 받는다.

**재현**

1) editor로 /admin/meetings/[id]/edit 진입. 2) 첨부파일 영역에서 10MB짜리 PDF(안내문상 20MB 이하이므로 허용되어야 함)를 선택하고 '업로드' 클릭. 3) 버튼이 '업로드 중...'으로 바뀐 뒤, 서버가 413으로 본문을 끊어 액션이 실행되지 않는다. 4) '파일 용량은 20MB 이하만 가능합니다' 같은 안내도, 어떤 오류 메시지도 표시되지 않고 첨부 목록에도 아무 변화가 없다(개발 모드에서는 'Body exceeded 6mb limit' 콘솔 오류).

**수정 방향**

두 값을 일치시킨다. 20MB를 지원하려면 next.config.ts의 bodySizeLimit을 파일 한도보다 크게(예: '21mb') 올리고, 반대로 6MB가 정책이면 MAX_SIZE와 UI 안내 문구를 6MB 미만으로 낮춘다. 추가로 MeetingAttachments.tsx의 file input에 onChange 클라이언트 용량 검증을 넣어 초과 시 즉시 안내한다(뉴스/타임라인 폼과 동일 패턴).

<details><summary>반증 검증 근거</summary>

next.config.ts의 `experimental.serverActions.bodySizeLimit: "6mb"`를 직접 확인했고, 설치된 next 16.1.6의 실제 구현(node_modules/next/dist/server/app-render/action-handler.js:557-570)에서 요청 본문을 sizeLimitTransform으로 스트리밍하며 누적 크기가 한도를 넘는 순간 `new ApiError(413, 'Body exceeded 6mb limit.')`로 콜백을 끊는 것을 확인했다. 이 차단은 액션 디코딩 단계에서 일어나므로 meeting-attachments.ts:20의 `file.size > MAX_SIZE(20MB)` 검사는 6MB~20MB 구간에서 실행조차 되지 않는다. MeetingAttachments.tsx:57의 file input에는 클라이언트 용량 검증이 없고(같은 저장소의 이미지 경로는 image-upload-limits.ts의 MAX_IMAGE_MB=5로 6mb 한도 아래에서 클라 검증까지 붙어 있어 대조가 명확하다), 60행 안내문은 '20MB 이하'라고 단언한다. 즉 안내와 실제 동작이 확실히 불일치한다. 다만 413 이후 클라이언트 화면이 '완전 무음'인지 에러 오버레이인지는 구현 세부라 단정하지 않는다 — 핵심(6MB 초과 파일은 친화적 안내 없이 실패)은 확정.

</details>

---

## 17. [MEDIUM] 제목 없는 안건·할일 없는 액션아이템이 경고 없이 통째로 버려져 입력한 본문이 사라짐

- **위치**: `src/lib/actions/meetings/form.ts:70`
- **분류**: validation · 회의록

**무엇이 잘못됐나**

validateMeetingForm은 agenda.title이 빈 문자열이면 그 행 전체를(작성된 discussion 포함) 필터로 제거하고, action_item도 task가 비면 owner/due_text가 채워져 있어도 통째로 제거한다. attendee 역시 name이 비면 role이 있어도 버린다. 그런데 클라이언트 폼에는 이 필드들에 required 표시도 검증도 없고, 저장이 '성공'으로 처리되어 /admin/meetings로 리다이렉트되기 때문에 사용자는 자기가 쓴 내용이 버려졌다는 사실을 전혀 통보받지 못한다. 회의 논의내용처럼 긴 텍스트가 조용히 증발하는 경로다.

**재현**

1) /admin/meetings/[id]/edit(또는 new)에서 '안건 / 논의내용' 추가 → '안건 제목'은 비워두고 '논의내용' 텍스트영역에만 회의 전문 수백 자를 작성. 2) 액션아이템도 추가해 '담당'과 '기한'만 입력하고 '할 일'은 비워둠. 3) 저장 → 성공 처리되어 목록으로 이동. 4) 해당 회의록 상세를 열면 그 안건과 액션아이템 자체가 존재하지 않는다. 작성한 논의내용 전문이 아무 경고 없이 소실.

**수정 방향**

제목이 비었지만 discussion이 채워진 행(또는 task가 비었지만 owner/due_text가 채워진 행)은 필터로 버리지 말고 '안건 제목을 입력해주세요' 같은 검증 에러로 반환해 저장을 막는다. 클라이언트 폼에서도 해당 입력에 required/실시간 안내를 추가한다. 완전히 빈 행만 조용히 무시하는 것이 안전하다.

<details><summary>반증 검증 근거</summary>

form.ts:70 `.filter((agenda) => agenda.title !== "")`가 discussion이 채워져 있어도 행 전체를 제거하고, 97행 `.filter((item) => item.task !== "")`가 owner/due_text만 있는 액션아이템을, 56행이 role만 있는 참석자를 동일하게 버린다. 그런데 이 필드들은 검증 에러를 만들지 않고 그대로 성공 경로로 흘러가 mutations.ts:59/97의 redirect('/admin/meetings')까지 도달한다 — 사용자는 성공으로 인지한다. 클라이언트에도 방어가 없다: MeetingForm.tsx:135(안건 제목), 161(할 일) 입력에는 required도, 제출 전 경고도 없다(같은 폼에서 title만 70행에 required가 붙어 있어 대조된다). DB 스키마의 NOT NULL(meeting_agendas.title 등)은 이 필터 때문에 애초에 발동하지 않으므로 상위 방어막이 아니다. 결과적으로 논의내용 수백 자를 쓰고 제목만 비우면 아무 경고 없이 통째로 사라지는 것이 맞다. '빈 행 정리' 의도는 이해되나, 본문이 있는 행까지 무통보로 버리는 것은 의도된 설계로 보기 어렵다.

</details>

---

## 18. [MEDIUM] createMeeting: 자식 저장 실패 시 이미 생성된 부모 회의록이 남아 재시도하면 빈 회의록이 중복 생성됨

- **위치**: `src/lib/actions/meetings/mutations.ts:50`
- **분류**: data-loss · 회의록

**무엇이 잘못됐나**

createMeeting은 meetings INSERT를 먼저 커밋한 뒤 replaceMeetingChildren을 호출한다. 자식 INSERT가 실패하면 childResult.error를 그대로 반환하고 끝나며, 방금 만든 meetings 행을 롤백/삭제하지 않는다. 사용자에게는 '회의록 저장에 실패했습니다'만 보이므로 아무것도 만들어지지 않았다고 판단해 다시 저장하게 되고, 그때마다 본문 없는 회의록 행이 하나씩 더 쌓인다. 게다가 이 시점에는 audit 로그도 남지 않아(에러 반환이 logAudit보다 앞) 히스토리로 추적도 불가능하다.

**재현**

1) /admin/meetings/new에서 제목 '기획회의 #3'과 참석자·안건을 입력하되 안건 논의내용에 Postgres가 거부하는 문자(U+0000 등)를 포함시킨다. 2) 저장 → meetings 행은 생성되고 agendas INSERT가 실패 → '회의록 저장에 실패했습니다' 표시, 목록으로 리다이렉트되지 않음. 3) 사용자가 다시 저장 → 같은 실패, 또 다른 meetings 행 생성. 4) /admin/meetings 목록에 '기획회의 #3'이 2건 이상, 모두 참석 0명·본문 없음 상태로 남는다.

**수정 방향**

자식 저장 실패 시 방금 insert한 meetings 행을 delete(보상 트랜잭션)하고 나서 에러를 반환하거나, 부모+자식을 하나의 RPC 함수에서 한 트랜잭션으로 생성한다.

<details><summary>반증 검증 근거</summary>

mutations.ts:37-51에서 meetings INSERT가 먼저 커밋되고(37-44), 그 뒤 replaceMeetingChildren 실패 시 `if (childResult.error) return { error: childResult.error };`(51)로 끝난다. 방금 만든 meetings 행을 지우는 보상 로직이 없고, logAudit(53)·redirect(59)는 그 아래라 감사 로그도 남지 않는다. 재시도하면 createMeeting은 항상 새 INSERT를 하므로 본문 없는 행이 누적된다. meetings 테이블에 title 중복을 막는 유니크 제약도 없다(20260630000001_meeting_minutes.sql:2-17). 상위 레이어 방어 없음. 트리거 조건은 #1과 동일하게 자식 INSERT 실패이므로 재현 난도는 있으나 코드 사실은 확정적이다. 참고로 재시도 시 제목은 React 19 폼 리셋(#7)으로 비워지므로 사용자가 다시 입력해 제출하게 되고, `required` 때문에 빈 제목 제출은 브라우저가 막는다 — 즉 '빈 제목 중복 행'이 아니라 '같은 제목의 본문 없는 행'이 쌓인다.

</details>

---

## 19. [MEDIUM] 히스토리 복원이 '새로 생긴 override'를 되돌리지 못한 채 성공 메시지를 띄움 (부분 복원)

- **위치**: `src/lib/actions/page-content.ts:35`
- **분류**: data-loss · 인라인 편집(page-content)

**무엇이 잘못됐나**

`savePageContentAction`은 35-38행에서 `.in("content_key", keys)`로 '이미 DB에 존재하던' 행만 조회해 감사 로그의 `payload.before`에 넣는다. 그 배치에서 처음 override가 만들어진 키는 before에 아예 표현되지 않는다(‘행이 없었음’이라는 상태를 기록할 방법이 없다). 복원은 `restorePageContentVersionAction` → `parsePageContentRestoreRows` → `savePageContentAction(before rows)` 경로로 before 행들을 upsert할 뿐 '그때 없던 키를 삭제'하지 않으므로, 한 번의 일괄 저장에 기존 키와 신규 키가 섞여 있으면 기존 키만 되돌아가고 신규 override는 새 값 그대로 남는다. 그런데 UI는 `setMessage("선택한 버전으로 복원했습니다.")`(useVersionHistoryManager.ts:59)로 완전 복원처럼 알린다. 관리자는 원상복구된 줄 알지만 페이지는 절반만 되돌아간 상태다.

**재현**

1) 편집 모드에서 이미 override가 있는 키(예: 이전에 수정한 home.hero.title)를 다시 고치고, 동시에 한 번도 수정한 적 없는 키(예: home.hero.subtitle)도 고쳐 한 번에 '저장'한다. 2) /admin/history에서 방금 생긴 page_content bulk_update 항목의 '이 버전 복원'을 누른다. 3) '선택한 버전으로 복원했습니다.' 메시지가 뜬다. 4) 홈으로 가보면 title은 이전 값으로 돌아왔지만 subtitle은 방금 저장한 새 값 그대로 남아 있다.

**수정 방향**

감사 payload에 '저장 전에 존재하지 않던 키' 목록을 함께 기록하고(예: `created_keys`), 복원 시 그 키들에 대해 `deletePageContentAction`을 수행하도록 한다. 부분 복원만 가능한 경우에는 성공 메시지 대신 '복원된 항목 N개 / 되돌리지 못한 항목 M개'를 명시한다.

<details><summary>반증 검증 근거</summary>

page-content.ts:35-38에서 upsert(51-53행) 이전에 `.in("content_key", keys)`로 조회한 기존 행만 payload.before에 담는다(60-65행). 그 배치에서 처음 만들어지는 키는 before에 표현되지 않는다. 복원 경로는 restorePageContentVersionAction(112-121행) → parsePageContentRestoreRows(restore-payload.ts) → savePageContentAction(rows)이고, savePageContentAction은 upsert만 할 뿐 delete가 없으므로 '그때 존재하지 않던 키'는 그대로 남는다. 반면 UI는 결과 error만 보고 useVersionHistoryManager.ts:59에서 '선택한 버전으로 복원했습니다.'를 표시한다. 상위 방어도 없다 — DB 스키마(20260317_page_content.sql)에 트리거/제약이 없고 RLS는 authenticated에 전부 허용이라 막지 않는다. 즉 한 배치에 기존 키와 신규 키가 섞이면 부분 복원 + 성공 메시지가 성립한다. 다만 손실이 아니라 '되돌림 미완료'이고 원본 값은 이후 감사 로그에 남아 있으므로 high가 아니라 medium으로 정정한다.

</details>

---

## 20. [MEDIUM] page_content 버전 복원이 '그 저장으로 새로 생긴 키'를 되돌리지 못하는데 성공 메시지를 띄운다

- **위치**: `src/lib/actions/page-content.ts:120`
- **분류**: data-loss · 감사로그·버전 히스토리

**무엇이 잘못됐나**

restorePageContentVersionAction은 payload.before(저장 직전에 DB에 이미 존재하던 행)만 뽑아 savePageContentAction으로 upsert한다. 그런데 bulk_update의 before는 `.in("content_key", keys)` 결과라, 그 저장에서 '처음 생성된' content_key는 before에 들어있지 않다. 복원은 그 키들을 삭제하지 않으므로 새로 생긴 오버라이드가 그대로 남는다. 즉 '이전 상태로 복원'이 실제로는 부분 복원이고, useVersionHistoryManager는 result.error가 없다는 이유로 "선택한 버전으로 복원했습니다."라는 완전 복원 메시지를 표시한다. 관리자는 되돌아간 줄 알지만 공개 페이지의 일부는 여전히 변경된 상태다.

**재현**

1) 공개 페이지 `/`에서 인라인 편집 모드 진입. 2) 이미 DB 오버라이드가 있는 키(예: home.hero.title)와 아직 오버라이드가 없어 하드코딩 기본값을 쓰는 키(예: home.hero.subtitle) 두 개를 동시에 수정하고 저장. → audit_log bulk_update: before=[home.hero.title 1건], after=[2건]. 3) /admin/history에서 "2개 편집 항목 저장" 항목의 '이 버전 복원' 클릭. 4) 결과: home.hero.title만 옛 값으로 돌아가고 home.hero.subtitle은 새로 넣은 값이 그대로 남는다(원래 상태였던 '오버라이드 없음'으로 돌아가지 않음). 화면에는 "선택한 버전으로 복원했습니다."가 뜬다.

**수정 방향**

복원 시 payload.after의 content_key 집합에서 payload.before의 content_key 집합을 뺀 차집합을 계산해 그 키들은 deletePageContentAction과 같은 경로로 삭제한 뒤, before 행들을 upsert 한다. 삭제·업서트 중 일부만 성공한 경우를 구분해 메시지에 반영하고(부분 복원 경고), 가능하면 RPC 한 트랜잭션으로 묶는다.

<details><summary>반증 검증 근거</summary>

코드로 확인된다. savePageContentAction(page-content.ts:35-38)은 `.select(...).in("content_key", keys)`로 before를 뜨므로 그 저장에서 처음 만들어지는 키는 beforeRows에 들어오지 않고, 61행 `before: beforeRows ?? []`로 그대로 기록된다. page_content는 오버라이드 테이블이라 기본값은 하드코딩이고(AdminEditContext.tsx:102-105 `hasOverride = stagedChanges.has(key) || key in dbContent`, 107-115 revertKey는 dbRow 없으면 DB를 건드리지 않음), 신규 키는 저장 시 upsert로 새로 INSERT된다. restorePageContentVersionAction(page-content.ts:112-121)은 parsePageContentRestoreRows로 before만 뽑아 savePageContentAction으로 다시 upsert할 뿐 '복원 후 남는 잉여 키'를 DELETE하는 로직이 전혀 없다. 그런데 useVersionHistoryManager.ts:54-60은 result.error만 없으면 "선택한 버전으로 복원했습니다."를 띄운다. 즉 부분 복원인데 완전 복원 메시지가 나온다. 재현 시나리오(기존 오버라이드 키 + 신규 키 동시 저장 → 복원)도 코드 흐름과 일치한다.

</details>

---

## 21. [MEDIUM] 갤러리 리스트(EditableList)의 이미지 URL은 호스트 화이트리스트 검증을 전혀 받지 않아 공개 페이지 이미지가 영구히 깨진다

- **위치**: `src/lib/actions/page-content/validation.ts:56`
- **분류**: validation · 미디어·업로드

**무엇이 잘못됐나**

page_content 저장 시 content_type이 "image"인 값은 validateOptionalImageUrl()로 https + 허용 호스트(allowed-image-hosts.json + Supabase 호스트) 검증을 받는다. 그런데 content_type이 "list"인 값은 JSON.parse 결과가 배열인지만 확인하고 항목 내부 필드는 전혀 검증하지 않는다(56~71줄). 갤러리 사진 목록(gallery.beauty.photos / struggle / solidarity 및 en.* 대응 키)은 바로 이 list 타입이고, 각 항목의 url 필드는 GalleryPhotoCard/GalleryLightbox에서 next/image의 src로 그대로 들어간다. 클라이언트 쪽 EditableListModal도 <input type="url">일 뿐 호스트 검증이 없다(EditableListModal.tsx 102~110줄). next/image의 호스트 검증(node_modules/next/dist/shared/lib/image-loader.js)은 `process.env.NODE_ENV !== 'production'` 블록 안에만 있어서, 개발 환경에서는 렌더 중 예외가 던져져 /gallery 페이지 전체가 죽고, 프로덕션에서는 /_next/image가 400 '"url" parameter is not allowed'를 돌려줘 해당 사진이 영구 깨짐 상태가 된다. 같은 URL을 소식 썸네일 칸에 넣으면 "허용된 이미지 도메인만 사용할 수 있습니다"로 막히는데 갤러리만 무방비인 비대칭이다.

**재현**

editor 계정으로 로그인 → 공개 /gallery 진입 → 관리자 툴바에서 편집 모드 ON → '아름다움' 섹션 사진 그리드 클릭(리스트 편집 모달) → 임의 항목의 '이미지 URL'을 https://example.com/photo.jpg 로 변경 → 적용 → 저장. 저장은 성공 메시지로 끝난다. 이후 로그아웃 상태로 /gallery를 열면 해당 카드가 빈 회색 박스로 남고 네트워크 탭에 /_next/image?url=https%3A%2F%2Fexample.com%2Fphoto.jpg... 400 응답이 찍힌다(개발 서버에서는 페이지 자체가 500 에러 화면). 관리자에게는 어떤 경고도 표시되지 않는다.

**수정 방향**

normalizeChange()의 list 분기에서 배열 여부만 보지 말고, 필드 스키마(예: photoFields의 type:"url")를 기준으로 각 항목의 URL 필드에 validateOptionalImageUrl()을 적용해 거부하라. 최소한 EditableList에 field.type === "url"인 값을 서버에서 검증하는 공통 경로를 만들고, 클라이언트 EditableListModal의 저장 시점에도 동일 검증으로 즉시 안내하는 것이 좋다.

<details><summary>반증 검증 근거</summary>

코드 대조 결과 주장이 모두 성립한다. (1) validation.ts:56~71의 list 분기는 `JSON.parse` 후 `Array.isArray`만 확인하고 항목 필드는 손대지 않은 채 `return { row: change, error: null }`로 통과시킨다. 반면 38~54줄 image 분기와 73~89줄 link 분기는 각각 validateOptionalImageUrl / validateEditableHref를 강제한다. (2) validateOptionalImageUrl(url.ts:65)은 `ALLOWED_IMAGE_HOST_SET`(allowed-image-hosts.json + Supabase 호스트) 검사를 하므로 소식 썸네일(news/form.ts:41)·타임라인 사진(timeline/form.ts:37)은 막히는 비대칭이 실제로 존재한다. (3) 갤러리 경로가 실제로 이 list 타입이다 — app/gallery/page.tsx가 `contentKey="gallery.beauty.photos"` 등으로 GalleryPhotoSection→EditableList를 쓰고, useEditableListEditor.ts:50~59의 handleSave가 `content_type: "list"`로 stageChange → AdminEditContext.saveChanges(144줄) → savePageContentAction으로 그대로 upsert된다. (4) 클라 쪽 방어도 없다: EditableListModal.tsx:102~110은 `type={field.type === "url" ? "url" : "text"}` 입력일 뿐이고, AdminEditContext에도 URL 검증 코드가 없다. (5) 렌더 경로도 확인 — GalleryPhotoCard.tsx:31의 `<Image src={photo.url}>`, GalleryLightbox.tsx:101~102도 next/image다. (6) 공개 방문자에게도 반영된다: app/layout.tsx:79~84가 로그인 여부와 무관하게 `getAllPageContent()`를 AdminEditShell에 넘기므로 비로그인 사용자도 저장된 값을 본다. (7) node_modules/next/dist/shared/lib/image-loader.js:21의 호스트 검증 블록이 `process.env.NODE_ENV !== 'production'` 안에만 있고 75줄에서 throw하는 것도 사실이라 개발 환경 크래시/프로덕션 400 설명도 맞다. 다만 프로덕션에서 페이지가 죽지는 않고(옵티마이저 400로 해당 이미지만 깨짐) 편집으로 되돌릴 수 있어 high보다는 medium이 적정하다.

</details>

---

## 22. [MEDIUM] 저장 중에 추가로 편집한 내용이 저장 완료 시 조용히 삭제됨

- **위치**: `src/lib/contexts/AdminEditContext.tsx:151`
- **분류**: data-loss · 인라인 편집(page-content)

**무엇이 잘못됐나**

`saveChanges`는 호출 시점 스냅샷 `changes = Array.from(stagedChanges.values())`만 서버로 보내고, 성공하면 151행에서 `setStagedChanges(new Map())`으로 스테이징 맵 '전체'를 절대값으로 비운다. 저장 요청이 진행되는 동안에도 contentEditable/모달 편집은 아무것도 막히지 않으므로(툴바의 저장 버튼만 disabled) 그 사이 blur된 편집은 `stageChange`로 새로 스테이징된다. 저장이 끝나면 이 신규 변경분까지 함께 지워지고, `mergeStagedChanges(prev, changes)`는 스냅샷에 있던 키만 dbContent에 반영하므로 화면 값도 편집 전으로 되돌아간다. 에러 표시도 없고 '변경 N개' 카운터도 0이 되어 관리자는 저장에 성공했다고 믿는다. `discardChanges`(98행)도 같은 방식으로 절대값 비우기라 저장 진행 중 눌리면 동일한 유실이 난다.

**재현**

1) 편집 모드에서 제목 A를 수정하고 blur → 툴바 '1개 변경'. 2) '저장'을 누른다(네트워크가 느릴수록 재현 쉬움. 개발자도구 Network를 Slow 3G로 두면 확실). 3) 저장 응답이 오기 전에 본문 B를 클릭해 수정하고 blur → '2개 변경'. 4) 저장 응답 도착 → 카운터가 0이 되고 B의 텍스트가 수정 전 값으로 되돌아간다. DB에는 A만 저장되고 B의 편집은 경고 없이 사라진다.

**수정 방향**

`setStagedChanges(new Map())` 대신 함수형 업데이트로 '이번에 저장한 키만' 제거한다. 예: `setStagedChanges(prev => { const next = new Map(prev); for (const c of changes) if (next.get(c.content_key) === c) next.delete(c.content_key); return next; })`. 저장 중에는 편집 입력을 잠그거나(오버레이/contentEditable=false) 저장 후 남은 변경 개수를 그대로 유지해 사용자에게 보여주는 것도 함께 필요하다.

<details><summary>반증 검증 근거</summary>

AdminEditContext.tsx:137-160을 확인했다. 140행에서 `Array.from(stagedChanges.values())` 스냅샷을 뜨고, 성공 시 150행 `mergeStagedChanges(prev, changes)`(content-store.ts에서 changes에 있는 키만 dbContent에 반영)와 151행 `setStagedChanges(new Map())`(함수형이 아닌 절대값 비우기)를 실행한다. 저장 대기 중 편집을 막는 장치는 없다 — EditableText는 편집 모드면 항상 contentEditable(EditableText.tsx:84-98)이고 saving 상태를 참조하지 않으며, 툴바는 저장/되돌리기 버튼만 disabled 처리한다(AdminToolbarMain.tsx:63,72). 따라서 await 구간에 blur된 편집은 stageChange로 들어온 뒤 151행에 통째로 지워지고, getContent는 dbContent(스냅샷만 병합됨)로 폴백하므로 화면 값도 편집 전으로 되돌아간다. 에러 표시도 없다. 다만 보고서의 '`discardChanges`도 저장 중 눌리면 동일'은 부정확하다 — 되돌리기 버튼은 `disabled={!hasChanges || saving}`(AdminToolbarMain.tsx:63)라 저장 중에는 클릭할 수 없다. 또 재현에는 저장 왕복(수백 ms) 안에 blur가 발생해야 하는 좁은 창이 필요하므로 critical이 아니라 medium으로 정정한다.

</details>

---

## 23. [MEDIUM] '저장 후 종료'/'버리기'를 눌러도 편집 모드가 꺼지지 않음 (stale closure)

- **위치**: `src/lib/contexts/AdminEditContext.tsx:70`
- **분류**: ui-state · 인라인 편집(page-content)

**무엇이 잘못됐나**

`toggleEditMode`는 71행에서 `if (isEditMode && stagedChanges.size > 0) return;` 가드를 갖고 있고, 이 값들은 useCallback이 생성된 렌더 시점의 클로저 값이다. 툴바의 종료 다이얼로그는 정의상 '변경 N>0개'일 때만 열리므로(useAdminToolbar.ts:28), 그 시점의 `toggleEditMode`는 항상 size>0을 캡처하고 있다. `handleDiscardAndExit`(useAdminToolbar.ts:45-49)는 `discardChanges()`로 상태 변경을 예약한 뒤 같은 틱에 이 낡은 `toggleEditMode()`를 호출하므로 가드에 걸려 early return → 편집 모드가 유지된다. `handleSaveAndExit`(35-43행)의 `setTimeout(...,100)`도 setState 반영을 기다릴 뿐 캡처된 클로저 값을 갱신하지 못하므로 마찬가지로 early return된다. 두 종료 경로 모두 다이얼로그만 닫히고 편집 모드는 켜진 채 남는다.

**재현**

1) 편집 모드에서 아무 텍스트나 2개 수정(툴바 '2개 변경'). 2) 툴바의 '편집 중' 버튼을 눌러 종료 다이얼로그를 띄운다. 3) '버리기'를 누른다 → 다이얼로그는 닫히고 변경은 버려지지만 버튼은 여전히 '편집 중'이고 모든 요소에 파란 편집 테두리가 남아 있다(편집 모드 유지). 4) '저장 후 종료'로도 동일: 저장은 되지만 편집 모드가 종료되지 않는다. 5) 다시 '편집 중'을 눌러야(이때는 변경 0개라 가드 통과) 비로소 종료된다.

**수정 방향**

`toggleEditMode`가 `stagedChanges`를 클로저로 읽지 않게 한다. 예를 들어 `setIsEditMode`를 함수형으로 호출하면서 가드를 제거하고(가드는 이미 useAdminToolbar의 handleToggleEditMode가 담당), 강제 종료용 `exitEditMode()`를 별도 제공해 다이얼로그의 두 버튼이 그것을 호출하게 한다. 혹은 stagedChanges를 ref로 함께 유지해 최신값을 읽는다.

<details><summary>반증 검증 근거</summary>

AdminEditContext.tsx:69-78의 toggleEditMode는 `if (isEditMode && stagedChanges.size > 0) return;`(70-72행) 가드를 갖고, deps가 [isEditMode, resetSelectedKey, stagedChanges.size]라 렌더 시점 값을 캡처한다. 종료 다이얼로그는 useAdminToolbar.ts:28-30에서 `isEditMode && hasChanges`일 때만 열리므로 다이얼로그가 떠 있는 렌더의 toggleEditMode는 항상 size>0을 캡처한 상태다. handleDiscardAndExit(45-49행)는 `discardChanges()` → `setShowConfirmDiscard(false)` → 같은 틱에 캡처된 toggleEditMode() 호출인데, React 배치 때문에 setStagedChanges 반영 전이며 클로저 값 자체도 갱신되지 않으므로 무조건 early return → 편집 모드 유지. handleSaveAndExit(35-43행)의 `setTimeout(...,100)`도 setState 반영만 기다릴 뿐 이미 캡처된 toggleEditMode 참조를 바꾸지 못하므로 동일하게 early return된다. 배선도 확인했다: AdminToolbar.tsx→AdminToolbarDialogs.tsx:36-37→DiscardChangesDialog의 '저장 후 종료'/'버리기' 버튼이 각각 onSaveAndExit/onDiscardAndExit에 연결돼 있다. 데이터 손실은 없고(저장/버리기 자체는 수행됨) 버튼을 한 번 더 누르면 종료되므로 high가 아니라 medium으로 정정한다. 근본 원인 위치는 useAdminToolbar.ts:45-49지만 가드 자체는 AdminEditContext.tsx:70이다.

</details>

---

## 24. [MEDIUM] 삭제한 회의록을 복원할 경로가 존재하지 않음 — '히스토리에서 복원 가능'이라는 확인 문구가 거짓

- **위치**: `src/lib/data/meetings.ts:65`
- **분류**: data-loss · 회의록

**무엇이 잘못됐나**

deleteMeeting은 is_deleted=true 소프트 삭제만 하고, 복원용 restoreMeetingAction과 MeetingListActions의 '복원' 버튼이 존재한다. 그러나 (1) 목록을 만드는 getAllMeetings가 .eq('is_deleted', false)로 삭제된 회의록을 아예 조회하지 않으므로 isDeleted=true인 항목이 렌더링될 일이 없어 복원 버튼은 도달 불가능한 죽은 코드이고, (2) /admin/history의 restoreEntry(useVersionHistoryManager.ts)는 page_content/news/timeline_events만 처리하고 그 외에는 '복원할 수 없는 변경 내역입니다.'를 반환해 meetings 감사 항목으로도 복원할 수 없다. 결과적으로 삭제 확인창의 '(히스토리에서 복원 가능)'은 사실이 아니며, 실수로 삭제한 회의록은 DB 직접 조작 없이는 영구히 되찾을 수 없다.

**재현**

1) editor로 /admin/meetings 접속 → 임의 회의록의 '삭제' 클릭 → 확인창에 '히스토리에서 복원 가능'이 표시되므로 안심하고 확인. 2) 목록에서 사라짐(정상). 3) /admin/history 이동 → 방금 생성된 meetings delete 항목의 '복원' 클릭 → '복원할 수 없는 변경 내역입니다.' 오류. 4) /admin/meetings 어디에도 삭제된 항목이 표시되지 않아 복원 버튼을 누를 수 없음. → 회의록 복구 불가.

**수정 방향**

목록에 '삭제됨 보기' 토글(is_deleted=true 조회)을 추가해 복원 버튼이 실제로 렌더링되게 하거나, useVersionHistoryManager.restoreEntry에 meetings 분기를 추가해 restoreMeetingAction을 호출하도록 한다. 둘 다 못 한다면 최소한 확인 문구에서 '히스토리에서 복원 가능'을 제거해야 한다.

<details><summary>반증 검증 근거</summary>

세 갈래 모두 실제로 막혀 있음을 확인했다. (1) getAllMeetings(data/meetings.ts:62-67)가 `.eq("is_deleted", false)`로 걸러서 목록에 삭제 항목이 절대 렌더링되지 않는다 — MeetingListActions.tsx:34-35의 isDeleted 분기(복원 버튼)는 도달 불가 죽은 코드다. 대조군이 결정적인데, 같은 패턴의 뉴스는 admin 목록 쿼리(data/news.ts:107-108 `supabase.from("news").select("*")`)에 is_deleted 필터가 없어 삭제 항목이 표시되고 복원 버튼이 실제로 동작한다. 즉 회의록만 복사 과정에서 빠진 것. (2) /admin/history의 restoreEntry(useVersionHistoryManager.ts:15-27)는 page_content/news/timeline_events만 처리하고 그 외에는 '복원할 수 없는 변경 내역입니다.'를 반환한다. 게다가 VersionHistoryEntryCard.tsx:4-9의 isRestorable은 `payload?.before`를 요구하는데 deleteMeeting의 logAudit(mutations.ts:113-115)은 payload 자체를 안 넘기므로 복원 버튼이 렌더링조차 되지 않는다. (3) 상세 페이지([id]/page.tsx)에도 복원 UI가 없고, edit 저장 payload(toMeetingPayload)에 is_deleted가 없어 재저장으로도 되살아나지 않는다. 따라서 MeetingListActions.tsx:12의 '(히스토리에서 복원 가능)' 문구는 거짓이다. 다만 소프트 삭제라 행 자체는 DB에 남아 있어 운영자가 SQL로 복구 가능하므로 high는 과하다 → medium.

</details>

---

## 25. [MEDIUM] 영문 타임라인이 DB id로 키잉된 하드코딩 번역표로 덮어써져, 관리자 수정이 /en/timeline에 절대 반영되지 않는다

- **위치**: `src/lib/i18n/timeline-en.ts:197`
- **분류**: stale-content · 타임라인 CRUD

**무엇이 잘못됐나**

translateTimelineEventToEnglish()가 `timelineTranslations[event.id]`로 DB 행의 title/description/date/category를 통째로 덮어쓴다. 번역표 키는 시드 데이터의 id 1~21뿐이다. 결과는 두 방향 모두 잘못된다. (1) id 1~21 이벤트를 관리자 화면에서 수정하면 /timeline만 바뀌고 /en/timeline은 옛 영문 문구를 계속 게시한다 — 관리자에겐 성공 메시지가 뜨고 오류 표시가 전혀 없다. (2) 관리자가 새로 만든 이벤트(id ≥ 22)는 번역표에 없어 `translated?.title ?? event.title` 폴백을 타므로 영문 페이지에 한국어 제목·본문이 그대로 출력된다. 두 경우 모두 저장소 내에서 이미 실현되어 있다: 마이그레이션 20260811035602이 timeline_events의 '산업통상자원부'를 '기후에너지환경부'로 UPDATE했지만 timeline-en.ts:150의 id 16 번역은 여전히 "The Ministry of Trade, Industry and Energy"이고, 20260811035047이 추가한 '김성환 기후에너지환경부 장관…' 행(id 22)은 번역 항목이 없다.

**재현**

1) /admin/timeline → '2025년 8월 29일 … 실시계획인가 고시'(id 16) 수정 → 본문의 부처명을 바꾸고 저장. 2) /timeline 에서는 변경 확인됨. 3) /en/timeline 방문 → 해당 카드는 여전히 timelineTranslations[16]의 옛 문구("The Ministry of Trade, Industry and Energy officially approved…")를 출력. 4) 이어서 /admin/timeline/new 로 새 이벤트 등록(id 22 이상) → /en/timeline 방문 → 그 카드만 제목·설명이 한국어로 노출됨(현재 '김성환 기후에너지환경부 장관, 주민 대책위 면담서 공사 강행 입장' 항목이 실제로 이 상태).

**수정 방향**

번역을 id가 아니라 DB 컬럼으로 옮기는 것이 근본 해법이다. timeline_events에 title_en/description_en/date_en 컬럼을 추가하고 TimelineForm에 영문 입력란을 두어, 번역이 비어 있을 때만 한국어로 폴백하게 한다. 즉시 조치가 필요하면 최소한 (a) timelineTranslations에 원문 한국어 title 스냅샷을 같이 저장해 DB title과 다르면 번역을 무시하고 폴백하도록 하고, (b) 번역이 없는 id에 대해서는 영문 페이지에서 카드를 감추거나 '번역 준비 중' 표시를 하도록 한다.

<details><summary>반증 검증 근거</summary>

핵심 메커니즘은 코드대로다. timeline-en.ts:197 `const translated = timelineTranslations[event.id]` 이후 199-208에서 date/title/description/category를 `translated?.X ?? event.X` 로 덮어쓴다. 번역표(37-192)는 키 1~21만 존재한다. /en/timeline/page.tsx:22-26은 `getPublishedTimeline()` 결과(=DB 실데이터)를 그대로 이 함수에 통과시키므로, id 1~21 행은 DB 본문이 무엇이든 정적 영문 문구가 이긴다. 또한 20260311_create_admin_tables.sql:34는 `id BIGINT GENERATED ALWAYS AS IDENTITY`이고 20260312_seed_data.sql:173의 INSERT는 id를 명시하지 않은 21행이므로 시드 id는 1~21이며, 마이그레이션 20260811035047이 추가한 '김성환 기후에너지환경부 장관…' 행은 id 22가 된다. 실제로 개발 폴백 파일 src/data/timeline.ts:208에도 `id: 22`로 동일하게 들어가 있고 번역표에 22 항목이 없어, 지금 이 순간 /en/timeline의 해당 카드는 한국어 제목·본문으로 출력된다(카테고리만 categoryMap으로 'Meetings' 변환). 다만 보고자가 든 두 근거 중 하나는 틀렸다: 20260811035602가 '산업통상자원부'→'기후에너지환경부'로 바꾼 것은 맞으나, 그 뒤 20260811040606이 `title not like '김성환%'` 조건으로 전부 되돌렸으므로 id 16의 한국어 본문은 다시 '산업통상자원부'가 되어 timeline-en.ts:151의 'The Ministry of Trade, Industry and Energy'와 어긋나지 않는다. 그래도 (a) id 1~21 수정이 영문에 반영 안 됨, (b) id≥22 신규 항목이 영문 페이지에 한국어로 노출됨 — 두 재현 시나리오는 모두 코드로 확정된다. 근거 하나가 무효화된 점과 데이터 손실이 아닌 콘텐츠 동기화 결함이라는 점을 반영해 high→medium으로 하향.

</details>

---

## 26. [LOW] 소식 삭제 확인 모달에 줄바꿈 대신 리터럴 문자열 \n이 그대로 표시됨

- **위치**: `src/app/admin/news/NewsListActions.tsx:73`
- **분류**: ui-state · 소식/언론보도 CRUD, 대시보드·서명·신고

**무엇이 잘못됐나**

`message="이 소식을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."`처럼 JSX 속성의 큰따옴표 문자열 안에 \n을 썼다. JSX 속성 문자열은 JS 문자열 리터럴이 아니라 HTML 속성처럼 취급되어 이스케이프 시퀀스를 해석하지 않는다(프로젝트 tsc로 확인: `<Foo message="a\nb"/>` → `React.createElement(Foo, { message: "a\\nb" })`). ConfirmModal은 메시지 `<p>`에 `whitespace-pre-line`을 걸어 줄바꿈을 의도했지만(src/components/admin/ConfirmModal.tsx:82), 실제 문자열에 개행 문자가 없으므로 역슬래시+n이 화면에 그대로 노출된다.

**재현**

1) editor로 /admin/news 접속. 2) 아무 소식의 '삭제' 버튼 클릭. 3) 확인 모달 본문이 '이 소식을 삭제하시겠습니까?\n나중에 복원할 수 있습니다.' 로 표시되어 \n 두 글자가 그대로 보인다.

**수정 방향**

JSX 표현식 컨테이너로 감싸라: `message={"이 소식을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."}`.

<details><summary>반증 검증 근거</summary>

NewsListActions.tsx:73이 message="이 소식을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."로 JSX 속성 큰따옴표 문자열 안에 백슬래시-n을 쓰고 있음을 확인했다. 프로젝트의 tsc로 직접 컴파일해 검증했다: <Foo message="a\nb" /> → React.createElement(Foo, { message: "a\\nb" }) 즉 이스케이프가 해석되지 않고 백슬래시가 문자로 남는다(JSX 속성 문자열은 HTML 속성처럼 취급되어 엔티티만 해석). ConfirmModal은 메시지 <p>에 whitespace-pre-line을 걸어 줄바꿈을 의도했지만 문자열에 개행 문자가 없으므로 화면에 \n 두 글자가 노출된다. 다만 whitespace-pre-line 위치는 ConfirmModal.tsx:83이지 82가 아니다(사소한 오차, 주 위치는 정확).

</details>

---

## 27. [LOW] 숫자가 아닌 소식 id로 수정 페이지에 접근하면 404가 아니라 프로덕션에서 500 크래시

- **위치**: `src/app/admin/news/[id]/edit/page.tsx:11`
- **분류**: error-handling · 소식/언론보도 CRUD

**무엇이 잘못됐나**

`parseInt(id, 10)`이 NaN을 돌려줘도 그대로 getNewsById(NaN)에 넘긴다. getNewsById는 `.eq("id", NaN)`을 실행하고 PostgREST는 `id=eq.NaN`을 보내 PostgreSQL이 `invalid input syntax for type bigint: "NaN"`(22P02)으로 거절한다. 그러면 src/lib/data/news.ts:144의 `fallbackOrThrow(() => null, ...)`가 프로덕션(NODE_ENV=production)에서 예외를 던지도록 되어 있어(같은 파일 26~32행) notFound() 대신 500 에러 페이지가 뜬다. 개발 환경에서는 null을 반환해 정상적으로 404가 나므로 로컬에서는 재현되지 않는다.

**재현**

1) 프로덕션 배포본에 editor로 로그인. 2) 주소창에 /admin/news/abc/edit 입력(오타·잘못 복사한 링크·크롤러 유입으로 충분히 발생). 3) '소식을 찾을 수 없습니다' 404가 아니라 Application error / 500 화면이 뜬다. (/admin/news/99999/edit 같은 존재하지 않는 숫자 id는 정상적으로 404가 나온다.)

**수정 방향**

페이지에서 `const newsId = Number.parseInt(id, 10); if (!Number.isInteger(newsId) || newsId <= 0) notFound();`로 먼저 걸러라. 더불어 getNewsById에서도 id가 유한한 정수가 아니면 쿼리 없이 null을 반환하도록 방어하는 편이 안전하다.

<details><summary>반증 검증 근거</summary>

경로를 끝까지 따라가 확인했다. edit/page.tsx:11 'const newsId = parseInt(id, 10);'에 NaN 가드가 없고 12행에서 그대로 getNewsById(newsId)를 호출한다. data/news.ts:139의 .eq('id', id)는 postgrest-js PostgrestFilterBuilder.ts:115 'this.url.searchParams.append(column, `eq.${value}`)'로 직렬화되어 id=eq.NaN이 전송되고, PostgreSQL은 bigint 캐스팅에서 22P02로 거절한다. 그러면 142행 if (error) → 144행 fallbackOrThrow(() => null, ...)이고 26~32행이 IS_PRODUCTION일 때 throw하므로 notFound()가 아니라 예외가 던져진다. src/app 아래에 error.tsx/global-error.tsx가 전혀 없어(not-found.tsx만 존재) 기본 500 화면이 뜬다. 도달성도 성립: proxy.ts는 /admin/:path*에 대해 활성 관리자만 통과시키므로 로그인한 editor가 /admin/news/abc/edit을 열면 그대로 500이다. 개발 환경에서는 null 반환으로 404가 나 로컬 재현이 안 된다는 설명도 26~31행과 일치한다. scripts/check-notfound-semantics.mjs는 maybeSingle 사용만 강제할 뿐 NaN을 막지 않는다.

</details>

---

## 28. [LOW] 삭제 확인 모달 문구에 개행 대신 '\n' 두 글자가 그대로 표시된다

- **위치**: `src/app/admin/timeline/TimelineListActions.tsx:73`
- **분류**: ui-state · 타임라인 CRUD

**무엇이 잘못됐나**

`message="이 타임라인을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."` 는 JSX 속성 문자열 리터럴이라 이스케이프 시퀀스가 해석되지 않는다(JSX 속성값은 JS 문자열 리터럴이 아니라 HTML 유사 리터럴로 처리되어 \n이 백슬래시+n 두 문자로 남는다). ConfirmModal은 이 값을 `whitespace-pre-line` 문단에 그대로 렌더링하므로(ConfirmModal.tsx:83) 작성자의 의도는 명백히 줄바꿈이었으나, 실제 화면에는 리터럴 문자열이 노출된다. 동일 패턴이 src/app/admin/news/NewsListActions.tsx:73 에도 있다.

**재현**

1) 관리자로 /admin/timeline 접속. 2) 아무 항목의 '삭제' 버튼 클릭. 3) 모달 본문이 '이 타임라인을 삭제하시겠습니까?\n나중에 복원할 수 있습니다.' 로, 줄바꿈 없이 백슬래시-n이 보이는 상태로 표시된다.

**수정 방향**

중괄호 표현식으로 바꿔 실제 개행 문자를 넘긴다: message={"이 타임라인을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."}. news 쪽도 같이 수정.

<details><summary>반증 검증 근거</summary>

TimelineListActions.tsx:73 `message="이 타임라인을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."` 를 실파일에서 확인했다. 중괄호 없는 JSX 속성값은 JS 문자열 리터럴이 아니라 HTML 유사 리터럴이라 백슬래시 이스케이프가 해석되지 않고, 트랜스파일 결과는 `message: "...?\\n나중에..."` 즉 백슬래시+n 두 문자가 된다. ConfirmModal.tsx:83-85는 이 문자열을 `<p ... className="... whitespace-pre-line ...">{message}</p>` 로 그대로 렌더링하므로 화면에 리터럴 '\n'이 노출된다. whitespace-pre-line을 굳이 붙여 둔 것 자체가 작성자 의도가 개행이었음을 보여준다. 동일 패턴이 /Users/hwang-gyeongha/pine-nut/website/src/app/admin/news/NewsListActions.tsx:73 에도 있음을 확인했다. 표시 결함이므로 low 유지.

</details>

---

## 29. [LOW] 숫자가 아닌 id로 타임라인 수정 페이지에 접근하면 404가 아니라 프로덕션에서 500 크래시

- **위치**: `src/app/admin/timeline/[id]/edit/page.tsx:11`
- **분류**: error-handling · 누락 영역

**무엇이 잘못됐나**

`const eventId = parseInt(id, 10);` 뒤에 `Number.isNaN` 검사 없이 곧바로 `getTimelineById(eventId)`를 호출한다. 같은 파일의 `if (!event) notFound()`는 NaN을 걸러주지 못한다. `getTimelineById(NaN)`은 `.eq("id", NaN)`으로 PostgREST에 `id=eq.NaN`을 보내고 bigint 캐스팅이 실패해(22P02) `error`가 채워지며, src/lib/data/timeline.ts:167-173의 `fallbackOrThrow`가 IS_PRODUCTION일 때 `throw new Error(...)`를 던진다(timeline.ts:32-38). 앱 전체에 error.tsx가 하나도 없으므로(find 결과 not-found.tsx 2개뿐) Next의 기본 500 화면이 뜬다. 개발 환경에서는 fallback 경로로 null을 돌려 notFound()가 되므로 로컬에서는 재현되지 않고 프로덕션에서만 터진다. 같은 형태의 소식 페이지 결함은 이미 확정 목록에 있으나 타임라인 쪽은 누락됐다 — 회의록 페이지들(meetings/[id]/page.tsx:15, meetings/[id]/edit/page.tsx:10)은 `Number.isNaN` 가드가 있어 이 파일만 남았다.

**재현**

프로덕션 배포본에 editor 이상으로 로그인한 뒤 주소창에 `/admin/timeline/abc/edit`(또는 오타·깨진 북마크로 `/admin/timeline/12x/edit`)를 입력한다. → 기대: 404 페이지. 실제: "Application error: a server-side exception has occurred" 500 화면이 뜨고, Vercel 로그에 `Failed to fetch timeline by id from Supabase: NaN`이 남는다.

**수정 방향**

meetings 페이지들과 동일하게 `const eventId = Number.parseInt(id, 10); if (Number.isNaN(eventId)) notFound();`를 추가한다. 아울러 src/app/admin/error.tsx를 만들어 관리자 영역의 서버 예외가 기본 500 화면 대신 복구 가능한 UI로 잡히게 하는 것을 권한다.

<details><summary>반증 검증 근거</summary>

src/app/admin/timeline/[id]/edit/page.tsx:10-14를 직접 읽어 확인했다. `const eventId = parseInt(id, 10);` 다음 줄이 바로 `const event = await getTimelineById(eventId);`이고 Number.isNaN 가드가 없다. `if (!event) notFound()`는 예외가 먼저 던져지므로 도달하지 못한다. src/lib/data/timeline.ts:152-176의 getTimelineById는 `.eq("id", id).maybeSingle()`로 NaN을 그대로 넘겨 `id=eq.NaN` 쿼리를 보내고, bigint 캐스팅 실패로 error가 채워지면 :167-173 `fallbackOrThrow(() => null, ...)` → :32-38에서 IS_PRODUCTION(`process.env.NODE_ENV === "production"`)일 때 `throw new Error(errorMessage)`. 개발 환경에서는 null을 반환해 notFound()가 되므로 로컬 재현이 안 된다는 서술도 코드와 일치한다. 에러 바운더리 부재도 확인 — `find src -name error.tsx -o -name global-error.tsx -o -name not-found.tsx` 결과가 not-found.tsx 2개(src/app, src/app/en)뿐이라 Next 기본 500 화면이 뜬다. 대조군 주장도 확인 — meetings/[id]/edit/page.tsx:9-10과 meetings/[id]/page.tsx는 `if (Number.isNaN(id)) notFound();` 가드가 있고, 가드가 없는 곳은 admin/timeline/[id]/edit/page.tsx:11과 admin/news/[id]/edit/page.tsx:11 두 곳뿐이다(grep parseInt 전수 확인). 재현 시나리오 중 `/admin/timeline/12x/edit` 예시는 부정확하다 — parseInt("12x", 10)은 12를 반환해 정상적으로 12번 이벤트를 연다. `abc`처럼 첫 문자부터 비숫자인 경우에만 NaN이 되어 500이 난다. 이 부분만 정정하면 나머지는 그대로 성립한다. 관리자 로그인이 필요하고 정상 링크로는 도달하지 않으므로 low가 적절하다.

</details>

---

## 30. [LOW] ConfirmModal: 모달 내부 비포커스 영역을 클릭하면 ESC가 먹지 않고 포커스 트랩이 풀린다

- **위치**: `src/components/admin/ConfirmModal.tsx:78`
- **분류**: ui-state · 대시보드·서명·신고

**무엇이 잘못됐나**

ESC/Tab 처리(handleKeyDown)를 다이얼로그 div의 onKeyDown에만 걸어 두었다. 다이얼로그 div에는 tabIndex가 없고 제목·본문 <p>도 포커스 불가라, 사용자가 모달 안 텍스트나 여백을 클릭하는 순간 document.activeElement가 body로 빠진다. 그 뒤 키 이벤트의 전파 경로에 다이얼로그 div가 포함되지 않으므로 React 합성 onKeyDown이 호출되지 않아 ESC로 닫히지 않고, Tab 순환 트랩도 동작하지 않아 포커스가 모달 뒤 페이지로 새어 나간다. 파괴적 작업(삭제) 확인창이라 키보드만 쓰는 사용자는 취소 경로를 잃는다.

**재현**

/admin/news에서 '삭제'를 눌러 확인 모달을 연다 → 모달 안의 설명 문구('이 소식을 삭제하시겠습니까?...')를 한 번 클릭한다 → ESC를 눌러도 모달이 닫히지 않는다. 이어서 Tab을 누르면 모달의 취소/삭제 버튼이 아니라 모달 뒤 목록의 링크로 포커스가 이동한다.

**수정 방향**

keydown을 document(또는 window)에 useEffect로 등록하거나, 다이얼로그 div에 tabIndex={-1}을 주고 열릴 때 컨테이너에 포커스를 준 뒤 blur 시 다시 끌어오도록 한다. 닫힐 때 이전 포커스 요소 복원과 배경 스크롤 잠금도 함께 처리하면 좋다.

<details><summary>반증 검증 근거</summary>

ConfirmModal.tsx:78에서 `onKeyDown={handleKeyDown}`이 다이얼로그 div에만 걸려 있고, 그 div(71-79행)에는 tabIndex가 없다. 바깥 오버레이(64-70행)도 role="presentation"에 onClick만 있고 키 핸들러가 없으며, 문서 전역 keydown 리스너를 등록하는 useEffect도 없다(28-32행은 cancelRef.focus()만). 제목 h3(80행)·본문 p(83행)도 포커스 불가라 그 영역을 클릭하면 브라우저가 포커스 가능한 조상을 못 찾아 activeElement가 body로 떨어지고, 이후 keydown의 전파 경로에 다이얼로그 div가 없어 React 합성 onKeyDown이 호출되지 않는다. 결과적으로 ESC(37-40행)도, Tab 순환 트랩(42-56행)도 죽는다. 초기 포커스가 취소 버튼에 있어도 '모달 안 텍스트 클릭' 한 번으로 재현되고, 그 뒤 Tab은 문서 순서상 모달 밖 요소로 나간다. 파괴적 작업 확인창에서 키보드 취소 경로가 사라지는 실동작 결함이라 low 유지.

</details>

---

## 31. [LOW] 최초 편집 저장 이력은 '이 버전 복원' 버튼이 보이지만 누르면 항상 실패

- **위치**: `src/components/admin/history/VersionHistoryEntryCard.tsx:7`
- **분류**: error-handling · 인라인 편집(page-content), 감사로그·버전 히스토리

**무엇이 잘못됐나**

`isRestorable`은 `Boolean(entry.payload?.before)`로 복원 가능 여부를 판정한다. page_content 일괄 저장의 payload.before는 항상 배열이고, 이전 override가 하나도 없던 배치에서는 `[]`가 저장된다. JS에서 `Boolean([])`은 true이므로 버튼이 노출되지만, 실제 복원 경로인 `parsePageContentRestoreRows`는 `before.length === 0`이면 `{ error: "복원 가능한 이전 데이터가 없습니다." }`를 반환한다(restore-payload.ts:19-21). 결과적으로 눌러도 100% 실패하는 버튼이 목록에 남아 관리자를 오도한다.

**재현**

1) 한 번도 인라인 편집한 적 없는 페이지에서 텍스트 하나만 수정하고 저장한다(=이전 override 없음 → payload.before = []). 2) /admin/history에 들어가면 해당 page_content bulk_update 항목에 '이 버전 복원' 버튼이 보인다. 3) 클릭 후 확인창을 수락하면 '복원 가능한 이전 데이터가 없습니다.' 에러만 표시되고 아무 일도 일어나지 않는다.

**수정 방향**

`isRestorable`에서 배열인 경우 길이까지 확인한다. 예: `const b = entry.payload?.before; return TABLES.includes(entry.table_name) && (Array.isArray(b) ? b.length > 0 : Boolean(b));`. 더 나아가 before가 비었을 때는 '기본값으로 되돌리기(override 삭제)'를 수행하는 별도 동작을 제공하는 편이 사용자 기대에 맞다.

<details><summary>반증 검증 근거</summary>

VersionHistoryEntryCard.tsx:4-9의 isRestorable은 `["page_content","news","timeline_events"].includes(table_name) && Boolean(entry.payload?.before)`다. page-content.ts:61은 항상 `before: beforeRows ?? []`를 저장하므로 이전 override가 없던 배치는 `[]`가 되고 JS에서 Boolean([])===true → 버튼이 렌더된다(49-58행). 실제 복원은 restore-payload.ts:13-21에서 `before.length === 0`이면 `{ error: "복원 가능한 이전 데이터가 없습니다." }`를 반환하고, useVersionHistoryManager.ts:54-57이 그 에러를 그대로 표시한다. 즉 100% 실패하는 버튼이 맞다. 데이터 훼손은 없고 오도만 발생하므로 medium이 아니라 low로 정정한다. (참고: 이 결함 때문에 발견 #7의 '최초 override로 빈 값을 저장한 경우' 히스토리 복구 경로까지 막힌다.)

</details>

---

## 32. [LOW] 저장하지 않은 변경이 있어도 툴바의 전체 새로고침 링크·브라우저 이탈에 경고가 없어 조용히 유실

- **위치**: `src/components/admin/toolbar/AdminToolbarMain.tsx:99`
- **분류**: data-loss · 인라인 편집(page-content)

**무엇이 잘못됐나**

스테이징 상태는 AdminEditProvider의 메모리(useState)에만 있고 저장소 백업이 없다. 그런데 같은 툴바의 '사이트 빌더'(99행), '히스토리'(106행), '관리자'(116행)는 next/link가 아닌 순수 `<a href>`라 전체 페이지 이동을 일으켜 Provider 상태를 통째로 파괴한다. 코드베이스 전체에 beforeunload 핸들러가 하나도 없어(grep 결과 0건) 새로고침·탭 닫기·주소 직접 입력에서도 경고가 뜨지 않는다. 툴바가 'N개 변경'을 표시하고 있는 바로 그 순간에도 옆 버튼 한 번으로 모든 편집이 경고 없이 사라진다.

**재현**

1) 편집 모드에서 텍스트 3개를 수정한다(툴바에 '3개 변경' 표시). 2) 같은 툴바의 '사이트 빌더'(또는 '히스토리'/'관리자') 링크를 클릭한다. 3) 전체 페이지가 새로 로드되고 아무 확인창 없이 3개 변경이 모두 사라진다. 4) 뒤로 가기로 돌아와도 편집 모드는 꺼져 있고 변경분은 복구되지 않는다. F5 새로고침도 동일.

**수정 방향**

`hasChanges`가 true인 동안 `beforeunload` 리스너를 등록해 브라우저 기본 경고를 띄우고, 툴바의 세 링크는 클릭 시 `hasChanges`면 종료 다이얼로그(저장 후 이동 / 버리고 이동)를 먼저 띄우도록 바꾼다. 보조적으로 스테이징 맵을 sessionStorage에 백업해 복구 옵션을 제공할 수 있다.

<details><summary>반증 검증 근거</summary>

AdminToolbarMain.tsx를 확인했다 — 99-104행('사이트 빌더'), 105-110행('히스토리'), 116-121행('관리자') 모두 next/link가 아닌 순수 `<a href>`다. 스테이징 상태는 AdminEditContext.tsx:61-63의 useState에만 존재하고 localStorage/sessionStorage 백업이 없으며, AdminEditShell.tsx가 Provider를 클라이언트 트리 상단에 두므로 전체 페이지 이동이 일어나면 상태가 통째로 파괴된다. `grep -rn beforeunload src` 결과 0건으로 이탈 경고도 없다. 즉 'N개 변경' 표시 중에 같은 툴바의 링크 한 번으로 전부 사라진다는 주장은 코드로 확인된다. 다만 사이트 빌더/히스토리 링크는 `hidden xl:flex`(98행) 안이라 xl 미만 화면에서는 노출되지 않고('관리자' 링크는 항상 노출), 트리거가 관리자의 명시적 클릭이며 새로고침 경고 부재는 방어 장치 누락이므로 medium이 아니라 low로 정정한다.

</details>

---

## 33. [LOW] 리스트 편집 모달은 아무것도 바꾸지 않고 '적용'만 눌러도 변경으로 스테이징되어 기본값을 DB에 고정시킴

- **위치**: `src/components/editable/editable-list/useEditableListEditor.ts:50`
- **분류**: ui-state · 인라인 편집(page-content)

**무엇이 잘못됐나**

`handleSave`는 이전 값과의 비교 없이 무조건 `stageChange`를 호출한다(EditableText·EditableRichText·EditableLink·EditableValue는 모두 `!==` 비교 후에만 스테이징하는 것과 대비된다). 그래서 리스트를 열어 내용만 확인하고 '적용'을 누르면 변경 0건인데도 '1개 변경'이 잡히고, 저장하면 하드코딩 기본값과 동일한 JSON이 page_content override로 새로 생성된다. 이후 개발자가 코드의 defaultItems를 갱신해도 DB override가 우선하므로 화면에 반영되지 않고, 원상복구하려면 '기본값 복원'으로 행을 지워야 한다는 사실을 알아야 한다. 또한 변경이 없어도 편집 모드 종료 시 불필요한 '저장되지 않은 변경사항' 다이얼로그가 뜬다.

**재현**

1) 편집 모드에서 홈의 통계 리스트(home.stats.items)를 클릭해 모달을 연다. 2) 아무것도 수정하지 않고 '적용'을 누른다. 3) 툴바가 '1개 변경'으로 바뀐다. 4) '저장'하면 기본값과 동일한 값의 page_content 행이 생성되고, 이후 코드의 defaultItems를 바꿔도 화면은 옛 값 그대로다.

**수정 방향**

`handleSave`에서 `JSON.stringify(stripEditableListIds(localItems))`를 현재 값(`getContent(contentKey) ?? JSON.stringify(defaultItems)`)과 비교해 동일하면 스테이징하지 않고 모달만 닫는다.

<details><summary>반증 검증 근거</summary>

useEditableListEditor.ts:50-58의 handleSave는 이전 값 비교 없이 무조건 stageChange를 호출한다. 대조군도 실제로 확인했다 — EditableText.tsx:41 `if (newValue !== value)`, EditableRichText.tsx의 handleSave `if (trimmed !== value)`로 둘 다 비교 후에만 스테이징한다. handleOpen(40-45행)이 `parseEditableListItems(getContent(...), defaultItems)`로 localItems를 채우므로(items.ts: raw가 없으면 defaultItems 반환) override가 없는 리스트를 열었다가 그대로 '적용'하면 하드코딩 기본값과 동일한 JSON이 스테이징되고, 저장하면 page_content에 동일 값 override 행이 생성된다. 이후 getStoredContent가 dbRow.value를 우선하므로(content-store.ts) 코드의 defaultItems 변경이 화면에 반영되지 않는 것도 사실이다. 변경 0건인데 hasChanges가 true가 되어 종료 다이얼로그가 뜨는 부작용도 useAdminToolbar.ts:28로 확인된다. 보고된 low 유지.

</details>

---

## 34. [LOW] 연도 필터 목록이 하드코딩되어 있어 2020년·2027년 이후 이벤트는 어떤 탭에서도 볼 수 없다

- **위치**: `src/components/timeline/timeline-config.ts:99`
- **분류**: ui-state · 타임라인 CRUD

**무엇이 잘못됐나**

koreanTimelineConfig.years / englishTimelineConfig.years 가 `["전체", 2019, 2021, 2022, 2023, 2024, 2025, 2026]` 로 고정되어 있다. 반면 관리자는 임의 연도의 이벤트를 등록할 수 있고 TimelinePage는 `event.year === selectedYear` 로만 필터링한다(TimelinePage.tsx:28). 목록에 없는 연도의 이벤트는 '전체'에서만 보이고 어떤 연도 탭으로도 도달할 수 없다. 2020년이 이미 목록에서 빠져 있어 2020년 사건을 추가하면 즉시 재현되고, 2027년이 되면 그 해에 등록되는 모든 신규 이벤트가 같은 상태가 된다.

**재현**

1) /admin/timeline/new 에서 날짜 '2020년 3월', 카테고리 '집회' 등으로 이벤트 등록(year=2020 저장). 2) /timeline 방문 → 상단 연도 탭에 '2020년' 버튼이 없다. 3) 다른 연도 탭(예: 2019년)을 누르면 이 카드는 사라지고, '전체'로 돌아와야만 다시 보인다. /en/timeline 도 동일.

**수정 방향**

years를 하드코딩하지 말고 서버에서 받은 timelineEvents의 year 집합을 오름차순 정렬해 동적으로 생성하고, 맨 앞에 '전체'/'All'을 붙인다(라벨 포맷은 기존 formatYear 유지).

<details><summary>반증 검증 근거</summary>

timeline-config.ts:99 `years: ["전체", 2019, 2021, 2022, 2023, 2024, 2025, 2026]`, 140행 `years: ["All", 2019, 2021, ... 2026]` 으로 2020년이 빠진 하드코딩 목록임을 확인했다. TimelinePage.tsx:25-28은 `selectedYear === timelineConfig.allYear ? timelineEvents : timelineEvents.filter((event) => event.year === selectedYear)` 로 정확히 일치 비교만 한다. 반면 관리자 등록에는 연도 화이트리스트가 없고(form.ts는 2000~2100 또는 date 추출), DB에도 year CHECK 제약이 없어 2020·2027년 이벤트가 얼마든지 생긴다. 그러면 해당 이벤트는 '전체' 탭에서만 보이고 전용 연도 탭이 존재하지 않는다. 다만 기본 선택이 allYear(22-24행)이라 기본 화면에서는 정상 노출되고, 피해는 '연도 탭으로 도달 불가'에 한정되므로 low 유지. 파일:줄 위치도 정확하다.

</details>

---

## 35. [LOW] admin_members 변경 액션이 영향 행 수를 확인하지 않아 0행 변경도 성공으로 처리된다

- **위치**: `src/lib/actions/admin-members.ts:38`
- **분류**: error-handling · 인증·권한

**무엇이 잘못됐나**

updateAdminRoleAction(38행), setAdminActiveAction(52행), removeAdminMemberAction(69행)은 update/delete 후 .select()로 실제 반영 행을 확인하지 않는다. PostgREST는 조건에 맞는 행이 0개여도 오류를 반환하지 않으므로, 대상 행이 사라졌거나 RLS(admin_members_owner_update/delete, is_admin_owner() 기준)로 걸러진 경우에도 error가 null이 되어 액션은 null(성공)을 반환한다. 같은 파일의 다른 코드나 news/board 액션들은 .single()/.select()로 '거짓 성공'을 막고 있는데(예: src/lib/actions/board.ts:153-155의 '0행이면 권한 없음 → 거짓 성공 방지' 처리) 명부 관리 액션만 빠져 있다.

그 결과 (a) 사용자에게는 성공으로 보이는데 아무것도 바뀌지 않고, (b) 그 뒤 logAudit이 실제로 일어나지 않은 변경을 audit_log에 기록해 /admin/history의 변경 이력이 사실과 달라진다. 특히 removeAdminMemberAction은 명부 DELETE가 0행이어도 그대로 다음 단계로 진행해 service-role로 auth 계정 삭제(92행)를 시도하는 구조여서, DELETE만 실패하고 auth 계정만 사라지면 admin_members.user_id가 NULL(ON DELETE SET NULL)로 남아 해당 이메일이 로그인도 재가입(existing 검사에 걸림)도 못 하는 영구 잠김이 된다.

**재현**

1) owner로 /admin/members를 두 탭(A, B)에 연다.
2) 탭 A에서 '대기중' 회원 #7을 삭제한다(목록에서 사라짐).
3) 탭 B(갱신 전 화면)에서 #7의 역할 select를 'editor'로 바꾼다.
4) updateAdminRoleAction(7,'editor') → wouldRemoveLastOwner는 false → update ... .eq('id',7)가 0행에 매칭되지만 error는 null → 액션이 null(성공)을 반환. 탭 B에는 아무 오류도 표시되지 않는다.
5) /admin/history를 열면 admin_members #7에 대한 'update {role: editor}' 감사 로그가 남아 있다. 실제로는 존재하지 않는 행에 대한 허위 이력이다.

**수정 방향**

세 액션 모두 .update(...).eq('id', id).select('id').maybeSingle() / .delete().eq('id', id).select('id').maybeSingle() 형태로 바꾸고, 반환 행이 없으면 '대상을 찾을 수 없거나 권한이 없습니다.' 오류를 돌려준 뒤 logAudit과 후속 처리를 건너뛴다. removeAdminMemberAction은 특히 명부 DELETE가 1행을 지웠음을 확인한 뒤에만 service.auth.admin.deleteUser로 진행하도록 순서를 고정한다.

<details><summary>반증 검증 근거</summary>

핵심 주장은 코드로 확인된다. admin-members.ts:38/52/69의 update·delete에는 .select()/.single()이 없어 반환값이 `{error}`뿐이고, PostgREST는 매칭 행 0건이어도 오류를 내지 않는다. 따라서 대상 행이 이미 사라진 경우 error=null → 액션이 null(성공) 반환 → MembersManager.tsx:31-33은 r?.error만 보므로 아무 오류도 표시하지 않고, 곧바로 logAudit(40/54/97행)이 실행된다. audit_log에는 record_id에 FK가 없어(20260313_audit_log.sql) 존재하지 않는 명부 행에 대한 'update {role: editor}' 기록이 그대로 남고 /admin/history에 노출된다. 두 탭 재현 시나리오는 그대로 성립한다(수동으로 결정론적으로 재현 가능).
다만 부가 주장 두 가지는 반증된다: (a) 'RLS(is_admin_owner)로 걸러져 0행'은 requireOwner를 통과한 정상 owner에게는 발생하지 않는다(admin_role()이 user_id 매칭으로 owner를 반환해야만 앱 게이트도 통과하는 것이 정상 경로다). (b) removeAdminMemberAction의 '영구 잠김' 경로는 성립하지 않는다 — auth 계정 삭제는 삭제 직전 SELECT(67-68행)로 얻은 target이 non-null이고 role='pending'일 때만 실행되는데, DELETE가 0행이라는 것은 그 행이 이미 사라졌다는 뜻이므로 user_id가 NULL로 남는 고아 명부 행 자체가 존재하지 않는다. 이 오판 부분을 제외하면 '거짓 성공 + 허위 감사 이력'이라는 본 결함은 실재하므로 low로 CONFIRMED.

</details>

---

## 36. [LOW] 명부 삭제 감사 로그에 대상 식별 정보가 전혀 없어 누가 제거됐는지 추적 불가

- **위치**: `src/lib/actions/admin-members.ts:97`
- **분류**: error-handling · 감사로그·버전 히스토리

**무엇이 잘못됐나**

removeAdminMemberAction은 admin_members 행을 DELETE한 뒤 `logAudit(supabase, "admin_members", id, "delete", {})`로 entity_key도 payload도 없이 기록한다. record_id는 이미 삭제된 행의 id라 사후 조회로 이메일을 복구할 수 없고, 이 경로는 조건에 따라 auth 계정까지 삭제한다(되돌릴 수 없는 작업). /admin/history에는 "admin_members delete"라는 문자열만 남는다. 같은 파일 40행·54행의 역할/활성 변경도 payload에 before가 없어 '무엇에서 무엇으로 바뀌었는지'를 알 수 없다.

**재현**

1) owner로 로그인해 /admin/members에서 pending 회원 someone@example.com을 삭제한다. 2) /admin/history를 연다. 3) 결과: "admin_members delete" 한 줄만 있고 대상 이메일·역할·user_id가 어디에도 없다. admin_members 행은 삭제됐고 auth 계정도 함께 지워졌을 수 있어, 나중에 '누가 왜 잘렸는지' 확인할 방법이 남지 않는다.

**수정 방향**

삭제 직전에 조회해 둔 target(email, role, user_id, display_name)을 entityKey와 payload.before에 담아 기록하고, auth 계정을 실제로 지웠는지 여부(payload.auth_user_deleted)도 함께 남긴다. 역할/활성 변경도 `payload: { before: {role: oldRole}, after: {role} }` 형태로 통일한다.

<details><summary>반증 검증 근거</summary>

코드 그대로다. admin-members.ts:97 `await logAudit(supabase, "admin_members", id, "delete", {});` — entityKey도 payload도 없다. 같은 저장소의 다른 삭제 액션과 대조하면 명백한 누락이다: deleteNews(news/mutations.ts:136-142)는 entityKey+before/after를, deleteTimeline(timeline/mutations.ts:152-158)도 동일하게, deleteMeeting(meetings/mutations.ts:113-115)조차 entityKey를 남긴다. 반면 이 경로는 67-68행에서 `select("user_id, role")`만 조회해 email조차 손에 쥐지 않은 채 69행에서 DELETE하고, 89-95행에서 조건 충족 시 service 클라이언트로 auth 계정까지 되돌릴 수 없이 삭제한다. record_id는 이미 사라진 admin_members.id라 사후 역추적이 불가능하고, 40행/54행의 역할·활성 변경 로그도 payload에 새 값만 있어 before를 알 수 없다는 지적도 코드와 일치한다. 다만 데이터가 오염되거나 잘못 동작하는 것은 아니고 추적성 결손이므로 심각도를 low로 내린다.

</details>

---

## 37. [LOW] 세션 만료 시 requireEditor가 던지는 NEXT_REDIRECT를 catch가 삼켜 로그인 이동이 사라진다

- **위치**: `src/lib/actions/auth.ts:22`
- **분류**: error-handling · 인증·권한

**무엇이 잘못됐나**

getAuthenticatedActionContext는 로그인되지 않은 경우 redirect('/admin/login')을 호출한다. Next.js의 redirect()는 digest='NEXT_REDIRECT'인 예외를 던지는 방식으로 동작하므로, 호출자가 이를 다시 던지지 않으면 리다이렉트가 사라진다.

그런데 requireEditor()를 try 블록 안에서 호출하고 catch에서 예외를 통째로 삼키는 액션이 다수 있다:
- src/lib/actions/news/mutations.ts:123-147(deleteNews), 151-175(restoreNews), 186-224(restoreNewsVersion)
- src/lib/actions/timeline/mutations.ts:139-163(deleteTimeline), 167-191(restoreTimeline), 202-239(restoreTimelineVersion)
- src/lib/actions/meetings/mutations.ts:101-120(deleteMeeting), 124-143(restoreMeeting)
- src/lib/actions/meeting-attachments.ts:67-99(deleteMeetingAttachmentAction)

이 경로에서는 세션이 끊긴 사용자가 로그인 페이지로 이동하는 대신, 원인과 무관한 '삭제에 실패했습니다. 다시 시도해주세요.' 같은 고정 문구만 받는다. 사용자는 몇 번을 눌러도 같은 메시지를 보게 되며(재시도해도 항상 같은 지점에서 실패), 세션이 만료됐다는 사실을 알 수 없다. 반면 createNews/updateNews처럼 redirect가 try 밖에 있는 액션은 정상 동작해 같은 화면에서 동작이 일관되지 않는다.

**재현**

1) editor로 로그인해 /admin/news 목록을 연 채로 둔다.
2) 다른 탭/기기에서 로그아웃하거나 refresh token이 만료될 때까지 방치해 서버 세션을 무효화한다(브라우저에는 페이지가 그대로 남아 있다).
3) 목록에서 임의 소식의 '삭제'를 누른다.
4) 기대: /admin/login(→/login)으로 이동해 재로그인 안내. 실제: deleteNews의 catch가 NEXT_REDIRECT를 삼켜 '삭제에 실패했습니다. 다시 시도해주세요.'만 표시되고 페이지에 그대로 머문다. 같은 상태에서 '새 소식' 폼 저장(createNews)은 정상적으로 로그인 페이지로 이동해 동작이 어긋난다.

**수정 방향**

두 가지 중 하나. (1) getAuthenticatedActionContext에서 redirect를 쓰지 않고 requireEditor/requireOwner/requireActiveAdmin과 동일하게 { error: '세션이 만료되었습니다. 다시 로그인해주세요.' }를 반환하도록 통일한다(주석에 적힌 'redirect 아님' 의도와도 일치). (2) redirect를 유지한다면 각 catch에서 next/navigation의 isRedirectError(또는 error.digest?.startsWith('NEXT_REDIRECT')) 검사 후 즉시 rethrow하고, 권한 게이트 호출을 try 밖으로 빼낸다.

<details><summary>반증 검증 근거</summary>

코드 대조 결과 인용이 정확하다. auth.ts:22 `if (!user) redirect("/admin/login")` → loadAdminContext(52행)에서 await로 호출되므로 requireEditor()가 NEXT_REDIRECT 예외로 reject된다. 지목된 호출부가 모두 `catch { return {error: ...} }`(rethrow 없음)로 확인됐다: news/mutations.ts 123-147·151-175·186-224, timeline/mutations.ts 139-163·167-191·202-239, meetings/mutations.ts 101-120·124-143, meeting-attachments.ts 67-99. 반면 createNews/updateNews·createTimeline/updateTimeline·createMeeting/updateMeeting은 try 없이 redirect가 최상위에 있어(news/mutations.ts:64,119 등) 정상 리다이렉트된다. 래퍼(news.ts의 deleteNewsAction 등)는 단순 위임이라 예외를 다시 잡지 않으므로 catch가 최종 소비자다. '삭제' 버튼은 클라이언트 컴포넌트에서 서버 액션을 호출하므로, 다른 탭 로그아웃/토큰 만료로 세션이 끊긴 stale 화면에서 실제로 도달 가능한 경로다.
다만 영향은 잘못된 안내 문구뿐이고(데이터 손상·권한 우회 없음, 새로고침하면 페이지 가드가 정상 리다이렉트) 발생 조건도 세션 만료라는 경계 상황이라 medium → low로 하향한다. 지목 위치(auth.ts:22)는 정확하다.

</details>

---

## 38. [LOW] 삭제/복원 액션의 try/catch가 Next.js redirect 예외를 삼켜 세션 만료 시 로그인으로 못 보내고 거짓 실패만 반복

- **위치**: `src/lib/actions/news/mutations.ts:145`
- **분류**: error-handling · 소식/언론보도 CRUD

**무엇이 잘못됐나**

deleteNews(123~148), restoreNews(152~176), restoreNewsVersion(186~225)은 본문 전체를 try/catch로 감싸고 catch에서 고정 문구를 반환한다. 그런데 그 안에서 호출하는 requireEditor → loadAdminContext → getAuthenticatedActionContext(src/lib/actions/auth.ts:22)는 사용자가 없으면 `redirect("/admin/login")`을 호출하고, Next.js의 redirect는 NEXT_REDIRECT digest를 가진 예외를 던져 동작한다. 빈 catch가 이 예외를 잡아버리므로 리다이렉트가 취소되고, 클라이언트에는 '삭제에 실패했습니다. 다시 시도해주세요.'만 표시된다. createNews/updateNews는 try/catch가 없어 정상적으로 리다이렉트되므로 같은 상황에서 동작이 갈린다. 사용자는 원인을 알 수 없고 재시도해도 영원히 같은 에러만 본다. 동일한 catch가 Supabase 미설정 예외(auth.ts:17 throw)도 같은 문구로 뭉갠다.

**재현**

1) editor로 /admin/news를 연 상태로 둔다. 2) 브라우저 개발자도구 Application 탭에서 sb-*-auth-token 쿠키를 삭제한다(또는 세션 만료를 기다린다). 3) 페이지를 새로고침하지 않고 소식 항목의 '삭제' → 모달 '삭제' 클릭. 4) /admin/login으로 이동하지 않고 목록 아래에 '삭제에 실패했습니다. 다시 시도해주세요.'만 뜬다. 몇 번을 눌러도 동일. '복원' 버튼, /admin/history의 '이 버전 복원'도 같다.

**수정 방향**

catch 블록에서 `unstable_rethrow(e)`(next/navigation)를 먼저 호출하거나, `if (e && typeof e === 'object' && 'digest' in e && String(e.digest).startsWith('NEXT_REDIRECT')) throw e;`로 프레임워크 제어 예외를 다시 던져라. 더 나은 방법은 requireEditor 호출을 try 밖으로 빼고 try 범위를 Supabase 쿼리로 좁히는 것이다.

<details><summary>반증 검증 근거</summary>

코드 대조 결과 사실이다. deleteNews(mutations.ts:122~148), restoreNews(150~176), restoreNewsVersion(178~225) 모두 본문 전체가 try로 감싸이고 catch가 인자 없는 'catch {'로 고정 문구를 반환한다(145·173·222행). 그 안의 requireEditor(auth.ts:106) → loadAdminContext(51) → getAuthenticatedActionContext(15)는 user가 없으면 22행에서 redirect('/admin/login')을 호출하고, Next.js redirect는 NEXT_REDIRECT digest 예외를 던져 동작하므로 unstable_rethrow 없는 이 catch에 잡혀 리다이렉트가 취소된다. auth.ts:17의 'Supabase not configured' throw도 동일하게 뭉개진다. 반면 createNews(64행)·updateNews(119행)는 try/catch가 없어 정상 리다이렉트되므로 동작이 갈린다는 지적도 맞다. 다만 실제 피해는 '잘못된 에러 문구 + 로그인 리다이렉트 누락'에 그치고(삭제 자체는 어차피 실패해야 정상), 페이지를 새로고침하면 proxy.ts 미들웨어가 /login으로 보내므로 영구 차단은 아니다. medium은 과대평가라 low로 정정한다.

</details>

---

## 39. [LOW] 이미지 업로드 후 DB 저장이 실패해도 스토리지 파일을 되돌리지 않아 고아 파일이 쌓인다

- **위치**: `src/lib/actions/news/mutations.ts:29`
- **분류**: data-loss · 미디어·업로드

**무엇이 잘못됐나**

createNews(29줄)·updateNews(81줄)·createTimeline(45줄)·updateTimeline(99줄)은 모두 DB 쓰기보다 먼저 uploadImageFromFormData()로 파일을 스토리지에 올린다. 이후 insert/update가 실패하면 에러 문자열만 반환하고 방금 올린 파일을 지우지 않는다. 같은 저장소의 다른 업로드 경로는 이 정리를 이미 하고 있다 — board.ts 136~140줄은 insert 실패 시 storage.remove(path), meeting-attachments.ts 48~51줄도 동일하다. 즉 news/timeline 경로만 롤백이 빠져 있다. 결과적으로 images/news/, images/timeline/ 에 아무 레코드도 참조하지 않는 파일이 남고, 관리자는 그것이 고아인지 사용 중인지 구분할 방법이 없다(미디어 라이브러리에 사용처 표시가 없으므로 함부로 지우지도 못한다). 이미지 교체(수정 시 새 파일 업로드)와 소식 삭제(soft delete) 역시 옛 파일을 정리하지 않는다.

**재현**

/admin/timeline/new 에서 사진 파일을 첨부하고, 개발자도구로 히든 필드 sort_order 값을 9999999999(INT 범위 초과)로 바꾼 뒤 저장한다 → 파일 업로드는 성공한 뒤 insert가 'value out of range for type integer'로 실패해 "저장 중 오류가 발생했습니다. 다시 시도해주세요."만 표시된다 → /admin/media 의 timeline 폴더를 보면 아무 타임라인 이벤트도 참조하지 않는 <uuid>.jpg 파일이 그대로 남아 있다. (동일 현상은 저장 시점의 일시적 Supabase 오류·RLS 거부 등 모든 DB 실패 경로에서 재현된다.)

**수정 방향**

insert/update 실패 분기에서 uploadResult.url로 만든 path를 storage.from("images").remove([path])로 정리하라(board.ts·meeting-attachments.ts와 동일 패턴). 겸사겸사 sort_order/year 같은 숫자 필드에 INT 범위 검증을 추가하고, 수정 시 이미지를 교체하면 이전 파일을 삭제할지 정책을 정하는 것이 좋다.

<details><summary>반증 검증 근거</summary>

인용된 위치가 모두 정확하다. news/mutations.ts:29(createNews)·81(updateNews), timeline/mutations.ts:45(createTimeline)·99(updateTimeline)에서 `uploadImageFromFormData`가 DB 쓰기보다 먼저 실행되고, 이후 insert/update 실패 시 `return { error: friendlyNewsError(...) }` / `friendlyTimelineError(...)`로 끝날 뿐 storage.remove 호출이 없다. 대조군 주장도 사실이다 — board.ts uploadBoardImage는 insert 실패 시 `await gate.supabase.storage.from(BOARD_IMAGE_BUCKET).remove([path])`를 수행하고, meeting-attachments.ts도 '메타 저장 실패 시 업로드한 파일 정리' 주석과 함께 remove를 호출한다. 즉 의도된 설계가 아니라 두 경로만 누락이다. 재현 시나리오도 성립한다: TimelineForm.tsx의 `<input type="hidden" name="sort_order">`를 9999999999로 바꾸면 timeline/form.ts:35 `parseInt(sortOrderStr,10) || 0`이 그대로 통과시키고, resolveTimelineSortOrder(mutations.ts:22)가 0이 아니므로 값을 유지하며, 20260311_create_admin_tables.sql:42의 컬럼이 `sort_order INT`(int4)라 insert가 범위 초과로 실패한다 → 업로드된 파일만 남는다. 다만 결과는 '데이터 손실'이 아니라 참조되지 않는 스토리지 쓰레기 축적이고 사용자에게 보이는 오동작은 없으므로 medium이 아니라 low가 적정하다.

</details>

---

## 40. [LOW] 동시 편집 시 뒤늦은 저장이 다른 관리자의 변경을 통째로 덮어씀 (버전 검사 없음)

- **위치**: `src/lib/actions/page-content.ts:51`
- **분류**: race · 인라인 편집(page-content)

**무엇이 잘못됐나**

`upsert(rows, { onConflict: "content_key" })`는 낙관적 동시성 제어가 전혀 없다 — 조건 없이 value/metadata/page/section을 덮어쓴다. 클라이언트의 `dbContent`는 페이지 로드 시점 스냅샷이고 이후 갱신되지 않으므로, 관리자 A가 탭을 열어둔 채 시간이 지나 저장하면 그 사이 관리자 B가 넣은 값이 경고 없이 사라진다. 특히 EditableList는 리스트 전체가 하나의 JSON 값이라 서로 다른 항목을 고쳐도 통째 클로버링된다.

**재현**

1) 관리자 A와 B가 각각 홈(/)을 연다. 2) B가 편집 모드에서 home.quotes.items 리스트에 인용문 1개를 추가하고 저장한다(총 4개). 3) A는 페이지를 새로고침하지 않은 채 같은 리스트를 열어 첫 항목의 문구만 수정하고 저장한다. 4) A의 로컬 스냅샷은 3개짜리이므로 저장된 JSON도 3개가 되어 B가 추가한 4번째 인용문이 아무 경고 없이 사라진다. 충돌 알림도, 히스토리상의 경고도 없다.

**수정 방향**

page_content에 버전/updated_at 기반 조건부 갱신을 도입한다(예: 클라이언트가 읽은 updated_at을 함께 보내 `.eq('updated_at', clientSeen)` 조건 update로 처리하고, 0행 갱신이면 '다른 관리자가 먼저 저장했습니다. 새로고침 후 다시 시도하세요.' 반환). 최소한 저장 직전에 해당 키들의 현재 값을 다시 읽어 스냅샷과 다르면 사용자에게 충돌을 알려야 한다.

<details><summary>반증 검증 근거</summary>

page-content.ts:51-53은 `upsert(rows, { onConflict: "content_key" })`이고 updated_at/버전 비교 조건이 전혀 없다(40-49행에서 updated_at을 무조건 새 값으로 덮어씀). 스키마(20260317_page_content.sql)에도 버전/etag 컬럼이나 충돌 감지 트리거가 없고, RLS는 authenticated에 UPDATE 전면 허용이라 상위에서 막는 것도 없다. 클라이언트의 dbContent는 AdminEditContext.tsx:64에서 initialContent로 한 번 초기화된 뒤 자기 저장 결과(150행)와 revertKey(125행)로만 갱신되므로 다른 관리자의 변경을 반영하지 않는다. 리스트 클로버링 시나리오도 성립한다 — useEditableListEditor.ts:40-45의 handleOpen이 `getContent(contentKey)`(=자기 스냅샷)로 모달을 채우고 51-56행에서 배열 전체를 JSON 한 덩어리로 스테이징하므로 다른 항목 추가분이 통째로 사라진다. 다만 관리자 2명 이상이 같은 키를 동시에 편집해야 하는 조건부 시나리오이고 last-write-wins가 명시적 설계일 가능성도 있어 medium이 아니라 low로 정정한다.

</details>

---

## 41. [LOW] 인라인 편집기의 이미지 업로드만 감사 로그가 남지 않는다

- **위치**: `src/lib/actions/page-content.ts:126`
- **분류**: upload · 감사로그·버전 히스토리

**무엇이 잘못됐나**

uploadMediaLibraryAction(media-library.ts:23)은 images 버킷 업로드를 logAudit("storage.images", create)로 남기는데, 같은 버킷에 파일을 올리는 uploadEditableImageAction에는 logAudit 호출이 없다. 인라인 편집기로 올라간 파일은 감사 로그에 흔적이 전혀 없어, 부적절한 이미지가 올라왔을 때 누가 언제 올렸는지 추적할 수 없다. 업로드된 오브젝트는 곧바로 public URL로 노출된다(getPublicUrl).

**재현**

1) editor로 로그인 → 공개 페이지에서 인라인 편집 모드 진입 → 이미지 편집 가능 영역에서 파일을 업로드한다. 2) images 버킷의 page-content/<uuid>.png 오브젝트가 생성되고 공개 URL이 콘텐츠에 반영된다. 3) /admin/history를 확인하면 이 업로드에 대한 storage.images create 항목이 존재하지 않는다(같은 시각 /admin/media에서 올린 파일은 기록됨).

**수정 방향**

업로드 성공 직후 `await logAudit(supabase, "storage.images", 0, "create", { entityKey: publicUrl, payload: { folder: "page-content", url: publicUrl } })`를 추가한다. 업로드 경로가 두 곳으로 갈라져 있으므로 uploadImageFromFormData 같은 공통 헬퍼 안에서 로깅하도록 합치는 편이 재발을 막는다.

<details><summary>반증 검증 근거</summary>

두 파일을 대조해 확인했다. media-library.ts:22-30의 uploadMediaLibraryAction은 업로드 성공 시 `logAudit(supabase, "storage.images", 0, "create", { entityKey: url, payload: { folder, url } })`를 남기는데, 같은 images 버킷에 쓰는 page-content.ts:126-169의 uploadEditableImageAction에는 logAudit 호출이 아예 없다(155-166행에서 upload 후 곧바로 getPublicUrl로 공개 URL을 반환하고 끝난다). EditableImage.tsx:46-83을 보면 파일 선택 즉시 업로드가 실행되고 stageChange로 스테이징만 되므로, 관리자가 저장하지 않고 이탈하면 공개 URL을 가진 오브젝트가 어떤 감사 기록도 없이 스토리지에 남는다. 다만 보고서의 '추적할 수 없다'는 다소 과하다 — 실제로 저장까지 이어지면 savePageContentAction의 bulk_update 감사 항목 payload.after에 해당 이미지 URL과 user_email이 남아 간접 추적은 가능하다. 그래서 실질 결손은 '저장되지 않은 업로드(고아 파일)' 구간에 한정된다. low 유지.

</details>

---

## 42. [LOW] 빈 문자열 저장이 검증 없이 허용되어 요소가 영구히 사라지고 되돌리기도 어려움

- **위치**: `src/lib/actions/page-content/validation.ts:102`
- **분류**: validation · 인라인 편집(page-content)

**무엇이 잘못됐나**

`normalizeChange`는 image/list/link/section 타입만 검사하고 text/richtext는 아무 검증 없이 통과시킨다(102행). 길이 하한·상한이 전혀 없어 빈 문자열도 그대로 upsert된다. 클라이언트 조회 경로도 `getStoredContent`가 `dbRow.value`를 그대로 반환하고 각 컴포넌트는 `getContent(key) ?? defaultValue`로 읽는데, `??`는 null/undefined만 걸러내므로 빈 문자열은 기본값으로 폴백되지 않는다. 결과적으로 제목/본문이 빈 요소로 렌더링되고, 편집 모드에서 그 contentEditable은 내용이 없어 높이 0에 가까워 다시 클릭·선택하기가 사실상 불가능해 툴바의 '기본값 복원'도 쓸 수 없다. 복구하려면 /admin/history에 의존해야 한다.

**재현**

1) 편집 모드에서 아무 제목(예: home.quotes.heading '주민들의 목소리')을 클릭하고 Ctrl+A → Delete로 비운 뒤 blur → 저장. 2) 편집 모드를 끄면 해당 제목이 화면에서 사라진다(빈 override가 기본값을 가림). 3) 다시 편집 모드를 켜도 그 자리에 클릭할 영역이 거의 없어 요소를 선택할 수 없고, 툴바 '기본값 복원'은 selectedKey가 잡히지 않아 사용할 수 없다.

**수정 방향**

서버 `normalizeChange`에서 text/richtext에 대해 trim 후 빈 값을 거부하고(또는 '기본값으로 되돌리기'로 해석해 해당 행을 삭제) 상한 길이(예: text 500자, richtext 10,000자)도 함께 검증한다. 클라이언트에서는 `getContent(key) || defaultValue` 형태로 빈 문자열을 기본값 폴백에 포함시키고, EditableText blur 시 빈 값이면 사용자에게 안내한다.

<details><summary>반증 검증 근거</summary>

validation.ts의 normalizeChange는 content_type이 image/list/link/section일 때만 값 검증을 하고(38-100행) text/richtext는 102행에서 무조건 통과시킨다 — 길이 하한/상한이 전혀 없다. DB도 막지 않는다: 20260317_page_content.sql의 value는 `TEXT NOT NULL DEFAULT ''`로 빈 문자열을 허용하고 CHECK 제약이 없다. 조회 경로도 확인했다 — content-store.ts의 getStoredContent는 `if (dbRow) return dbRow.value;`로 빈 문자열을 그대로 반환하고, 소비처는 EditableText.tsx:31 `getContent(contentKey) ?? defaultValue`라 `??`가 ''를 걸러내지 못한다. 따라서 빈 override가 하드코딩 기본값을 영구히 가리는 것은 확정이다. 복구 난이도 주장도 대체로 성립한다: useEditableSelection.ts:17이 `target.closest("[data-editable-key]")`로 선택하므로 빈 요소를 정확히 못 누르면 상위 EditableSection 래퍼(EditableSection.tsx:49-52)의 visibility 키가 selectedKey로 잡혀 '기본값 복원'이 엉뚱한 키를 겨냥하고, 최초 override였다면 히스토리 복원마저 발견 #5 때문에 실패한다. 다만 '빈 contentEditable은 높이 0이라 클릭 불가'는 브라우저 렌더링 의존이라 코드만으로는 확증할 수 없고, 트리거가 관리자의 의도적 전체 삭제라는 점을 감안해 medium이 아니라 low로 정정한다.

</details>

---

## 43. [LOW] 날짜에서 연도를 뽑을 때 범위 검증이 없어, 날짜 텍스트 속 4자리 숫자가 연도로 저장된다

- **위치**: `src/lib/actions/timeline/form.ts:31`
- **분류**: validation · 타임라인 CRUD

**무엇이 잘못됐나**

hidden year 값에는 `parsedYear >= 2000 && parsedYear <= 2100` 검사가 있지만, 그 검사를 통과하지 못해 폴백으로 호출되는 extractYearFromDate()(form.ts:6-9)의 결과에는 아무 범위 검증도 적용되지 않는다. extractYearFromDate는 date 문자열에서 처음 나오는 연속 4자리 숫자를 그대로 연도로 삼는다. timeline_events.year는 INT라 1000 같은 값도 그대로 INSERT된다. 이 사이트 특성상 날짜 문구에 '1,000명', '1000차' 같은 숫자가 섞이기 쉬운데, 그러면 이벤트가 연도 필터 어디에도 속하지 않게 된다.

**재현**

1) /admin/timeline/new 에서 날짜에 '1000명 대행진 (2025년 6월)' 입력, 나머지 정상 입력 후 등록. 2) hidden year=0 → 범위 밖 → extractYearFromDate가 첫 4자리 '1000'을 잡아 year=1000으로 저장. 3) /timeline 에서 2019~2026 어느 연도 탭을 눌러도 이 카드는 나오지 않고 '전체'에서만 보인다. 관리자 목록에는 '1000명 대행진 (2025년 6월) · 1000년'으로 표시. 4) 수정 화면에도 연도 입력란이 없고 hidden year=1000이 다시 범위 밖이라 또 추출 → 1000년으로 고정되어 복구 불가.

**수정 방향**

extractYearFromDate 결과에도 동일한 2000~2100 범위 검증을 적용하고, 범위를 벗어나면 현재 연도로 폴백하는 대신 '날짜에서 연도를 인식하지 못했습니다. 연도를 직접 선택해주세요' 오류를 반환해 저장을 막는다. 정규식도 `(19|20)\d{2}` 처럼 연도 형태로 좁히는 편이 안전하다.

<details><summary>반증 검증 근거</summary>

form.ts:6-9 `extractYearFromDate`는 `dateText.match(/(\d{4})/)`로 첫 4자리 연속 숫자를 잡아 그대로 반환하며 범위 검증이 전혀 없다. 반면 hidden year 경로(31행)에만 2000~2100 검증이 걸려 있어 비대칭이 확인된다. DB도 막지 않는다 — 20260311_create_admin_tables.sql:36은 `year INT NOT NULL`이고 마이그레이션 전체를 grep한 결과 year에 대한 CHECK/CONSTRAINT는 하나도 없다. 신규 등록 시 hidden year=0(TimelineForm.tsx:64)이 범위 밖이라 반드시 이 폴백을 타므로, '1000명 대행진 (2025년 6월)' 같은 date 입력은 year=1000으로 INSERT된다. 이후 TimelinePage.tsx:28 필터의 어느 연도 탭에도 걸리지 않고, 수정 화면에서도 hidden year=1000이 또 범위 밖이라 다시 추출되어 복구 불가라는 설명까지 코드와 일치한다. 다만 재현하려면 date 자유입력에 연도 아닌 4자리 숫자를 앞세워야 하는 다소 특이한 입력이 필요하므로 medium→low로 하향.

</details>

---

## 44. [LOW] delete/restore 액션의 try/catch가 Next.js redirect 예외를 삼켜, 세션 만료 시 로그인으로 이동하지 못하고 영구 실패한다

- **위치**: `src/lib/actions/timeline/mutations.ts:161`
- **분류**: error-handling · 타임라인 CRUD

**무엇이 잘못됐나**

deleteTimeline(139-164), restoreTimeline(166-192), restoreTimelineVersion(202-239)은 `requireEditor()` 호출까지 try 블록 안에 넣고 빈 `catch {}`로 모든 예외를 삼킨다. requireEditor → loadAdminContext → getAuthenticatedActionContext(auth.ts:22)는 로그인 세션이 없으면 `redirect("/admin/login")`을 호출하고, Next.js의 redirect는 NEXT_REDIRECT 예외를 던져 전파되어야 동작한다. 이 예외가 catch에 잡히면 리다이렉트가 취소되고 '삭제에 실패했습니다. 다시 시도해주세요.'라는 잘못된 원인의 메시지만 남는다. 반면 createTimeline/updateTimeline은 try로 감싸지 않아 정상 동작하므로 동작이 액션마다 불일치한다.

**재현**

1) 관리자로 /admin/timeline 을 연 상태로 둔다. 2) 다른 탭에서 로그아웃하거나 리프레시 토큰이 만료될 때까지 방치(쿠키 삭제로도 재현 가능). 3) 목록에서 '삭제' → 확인 클릭. 4) 기대: /admin/login 으로 이동. 실제: 화면 그대로 남고 '삭제에 실패했습니다. 다시 시도해주세요.'만 표시되며, 몇 번을 눌러도 동일하게 실패한다(권한 문제라는 단서가 전혀 없다). '복원' 버튼과 /admin/history의 '이 버전 복원'도 같다.

**수정 방향**

requireEditor() 호출을 try 블록 바깥으로 빼거나, catch에서 `next/navigation`의 unstable_rethrow(err)를 먼저 호출해 NEXT_REDIRECT/NEXT_NOT_FOUND 계열 예외를 재던지도록 한다.

<details><summary>반증 검증 근거</summary>

mutations.ts:139-164(delete), 166-192(restore), 202-239(restoreTimelineVersion) 모두 `requireEditor()` 호출을 try 안에 두고 빈 `catch {}`로 끝난다(161, 189, 237행). auth.ts:106-111 requireEditor → 51-52 loadAdminContext → 15-25 getAuthenticatedActionContext, 그리고 22행 `if (!user) redirect("/admin/login")`이 실재한다. Next 16.1.6의 node_modules/next/dist/client/components/redirect.js를 직접 확인한 결과 `function redirect(url, type){ ... throw getRedirectError(...) }`로 여전히 예외를 던진다(digest에 NEXT_REDIRECT). 따라서 세션 없는 상태에서 삭제/복원을 누르면 NEXT_REDIRECT가 catch에 잡혀 리다이렉트가 취소되고 '삭제에 실패했습니다…'만 남는다. 도달 가능성도 있다 — 관리자 페이지 렌더 후 쿠키 만료/삭제 시 서버 액션만 단독으로 실행되며, TimelineListActions.tsx:18-21은 반환된 result.error를 그대로 표시할 뿐이다. createTimeline/updateTimeline은 try로 감싸지 않아(34-83, 85-136) 정상 리다이렉트되므로 액션 간 불일치도 사실이다. 다만 데이터 훼손 없이 '잘못된 에러 문구 + 리다이렉트 실패'라는 UX 열화에 그치므로 medium→low로 하향.

</details>

---

## 45. [LOW] 동시 등록 시 sort_order가 중복되어 공개 페이지 순서가 흔들리고 관리자 목록 페이지네이션이 행을 중복/누락한다

- **위치**: `src/lib/actions/timeline/mutations.ts:24`
- **분류**: race · 타임라인 CRUD

**무엇이 잘못됐나**

resolveTimelineSortOrder는 최댓값을 SELECT한 뒤 별도 INSERT를 실행한다(읽기-쓰기 비원자적). 두 요청이 겹치면 같은 값을 읽어 동일한 sort_order로 두 행이 들어간다. sort_order 컬럼에는 UNIQUE 제약이 없고(20260311_create_admin_tables.sql:42), 정렬 쿼리도 `order("sort_order")` 단일 키만 사용하며 id 같은 tiebreaker가 없다(lib/data/timeline.ts:90, 120). 동점 행의 상대 순서는 Postgres가 보장하지 않으므로 요청마다 뒤바뀔 수 있고, 관리자 목록은 `range(from,to)` 오프셋 페이징이라 동점 행이 페이지 경계에 걸리면 같은 행이 두 페이지에 보이거나 한 행이 아예 안 보일 수 있다.

**재현**

1) 두 관리자(또는 두 탭)가 /admin/timeline/new 를 각각 열고 거의 동시에 '등록하기'를 누른다. 2) 둘 다 max sort_order=21을 읽고 각각 22로 INSERT → 22가 두 개. 3) /timeline 을 여러 번 새로고침하면 두 카드의 앞뒤가 뒤바뀌어 보일 수 있다. 4) 동점 행이 20개 경계(1페이지 마지막/2페이지 첫)에 걸리도록 항목 수를 맞추면, /admin/timeline?page=1 과 ?page=2 에서 같은 항목이 중복 표시되거나 한 항목이 어느 페이지에도 안 나온다.

**수정 방향**

sort_order 채번을 원자적으로 처리한다(예: `insert ... select coalesce(max(sort_order),0)+1 from timeline_events` 를 수행하는 SECURITY DEFINER RPC 또는 sequence 사용). 최소한 모든 정렬 쿼리에 `.order("id", { ascending: true })` 2차 정렬 키를 추가해 동점 시 순서와 페이지네이션을 결정적으로 만든다.

<details><summary>반증 검증 근거</summary>

mutations.ts:24-31은 max(sort_order)를 SELECT한 뒤 34-71의 별도 INSERT를 수행하는 비원자적 read-then-write이고, 트랜잭션·잠금·재시도가 없다. 20260311_create_admin_tables.sql:42는 `sort_order INT NOT NULL DEFAULT 0`으로 UNIQUE가 없고, 인덱스도 48행 `CREATE INDEX idx_timeline_sort ON timeline_events (sort_order) WHERE NOT is_deleted`로 유니크가 아니다. 정렬 쿼리도 lib/data/timeline.ts:90 `.order("sort_order", { ascending: true })`, 120행 `.order("sort_order", ...).range(from, to)` 로 tiebreaker가 없어 동점 행의 상대 순서가 미정의다. 즉 중복 sort_order 생성은 코드상 확정적이고, 그 뒤 UPDATE로 힙 튜플 위치가 바뀌면 동점 행의 출력 순서가 실제로 뒤집힐 수 있어 OFFSET 페이징(range)에서 경계 중복/누락도 성립한다. 다만 SELECT~INSERT 창이 매우 짧아 재현 확률이 낮고 피해가 표시 순서 흔들림에 그치므로 low가 적정하다(보고 등급 low 유지).

</details>

---

## 46. [LOW] 미디어 라이브러리가 폴더당 100개만 조회해 101번째부터는 목록에서 영구 누락되고 삭제·재사용이 불가능해진다

- **위치**: `src/lib/data/media-library.ts:23`
- **분류**: ui-state · 누락 영역

**무엇이 잘못됐나**

`getMediaLibraryItems()`가 4개 폴더(library, page-content, news, timeline) 각각에 대해 `supabase.storage.from("images").list(folder, { limit: 100, sortBy: { column: "updated_at", order: "desc" } })`로 최신 100개만 가져오고, 그 결과가 그대로 `MediaLibraryManager`의 `initialItems`가 된다(src/app/admin/media/page.tsx:5). 클라이언트 훅에도 페이지네이션·offset·더보기·검색이 전혀 없고(useMediaLibraryManager.ts:12 `useState(initialItems)`가 유일한 소스), UI에도 잘렸다는 표시가 없다. /admin/media는 storage의 파일을 삭제할 수 있는 유일한 화면이므로(deleteMediaLibraryItemAction), 한 폴더가 100개를 넘는 순간 오래된 파일들은 브라우징도 삭제도 불가능한 사각지대로 들어간다. 이미 확정된 '업로드 후 DB 저장 실패 시 고아 파일이 쌓인다'(news/mutations.ts:29)와 '이미지 교체·삭제 시 이전 스토리지 객체를 지우지 않는다'는 문제가 바로 news/timeline/page-content 폴더에 누적되므로, 정리하려 해도 100개 밖의 고아 파일에는 손을 댈 수 없다.

**재현**

1) editor로 /admin/media에서 폴더 'library'를 선택해 이미지를 101장 업로드한다(또는 소식 썸네일을 101건 등록해 news 폴더를 채운다). 2) 페이지를 새로고침한다. → 기대: 101장이 모두 보이거나 최소한 페이지 이동 수단이 있다. 실제: 가장 최근 100장만 렌더되고, 가장 먼저 올린 1장은 목록에서 사라진다. 그 파일의 공개 URL은 계속 살아 있지만 관리 UI에서 선택·삭제할 방법이 없다. 폴더를 news/timeline/page-content로 바꿔도 각각 동일하게 100개에서 잘린다.

**수정 방향**

`list()`에 `offset`을 주는 루프(또는 `{ limit: 1000, offset: page*1000 }` 기반 서버 페이지네이션)로 전량을 읽거나, /admin/media를 `searchParams.page`를 받는 서버 페이지네이션으로 바꾼다. 최소한 반환 개수가 limit에 도달하면 MediaLibraryStatus에 "최근 100개만 표시 중 — 이전 파일은 보이지 않습니다" 배너를 띄워 잘림을 드러내야 한다. 파일명 검색 필드를 추가하면 실사용 부담이 크게 줄어든다.

<details><summary>반증 검증 근거</summary>

코드에서 전부 확인했다. src/lib/data/media-library.ts:3 `MEDIA_FOLDERS = ["library", "page-content", "news", "timeline"]`, :20-25에서 각 폴더마다 `.list(folder, { limit: 100, sortBy: { column: "updated_at", order: "desc" } })` — offset 파라미터가 없어 최신 100개만 가져오고, :57-63은 4개 배열을 flat+정렬만 한다. 총량 카운트도 없다. src/app/admin/media/page.tsx:5-7이 그 결과를 그대로 initialItems로 넘기고, useMediaLibraryManager.ts:11-12 `const [items, setItems] = useState(initialItems)`가 유일한 소스이며 훅 전체(:11-111)에 offset·더보기·검색·재조회가 없다. UI에도 잘림 표시가 없다 — MediaLibraryGrid.tsx:19는 `{items.length}개`만 출력해 실제로는 '400개 중 400개'처럼 보이게 만든다. 삭제 경로 독점도 확인 — grep 결과 `storage.from("images").remove`는 lib/actions/media-library.ts:47(deleteMediaLibraryItemAction)뿐이고, 이 액션은 /admin/media UI에서만 호출된다(useMediaLibraryManager.ts:82). 따라서 100개 밖 파일은 브라우징도 삭제도 불가능하다. 재현 시나리오에 한 가지 정정이 필요하다: '폴더 library를 선택해' 부분은 오해다 — MediaUploadPanel.tsx:22-31의 select는 업로드 대상 폴더일 뿐이고, 그리드는 folder 상태로 필터링하지 않고 4개 폴더 전체를 합쳐 보여준다(MediaLibraryManager.tsx:30-34가 media.items를 그대로 전달). 정확한 재현은 'library 폴더에 101장을 업로드 후 새로고침 → 가장 오래된 1장이 그리드에서 완전히 사라지고 삭제 버튼에 접근할 수 없다'이다. 결함 자체는 성립한다. 다만 폴더 하나가 100개를 넘어야 발동하고 데이터 손상이나 사용자 노출 오류는 없으며 관리 사각지대에 그치므로 low로 하향한다.

</details>

---

## 47. [LOW] 서명 추이 차트의 가장 왼쪽 날짜가 '하루치'가 아니라 '조회 시각 이후분'만 집계된다

- **위치**: `src/lib/data/signatures.ts:31`
- **분류**: data-loss · 대시보드·서명·신고

**무엇이 잘못됐나**

sinceDate를 new Date()에서 만들고 setDate로 날짜만 빼기 때문에 '현재 시각'이 그대로 남는다(예: 13일 전 23:07). 이 값을 그대로 .gte("created_at", ...)에 넣어 조회하는데(42행), 버킷은 그 날짜의 0시부터 24시까지를 나타내는 것처럼 라벨링된다(64~68행, /admin/signatures/page.tsx:33의 MM-DD 라벨). 결과적으로 차트의 첫 번째 막대는 항상 '그날 조회 시각 이후'만 센 부분 집계이며, 페이지를 여는 시각에 따라 같은 날짜의 값이 계속 달라진다. maxDaily 계산에도 영향을 줘 막대 높이 스케일까지 흔들린다.

**재현**

8월 1일에 서명이 40건 들어왔고 그중 23:00 이후는 1건이라고 하자. 관리자가 8월 14일 23:30에 /admin/signatures를 열면 sinceDate = 8월 1일 23:30이 되어, 8월 1일 막대에 40이 아니라 0~1이 표시된다. 같은 페이지를 8월 14일 09:00에 열면 8월 1일 막대는 09:00 이후분만 세어 또 다른 값이 나온다. 즉 동일 데이터에 대해 조회 시각마다 첫 막대 수치가 달라진다.

**수정 방향**

sinceDate를 해당 날짜의 자정(그리고 KST 기준이라면 KST 자정 = UTC 15:00 전날)으로 내림 처리한 뒤 gte에 사용한다. 예: 버킷 시작 시각을 명시적으로 계산해 [dayStart, dayEnd) 범위로 질의하거나, Postgres 쪽에서 date_trunc('day', created_at AT TIME ZONE 'Asia/Seoul')로 집계하는 RPC를 사용.

<details><summary>반증 검증 근거</summary>

src/lib/data/signatures.ts:30-31에서 `const sinceDate = new Date(); sinceDate.setDate(sinceDate.getDate() - (periodDays - 1));`로 시:분:초가 '현재 시각' 그대로 남고, 42행 `.gte("created_at", sinceDate.toISOString())`이 그 타임스탬프를 그대로 하한으로 쓴다. 반면 버킷은 64-68행에서 `d.toISOString().split("T")[0]`로 날짜 키만 만들고, 70행이 `row.created_at.split("T")[0]`로 매칭하므로 가장 오래된 버킷은 '그 날짜 00:00~24:00'을 뜻하는 라벨(page.tsx:33 `day.date.slice(5)` MM-DD)을 달고 있으면서 실제로는 '조회 시각 이후'만 센다. 페이지를 여는 시각에 따라 같은 날짜의 첫 막대 값이 계속 달라지고, page.tsx:5의 `Math.max(...counts,1)`로 계산하는 maxDaily에도 영향을 줘 전체 막대 스케일이 흔들린다는 서술도 코드와 일치한다. 반증 시도(상위에서 날짜 절삭·별도 필터)를 찾았으나 없다. 다만 '데이터 손실'은 아니고 14일 차트 중 가장 오래된 한 칸의 표시 정확도 문제이므로 medium→low로 조정한다.

</details>

---

## 48. [LOW] 서명 일자 집계·표시가 UTC 기준이라 KST 새벽 서명이 전날로 잡히고 '오늘' 막대가 없어진다

- **위치**: `src/lib/data/signatures.ts:67`
- **분류**: cache · 대시보드·서명·신고

**무엇이 잘못됐나**

버킷 키를 d.toISOString().split("T")[0](67행), 행 매칭도 row.created_at.split("T")[0](70행)로 만들기 때문에 날짜 경계가 전부 UTC 자정이다. 저장소·코드 어디에도 TZ 설정이 없고(vercel.json에 TZ 없음, src 전체에 Asia/Seoul 문자열 없음) Vercel 런타임 기본 TZ는 UTC이므로 KST(UTC+9) 기준 00:00~09:00 사이 서명은 전날 막대에 들어간다. 같은 문제가 최근 서명 목록에도 있어, 서버 컴포넌트에서 실행되는 new Date(sig.createdAt).toLocaleDateString("ko-KR")(src/app/admin/signatures/page.tsx:69)가 UTC 날짜를 한국어 포맷으로 찍는다. 한국어 전용 운동 사이트에서 날짜가 하루 어긋나 보고·집계에 그대로 반영된다.

**재현**

KST 2026-08-11 02:00에 서명이 1건 접수된다(created_at = 2026-08-10T17:00:00Z). 관리자가 같은 날 KST 10:00에 /admin/signatures를 열면 이 서명은 08-11 막대가 아니라 08-10 막대에 계산되고, '최근 서명 목록'의 날짜도 '2026. 8. 10.'으로 표시된다. 또 관리자가 KST 08:00(=UTC 전날 23:00)에 페이지를 열면 마지막 버킷 키가 08-10이라 차트에 '오늘(08-11)' 칸 자체가 없고, 그날 새벽에 들어온 서명이 어느 막대에도 오늘로 보이지 않는다.

**수정 방향**

KST 오프셋(+9h)을 적용해 날짜 키를 만들거나, 표시·집계 모두 { timeZone: 'Asia/Seoul' }를 명시한 Intl 포맷터를 쓴다. 서버 집계는 Postgres에서 (created_at AT TIME ZONE 'Asia/Seoul')::date로 그룹핑하는 편이 안전하다.

<details><summary>반증 검증 근거</summary>

버킷 키는 signatures.ts:67 `d.toISOString().split("T")[0]`, 행 매칭은 70행 `row.created_at.split("T")[0]`로 둘 다 UTC 자정을 경계로 삼는다. 저장소에 TZ 지정이 전혀 없음을 직접 확인했다 — vercel.json에는 crons만 있고(내용 확인), `grep -rn "Asia/Seoul|TZ=|timeZone" src next.config.ts vercel.json` 결과가 0건이다. Vercel/Node 기본 TZ는 UTC이므로 KST 00:00~09:00 서명은 전날 버킷으로 들어가고, 64-66행의 `new Date()` 기준 마지막 버킷도 KST 09:00 이전에는 UTC 전날이라 한국 날짜 기준 '오늘' 칸이 없다. 목록 쪽도 /admin/signatures/page.tsx:69 `new Date(sig.createdAt).toLocaleDateString("ko-KR")`가 서버 컴포넌트(3행 async 함수, layout.tsx:9 force-dynamic)에서 실행되므로 timeZone 옵션 없이 시스템 TZ=UTC로 포맷된다. 덧붙여 배포 TZ가 Asia/Seoul이더라도 66행 setDate(로컬)와 67행 toISOString(UTC)이 섞여 있어 경계가 어긋나므로, 어느 TZ에서도 KST 일자와 일치하지 않는다. 카테고리 'cache'는 오분류이고 영향은 내부 대시보드의 날짜 하루 밀림이라 medium→low로 조정한다.

</details>

---

## 49. [LOW] 서버 MIME 검증이 클라이언트가 선언한 file.type만 믿어 확장자만 바꾼 비이미지 파일이 그대로 저장된다

- **위치**: `src/lib/image-upload-limits.ts:17`
- **분류**: upload · 미디어·업로드

**무엇이 잘못됐나**

validateImageFile()은 file.type 문자열만 확인하는데, 이 값은 브라우저가 파일 확장자를 보고 채워 넣는 값이라 실제 내용과 무관하다. 서버(uploadImageFromFormData)도 같은 함수를 쓰고, 확장자는 IMAGE_EXT_BY_TYPE[file.type]로, Content-Type도 file.type 그대로 지정해 저장한다(storage/upload.ts 24·30줄). 매직바이트 검사나 디코딩 시도가 없으므로 이미지가 아닌 임의 바이트가 image/png로 공개 버킷에 들어간다. 용량(file.size)은 서버가 실제 값을 보므로 그 부분은 정상 방어된다. 저장 후에는 next/image 옵티마이저가 디코딩에 실패해(400 'image type is not allowed' 또는 500) 깨진 이미지가 되며, 미디어 라이브러리에서도 정상 이미지와 구분되지 않는다.

**재현**

임의의 PDF(또는 zip) 파일을 report.pdf → report.png 로 확장자만 바꾼다 → /admin/media 업로드 폼에서 선택한다(accept 필터도, 클라이언트 validateImageFile도, 서버 validateImageFile도 모두 file.type이 image/png이므로 통과) → "이미지를 업로드했습니다" 메시지와 함께 images/library/<uuid>.png 로 저장된다 → 목록의 해당 카드는 깨진 이미지로 표시되고, 이 URL을 소식 썸네일이나 갤러리에 붙여 넣으면 공개 페이지에서도 깨진다.

**수정 방향**

서버에서 파일 앞부분 바이트를 읽어 매직넘버(JPEG FF D8 FF, PNG 89 50 4E 47, WebP RIFF....WEBP)를 확인하고 선언된 MIME과 일치하지 않으면 거부하라. 확장자·Content-Type도 클라이언트 값이 아니라 판정된 실제 타입으로 결정해야 한다.

<details><summary>반증 검증 근거</summary>

코드가 주장대로다. image-upload-limits.ts:17 `ALLOWED_IMAGE_TYPES.includes(file.type ...)`는 브라우저가 확장자로 채운 file.type 문자열만 본다. 서버 경로인 storage/upload.ts:19가 같은 함수를 호출하고(주석은 '최종 방어'라고 쓰여 있으나 실제 방어는 형식이 아니라 용량뿐), 24줄 `IMAGE_EXT_BY_TYPE[file.type]`로 확장자를 정하고 30줄 `{ contentType: file.type }`로 그대로 저장한다. 매직바이트 검사·디코딩 시도는 저장소 전체에 없다(page-content.ts:142의 uploadEditableImageAction도 `ALLOWED_TYPES.includes(file.type)`로 동일). MediaUploadPanel의 `accept="image/jpeg,image/png,image/webp"`와 useMediaLibraryManager.ts:32의 클라 validateImageFile도 같은 file.type을 보므로 PDF를 .png로 개명하면 세 관문 모두 통과해 images/library/<uuid>.png로 저장되고 '이미지를 업로드했습니다'가 뜬다 — 안내 문구('JPG, PNG, WebP 형식의 사진만 올릴 수 있습니다')가 실제로는 강제되지 않는 셈이다. 다만 파급은 제한적이다: 저장 Content-Type이 image/*로 고정되므로 HTML/JS 실행 같은 저장형 XSS는 성립하지 않고, 이미 editor 이상 권한(requireEditor)을 가진 사용자가 고의로 확장자를 바꿔야 하며 결과는 깨진 이미지 1건이다. 보고된 low 등급이 적정하다.

</details>

---

## 판정 보류 (UNCERTAIN)

반증 검증에서 확실히 재현된다고 판단하지 못한 항목. 추가 조사 대상.

- **관리자 소식 목록 페이지네이션이 date 단일 정렬이라 같은 날짜 항목이 중복 노출되거나 누락됨** — `src/lib/data/news.ts:108`  
  코드 사실관계는 맞다. src/lib/data/news.ts:108 dataQuery는 .order('date', {ascending:false}).range(from,to)뿐이고 2차 정렬 키가 없으며, admin 목록은 is_deleted 필터가 없어 부분 인덱스 idx_news_date(migrations 19행, WHERE NOT is_deleted)를 못 타 seq scan + sort가 된다. 하지만 보고된 재현 시나리오는 결정적이지 않다. LIMIT 20 OFFSET 0과 LIMIT 20 OFFSET 20이 서로 다른 sort method(top-N heapsort vs quicksort)로 계획될 때에만 동률 순서가 뒤바뀌는데, 수십 행 규모에서는 두 쿼리가 같은 방식으로 정렬돼 동일 순서가 

- **동시 저장 시 delete/insert 순서가 엇갈려 참석자·안건이 두 벌로 중복 저장됨** — `src/lib/actions/meetings/children.ts:23`  
  메커니즘 자체는 코드로 확인된다. children.ts:10-21의 DELETE 4회와 23행 이후의 INSERT는 각각 독립 트랜잭션이고, 낙관적 잠금·updated_at 비교·SELECT ... FOR UPDATE 어느 것도 없다. meetings 테이블에도 버전 컬럼이 없어(20260630000001) 충돌 감지 수단이 전무하다. 따라서 B의 DELETE가 A의 INSERT보다 먼저 실행되는 인터리빙에서 A·B 양쪽 자식 행이 남는 중복은 이론상 성립한다. 다만 CONFIRMED로 올리지 않는 이유: (1) 같은 탭 중복 클릭은 SubmitButton의 useFormStatus disabled(MeetingForm.tsx:19)로 막히므로 서로 다른 탭/사용자가 필요하고, (2) 중복이 발생하려면 B의

- **EditableText에서 Shift+Enter 줄바꿈·서식 붙여넣기가 textContent로 뭉개져 저장됨** — `src/components/editable/EditableText.tsx:40`  
  코드 사실관계는 맞다 — EditableText.tsx:40은 `ref.current?.textContent?.trim()`이고, handleKeyDown(52-65행)은 `e.key === "Enter" && !e.shiftKey`만 preventDefault 하므로 Shift+Enter는 브라우저 기본동작으로 <br>가 삽입되며, onPaste 핸들러도 없다(파일 전체 확인). textContent가 요소 경계에서 줄바꿈을 만들지 않는 것도 사실이다. 그러나 보고된 재현 결과는 틀렸다: '7년, 705번의 외침'에 <br>만 삽입되면 텍스트 노드의 공백은 그대로 남아 textContent는 '7년, 705번의 외침'(원본과 동일)이 되고, handleBlur의 `newValue !== value` 비교(

- **미디어 라이브러리가 폴더당 100개만 조회해 그보다 오래된 이미지는 화면에서 영구히 사라진다** — `src/lib/data/media-library.ts:23`  
  코드 사실은 맞다 — media-library.ts:22~25가 4개 폴더 각각 `limit: 100`, `updated_at desc`로만 list하고, MediaLibraryGrid.tsx:19가 `{items.length}개`를 '저장된 이미지' 개수로 표시하며, MediaLibraryManager/MediaUploadPanel 어디에도 페이지네이션·검색·더보기 UI가 없다. 그러나 '버그'로 확정하기에는 근거가 부족하다. (1) 이는 명시적으로 작성된 상한이며 그 상한 안에서는 코드가 설계대로 정확히 동작한다 — 잘못 계산하거나 잘못 표시하는 로직 결함이 아니라 페이지네이션 미구현이라는 기능 공백이다. (2) 재현에 '한 폴더에 101개 이상'이라는 전제가 필요한데 현재 저장소에서 그 상태가 실재한다

- **회의 수정 시 하위 테이블 전량 삭제·재삽입인데 감사 로그에 before가 없어 복구 불가** — `src/lib/actions/meetings/mutations.ts:93`  
  사실 확인은 전부 통과했다. children.ts:10-21이 meeting_attendees/agendas/decisions/action_items를 meeting_id 기준으로 하드 DELETE한 뒤 23-70행에서 재INSERT하고, updateMeeting(meetings/mutations.ts:91-94)의 logAudit payload는 `{ after: { ...form } }`뿐이라 before가 없다. 부분 실패 미롤백도 실재한다 — 74-82행에서 meetings 행을 먼저 UPDATE하고 88-89행에서 replaceMeetingChildren이 error를 반환하면 부모는 갱신·자식은 삭제된 상태로 남는다. 그럼에도 CONFIRMED로 올리지 못하는 이유는 두 가지다. 첫째, 제시된 재

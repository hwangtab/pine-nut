-- id=1 서명 행 삭제 — 2026-03-10 개발 중 삽입된 테스트 데이터, 동의 미획득.
--
-- 이 행(이름 '테스트', 이메일 test@example.com)은 실제 시민이 아니고, 개인정보
-- 수집·이용 동의(consent_privacy)도 연령 확인(consent_age)도 받지 않았다 —
-- 현재 정책 기준으로 유효한 서명이 아니다. 그런데도 공개 서명 수 카운터를
-- 1 부풀리고 있었다. 사용자가 삭제하기로 결정했다(2026-08-29).
--
-- 20260828000000_solidarity_signatures.sql·20260829000000_signature_admin_stats.sql
-- 둘 다 건드리지 않는다 — 이미 적용됐거나 이번 작업의 다른 목적을 위한
-- 파일이다. 이 삭제는 별도 파일로 분리한다.
--
-- WHERE 절에 id 하나만 두지 않는다 — id는 GENERATED ALWAYS AS IDENTITY라
-- 순번이 어긋나거나(예: 백업 복원, 다른 환경에 같은 파일을 잘못 적용) id=1이
-- 다른 실제 서명자를 가리키는 사고를 막기 위해서다. name·email·두 동의
-- 컬럼까지 전부 일치해야만 지운다 — 하나라도 안 맞으면 이 DELETE는 0행을
-- 지우고 조용히 끝난다. 실제 서명을 잘못 지우는 것보다 아무것도 안 지우는
-- 쪽이 낫다.
DELETE FROM signatures
WHERE id = 1
  AND name = '테스트'
  AND email = 'test@example.com'
  AND consent_privacy IS FALSE
  AND consent_age IS FALSE;

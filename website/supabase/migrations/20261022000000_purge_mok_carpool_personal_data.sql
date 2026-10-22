-- 목자르기(10/10) 카풀 개인정보 파기. 신청 폼과 카풀 페이지에 "공연이 끝나면
-- 지웁니다"라고 약속했다. 이름·휴대전화·ip_hash 가 든 두 테이블의 행을 모두 지운다.
-- 테이블과 정책은 남긴다 — 다음 공연에 카풀을 다시 열면 그대로 쓴다.
DELETE FROM carpool_riders;
DELETE FROM carpool_boarded_contacts;

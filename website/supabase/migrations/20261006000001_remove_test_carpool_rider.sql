-- 배포 직후 신청 API 검증에 쓴 테스트 행을 지운다.
DELETE FROM carpool_riders WHERE phone = '01000000000' AND name = '카풀테스트';

-- 이름 중복 차단 배포를 검증하던 요청이 배포 전 구버전에 닿아 들어간 테스트 행.
DELETE FROM carpool_riders WHERE phone = '01000000000' AND name = '황 경하';

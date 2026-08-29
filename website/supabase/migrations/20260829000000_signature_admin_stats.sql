-- 관리자 서명 현황(/admin/signatures) 통계 집계를 DB로 내린다.
--
-- 문제: getSignatureStats()가 페이지 로드마다 signatures 전체를 두 번(지역·이름공개
-- 원본, 최근 14일 원본) range() 페이지네이션으로 훑어 Node 프로세스로 끌어온 뒤
-- JS에서 지역별 count·중복 후보·일별 버킷·공개 동의율을 계산했다. 1000행씩
-- 순차 요청이라 서명이 10,000건이면 페이지 로드 한 번에 11~15회 왕복이 생기고,
-- 캠페인이 커질수록(운영진이 화면을 가장 자주 볼 시점에) 정확히 느려진다.
--
-- 조치: 이 계산을 모두 표현 가능한 SQL 집계로 옮긴 signature_admin_stats() 하나를
-- 추가한다. 권한 패턴은 이 파일보다 먼저 배포된 signature_region_count()
-- (supabase/migrations/20260828000000_solidarity_signatures.sql)를 그대로 따른다 —
-- SECURITY DEFINER, search_path 고정, service_role에만 EXECUTE 부여. 호출부
-- (src/lib/data/signatures.ts의 getSignatureStats)도 이 함수를 부를 때만 서비스
-- 롤 클라이언트(createSupabaseServiceClient)로 바꾼다 — /admin/signatures 페이지는
-- src/proxy.ts matcher(/admin/:path*)로 이미 활성 관리자만 도달하므로, CSV
-- 내보내기 라우트가 이미 쓰는 것과 같은 신뢰 경계다.
--
-- 20260828000000_solidarity_signatures.sql은 이미 프로덕션에 적용됐으므로 여기서
-- 수정하지 않는다 — 이 파일은 그 위에 얹는 별도 마이그레이션이다.

CREATE OR REPLACE FUNCTION signature_admin_stats(p_since timestamptz)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    -- 시·도별 count. '미상'(레거시 65건 백필 센티넬)은 지역 분포에서 제외하고
    -- unknownRegionCount로 따로 뺀다 — signature_region_count()·기존
    -- getSignatureStats의 regionMap 로직과 동일한 제외 규칙이다.
    'regionCounts', (
      SELECT coalesce(
        jsonb_agg(jsonb_build_object('regionTop', region_top, 'count', region_cnt)),
        '[]'::jsonb
      )
      FROM (
        SELECT region_top, count(*) AS region_cnt
        FROM signatures
        WHERE region_top <> '미상'
        GROUP BY region_top
      ) region_agg
    ),
    -- '미상' 건수. 지역 분포 배열엔 낄 자리가 없어(REGION_TOPS로만 시드) 별도로 뺀다.
    'unknownRegionCount', (
      SELECT count(*) FROM signatures WHERE region_top = '미상'
    ),
    -- namePublicRate의 분모: '미상' 제외(동의를 물은 적 없이 DEFAULT false로
    -- 백필된 행이라 분모에 넣으면 동의율이 과거분에 희석된다).
    'namePublicRateBase', (
      SELECT count(*) FROM signatures WHERE region_top <> '미상'
    ),
    -- namePublicRate의 분자. 기존 JS 로직과 동일하게 전체 행을 대상으로 센다 —
    -- '미상' 행은 name_public이 항상 DEFAULT false로 백필돼 있어 분자에 넣어도
    -- 기여분이 0이지만(그래서 원래 코드도 필터 없이 셌다), 그 불변식에 기대지
    -- 않고 원본 JS와 같은 계산식을 그대로 옮긴다.
    'namePublicTrueCount', (
      SELECT count(*) FILTER (WHERE name_public) FROM signatures
    ),
    -- 동일 이름+지역(시·도+시·군·구) 중복 후보. '미상' 행은 지역이 전부
    -- '미상'|''로 뭉개져 판별자 구실을 못 해 제외한다(기존 JS의
    -- isLegacyUnknownRegion continue와 동일).
    'duplicateCandidates', (
      SELECT coalesce(
        jsonb_agg(
          jsonb_build_object(
            'name', name, 'regionTop', region_top, 'regionSub', region_sub, 'count', dup_cnt
          )
          ORDER BY dup_cnt DESC, name
        ),
        '[]'::jsonb
      )
      FROM (
        SELECT name, region_top, region_sub, count(*) AS dup_cnt
        FROM signatures
        WHERE region_top <> '미상'
        GROUP BY name, region_top, region_sub
        HAVING count(*) > 1
      ) dup_agg
    ),
    -- KST(Asia/Seoul, 고정 UTC+9 — 한국은 DST 없음) 자정 기준 일별 버킷.
    -- created_at은 timestamptz다. `AT TIME ZONE 'Asia/Seoul'`은 그 순간의 KST
    -- 벽시계 시각을 돌려주므로 ::date로 자르면 kstDateKey()(UTC 값에 9시간을
    -- 더한 뒤 날짜만 취함, src/lib/data/signatures.ts)와 정확히 같은 날짜가
    -- 나온다. UTC로 그냥 자르면 KST 00:00~09:00 서명이 전날 막대로 들어간다.
    -- ::date를 ::text로 바로 캐스팅하지 않고 to_char(..., 'YYYY-MM-DD')로
    -- 고정한다 — date::text의 출력 형식은 세션 DateStyle(예: SQL, GERMAN)에
    -- 좌우되는데 이 함수는 search_path만 고정하고 DateStyle은 고정하지 않는다.
    -- DateStyle이 ISO가 아닌 세션에서 실행되면 'YYYY-MM-DD'가 아닌 다른 형식이
    -- 나와 JS의 dailyMap 키와 하나도 안 맞고, 에러 없이 차트가 전부 0으로
    -- 보인다 — 조용한 실패라 더 위험하다. to_char는 DateStyle과 무관하게
    -- 항상 이 형식을 낸다.
    'dailyCounts', (
      SELECT coalesce(
        jsonb_agg(jsonb_build_object('date', day, 'count', day_cnt) ORDER BY day),
        '[]'::jsonb
      )
      FROM (
        SELECT
          to_char((created_at AT TIME ZONE 'Asia/Seoul')::date, 'YYYY-MM-DD') AS day,
          count(*) AS day_cnt
        FROM signatures
        WHERE created_at >= p_since
        GROUP BY day
      ) daily_agg
    )
  );
$$;

REVOKE ALL ON FUNCTION signature_admin_stats(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION signature_admin_stats(timestamptz) TO service_role;

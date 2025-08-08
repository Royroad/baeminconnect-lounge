-- =====================================================
-- 통합된 단일 테이블 구조 (구글시트와 동일)
-- =====================================================

-- 기존 테이블들 백업 (필요시)
-- CREATE TABLE suggestions_backup AS SELECT * FROM suggestions;
-- CREATE TABLE improvements_backup AS SELECT * FROM improvements;
-- CREATE TABLE progress_items_backup AS SELECT * FROM progress_items;
-- CREATE TABLE counseling_cases_backup AS SELECT * FROM counseling_cases;

-- 통합 테이블 생성
CREATE TABLE IF NOT EXISTS rider_voc_cases (
  id BIGSERIAL PRIMARY KEY,
  
  -- 구글시트 연동 정보 (17개 컬럼 매핑)
  sheet_row_id TEXT, -- A: No 컬럼
  cw_name TEXT, -- B: CW
  visit_date DATE, -- C: 방문일자
  visit_time TEXT, -- D: 방문 시간대
  counselor TEXT, -- E: 상담자
  rider_type TEXT, -- F: 라이더 타입
  rider_id TEXT, -- G: 아이디
  special_notes TEXT, -- H: 특이사항
  visit_purpose TEXT, -- I: 방문목적 ('단순방문/휴식', '문제해결', '정책/서비스 개선')
  counseling_content TEXT, -- J: 상담내용
  main_content TEXT, -- K: 주요 내용
  action_status TEXT, -- L: 조치 상태 ('해결', '조치완료', '일부 조치완료', '진행중', '검토중' 등)
  action_content TEXT, -- M: 조치 내용
  status_update_date DATE, -- N: 상태 업데이트일 ⭐️ 새로 추가된 컬럼
  assigned_staff TEXT, -- O: 배정 담당자
  reference_link TEXT, -- P: 연결 링크
  rider_feedback TEXT, -- Q: 라이더 피드백(공개용)
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_rider_id ON rider_voc_cases(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_visit_date ON rider_voc_cases(visit_date);
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_visit_purpose ON rider_voc_cases(visit_purpose);
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_action_status ON rider_voc_cases(action_status);
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_sheet_row_id ON rider_voc_cases(sheet_row_id);
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_status_update_date ON rider_voc_cases(status_update_date);

-- 복합 인덱스 (필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_rider_voc_cases_purpose_status ON rider_voc_cases(visit_purpose, action_status);

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO rider_voc_cases (
  sheet_row_id, cw_name, visit_date, visit_time, counselor, rider_type, rider_id,
  special_notes, visit_purpose, counseling_content, main_content,
  action_status, action_content, status_update_date, assigned_staff, rider_feedback
) VALUES 
-- 문제해결 사례 (방문목적: '문제해결', 조치상태: '해결')
(
  '1', 
  '김상담', 
  '2024-01-15', 
  '오전', 
  '이상담원', 
  '오토바이', 
  'BC231234',
  '급한 상황', 
  '문제해결', 
  '수단 변경 오류로 배달 업무 진행이 어려운 상황', 
  '시스템 오류로 인한 수단 변경 불가',
  '해결', 
  '시스템 오류 확인 후 수단 변경 기능 즉시 복구', 
  '2024-01-15',
  '기술팀 박개발',
  '오류로 수단 변경이 어려운 상태였는데 상담을 통해 오류를 바로 해결해줘서 고마워요.'
),
(
  '2', 
  '박상담', 
  '2024-01-18', 
  '오후', 
  '최상담원', 
  '자전거', 
  'BC457890',
  NULL, 
  '문제해결', 
  '정산 관련 문의 및 불일치 신고', 
  '정산 내역 불일치 및 누락 배달료',
  '해결', 
  '정산 내역 재검토 후 누락된 배달료 추가 지급', 
  '2024-01-18',
  '정산팀 김정산',
  '정산에 문제가 있었는데 빠르게 확인해서 해결해주셔서 감사합니다. 신뢰가 생겨요.'
),
(
  '3', 
  '최상담', 
  '2024-01-20', 
  '저녁', 
  '정상담원', 
  '킥보드', 
  'BC789012',
  '긴급', 
  '문제해결', 
  '앱 로그인 불가 및 계정 접근 문제', 
  '계정 로그인 오류 및 인증 문제',
  '해결', 
  '계정 보안 설정 재설정 및 로그인 기능 복구', 
  '2024-01-20',
  '개발팀 이개발',
  '앱에 로그인이 안돼서 일을 못할뻔했는데 바로 해결해주셔서 다행이에요.'
),

-- 개선 완료 사례 (방문목적: '정책/서비스 개선', 조치상태: '조치완료' 또는 '일부 조치완료')
(
  '4', 
  '김상담', 
  '2024-01-22', 
  '오후', 
  '박상담원', 
  '오토바이', 
  'BC345678',
  NULL, 
  '정책/서비스 개선', 
  '배달 경로 최적화 관련 상담', 
  '배달 경로 추천 알고리즘 개선 요청',
  '조치완료', 
  '경로 추천 알고리즘 업데이트 및 AI 기반 최적화 도입', 
  '2024-02-15',
  '서비스팀 조서비스',
  '경로 추천 기능이 많이 개선됐네요. 배달 시간이 확실히 단축됐어요.'
),
(
  '5', 
  '이상담', 
  '2024-01-25', 
  '오전', 
  '김상담원', 
  '자전거', 
  'BC567890',
  NULL, 
  '정책/서비스 개선', 
  '라운지 이용 시간 연장 문의', 
  '라운지 운영시간 연장 요청',
  '조치완료', 
  '라운지 운영시간을 기존 22시에서 24시로 연장', 
  '2024-02-01',
  '운영팀 최운영',
  '라운지 운영 시간이 연장돼서 휴식하기가 훨씬 편해졌습니다. 감사해요!'
),
(
  '6', 
  '박상담', 
  '2024-01-28', 
  '오후', 
  '이상담원', 
  '오토바이', 
  'BC678901',
  NULL, 
  '정책/서비스 개선', 
  '기피지역 수당 개선 제안', 
  '기피지역 추가 수당 및 인센티브 개선',
  '일부 조치완료', 
  '기피지역 수당 20% 인상 및 야간 추가 수당 신설', 
  '2024-02-10',
  '정책팀 김정책',
  '기피지역 수당이 개선돼서 일하는 보람이 생겼어요. 추가 개선도 기대됩니다!'
);

-- 코멘트 추가 (문서화)
COMMENT ON TABLE rider_voc_cases IS '라이더 VOC 통합 관리 테이블 (구글시트와 동일 구조)';
COMMENT ON COLUMN rider_voc_cases.visit_purpose IS '방문목적: 단순방문/휴식, 문제해결, 정책/서비스 개선';
COMMENT ON COLUMN rider_voc_cases.action_status IS '조치 상태: 해결, 조치완료, 일부 조치완료, 진행중, 검토중 등';
COMMENT ON COLUMN rider_voc_cases.status_update_date IS '상태 업데이트일 (해결날짜/완료날짜)';

-- 필터링 예시 쿼리 (참고용)
/*
-- 문제해결 사례 조회
SELECT * FROM rider_voc_cases 
WHERE visit_purpose = '문제해결' 
  AND action_status = '해결'
  AND rider_feedback IS NOT NULL 
  AND rider_feedback != ''
ORDER BY status_update_date DESC;

-- 개선 완료 아이템 조회  
SELECT * FROM rider_voc_cases
WHERE visit_purpose = '정책/서비스 개선'
  AND action_status IN ('조치완료', '일부 조치완료')
  AND rider_feedback IS NOT NULL
  AND rider_feedback != ''
ORDER BY status_update_date DESC;
*/

-- 기존 테이블 삭제 (주의: 백업 후 실행)
-- DROP TABLE IF EXISTS suggestions CASCADE;
-- DROP TABLE IF EXISTS improvements CASCADE; 
-- DROP TABLE IF EXISTS progress_items CASCADE;
-- DROP TABLE IF EXISTS counseling_cases CASCADE;

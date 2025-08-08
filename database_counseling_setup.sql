-- 상담 케이스 테이블 생성 SQL
-- 새로운 구글시트 구조에 맞춘 테이블 정의

-- 기존 counseling_cases 테이블이 있다면 삭제 (주의: 데이터 손실!)
-- DROP TABLE IF EXISTS counseling_cases;

-- 상담 케이스 테이블 생성
CREATE TABLE IF NOT EXISTS counseling_cases (
  id BIGSERIAL PRIMARY KEY,
  
  -- 구글시트 연동 정보
  sheet_row_id TEXT, -- 구글시트의 행 번호 (No 컬럼)
  
  -- 기본 정보
  cw_name TEXT, -- CW 이름
  visit_date DATE, -- 방문일자
  visit_time TEXT, -- 방문 시간대
  counselor TEXT, -- 상담자
  rider_type TEXT, -- 라이더 타입
  rider_id TEXT, -- 라이더 아이디
  
  -- 상담 내용
  special_notes TEXT, -- 특이사항
  visit_purpose TEXT, -- 방문목적
  counseling_content TEXT, -- 상담내용
  main_content TEXT, -- 주요 내용
  
  -- 조치 정보
  action_status TEXT, -- 조치 상태 (완료, 진행중, 검토중, 접수완료, 취소, 보류)
  action_content TEXT, -- 조치 내용
  assigned_staff TEXT, -- 배정 담당자
  reference_link TEXT, -- 연결 링크
  
  -- 피드백
  rider_feedback TEXT, -- 라이더 피드백(공개용)
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_counseling_cases_rider_id ON counseling_cases(rider_id);
CREATE INDEX IF NOT EXISTS idx_counseling_cases_visit_date ON counseling_cases(visit_date);
CREATE INDEX IF NOT EXISTS idx_counseling_cases_action_status ON counseling_cases(action_status);
CREATE INDEX IF NOT EXISTS idx_counseling_cases_sheet_row_id ON counseling_cases(sheet_row_id);
CREATE INDEX IF NOT EXISTS idx_counseling_cases_created_at ON counseling_cases(created_at);

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO counseling_cases (
  sheet_row_id, cw_name, visit_date, visit_time, counselor, rider_type, rider_id,
  special_notes, visit_purpose, counseling_content, main_content,
  action_status, action_content, assigned_staff, rider_feedback
) VALUES 
(
  '1', 
  '김상담', 
  '2024-01-15', 
  '오전', 
  '이상담원', 
  '오토바이', 
  'BC231234',
  '급한 상황', 
  '기술지원', 
  '수단 변경 오류로 배달 업무 진행이 어려운 상황', 
  '시스템 오류 수정 요청',
  '완료', 
  '시스템 오류 확인 후 수단 변경 기능 즉시 복구', 
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
  '정산문의', 
  '정산 관련 문의 및 불일치 신고', 
  '정산 내역 검토 요청',
  '완료', 
  '정산 내역 재검토 후 누락된 배달료 추가 지급', 
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
  '계정지원', 
  '앱 로그인 불가 및 계정 접근 문제', 
  '계정 복구 요청',
  '완료', 
  '계정 보안 설정 재설정 및 로그인 기능 복구', 
  '개발팀 이개발',
  '앱에 로그인이 안돼서 일을 못할뻔했는데 바로 해결해주셔서 다행이에요.'
),
(
  '4', 
  '김상담', 
  '2024-01-22', 
  '오후', 
  '박상담원', 
  '오토바이', 
  'BC345678',
  NULL, 
  '서비스개선', 
  '배달 경로 최적화 관련 상담', 
  '경로 알고리즘 개선 요청',
  '진행중', 
  '경로 추천 알고리즘 업데이트 적용 중', 
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
  '시설문의', 
  '라운지 이용 시간 연장 문의', 
  '라운지 운영시간 검토',
  '완료', 
  '라운지 운영시간을 기존 22시에서 24시로 연장', 
  '운영팀 최운영',
  '라운지 운영 시간이 연장돼서 휴식하기가 훨씬 편해졌습니다. 감사해요!'
);

-- 코멘트 추가
COMMENT ON TABLE counseling_cases IS '라이더 상담 케이스 관리 테이블';
COMMENT ON COLUMN counseling_cases.sheet_row_id IS '구글시트의 행 번호 (동기화용)';
COMMENT ON COLUMN counseling_cases.rider_id IS '라이더 식별 ID';
COMMENT ON COLUMN counseling_cases.action_status IS '조치 상태 (완료, 진행중, 검토중, 접수완료, 취소, 보류)';
COMMENT ON COLUMN counseling_cases.rider_feedback IS '공개용 라이더 피드백';

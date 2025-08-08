-- =====================================================
-- 배민 라운지 라이더 제안함 데이터베이스 스키마
-- =====================================================
-- 사용법: Supabase 대시보드의 SQL Editor에서 실행

-- 1. 제안 테이블 (suggestions)
CREATE TABLE suggestions (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    proposer_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 개선 완료 아이템 테이블 (improvements)
CREATE TABLE improvements (
    id BIGSERIAL PRIMARY KEY,
    suggestion_id BIGINT REFERENCES suggestions(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    proposer_name VARCHAR(100) NOT NULL,
    completed_date DATE NOT NULL,
    before_image_url TEXT,
    after_image_url TEXT,
    effect_description TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 진행 중인 아이템 테이블 (progress_items)
CREATE TABLE progress_items (
    id BIGSERIAL PRIMARY KEY,
    suggestion_id BIGINT REFERENCES suggestions(id),
    title VARCHAR(255) NOT NULL,
    proposer_name VARCHAR(100) NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    current_status VARCHAR(100),
    expected_completion DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 샘플 데이터 삽입
-- =====================================================

-- 샘플 제안 데이터
INSERT INTO suggestions (title, description, proposer_name, status) VALUES
('휴대폰 고속 충전기 추가', '기존 충전기가 너무 느려서 고속 충전기 설치를 제안합니다', '김라이더', 'completed'),
('편안한 쿠션 의자 도입', '딱딱한 의자 때문에 오래 앉기 힘듭니다', '박라이더', 'completed'),
('무료 커피머신 설치', '따뜻한 커피를 마실 수 있으면 좋겠습니다', '이라이더', 'completed'),
('개인 사물함 설치', '개인 물품을 안전하게 보관할 공간이 필요합니다', '최라이더', 'in_progress'),
('휴식 공간 확장', '더 많은 라이더가 쉴 수 있도록 공간 확장이 필요합니다', '정라이더', 'in_progress'),
('음료 자판기 추가', '다양한 음료를 선택할 수 있으면 좋겠습니다', '신라이더', 'in_progress'),
('무선 충전패드 설치', '선 없이 편리하게 충전할 수 있으면 좋겠습니다', '한라이더', 'pending'),
('수면 존 신설', '짧은 휴식을 위한 수면 공간이 있으면 좋겠습니다', '강라이더', 'pending'),
('게임기 설치', '휴식 시간에 간단한 게임을 즐길 수 있으면 좋겠습니다', '조라이더', 'pending'),
('독서 공간 마련', '조용한 독서 공간이 있으면 좋겠습니다', '윤라이더', 'pending');

-- 완료된 개선 아이템 데이터
INSERT INTO improvements (suggestion_id, title, description, proposer_name, completed_date, effect_description, feedback) VALUES
(1, '휴대폰 고속 충전기 추가', '기존 일반 충전기에서 고속 충전기로 교체', '김라이더', '2024-12-20', '충전 속도 50% 향상', '라이더님들의 만족도가 크게 증가했습니다!'),
(2, '편안한 쿠션 의자 도입', '딱딱한 의자에서 메모리폼 쿠션 의자로 교체', '박라이더', '2024-12-15', '휴식 만족도 40% 향상', '장시간 휴식이 훨씬 편해졌다는 피드백을 받았습니다.'),
(3, '무료 커피머신 설치', '셀프 커피머신을 설치하여 언제든 따뜻한 커피 제공', '이라이더', '2024-12-10', '라운지 이용률 30% 증가', '추운 겨울, 따뜻한 커피로 몸과 마음이 따뜻해집니다.');

-- 진행 중인 아이템 데이터
INSERT INTO progress_items (suggestion_id, title, proposer_name, progress_percentage, current_status, expected_completion) VALUES
(4, '개인 사물함 설치', '최라이더', 75, '시공 준비 중', '2025-01-15'),
(5, '휴식 공간 확장', '정라이더', 45, '설계 검토 중', '2025-02-01'),
(6, '음료 자판기 추가', '신라이더', 60, '업체 협의 중', '2025-01-25');

-- =====================================================
-- 인덱스 및 성능 최적화
-- =====================================================

-- 자주 사용되는 쿼리 최적화를 위한 인덱스
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_created_at ON suggestions(created_at);
CREATE INDEX idx_suggestions_proposer ON suggestions(proposer_name);
CREATE INDEX idx_improvements_completed_date ON improvements(completed_date);
CREATE INDEX idx_progress_items_last_updated ON progress_items(last_updated);

-- =====================================================
-- RLS (Row Level Security) 정책 (선택사항)
-- =====================================================

-- 모든 사용자가 읽기 가능하도록 설정
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_items ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 정책
CREATE POLICY "Anyone can read suggestions" ON suggestions FOR SELECT USING (true);
CREATE POLICY "Anyone can read improvements" ON improvements FOR SELECT USING (true);
CREATE POLICY "Anyone can read progress_items" ON progress_items FOR SELECT USING (true);

-- 쓰기 권한은 인증된 사용자만 (관리자용)
CREATE POLICY "Only authenticated users can insert suggestions" ON suggestions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update suggestions" ON suggestions FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- 완료!
-- =====================================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하면
-- 라이더 제안함에 필요한 모든 테이블과 샘플 데이터가 생성됩니다. 
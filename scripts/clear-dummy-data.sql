-- 기존 더미 데이터 삭제 스크립트
-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 주의: 이 스크립트는 모든 데이터를 삭제합니다!
-- 백업이 필요한 데이터가 있다면 먼저 백업하세요.

-- 1. 외래키 제약조건 때문에 순서대로 삭제

-- progress_items 테이블 (suggestions 참조)
DELETE FROM progress_items;

-- improvements 테이블 (suggestions 참조)  
DELETE FROM improvements;

-- suggestions 테이블 (메인)
DELETE FROM suggestions;

-- 2. Auto-increment ID 초기화 (선택사항)
-- 다음 입력되는 데이터가 ID 1부터 시작하도록 설정

ALTER SEQUENCE suggestions_id_seq RESTART WITH 1;
ALTER SEQUENCE improvements_id_seq RESTART WITH 1;
ALTER SEQUENCE progress_items_id_seq RESTART WITH 1;

-- 3. 삭제 확인
SELECT 'suggestions' as table_name, COUNT(*) as remaining_count FROM suggestions
UNION ALL
SELECT 'improvements' as table_name, COUNT(*) as remaining_count FROM improvements  
UNION ALL
SELECT 'progress_items' as table_name, COUNT(*) as remaining_count FROM progress_items;

-- 모든 테이블에서 0이 나와야 정상적으로 삭제된 것입니다.
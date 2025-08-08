import { createClient } from '@supabase/supabase-js';

/**
 * Supabase 클라이언트 설정
 * 환경변수를 통해 안전하게 API 키를 관리
 */

// 환경변수 확인
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
}

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 설정 방법:
 * 1. Supabase 웹사이트에서 프로젝트 생성
 * 2. .env.local 파일에 다음 내용 추가:
 *    REACT_APP_SUPABASE_URL=your_project_url
 *    REACT_APP_SUPABASE_ANON_KEY=your_anon_key
 */ 
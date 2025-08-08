/**
 * 구글시트-Supabase 컬럼 매핑 검증 스크립트
 * 홈페이지에 노출되는 값들이 올바른 컬럼에서 가져오는지 확인
 */

// Node.js fetch polyfill
const fetch = require('node-fetch');
global.fetch = fetch;

// SSL 검증 우회 (개발환경용)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 환경변수
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function verifyMapping() {
  console.log('🔍 컬럼 매핑 검증 시작...\n');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    console.log('📋 구글시트 ↔ Supabase ↔ 홈페이지 매핑 확인\n');
    
    // 문제해결 사례 매핑 확인
    console.log('🔍 문제해결 사례 매핑:');
    const { data: problemCases, error: problemError } = await supabase
      .from('rider_voc_cases')
      .select('*')
      .eq('visit_purpose', '문제해결')
      .eq('action_status', '해결')
      .not('main_content', 'is', null)
      .not('action_content', 'is', null)
      .not('rider_feedback', 'is', null)
      .not('rider_id', 'is', null)
      .not('status_update_date', 'is', null)
      .limit(3);
    
    if (problemError) {
      console.error('❌ 문제해결 사례 조회 실패:', problemError);
    } else {
      console.log(`✅ 조건을 만족하는 문제해결 사례: ${problemCases.length}개\n`);
      
      problemCases.forEach((item, index) => {
        console.log(`${index + 1}. 라이더 ID: ${item.rider_id}`);
        console.log(`   구글시트 → Supabase → 홈페이지`);
        console.log(`   - 상담 내용: 주요 내용 → main_content → "${item.main_content?.substring(0, 30)}..."`);
        console.log(`   - 해결 방법: 조치 내용 → action_content → "${item.action_content?.substring(0, 30)}..."`);
        console.log(`   - 라이더 피드백: 라이더 피드백(공개용) → rider_feedback → "${item.rider_feedback?.substring(0, 30)}..."`);
        console.log(`   - 라이더 ID: 아이디 → rider_id → ${item.rider_id}`);
        console.log(`   - 날짜: 상태 업데이트일 → status_update_date → ${item.status_update_date || item.visit_date}`);
        console.log('');
      });
    }
    
    // 개선 완료 아이템 매핑 확인
    console.log('🔍 개선 완료 아이템 매핑:');
    const { data: improvements, error: improvementError } = await supabase
      .from('rider_voc_cases')
      .select('*')
      .eq('visit_purpose', '정책/서비스 개선')
      .in('action_status', ['조치완료', '일부 조치완료'])
      .not('rider_feedback', 'is', null)
      .not('rider_feedback', 'eq', '')
      .limit(3);
    
    if (improvementError) {
      console.error('❌ 개선 완료 아이템 조회 실패:', improvementError);
    } else {
      console.log(`✅ 조건을 만족하는 개선 완료 아이템: ${improvements.length}개\n`);
      
      improvements.forEach((item, index) => {
        console.log(`${index + 1}. 라이더 ID: ${item.rider_id}`);
        console.log(`   구글시트 → Supabase → 홈페이지`);
        console.log(`   - 제안 내용: 주요 내용 → main_content → "${item.main_content?.substring(0, 30)}..."`);
        console.log(`   - 조치 내용: 조치 내용 → action_content → "${item.action_content?.substring(0, 30)}..."`);
        console.log(`   - 라이더 피드백: 라이더 피드백(공개용) → rider_feedback → "${item.rider_feedback?.substring(0, 30)}..."`);
        console.log(`   - 라이더 ID: 아이디 → rider_id → ${item.rider_id}`);
        console.log(`   - 날짜: 상태 업데이트일 → status_update_date → ${item.status_update_date || item.visit_date}`);
        console.log('');
      });
    }
    
    // 매핑 요약
    console.log('📊 매핑 요약:');
    console.log('구글시트 컬럼 → Supabase 컬럼 → 홈페이지 표시');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('주요 내용 → main_content → 상담 내용 / 제안 내용');
    console.log('조치 내용 → action_content → 해결 방법 / 조치 내용');
    console.log('라이더 피드백(공개용) → rider_feedback → 라이더 피드백');
    console.log('아이디 → rider_id → 라이더 ID (마스킹)');
    console.log('상태 업데이트일 → status_update_date → 날짜');
    console.log('방문목적 → visit_purpose → 필터링 조건');
    console.log('조치 상태 → action_status → 필터링 조건 / 뱃지');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  verifyMapping().catch(console.error);
}

module.exports = { verifyMapping };

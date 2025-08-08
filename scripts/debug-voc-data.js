/**
 * VOC 데이터 디버깅 스크립트
 * Supabase에 저장된 데이터를 분석하여 문제해결 사례 필터링 문제 진단
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

async function debugVocData() {
  console.log('🔍 VOC 데이터 디버깅 시작...\n');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // 1. 전체 데이터 개수 확인
    const { count: totalCount, error: countError } = await supabase
      .from('rider_voc_cases')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ 전체 데이터 개수 조회 실패:', countError);
      return;
    }
    
    console.log(`📊 총 VOC 케이스 개수: ${totalCount}개\n`);
    
    // 2. 방문목적별 분포 확인
    console.log('📋 방문목적별 분포:');
    const { data: purposeData, error: purposeError } = await supabase
      .from('rider_voc_cases')
      .select('visit_purpose')
      .not('visit_purpose', 'is', null);
    
    if (purposeError) {
      console.error('❌ 방문목적 데이터 조회 실패:', purposeError);
    } else {
      const purposeCount = {};
      purposeData.forEach(item => {
        const purpose = item.visit_purpose || '미입력';
        purposeCount[purpose] = (purposeCount[purpose] || 0) + 1;
      });
      
      Object.entries(purposeCount).forEach(([purpose, count]) => {
        console.log(`   - ${purpose}: ${count}개`);
      });
    }
    
    // 3. 조치 상태별 분포 확인
    console.log('\n📋 조치 상태별 분포:');
    const { data: statusData, error: statusError } = await supabase
      .from('rider_voc_cases')
      .select('action_status')
      .not('action_status', 'is', null);
    
    if (statusError) {
      console.error('❌ 조치 상태 데이터 조회 실패:', statusError);
    } else {
      const statusCount = {};
      statusData.forEach(item => {
        const status = item.action_status || '미입력';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}개`);
      });
    }
    
    // 4. 문제해결 사례 필터링 확인 (모든 필수 컬럼 값 존재)
    console.log('\n🔍 문제해결 사례 필터링 결과 (모든 필수 컬럼 필수):');
    const { data: problemSolvingData, error: problemError } = await supabase
      .from('rider_voc_cases')
      .select('*')
      .eq('visit_purpose', '문제해결')
      .eq('action_status', '해결')
      .not('main_content', 'is', null)
      .not('main_content', 'eq', '')
      .not('action_content', 'is', null)
      .not('action_content', 'eq', '')
      .not('rider_feedback', 'is', null)
      .not('rider_feedback', 'eq', '')
      .not('rider_id', 'is', null)
      .not('rider_id', 'eq', '')
      .not('status_update_date', 'is', null);
    
    if (problemError) {
      console.error('❌ 문제해결 사례 조회 실패:', problemError);
    } else {
      console.log(`   - 조건을 만족하는 문제해결 사례: ${problemSolvingData.length}개`);
      
      if (problemSolvingData.length > 0) {
        console.log('\n📝 문제해결 사례 예시:');
        problemSolvingData.slice(0, 3).forEach((item, index) => {
          console.log(`\n   ${index + 1}. 라이더 ID: ${item.rider_id}`);
          console.log(`      방문목적: ${item.visit_purpose}`);
          console.log(`      조치상태: ${item.action_status}`);
          console.log(`      주요내용: ${item.main_content?.substring(0, 50)}...`);
          console.log(`      라이더피드백: ${item.rider_feedback?.substring(0, 50)}...`);
        });
      }
    }
    
    // 5. 개선 완료 아이템 필터링 확인
    console.log('\n🔍 개선 완료 아이템 필터링 결과:');
    const { data: improvementData, error: improvementError } = await supabase
      .from('rider_voc_cases')
      .select('*')
      .eq('visit_purpose', '정책/서비스 개선')
      .in('action_status', ['조치완료', '일부 조치완료'])
      .not('rider_feedback', 'is', null)
      .not('rider_feedback', 'eq', '');
    
    if (improvementError) {
      console.error('❌ 개선 완료 아이템 조회 실패:', improvementError);
    } else {
      console.log(`   - 조건을 만족하는 개선 완료 아이템: ${improvementData.length}개`);
      
      if (improvementData.length > 0) {
        console.log('\n📝 개선 완료 아이템 예시:');
        improvementData.slice(0, 3).forEach((item, index) => {
          console.log(`\n   ${index + 1}. 라이더 ID: ${item.rider_id}`);
          console.log(`      방문목적: ${item.visit_purpose}`);
          console.log(`      조치상태: ${item.action_status}`);
          console.log(`      조치내용: ${item.action_content?.substring(0, 50)}...`);
          console.log(`      라이더피드백: ${item.rider_feedback?.substring(0, 50)}...`);
        });
      }
    }
    
    // 6. 샘플 데이터 확인 (처음 5개 행)
    console.log('\n📝 샘플 데이터 (처음 5개):');
    const { data: sampleData, error: sampleError } = await supabase
      .from('rider_voc_cases')
      .select('*')
      .order('id', { ascending: true })
      .limit(5);
    
    if (sampleError) {
      console.error('❌ 샘플 데이터 조회 실패:', sampleError);
    } else {
      sampleData.forEach((item, index) => {
        console.log(`\n   ${index + 1}. ID: ${item.id}`);
        console.log(`      라이더ID: ${item.rider_id || '미입력'}`);
        console.log(`      방문목적: ${item.visit_purpose || '미입력'}`);
        console.log(`      조치상태: ${item.action_status || '미입력'}`);
        console.log(`      라이더피드백: ${item.rider_feedback ? '있음' : '없음'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  debugVocData().catch(console.error);
}

module.exports = { debugVocData };

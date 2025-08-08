/**
 * 데이터베이스 더미 데이터 삭제 스크립트
 * 사용법: node scripts/clear-database.js
 */

// Node.js fetch polyfill
const fetch = require('node-fetch');
global.fetch = fetch;

// SSL 검증 우회 (개발환경용)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 모든 테이블의 데이터 삭제
 */
async function clearAllData() {
  console.log('🗑️ 데이터베이스 더미 데이터 삭제 시작...\n');
  
  try {
    // 1. progress_items 삭제 (외래키 때문에 먼저)
    console.log('📋 progress_items 삭제 중...');
    const { error: progressError } = await supabase
      .from('progress_items')
      .delete()
      .neq('id', 0); // 모든 행 삭제
      
    if (progressError) {
      console.error('❌ progress_items 삭제 실패:', progressError.message);
    } else {
      console.log('✅ progress_items 삭제 완료');
    }

    // 2. improvements 삭제
    console.log('📋 improvements 삭제 중...');
    const { error: improvementsError } = await supabase
      .from('improvements')
      .delete()
      .neq('id', 0); // 모든 행 삭제
      
    if (improvementsError) {
      console.error('❌ improvements 삭제 실패:', improvementsError.message);
    } else {
      console.log('✅ improvements 삭제 완료');
    }

    // 3. suggestions 삭제 (메인 테이블)
    console.log('📋 suggestions 삭제 중...');
    const { error: suggestionsError } = await supabase
      .from('suggestions')
      .delete()
      .neq('id', 0); // 모든 행 삭제
      
    if (suggestionsError) {
      console.error('❌ suggestions 삭제 실패:', suggestionsError.message);
    } else {
      console.log('✅ suggestions 삭제 완료');
    }

    // 4. 삭제 확인
    console.log('\n🔍 삭제 결과 확인 중...');
    
    const [
      { count: suggestionsCount },
      { count: improvementsCount },
      { count: progressCount }
    ] = await Promise.all([
      supabase.from('suggestions').select('*', { count: 'exact', head: true }),
      supabase.from('improvements').select('*', { count: 'exact', head: true }),
      supabase.from('progress_items').select('*', { count: 'exact', head: true })
    ]);

    console.log('📊 남은 데이터 개수:');
    console.log(`   - suggestions: ${suggestionsCount}개`);
    console.log(`   - improvements: ${improvementsCount}개`);
    console.log(`   - progress_items: ${progressCount}개`);

    if (suggestionsCount === 0 && improvementsCount === 0 && progressCount === 0) {
      console.log('\n🎉 모든 더미 데이터 삭제 완료!');
      console.log('💡 이제 새로운 데이터를 구글 시트에서 동기화할 수 있습니다.');
    } else {
      console.log('\n⚠️ 일부 데이터가 남아있습니다. Supabase Dashboard에서 수동 확인이 필요합니다.');
    }

  } catch (error) {
    console.error('💥 삭제 과정에서 오류 발생:', error.message);
  }
}

/**
 * 확인 프롬프트
 */
function confirmDeletion() {
  console.log('⚠️ 주의: 이 스크립트는 모든 기존 데이터를 삭제합니다!');
  console.log('계속하려면 "DELETE" 라고 입력하세요.');
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('입력: ', (answer) => {
    if (answer === 'DELETE') {
      clearAllData();
    } else {
      console.log('❌ 삭제가 취소되었습니다.');
    }
    rl.close();
  });
}

// 스크립트 실행
if (require.main === module) {
  confirmDeletion();
}
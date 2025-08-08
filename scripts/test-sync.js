/**
 * 구글 시트 동기화 테스트 스크립트
 * 실제 동기화 전에 연결 상태와 데이터 형식을 확인
 */

// Node.js fetch polyfill
const fetch = require('node-fetch');
global.fetch = fetch;

// SSL 검증 우회 (개발환경용)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { createClient } = require('@supabase/supabase-js');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

// 환경변수
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

/**
 * 환경변수 확인
 */
function checkEnvironmentVariables() {
  console.log('🔍 환경변수 확인 중...\n');
  
  const checks = [
    { name: 'SUPABASE_URL', value: SUPABASE_URL, required: true },
    { name: 'SUPABASE_SERVICE_KEY', value: SUPABASE_SERVICE_KEY, required: true },
    { name: 'GOOGLE_SHEET_ID', value: GOOGLE_SHEET_ID, required: true },
    { name: 'GOOGLE_CLIENT_EMAIL', value: GOOGLE_CLIENT_EMAIL, required: true },
    { name: 'GOOGLE_PRIVATE_KEY', value: GOOGLE_PRIVATE_KEY ? '설정됨' : undefined, required: true }
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    const status = check.value ? '✅' : '❌';
    const display = check.name === 'GOOGLE_PRIVATE_KEY' 
      ? (check.value ? '설정됨' : '설정안됨')
      : (check.value ? `${check.value.substring(0, 20)}...` : '설정안됨');
      
    console.log(`${status} ${check.name}: ${display}`);
    
    if (check.required && !check.value) {
      allPassed = false;
    }
  });
  
  console.log();
  return allPassed;
}

/**
 * Supabase 연결 테스트
 */
async function testSupabaseConnection() {
  console.log('🔗 Supabase 연결 테스트 중...');
  
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    // 통합 테이블 존재 확인
    const { data: vocCases, error: vocCasesError } = await supabase
      .from('rider_voc_cases')
      .select('count')
      .limit(1);
      
    if (vocCasesError) {
      console.log('❌ rider_voc_cases 테이블 접근 실패:', vocCasesError.message);
      console.log('💡 database_unified_setup.sql을 먼저 실행해주세요.');
      return false;
    }
    
    // 테이블 구조 확인
    const { data: sampleData, error: sampleError } = await supabase
      .from('rider_voc_cases')
      .select('id, rider_id, visit_purpose, action_status')
      .limit(3);
      
    if (sampleError) {
      console.log('❌ 테이블 구조 확인 실패:', sampleError.message);
      return false;
    }
    
    console.log('✅ Supabase 연결 성공');
    console.log(`   - rider_voc_cases 테이블: 접근 가능`);
    console.log(`   - 샘플 데이터: ${sampleData?.length || 0}개 행`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Supabase 연결 실패:', error.message);
    return false;
  }
}

/**
 * 구글 시트 연결 테스트
 */
async function testGoogleSheetConnection() {
  console.log('\n📊 구글 시트 연결 테스트 중...');
  
  try {
    const serviceAccountAuth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    console.log('✅ 구글 시트 연결 성공');
    console.log(`   - 문서 제목: ${doc.title}`);
    console.log(`   - 시트 개수: ${doc.sheetCount}`);
    
    // 특정 시트 정보: "1.1. 일자별 상담일지"
    const sheet = doc.sheetsByTitle['1.1. 일자별 상담일지'];
    if (!sheet) {
      throw new Error('워크시트 "1.1. 일자별 상담일지"를 찾을 수 없습니다');
    }
    await sheet.loadHeaderRow();
    
    console.log(`   - 첫 번째 시트: ${sheet.title}`);
    console.log(`   - 헤더 컬럼: ${sheet.headerValues.join(', ')}`);
    
    // 필수 컬럼 확인 (새로운 구글시트 구조)
    const requiredColumns = ['No', 'CW', '방문일자', '아이디', '방문목적', '조치 상태'];
    const missingColumns = requiredColumns.filter(col => !sheet.headerValues.includes(col));
    
    if (missingColumns.length > 0) {
      console.log(`⚠️ 누락된 필수 컬럼: ${missingColumns.join(', ')}`);
    } else {
      console.log('✅ 모든 필수 컬럼 확인됨');
    }
    
    // 데이터 행 개수 확인
    const rows = await sheet.getRows();
    console.log(`   - 데이터 행 개수: ${rows.length}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ 구글 시트 연결 실패:', error.message);
    return false;
  }
}

/**
 * 데이터 형식 검증 테스트
 */
async function testDataValidation() {
  console.log('\n🔍 데이터 형식 검증 테스트 중...');
  
  try {
    const serviceAccountAuth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['1.1. 일자별 상담일지'];
    if (!sheet) {
      throw new Error('워크시트 "1.1. 일자별 상담일지"를 찾을 수 없습니다');
    }
    const rows = await sheet.getRows();
    
    if (rows.length === 0) {
      console.log('⚠️ 시트에 데이터가 없습니다');
      return false;
    }
    
    let validCount = 0;
    let invalidCount = 0;
    
    // 처음 5개 행만 검증
    const testRows = rows.slice(0, Math.min(5, rows.length));
    
    for (const row of testRows) {
      const riderId = row.get('아이디');
      const visitPurpose = row.get('방문목적');
      const actionStatus = row.get('조치 상태');
      const visitDate = row.get('방문일자');
      
      console.log(`\n행 ${row.rowNumber} 검증:`);
      
      // 라이더 ID 형식 검증 (기존 ID이므로 다양한 형식 허용)
      const riderIdValid = riderId && riderId.trim().length > 0;
      console.log(`   - 라이더 ID (${riderId}): ${riderIdValid ? '✅' : '❌'}`);
      
      // 방문목적 검증
      const validPurposes = ['단순방문/휴식', '문제해결', '정책/서비스 개선'];
      const purposeValid = validPurposes.includes(visitPurpose);
      console.log(`   - 방문목적 (${visitPurpose}): ${purposeValid ? '✅' : '❌'}`);
      
      // 조치 상태값 검증
      const validStatuses = ['해결', '조치완료', '일부 조치완료', '진행중', '검토중', '접수완료', '취소', '보류'];
      const statusValid = validStatuses.includes(actionStatus);
      console.log(`   - 조치 상태 (${actionStatus}): ${statusValid ? '✅' : '❌'}`);
      
      // 방문일자 검증 (선택사항)
      const dateValid = !visitDate || /^\d{4}-\d{2}-\d{2}$/.test(visitDate);
      console.log(`   - 방문일자 (${visitDate || '미입력'}): ${dateValid ? '✅' : '❌'}`);
      
      if (riderIdValid && purposeValid && statusValid && dateValid) {
        validCount++;
      } else {
        invalidCount++;
      }
    }
    
    console.log(`\n📊 검증 결과:`);
    console.log(`   - 유효한 행: ${validCount}`);
    console.log(`   - 무효한 행: ${invalidCount}`);
    
    return invalidCount === 0;
    
  } catch (error) {
    console.log('❌ 데이터 검증 실패:', error.message);
    return false;
  }
}

/**
 * 메인 테스트 함수
 */
async function runTests() {
  console.log('🧪 구글 시트 동기화 테스트 시작\n');
  console.log('=' .repeat(50));
  
  // 1. 환경변수 확인
  const envCheck = checkEnvironmentVariables();
  if (!envCheck) {
    console.log('\n❌ 환경변수 설정이 완료되지 않았습니다.');
    console.log('💡 .env 파일을 확인하고 필요한 키값들을 설정해주세요.');
    return false;
  }
  
  // 2. Supabase 연결 테스트
  const supabaseCheck = await testSupabaseConnection();
  if (!supabaseCheck) {
    console.log('\n❌ Supabase 연결에 문제가 있습니다.');
    return false;
  }
  
  // 3. 구글 시트 연결 테스트
  const sheetsCheck = await testGoogleSheetConnection();
  if (!sheetsCheck) {
    console.log('\n❌ 구글 시트 연결에 문제가 있습니다.');
    return false;
  }
  
  // 4. 데이터 형식 검증
  const dataCheck = await testDataValidation();
  if (!dataCheck) {
    console.log('\n⚠️ 일부 데이터 형식에 문제가 있습니다.');
    console.log('💡 필수 컬럼 값들이 올바르게 입력되었는지 확인해주세요.');
  }
  
  console.log('\n' + '=' .repeat(50));
  
  if (envCheck && supabaseCheck && sheetsCheck) {
    console.log('🎉 모든 연결 테스트 통과!');
    console.log('💡 이제 npm run sync:voc 명령으로 통합 VOC 동기화를 실행할 수 있습니다.');
    return true;
  } else {
    console.log('❌ 일부 테스트 실패');
    console.log('💡 위의 오류를 해결한 후 다시 테스트해주세요.');
    return false;
  }
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
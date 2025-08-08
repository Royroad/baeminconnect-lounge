/**
 * Supabase 연결 디버깅 스크립트
 */

// Node.js fetch polyfill
const fetch = require('node-fetch');
global.fetch = fetch;

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase 연결 상세 진단\n');

// 1. 환경변수 길이 확인
console.log('📊 키 길이 정보:');
console.log(`SUPABASE_URL 길이: ${SUPABASE_URL?.length || 0}`);
console.log(`ANON_KEY 길이: ${SUPABASE_ANON_KEY?.length || 0}`);
console.log(`SERVICE_KEY 길이: ${SUPABASE_SERVICE_KEY?.length || 0}`);
console.log();

// 2. URL 형식 확인
console.log('🌐 URL 형식 확인:');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`URL 형식 맞음: ${/^https:\/\/\w+\.supabase\.co$/.test(SUPABASE_URL)}`);
console.log();

// 3. 키 형식 확인 (JWT 토큰인지)
console.log('🔑 키 형식 확인:');
const isJWT = (key) => key && key.split('.').length === 3;
console.log(`ANON_KEY JWT 형식: ${isJWT(SUPABASE_ANON_KEY)}`);
console.log(`SERVICE_KEY JWT 형식: ${isJWT(SUPABASE_SERVICE_KEY)}`);
console.log();

// 4. Anon 클라이언트 테스트
console.log('🔗 Anon 클라이언트 테스트:');
try {
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Anon 클라이언트 생성 성공');
  
  // 간단한 쿼리 테스트
  anonClient
    .from('suggestions')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log(`❌ Anon 쿼리 실패: ${error.message}`);
      } else {
        console.log('✅ Anon 쿼리 성공');
      }
    });
    
} catch (error) {
  console.log(`❌ Anon 클라이언트 생성 실패: ${error.message}`);
}

// 5. Service 클라이언트 테스트
console.log('\n🔐 Service 클라이언트 테스트:');
try {
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('✅ Service 클라이언트 생성 성공');
  
  // 간단한 쿼리 테스트
  serviceClient
    .from('suggestions')
    .select('count')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log(`❌ Service 쿼리 실패: ${error.message}`);
      } else {
        console.log('✅ Service 쿼리 성공');
        console.log('\n🎉 모든 Supabase 연결 테스트 통과!');
      }
    });
    
} catch (error) {
  console.log(`❌ Service 클라이언트 생성 실패: ${error.message}`);
}

// 6. 네트워크 연결 테스트
console.log('\n🌐 네트워크 연결 테스트:');
fetch(SUPABASE_URL + '/rest/v1/')
  .then(response => {
    console.log(`✅ 기본 연결 성공 (상태: ${response.status})`);
  })
  .catch(error => {
    console.log(`❌ 네트워크 연결 실패: ${error.message}`);
  });
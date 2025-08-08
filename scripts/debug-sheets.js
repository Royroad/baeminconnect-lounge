/**
 * 구글 시트 전체 구조 디버깅 스크립트
 * 모든 시트 탭과 헤더를 확인
 */

// Node.js fetch polyfill
const fetch = require('node-fetch');
global.fetch = fetch;

// SSL 검증 우회 (개발환경용)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

// 환경변수
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

async function debugSheets() {
  console.log('🔍 구글시트 전체 구조 확인 중...\n');
  
  try {
    const serviceAccountAuth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    console.log(`📊 문서 정보:`);
    console.log(`   - 제목: ${doc.title}`);
    console.log(`   - 총 시트 개수: ${doc.sheetCount}\n`);
    
    // 모든 시트 탭 확인
    for (let i = 0; i < doc.sheetsByIndex.length; i++) {
      const sheet = doc.sheetsByIndex[i];
      
      console.log(`📋 시트 ${i + 1}: "${sheet.title}"`);
      console.log(`   - 시트 ID: ${sheet.sheetId}`);
      console.log(`   - 행 개수: ${sheet.rowCount}`);
      console.log(`   - 열 개수: ${sheet.columnCount}`);
      
      try {
        // 헤더 행 로드 시도
        await sheet.loadHeaderRow();
        
        if (sheet.headerValues && sheet.headerValues.length > 0) {
          console.log(`   - 헤더: ${sheet.headerValues.slice(0, 10).join(', ')}${sheet.headerValues.length > 10 ? '...' : ''}`);
          
          // VOC 관련 키워드 찾기
          const vocKeywords = ['No', 'CW', '방문일자', '아이디', '방문목적', '조치 상태', '라이더', 'VOC'];
          const foundKeywords = sheet.headerValues.filter(header => 
            vocKeywords.some(keyword => header && header.includes(keyword))
          );
          
          if (foundKeywords.length > 0) {
            console.log(`   ⭐️ VOC 관련 컬럼 발견: ${foundKeywords.join(', ')}`);
          }
          
          // 데이터 행 확인
          const rows = await sheet.getRows();
          console.log(`   - 데이터 행 개수: ${rows.length}`);
          
        } else {
          console.log(`   ❌ 헤더가 비어있음`);
        }
        
      } catch (error) {
        console.log(`   ❌ 헤더 로드 실패: ${error.message}`);
      }
      
      console.log(''); // 빈 줄
    }
    
    // 권장사항
    console.log('💡 권장사항:');
    console.log('   1. VOC 데이터가 있는 시트 탭을 첫 번째로 이동');
    console.log('   2. 또는 올바른 시트 탭 이름을 알려주시면 스크립트를 수정하겠습니다');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  debugSheets().catch(console.error);
}

module.exports = { debugSheets };

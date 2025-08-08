/**
 * 구글 스프레드시트와 Supabase 동기화 스크립트
 * 사용법: node scripts/google-sheets-sync.js
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

// 환경변수 설정
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서비스 키 필요
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Supabase 클라이언트 (서비스 키 사용)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 구글 시트 인증 및 문서 로드
 */
async function loadGoogleSheet() {
  try {
    console.log('🔐 구글 시트 인증 중...');
    
    const serviceAccountAuth = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    console.log(`✅ 구글 시트 로드 완료: ${doc.title}`);
    return doc;
  } catch (error) {
    console.error('❌ 구글 시트 로드 실패:', error);
    throw error;
  }
}

/**
 * 라이더 ID 유효성 검증
 */
function validateRiderId(riderId) {
  if (!riderId || typeof riderId !== 'string') return false;
  
  // BC + 6자리 숫자 패턴 확인
  const pattern = /^BC\d{6}$/;
  return pattern.test(riderId);
}

/**
 * 상태값 매핑 (시트 → Supabase)
 */
function mapStatus(sheetStatus) {
  const statusMap = {
    '접수완료': 'pending',
    '검토중': 'review', 
    '진행중': 'in_progress',
    '완료': 'completed',
    '취소': 'cancelled',
    '보류': 'hold'
  };
  
  return statusMap[sheetStatus] || 'pending';
}

/**
 * 날짜 형식 변환
 */
function formatDate(dateValue) {
  if (!dateValue) return null;
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
}

/**
 * 구글 시트에서 데이터 읽기
 */
async function readSheetData(doc) {
  try {
    console.log('📊 시트 데이터 읽기 중...');
    
    const sheet = doc.sheetsByIndex[0]; // 첫 번째 시트
    const rows = await sheet.getRows();
    
    const vocData = [];
    
    for (const row of rows) {
      // 빈 행 스킵
      if (!row.get('제목') && !row.get('라이더_ID')) continue;
      
      // 라이더 ID 검증
      const riderId = row.get('라이더_ID');
      if (!validateRiderId(riderId)) {
        console.warn(`⚠️ 잘못된 라이더 ID: ${riderId} (행 ${row.rowNumber})`);
        continue;
      }
      
      const vocItem = {
        // 기본 정보
        id: parseInt(row.get('번호')) || null,
        voc_category: row.get('VOC_구분') || '',
        rider_id: riderId,
        rider_type: row.get('라이더_유형') || '',
        title: row.get('제목') || '',
        description: row.get('상세_내용') || '',
        request_tasks: row.get('요청_업무') || '',
        improvement_plan: row.get('개선과제') || '',
        wiki_link: row.get('위키_링크') || '',
        
        // 상태 및 담당
        status: mapStatus(row.get('상태')),
        feedback_status: row.get('피드백_상태') || '',
        team: row.get('담당팀') || '',
        owner: row.get('담당자') || '',
        
        // 날짜
        due_date: formatDate(row.get('완료_예정일')),
        created_at: formatDate(row.get('등록일')) || new Date().toISOString(),
        updated_at: formatDate(row.get('수정일')) || new Date().toISOString(),
        
        // 내부 정보
        sheet_row: row.rowNumber
      };
      
      vocData.push(vocItem);
    }
    
    console.log(`✅ ${vocData.length}개 VOC 항목 읽기 완료`);
    return vocData;
    
  } catch (error) {
    console.error('❌ 시트 데이터 읽기 실패:', error);
    throw error;
  }
}

/**
 * Supabase에 데이터 동기화
 */
async function syncToSupabase(vocData) {
  try {
    console.log('🔄 Supabase 동기화 시작...');
    
    for (const item of vocData) {
      // suggestions 테이블에 업서트
      const suggestionData = {
        title: item.title,
        description: item.description,
        rider_id: item.rider_id,
        status: item.status,
        priority: 'medium', // 기본값
        created_at: item.created_at,
        updated_at: item.updated_at
      };
      
      let suggestionId;
      
      if (item.id) {
        // 기존 항목 업데이트
        const { data, error } = await supabase
          .from('suggestions')
          .upsert({ id: item.id, ...suggestionData })
          .select('id');
          
        if (error) {
          console.error(`❌ 업데이트 실패 (ID: ${item.id}):`, error);
          continue;
        }
        
        suggestionId = data[0]?.id;
      } else {
        // 새 항목 삽입
        const { data, error } = await supabase
          .from('suggestions')
          .insert(suggestionData)
          .select('id');
          
        if (error) {
          console.error(`❌ 삽입 실패:`, error);
          continue;
        }
        
        suggestionId = data[0]?.id;
      }
      
      // 완료된 항목은 improvements 테이블에도 추가
      if (item.status === 'completed' && suggestionId) {
        const improvementData = {
          suggestion_id: suggestionId,
          title: item.title,
          description: item.improvement_plan || item.description,
          rider_id: item.rider_id,
          completed_date: item.due_date || new Date().toISOString().split('T')[0],
          effect_description: item.improvement_plan || '개선 완료'
        };
        
        await supabase
          .from('improvements')
          .upsert(improvementData);
      }
      
      // 진행중 항목은 progress_items 테이블에도 추가
      if (item.status === 'in_progress' && suggestionId) {
        const progressData = {
          suggestion_id: suggestionId,
          title: item.title,
          rider_id: item.rider_id,
          progress_percentage: 50, // 기본값
          current_status: item.status,
          expected_completion: item.due_date
        };
        
        await supabase
          .from('progress_items')
          .upsert(progressData);
      }
    }
    
    console.log('✅ Supabase 동기화 완료');
    
  } catch (error) {
    console.error('❌ Supabase 동기화 실패:', error);
    throw error;
  }
}

/**
 * 메인 동기화 함수
 */
async function main() {
  try {
    console.log('🚀 구글 시트 → Supabase 동기화 시작');
    console.log('시간:', new Date().toISOString());
    
    // 환경변수 확인
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GOOGLE_SHEET_ID) {
      throw new Error('필수 환경변수가 설정되지 않았습니다');
    }
    
    // 1. 구글 시트 로드
    const doc = await loadGoogleSheet();
    
    // 2. 시트 데이터 읽기
    const vocData = await readSheetData(doc);
    
    // 3. Supabase 동기화
    await syncToSupabase(vocData);
    
    console.log('🎉 동기화 완료!');
    
  } catch (error) {
    console.error('💥 동기화 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main };
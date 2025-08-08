/**
 * 양방향 구글 시트 ↔ Supabase 동기화 스크립트
 * 구글 시트를 Master로 하여 완전 동기화
 * 사용법: node scripts/sync-bidirectional.js
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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Supabase 클라이언트
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 구글 시트 로드
 */
async function loadGoogleSheet() {
  try {
    console.log('🔐 구글 시트 로드 중...');
    
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
 * 구글 시트에서 모든 데이터 읽기
 */
async function readAllSheetData(doc) {
  try {
    console.log('📊 구글 시트 데이터 읽기 중...');
    
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    
    const sheetData = [];
    
    for (const row of rows) {
      // 빈 행 스킵
      if (!row.get('제목') && !row.get('라이더_ID')) continue;
      
      const rowData = {
        sheet_row_number: row.rowNumber,
        id: parseInt(row.get('번호')) || null,
        title: row.get('제목') || '',
        description: row.get('상세_내용') || '',
        rider_id: row.get('라이더_ID') || '',
        status: mapStatus(row.get('상태')),
        voc_category: row.get('VOC_구분') || '',
        rider_type: row.get('라이더_유형') || '',
        request_tasks: row.get('요청_업무') || '',
        improvement_plan: row.get('개선과제') || '',
        wiki_link: row.get('위키_링크') || '',
        feedback_status: row.get('피드백_상태') || '',
        team: row.get('담당팀') || '',
        owner: row.get('담당자') || '',
        due_date: formatDate(row.get('완료_예정일')),
        created_at: formatDate(row.get('등록일')) || new Date().toISOString(),
        updated_at: formatDate(row.get('수정일')) || new Date().toISOString(),
        
        // 새로 추가된 컬럼들 (없으면 기본값)
        completed_date: formatDate(row.get('완료일')) || formatDate(row.get('완료_예정일')) || null,
        progress_percentage: parseInt(row.get('진행률')) || (row.get('상태') === '진행중' ? 50 : 0),
        effect_description: row.get('효과_설명') || '',
        feedback_content: row.get('피드백_내용') || ''
      };
      
      sheetData.push(rowData);
    }
    
    console.log(`✅ 구글 시트에서 ${sheetData.length}개 항목 읽기 완료`);
    return sheetData;
    
  } catch (error) {
    console.error('❌ 구글 시트 데이터 읽기 실패:', error);
    throw error;
  }
}

/**
 * Supabase에서 모든 데이터 읽기
 */
async function readAllSupabaseData() {
  try {
    console.log('🗄️ Supabase 데이터 읽기 중...');
    
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('id');
      
    if (error) {
      throw error;
    }
    
    console.log(`✅ Supabase에서 ${data.length}개 항목 읽기 완료`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Supabase 데이터 읽기 실패:', error);
    throw error;
  }
}

/**
 * 완전 동기화 실행
 * 구글 시트를 Master로 하여 Supabase를 완전히 일치시킴
 */
async function performFullSync(sheetData, supabaseData) {
  try {
    console.log('🔄 완전 동기화 시작...');
    
    // 1. 구글 시트에 있는 데이터의 ID 목록
    const sheetIds = sheetData
      .filter(item => item.id)
      .map(item => item.id);
    
    // 2. Supabase에 있는 데이터의 ID 목록  
    const supabaseIds = supabaseData.map(item => item.id);
    
    console.log(`📊 구글 시트 ID: [${sheetIds.join(', ')}]`);
    console.log(`📊 Supabase ID: [${supabaseIds.join(', ')}]`);
    
    // 3. 삭제할 항목들 (Supabase에는 있지만 구글 시트에는 없음)
    const toDelete = supabaseIds.filter(id => !sheetIds.includes(id));
    
    if (toDelete.length > 0) {
      console.log(`🗑️ 삭제할 항목: [${toDelete.join(', ')}]`);
      
      for (const id of toDelete) {
        // 관련 테이블에서 먼저 삭제 (외래키 제약조건)
        await supabase.from('improvements').delete().eq('suggestion_id', id);
        await supabase.from('progress_items').delete().eq('suggestion_id', id);
        
        // suggestions에서 삭제
        await supabase.from('suggestions').delete().eq('id', id);
        
        console.log(`✅ ID ${id} 및 관련 데이터 삭제 완료`);
      }
    }
    
    // 4. 추가/수정할 항목들
    for (const sheetItem of sheetData) {
      const existingItem = supabaseData.find(item => item.id === sheetItem.id);
      
      const suggestionData = {
        title: sheetItem.title,
        description: sheetItem.description,
        rider_id: sheetItem.rider_id,
        status: sheetItem.status,
        priority: 'medium',
        created_at: sheetItem.created_at,
        updated_at: sheetItem.updated_at
      };
      
      if (existingItem) {
        // 수정
        const { error } = await supabase
          .from('suggestions')
          .update(suggestionData)
          .eq('id', sheetItem.id);
          
        if (error) {
          console.error(`❌ ID ${sheetItem.id} 수정 실패:`, error);
        } else {
          console.log(`🔄 ID ${sheetItem.id} 수정 완료`);
        }
      } else {
        // 추가
        const { data, error } = await supabase
          .from('suggestions')
          .insert(suggestionData)
          .select('id');
          
        if (error) {
          console.error(`❌ 새 항목 추가 실패:`, error);
        } else {
          const newId = data[0]?.id;
          console.log(`➕ 새 항목 추가 완료 (ID: ${newId})`);
          
          // 구글 시트의 번호 컬럼 업데이트 (선택사항)
          // 이 부분은 구글 시트에 역동기화하는 기능입니다
        }
      }
      
      // 기존 관련 테이블 데이터 삭제 후 새로 추가
      if (sheetItem.id) {
        await supabase.from('improvements').delete().eq('suggestion_id', sheetItem.id);
        await supabase.from('progress_items').delete().eq('suggestion_id', sheetItem.id);
      }
      
      // 완료된 항목은 improvements 테이블에도 추가
      if (sheetItem.status === 'completed' && sheetItem.id) {
        await syncToImprovements(sheetItem);
      }
      
      // 진행중 항목은 progress_items 테이블에도 추가
      if (sheetItem.status === 'in_progress' && sheetItem.id) {
        await syncToProgress(sheetItem);
      }
    }
    
    console.log('✅ 완전 동기화 완료!');
    
  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    throw error;
  }
}

/**
 * improvements 테이블 동기화
 */
async function syncToImprovements(sheetItem) {
  const improvementData = {
    suggestion_id: sheetItem.id,
    title: sheetItem.title,
    description: sheetItem.improvement_plan || sheetItem.description,
    rider_id: sheetItem.rider_id,
    completed_date: sheetItem.completed_date || sheetItem.due_date || new Date().toISOString().split('T')[0],
    effect_description: sheetItem.effect_description || sheetItem.improvement_plan || '개선 완료',
    feedback: sheetItem.feedback_content || ''
  };
  
  const { error } = await supabase.from('improvements').insert(improvementData);
  if (error) {
    console.warn(`⚠️ improvements 추가 실패 (ID: ${sheetItem.id}):`, error.message);
  }
}

/**
 * progress_items 테이블 동기화
 */
async function syncToProgress(sheetItem) {
  const progressData = {
    suggestion_id: sheetItem.id,
    title: sheetItem.title,
    rider_id: sheetItem.rider_id,
    progress_percentage: sheetItem.progress_percentage || 50,
    current_status: '진행 중',
    expected_completion: sheetItem.due_date,
    last_updated: new Date().toISOString()
  };
  
  const { error } = await supabase.from('progress_items').insert(progressData);
  if (error) {
    console.warn(`⚠️ progress_items 추가 실패 (ID: ${sheetItem.id}):`, error.message);
  }
}

/**
 * 유틸리티 함수들
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

function formatDate(dateValue) {
  if (!dateValue) return null;
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString();
}

/**
 * 메인 함수
 */
async function main() {
  try {
    console.log('🚀 양방향 동기화 시작');
    console.log('📅 시간:', new Date().toISOString());
    console.log('🎯 구글 시트를 Master로 완전 동기화\n');
    
    // 1. 구글 시트 데이터 읽기
    const doc = await loadGoogleSheet();
    const sheetData = await readAllSheetData(doc);
    
    // 2. Supabase 데이터 읽기
    const supabaseData = await readAllSupabaseData();
    
    // 3. 완전 동기화 실행
    await performFullSync(sheetData, supabaseData);
    
    console.log('\n🎉 양방향 동기화 완료!');
    console.log('💡 이제 구글 시트가 Supabase와 완전히 동기화되었습니다.');
    
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
// Node.js 환경에서 fetch 사용을 위한 polyfill
const fetch = require('node-fetch');
global.fetch = fetch;

// SSL 인증 우회 (개발환경용)
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

require('dotenv').config();
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');

/**
 * 통합 VOC 데이터 동기화 스크립트
 * 구글 시트 → Supabase rider_voc_cases 테이블로 데이터 동기화
 */

// 환경변수 확인
const requiredEnvVars = [
  'GOOGLE_SHEET_ID',
  'GOOGLE_CLIENT_EMAIL', 
  'GOOGLE_PRIVATE_KEY',
  'REACT_APP_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ 필수 환경변수가 설정되지 않았습니다:', missingVars.join(', '));
  process.exit(1);
}

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Google Sheets 인증 설정
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

/**
 * 업데이트된 구글시트 컬럼 매핑 (17개 컬럼)
 * A: No, B: CW, C: 방문일자, D: 방문 시간대, E: 상담자, F: 라이더 타입,
 * G: 아이디, H: 특이사항, I: 방문목적, J: 상담내용, K: 주요 내용,
 * L: 조치 상태, M: 조치 내용, N: 상태 업데이트일, O: 배정 담당자, P: 연결 링크, Q: 라이더 피드백(공개용)
 */
const SHEET_COLUMNS = {
  sheet_row_id: 'No',                    // A: No
  cw_name: 'CW',                        // B: CW  
  visit_date: '방문일자',                 // C: 방문일자
  visit_time: '방문 시간대',              // D: 방문 시간대
  counselor: '상담자',                   // E: 상담자
  rider_type: '라이더 타입',              // F: 라이더 타입
  rider_id: '아이디',                    // G: 아이디
  special_notes: '특이사항',              // H: 특이사항
  visit_purpose: '방문목적',              // I: 방문목적
  counseling_content: '상담내용',         // J: 상담내용
  main_content: '주요 내용',              // K: 주요 내용
  action_status: '조치 상태',             // L: 조치 상태
  action_content: '조치 내용',            // M: 조치 내용
  status_update_date: '상태 업데이트일',   // N: 상태 업데이트일 ⭐️ 새로 추가
  assigned_staff: '배정 담당자',          // O: 배정 담당자
  reference_link: '연결 링크',            // P: 연결 링크
  rider_feedback: '라이더 피드백(공개용)'  // Q: 라이더 피드백(공개용)
};

/**
 * 날짜 문자열을 ISO 형식으로 변환
 * @param {string} dateString - 날짜 문자열
 * @returns {string|null} ISO 형식 날짜 또는 null
 */
const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;
  
  try {
    // 다양한 날짜 형식 처리
    const cleanDate = dateString.trim();
    if (!cleanDate) return null;
    
    // YYYY-MM-DD 형식이면 그대로 사용
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      return cleanDate;
    }
    
    // 다른 형식이면 Date 객체로 파싱 후 ISO 형식으로 변환
    const date = new Date(cleanDate);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('날짜 파싱 실패:', dateString, error.message);
    return null;
  }
};

/**
 * 구글시트에서 VOC 케이스 데이터 조회
 * @returns {Promise<Array>} VOC 케이스 목록
 */
const fetchSheetData = async () => {
  try {
    console.log('📋 구글시트 데이터 조회 중...');
    
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    console.log(`📊 시트 제목: ${doc.title}`);
    
    // 특정 워크시트 사용: "1.1. 일자별 상담일지"
    const sheet = doc.sheetsByTitle['1.1. 일자별 상담일지'];
    if (!sheet) {
      throw new Error('워크시트 "1.1. 일자별 상담일지"를 찾을 수 없습니다');
    }
    
    // 메모리 효율성을 위해 loadCells() 제거, getRows()만 사용
    // 전체 데이터 처리
    const allRows = await sheet.getRows();
    console.log(`📝 총 ${allRows.length}개 행 처리`);
    
    const vocCases = [];
    
    for (const row of allRows) {
      // 빈 행 건너뛰기
      if (!row.get(SHEET_COLUMNS.sheet_row_id) && !row.get(SHEET_COLUMNS.rider_id)) continue;
      
      const caseData = {
        sheet_row_id: row.get(SHEET_COLUMNS.sheet_row_id) || null,
        cw_name: row.get(SHEET_COLUMNS.cw_name) || null,
        visit_date: parseDate(row.get(SHEET_COLUMNS.visit_date)),
        visit_time: row.get(SHEET_COLUMNS.visit_time) || null,
        counselor: row.get(SHEET_COLUMNS.counselor) || null,
        rider_type: row.get(SHEET_COLUMNS.rider_type) || null,
        rider_id: row.get(SHEET_COLUMNS.rider_id) || null,
        special_notes: row.get(SHEET_COLUMNS.special_notes) || null,
        visit_purpose: row.get(SHEET_COLUMNS.visit_purpose) || null,
        counseling_content: row.get(SHEET_COLUMNS.counseling_content) || null,
        main_content: row.get(SHEET_COLUMNS.main_content) || null,
        action_status: row.get(SHEET_COLUMNS.action_status) || null,
        action_content: row.get(SHEET_COLUMNS.action_content) || null,
        status_update_date: parseDate(row.get(SHEET_COLUMNS.status_update_date)), // ⭐️ 새로 추가
        assigned_staff: row.get(SHEET_COLUMNS.assigned_staff) || null,
        reference_link: row.get(SHEET_COLUMNS.reference_link) || null,
        rider_feedback: row.get(SHEET_COLUMNS.rider_feedback) || null
      };
      
      // 필수 필드 확인 (라이더 ID 또는 상담내용이 있어야 함)
      if (caseData.rider_id || caseData.counseling_content) {
        vocCases.push(caseData);
      }
    }
    
    console.log(`✅ ${vocCases.length}개 유효한 VOC 케이스 발견`);
    return vocCases;
    
  } catch (error) {
    console.error('❌ 구글시트 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * Supabase의 기존 VOC 케이스 조회
 * @returns {Promise<Array>} 기존 VOC 케이스 목록
 */
const fetchExistingCases = async () => {
  try {
    console.log('🔍 Supabase 기존 데이터 조회 중...');
    
    const { data, error } = await supabase
      .from('rider_voc_cases') // 새 테이블명
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    console.log(`📊 기존 VOC 케이스 ${data?.length || 0}개 발견`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Supabase 데이터 조회 실패:', error);
    throw error;
  }
};

/**
 * VOC 케이스를 Supabase에 삽입
 * @param {Object} caseData - VOC 케이스 데이터
 * @returns {Promise<Object>} 삽입 결과
 */
const insertVocCase = async (caseData) => {
  try {
    const { data, error } = await supabase
      .from('rider_voc_cases') // 새 테이블명
      .insert([{
        sheet_row_id: caseData.sheet_row_id,
        cw_name: caseData.cw_name,
        visit_date: caseData.visit_date,
        visit_time: caseData.visit_time,
        counselor: caseData.counselor,
        rider_type: caseData.rider_type,
        rider_id: caseData.rider_id,
        special_notes: caseData.special_notes,
        visit_purpose: caseData.visit_purpose,
        counseling_content: caseData.counseling_content,
        main_content: caseData.main_content,
        action_status: caseData.action_status,
        action_content: caseData.action_content,
        status_update_date: caseData.status_update_date, // ⭐️ 새로 추가
        assigned_staff: caseData.assigned_staff,
        reference_link: caseData.reference_link,
        rider_feedback: caseData.rider_feedback,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) {
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    console.error('❌ VOC 케이스 삽입 실패:', error);
    throw error;
  }
};

/**
 * VOC 케이스를 Supabase에서 업데이트
 * @param {number} id - 케이스 ID
 * @param {Object} caseData - 업데이트할 데이터
 * @returns {Promise<Object>} 업데이트 결과
 */
const updateVocCase = async (id, caseData) => {
  try {
    const { data, error } = await supabase
      .from('rider_voc_cases') // 새 테이블명
      .update({
        cw_name: caseData.cw_name,
        visit_date: caseData.visit_date,
        visit_time: caseData.visit_time,
        counselor: caseData.counselor,
        rider_type: caseData.rider_type,
        rider_id: caseData.rider_id,
        special_notes: caseData.special_notes,
        visit_purpose: caseData.visit_purpose,
        counseling_content: caseData.counseling_content,
        main_content: caseData.main_content,
        action_status: caseData.action_status,
        action_content: caseData.action_content,
        status_update_date: caseData.status_update_date, // ⭐️ 새로 추가
        assigned_staff: caseData.assigned_staff,
        reference_link: caseData.reference_link,
        rider_feedback: caseData.rider_feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    return data?.[0];
  } catch (error) {
    console.error('❌ VOC 케이스 업데이트 실패:', error);
    throw error;
  }
};

/**
 * VOC 케이스 동기화 실행
 * @returns {Promise<void>}
 */
const syncVocCases = async () => {
  try {
    console.log('🚀 VOC 케이스 동기화 시작...\n');
    
    // 1. 구글시트와 Supabase 데이터 조회
    const [sheetCases, existingCases] = await Promise.all([
      fetchSheetData(),
      fetchExistingCases()
    ]);
    
    // 2. 기존 케이스를 sheet_row_id로 매핑
    const existingCasesMap = new Map();
    existingCases.forEach(case_ => {
      if (case_.sheet_row_id) {
        existingCasesMap.set(case_.sheet_row_id.toString(), case_);
      }
    });
    
    console.log('\n📊 동기화 통계:');
    
    let newCount = 0;
    let updateCount = 0;
    let skipCount = 0;
    
    // 3. 시트 데이터 처리
    for (const sheetCase of sheetCases) {
      try {
        const rowId = sheetCase.sheet_row_id?.toString();
        
        if (!rowId) {
          console.log('⚠️  행 번호가 없어 건너뜀:', sheetCase.rider_id);
          skipCount++;
          continue;
        }
        
        const existingCase = existingCasesMap.get(rowId);
        
        if (existingCase) {
          // 업데이트
          await updateVocCase(existingCase.id, sheetCase);
          console.log(`🔄 업데이트: ${sheetCase.rider_id || 'Unknown'} (행 ${rowId})`);
          updateCount++;
        } else {
          // 새로 삽입
          await insertVocCase(sheetCase);
          console.log(`➕ 신규 추가: ${sheetCase.rider_id || 'Unknown'} (행 ${rowId})`);
          newCount++;
        }
        
        // 작업 간 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ 케이스 처리 실패 (행 ${sheetCase.sheet_row_id}):`, error.message);
        skipCount++;
      }
    }
    
    // 4. 시트에 없는 기존 데이터 확인
    const sheetRowIds = new Set(sheetCases.map(c => c.sheet_row_id?.toString()).filter(Boolean));
    const orphanedCases = existingCases.filter(c => 
      c.sheet_row_id && !sheetRowIds.has(c.sheet_row_id.toString())
    );
    
    if (orphanedCases.length > 0) {
      console.log(`\n⚠️  시트에서 삭제된 ${orphanedCases.length}개 케이스 발견:`);
      orphanedCases.forEach(case_ => {
        console.log(`   - ${case_.rider_id || 'Unknown'} (행 ${case_.sheet_row_id})`);
      });
      console.log('   이 케이스들은 수동으로 확인이 필요합니다.');
    }
    
    // 5. 최종 결과 출력
    console.log('\n✅ 동기화 완료!');
    console.log(`📊 결과 요약:`);
    console.log(`   • 신규 추가: ${newCount}개`);
    console.log(`   • 업데이트: ${updateCount}개`);
    console.log(`   • 건너뜀: ${skipCount}개`);
    console.log(`   • 총 처리: ${newCount + updateCount}개`);
    
    if (orphanedCases.length > 0) {
      console.log(`   • 확인 필요: ${orphanedCases.length}개`);
    }
    
    // 6. 필터링 통계 출력
    console.log('\n🎯 카테고리별 통계:');
    const problemSolvingCount = sheetCases.filter(c => 
      c.visit_purpose === '문제해결' && c.action_status === '해결' && c.rider_feedback
    ).length;
    
    const improvementCount = sheetCases.filter(c => 
      c.visit_purpose === '정책/서비스 개선' && 
      ['조치완료', '일부 조치완료'].includes(c.action_status) && 
      c.rider_feedback
    ).length;
    
    console.log(`   • 문제해결 사례 (노출 가능): ${problemSolvingCount}개`);
    console.log(`   • 개선 완료 아이템 (노출 가능): ${improvementCount}개`);
    
  } catch (error) {
    console.error('❌ 동기화 실패:', error);
    process.exit(1);
  }
};

// 스크립트 실행
if (require.main === module) {
  syncVocCases()
    .then(() => {
      console.log('\n🎉 VOC 동기화가 성공적으로 완료되었습니다!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 동기화 중 오류 발생:', error);
      process.exit(1);
    });
}

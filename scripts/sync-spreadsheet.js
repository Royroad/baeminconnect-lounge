const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

/**
 * 구글 스프레드시트 CSV 파일을 Supabase로 동기화하는 스크립트
 * 사용법: node sync-spreadsheet.js <csv-file-path>
 */

// Supabase 설정
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 관리자 키 필요
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncSpreadsheetToSupabase(csvFilePath) {
  console.log('📊 스프레드시트 동기화 시작...');
  
  const suggestions = [];
  const improvements = [];
  const progressItems = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // CSV 행을 데이터베이스 레코드로 변환
        const record = transformRowToRecord(row);
        
        // 상태에 따라 적절한 테이블로 분류
        switch (record.status) {
          case 'completed':
            improvements.push(record);
            break;
          case 'in_progress':
            progressItems.push(record);
            break;
          default:
            suggestions.push(record);
        }
      })
      .on('end', async () => {
        try {
          // 기존 데이터 백업 (선택사항)
          await backupExistingData();
          
          // 테이블별 업데이트
          await updateSuggestions(suggestions);
          await updateImprovements(improvements);
          await updateProgressItems(progressItems);
          
          console.log('✅ 동기화 완료!');
          console.log(`📋 제안: ${suggestions.length}건`);
          console.log(`✨ 완료: ${improvements.length}건`);
          console.log(`🚀 진행중: ${progressItems.length}건`);
          
          resolve();
        } catch (error) {
          console.error('❌ 동기화 실패:', error);
          reject(error);
        }
      });
  });
}

function transformRowToRecord(row) {
  return {
    title: row['제안제목'] || row['title'],
    description: row['제안내용'] || row['description'],
    proposer_name: row['제안자명'] || row['proposer_name'],
    status: mapStatus(row['상태'] || row['status']),
    priority: mapPriority(row['우선순위'] || row['priority']),
    progress_percentage: parseInt(row['진행률'] || row['progress']) || 0,
    current_status: row['현재상태'] || row['current_status'],
    effect_description: row['효과설명'] || row['effect_description'],
    feedback: row['피드백'] || row['feedback'],
    completed_date: parseDate(row['완료일'] || row['completed_date']),
    expected_completion: parseDate(row['예상완료일'] || row['expected_completion'])
  };
}

function mapStatus(status) {
  const statusMap = {
    '대기': 'pending',
    '진행중': 'in_progress', 
    '완료': 'completed',
    '취소': 'cancelled'
  };
  return statusMap[status] || status || 'pending';
}

function mapPriority(priority) {
  const priorityMap = {
    '낮음': 'low',
    '보통': 'medium',
    '높음': 'high'
  };
  return priorityMap[priority] || priority || 'medium';
}

function parseDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

async function backupExistingData() {
  console.log('💾 기존 데이터 백업 중...');
  
  const { data: suggestions } = await supabase.from('suggestions').select('*');
  const { data: improvements } = await supabase.from('improvements').select('*');
  const { data: progressItems } = await supabase.from('progress_items').select('*');
  
  const backup = {
    timestamp: new Date().toISOString(),
    suggestions,
    improvements,
    progressItems
  };
  
  fs.writeFileSync(
    `backup-${Date.now()}.json`, 
    JSON.stringify(backup, null, 2)
  );
  
  console.log('✅ 백업 완료');
}

async function updateSuggestions(suggestions) {
  if (suggestions.length === 0) return;
  
  console.log(`📋 제안 테이블 업데이트: ${suggestions.length}건`);
  
  // 기존 데이터 삭제 후 새로 삽입 (또는 upsert 로직 구현)
  await supabase.from('suggestions').delete().neq('id', 0);
  
  const { error } = await supabase
    .from('suggestions')
    .insert(suggestions.map(s => ({
      title: s.title,
      description: s.description,
      proposer_name: s.proposer_name,
      status: s.status,
      priority: s.priority
    })));
    
  if (error) throw error;
}

async function updateImprovements(improvements) {
  if (improvements.length === 0) return;
  
  console.log(`✨ 개선완료 테이블 업데이트: ${improvements.length}건`);
  
  await supabase.from('improvements').delete().neq('id', 0);
  
  const { error } = await supabase
    .from('improvements')
    .insert(improvements.map(i => ({
      title: i.title,
      description: i.description,
      proposer_name: i.proposer_name,
      completed_date: i.completed_date,
      effect_description: i.effect_description,
      feedback: i.feedback
    })));
    
  if (error) throw error;
}

async function updateProgressItems(progressItems) {
  if (progressItems.length === 0) return;
  
  console.log(`🚀 진행중 테이블 업데이트: ${progressItems.length}건`);
  
  await supabase.from('progress_items').delete().neq('id', 0);
  
  const { error } = await supabase
    .from('progress_items')
    .insert(progressItems.map(p => ({
      title: p.title,
      proposer_name: p.proposer_name,
      progress_percentage: p.progress_percentage,
      current_status: p.current_status,
      expected_completion: p.expected_completion
    })));
    
  if (error) throw error;
}

// 스크립트 실행
if (require.main === module) {
  const csvFilePath = process.argv[2];
  
  if (!csvFilePath) {
    console.error('❌ 사용법: node sync-spreadsheet.js <csv-file-path>');
    process.exit(1);
  }
  
  if (!fs.existsSync(csvFilePath)) {
    console.error('❌ CSV 파일을 찾을 수 없습니다:', csvFilePath);
    process.exit(1);
  }
  
  syncSpreadsheetToSupabase(csvFilePath)
    .then(() => {
      console.log('🎉 동기화 성공!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 동기화 실패:', error);
      process.exit(1);
    });
}

module.exports = { syncSpreadsheetToSupabase }; 
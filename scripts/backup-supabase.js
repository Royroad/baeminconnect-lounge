/**
 * Supabase 데이터 백업 스크립트
 * 모든 테이블의 데이터를 JSON 파일로 백업합니다.
 * 
 * 사용법:
 *   node scripts/backup-supabase.js
 * 
 * 환경변수 필요:
 *   REACT_APP_SUPABASE_URL
 *   REACT_APP_SUPABASE_ANON_KEY (또는 서비스 키)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 REACT_APP_SUPABASE_URL과 REACT_APP_SUPABASE_ANON_KEY를 설정하세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 백업할 테이블 목록
const TABLES = [
  'suggestions',
  'improvements',
  'progress_items',
  'rider_feedback',
  'counseling_cases',
  // 필요에 따라 추가 테이블 추가
];

/**
 * 테이블 데이터 백업
 */
const backupTable = async (tableName) => {
  try {
    console.log(`📦 ${tableName} 테이블 백업 중...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`❌ ${tableName} 백업 실패:`, error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  ${tableName} 테이블에 데이터가 없습니다.`);
      return { table: tableName, count: 0, data: [] };
    }

    console.log(`✅ ${tableName}: ${data.length}개 레코드 백업 완료`);
    return { table: tableName, count: data.length, data };
  } catch (error) {
    console.error(`❌ ${tableName} 백업 중 오류 발생:`, error.message);
    return null;
  }
};

/**
 * 전체 백업 실행
 */
const runBackup = async () => {
  console.log('🚀 Supabase 데이터 백업을 시작합니다...\n');

  const backupDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

  const results = {
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl,
    tables: {},
    summary: {
      totalTables: TABLES.length,
      successCount: 0,
      failCount: 0,
      totalRecords: 0,
    },
  };

  // 각 테이블 백업
  for (const table of TABLES) {
    const result = await backupTable(table);
    if (result) {
      results.tables[table] = result;
      results.summary.successCount++;
      results.summary.totalRecords += result.count;
    } else {
      results.summary.failCount++;
    }
  }

  // 백업 파일 저장
  fs.writeFileSync(backupFile, JSON.stringify(results, null, 2), 'utf8');

  // 요약 출력
  console.log('\n📊 백업 요약:');
  console.log(`   총 테이블: ${results.summary.totalTables}개`);
  console.log(`   성공: ${results.summary.successCount}개`);
  console.log(`   실패: ${results.summary.failCount}개`);
  console.log(`   총 레코드: ${results.summary.totalRecords}개`);
  console.log(`\n💾 백업 파일: ${backupFile}`);

  // 개별 테이블 파일도 저장 (선택사항)
  for (const [tableName, tableData] of Object.entries(results.tables)) {
    const tableFile = path.join(backupDir, `backup_${timestamp}_${tableName}.json`);
    fs.writeFileSync(tableFile, JSON.stringify(tableData.data, null, 2), 'utf8');
    console.log(`   - ${tableName}: ${tableFile}`);
  }

  console.log('\n✅ 백업이 완료되었습니다!');
};

// 실행
runBackup().catch((error) => {
  console.error('❌ 백업 중 오류 발생:', error);
  process.exit(1);
});


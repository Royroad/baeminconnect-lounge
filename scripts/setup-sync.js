/**
 * 구글 시트 동기화 설정 스크립트
 * 필요한 패키지 설치 및 초기 설정
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 구글 시트 동기화 환경 설정 중...');

// 1. 필요한 패키지 설치
console.log('📦 패키지 설치 중...');

const packages = [
  'google-spreadsheet',
  'google-auth-library',
  'dotenv'
];

try {
  for (const pkg of packages) {
    console.log(`  - ${pkg} 설치 중...`);
    execSync(`npm install ${pkg}`, { stdio: 'inherit' });
  }
  console.log('✅ 패키지 설치 완료');
} catch (error) {
  console.error('❌ 패키지 설치 실패:', error.message);
  process.exit(1);
}

// 2. package.json에 스크립트 추가
console.log('📝 package.json 스크립트 추가 중...');

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  // 동기화 관련 스크립트 추가
  packageJson.scripts['sync:sheets'] = 'node scripts/google-sheets-sync.js';
  packageJson.scripts['sync:setup'] = 'node scripts/setup-sync.js';
  packageJson.scripts['sync:test'] = 'node scripts/test-sync.js';
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json 업데이트 완료');
} catch (error) {
  console.error('❌ package.json 업데이트 실패:', error.message);
}

// 3. 환경변수 템플릿 생성
console.log('🔐 환경변수 템플릿 생성 중...');

const envTemplate = `
# 구글 시트 동기화를 위한 환경변수 설정
# .env 파일에 추가하세요

# Supabase 서비스 키 (동기화용 - 관리자 권한)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 구글 시트 설정
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----"

# 동기화 설정
SYNC_INTERVAL_HOURS=24
SYNC_LOG_LEVEL=info
`;

try {
  fs.writeFileSync('.env.sync.template', envTemplate.trim());
  console.log('✅ 환경변수 템플릿 생성 완료 (.env.sync.template)');
} catch (error) {
  console.error('❌ 환경변수 템플릿 생성 실패:', error.message);
}

// 4. 설정 가이드 출력
console.log('\n🎯 설정 완료! 다음 단계를 진행하세요:\n');

console.log('1. 구글 클라우드 콘솔에서 서비스 계정 생성');
console.log('   - https://console.cloud.google.com/');
console.log('   - API 및 서비스 > 사용자 인증 정보');
console.log('   - 서비스 계정 만들기');
console.log('   - 키 생성 (JSON 형식)');

console.log('\n2. 구글 시트 권한 설정');
console.log('   - 구글 시트를 서비스 계정 이메일과 공유');
console.log('   - 편집자 권한 부여');

console.log('\n3. Supabase 서비스 키 발급');
console.log('   - Supabase Dashboard > Settings > API');
console.log('   - service_role key 복사');

console.log('\n4. 환경변수 설정');
console.log('   - .env 파일에 위의 키값들 추가');
console.log('   - .env.sync.template 파일 참고');

console.log('\n5. 동기화 테스트');
console.log('   - npm run sync:test');
console.log('   - npm run sync:sheets');

console.log('\n✨ 설정이 완료되면 매일 자동 동기화가 시작됩니다!');
# 🗃️ Supabase 연동 설정 가이드

라이더 제안함 기능을 사용하기 위한 Supabase 데이터베이스 설정 방법을 안내합니다.

## 📋 **1단계: Supabase 프로젝트 생성**

### 1.1 계정 생성 및 로그인
1. [Supabase 웹사이트](https://supabase.com) 방문
2. 계정 생성 또는 로그인 (GitHub 계정으로 간편 로그인 가능)

### 1.2 새 프로젝트 생성
1. **"New Project"** 버튼 클릭
2. 프로젝트 정보 입력:
   - **Name**: `baemin-lounge-suggestions` (원하는 이름)
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국과 가장 가까운 지역)
3. **"Create new project"** 클릭
4. 프로젝트 생성 완료까지 2-3분 대기

## 🔧 **2단계: 데이터베이스 테이블 생성**

### 2.1 SQL Editor 접속
1. 왼쪽 메뉴에서 **"SQL Editor"** 클릭
2. **"New query"** 버튼 클릭

### 2.2 테이블 생성 스크립트 실행
1. 프로젝트 폴더의 `database_setup.sql` 파일 내용 복사
2. SQL Editor에 붙여넣기
3. **"Run"** 버튼 클릭 또는 `Ctrl + Enter`
4. 성공 메시지 확인

### 2.3 테이블 생성 확인
1. 왼쪽 메뉴에서 **"Table Editor"** 클릭
2. 다음 테이블들이 생성되었는지 확인:
   - `suggestions` (제안)
   - `improvements` (완료된 개선 아이템)
   - `progress_items` (진행 중인 아이템)

## 🔑 **3단계: API 키 및 URL 확인**

### 3.1 프로젝트 설정으로 이동
1. 왼쪽 메뉴에서 **"Settings"** 클릭
2. **"API"** 메뉴 선택

### 3.2 연결 정보 복사
다음 정보를 복사해 둡니다:
- **Project URL**: `https://your-project-id.supabase.co` 형태
- **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` 형태

## ⚙️ **4단계: React 앱 환경변수 설정**

### 4.1 환경변수 파일 생성
프로젝트 루트 폴더에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```bash
# Supabase 설정
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 주의사항:**
- `your-project-id`를 실제 프로젝트 ID로 교체
- `eyJhbGc...`을 실제 anon key로 교체
- `.env.local` 파일은 Git에 업로드하지 마세요!

### 4.2 .gitignore 확인
`.gitignore` 파일에 다음 내용이 포함되어 있는지 확인:
```
.env.local
.env
```

## 🚀 **5단계: 애플리케이션 실행**

### 5.1 개발 서버 재시작
환경변수 변경 후 개발 서버를 재시작해야 합니다:
```bash
npm start
```

### 5.2 기능 테스트
1. 메인 페이지에서 개선사항 배너 확인
2. "라이더 제안함" 메뉴 클릭
3. 통계, 완료 아이템, 진행 중 아이템 등이 표시되는지 확인

## 📊 **6단계: 데이터 관리 (선택사항)**

### 6.1 Supabase 대시보드에서 데이터 관리
1. **Table Editor**에서 직접 데이터 편집 가능
2. 새로운 제안, 개선 아이템 추가
3. 진행률 업데이트 등

### 6.2 실시간 업데이트 확인
- 데이터베이스에서 데이터 변경 시
- 웹사이트에서 새로고침하면 즉시 반영 확인

## 🛡️ **7단계: 보안 설정 (프로덕션 환경)**

### 7.1 Row Level Security (RLS) 확인
- 이미 설정된 RLS 정책으로 읽기 권한만 공개
- 쓰기 권한은 관리자만 가능하도록 설정됨

### 7.2 도메인 허용 설정 (선택사항)
1. **Settings > API > Site URL** 설정
2. 실제 도메인 URL 추가 (예: `https://yoursite.com`)

## ❓ **문제 해결**

### 연결 오류 시 확인사항:
1. **환경변수 확인**: `.env.local` 파일의 URL과 키가 정확한지 확인
2. **서버 재시작**: 환경변수 변경 후 `npm start` 재실행
3. **네트워크 확인**: 브라우저 개발자 도구에서 네트워크 에러 확인
4. **Supabase 프로젝트 상태**: Supabase 대시보드에서 프로젝트가 활성 상태인지 확인

### 데이터가 보이지 않을 때:
1. **테이블 확인**: Table Editor에서 데이터가 존재하는지 확인
2. **RLS 정책**: SQL Editor에서 RLS 정책이 올바르게 설정되었는지 확인
3. **브라우저 콘솔**: 개발자 도구에서 에러 메시지 확인

## 📞 **추가 지원**

더 자세한 정보가 필요하시면:
- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase 커뮤니티](https://github.com/supabase/supabase/discussions)

---

**🎉 설정 완료!**
이제 라이더분들의 소중한 제안을 체계적으로 관리할 수 있습니다! 
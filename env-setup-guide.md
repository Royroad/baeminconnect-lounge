# 환경변수 설정 가이드

## .env 파일에 추가할 내용

```env
# 기존 Supabase 설정 (그대로 유지)
REACT_APP_SUPABASE_URL=https://lkylcfbqilhwvujxjmlu.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 추가할 동기화 설정
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_CLIENT_EMAIL=baemin-lounge-sync@your-project-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n"
```

## 각 값을 찾는 방법

### 1. SUPABASE_SERVICE_ROLE_KEY
1. Supabase Dashboard 접속: https://app.supabase.com
2. 프로젝트 선택
3. Settings > API 메뉴
4. "service_role" 키 복사 (secret 부분)

### 2. GOOGLE_SHEET_ID  
구글 시트 URL에서 추출:
```
https://docs.google.com/spreadsheets/d/1ABC123-XYZ789-DEF456/edit#gid=0
                                    ↑ 이 부분이 SHEET_ID ↑
```

### 3. GOOGLE_CLIENT_EMAIL
다운로드한 JSON 파일의 "client_email" 값

### 4. GOOGLE_PRIVATE_KEY
다운로드한 JSON 파일의 "private_key" 값
⚠️ 주의: 따옴표로 감싸고 \n은 \\n으로 이스케이프 처리

## 완성된 .env 파일 예시

```env
REACT_APP_SUPABASE_URL=https://lkylcfbqilhwvujxjmlu.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxreWxjZmJ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxreWxjZmJ
GOOGLE_SHEET_ID=1ABC123-XYZ789-DEF456
GOOGLE_CLIENT_EMAIL=baemin-lounge-sync@my-project-123456.iam.gserviceaccount.com  
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```
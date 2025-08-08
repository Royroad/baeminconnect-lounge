# 새 구글시트 연동 설정 가이드

## 📋 개요

새로운 구글시트 구조에 맞춰 상담 케이스 관리 시스템을 업데이트했습니다.

**새 구글시트 ID**: `1XKsKDEgjlca5sVGwt0ymujaYDvwZ3UNWSReAjkHnf1Q`

## 🔧 설정 단계

### 1. 환경변수 업데이트

`.env` 파일에서 구글시트 ID를 변경하세요:

```env
GOOGLE_SHEET_ID=1XKsKDEgjlca5sVGwt0ymujaYDvwZ3UNWSReAjkHnf1Q
```

### 2. 데이터베이스 테이블 생성

Supabase Dashboard의 SQL Editor에서 다음 파일을 실행하세요:

```bash
# 파일: database_counseling_setup.sql
```

이 파일은 새로운 `counseling_cases` 테이블을 생성하고 샘플 데이터를 삽입합니다.

### 3. 동기화 테스트

```bash
# 연결 테스트
npm run sync:test

# 상담 케이스 동기화 실행
npm run sync:counseling
```

## 📊 새 구글시트 컬럼 구조

| 컬럼 | 내용 | Supabase 필드 |
|------|------|---------------|
| A | No | sheet_row_id |
| B | CW | cw_name |
| C | 방문일자 | visit_date |
| D | 방문 시간대 | visit_time |
| E | 상담자 | counselor |
| F | 라이더 타입 | rider_type |
| G | 아이디 | rider_id |
| H | 특이사항 | special_notes |
| I | 방문목적 | visit_purpose |
| J | 상담내용 | counseling_content |
| K | 주요 내용 | main_content |
| L | 조치 상태 | action_status |
| M | 조치 내용 | action_content |
| N | 배정 담당자 | assigned_staff |
| O | 연결 링크 | reference_link |
| P | 라이더 피드백(공개용) | rider_feedback |

## 🎯 업데이트된 기능

### 1. 새로운 페이지 구성

**제안함 페이지 변경사항**:
- ✅ 상단에 **문제해결 사례** 섹션 추가
- ✅ **라이더 보이스** (피드백) 섹션 추가
- ❌ 통계 대시보드 섹션 제거 (총 제안 수, 개선 완료 등)
- ✅ 기존 개선 완료/진행중 섹션 유지

### 2. 새로운 컴포넌트

- `ProblemSolvingSection.js`: 문제해결 사례 표시
- `RiderFeedbackSection.js`: 라이더 피드백 표시
- `counselingService.js`: 상담 데이터 관리 서비스

### 3. 데이터 흐름

```
구글시트 (상담 기록) 
    ↓ 
Supabase counseling_cases 테이블 
    ↓ 
React 컴포넌트 (문제해결 사례, 라이더 보이스)
```

## 🚀 사용법

### 동기화 실행

```bash
# 상담 케이스 동기화
npm run sync:counseling
```

### 로그 확인

동기화 실행 시 다음과 같은 정보가 표시됩니다:
- 📋 구글시트에서 읽은 데이터 수
- ➕ 신규 추가된 케이스 수
- 🔄 업데이트된 케이스 수
- ⚠️ 건너뛴 케이스 수

### 데이터 검증

1. **구글시트 확인**: 데이터가 올바른 형식으로 입력되어 있는지 확인
2. **Supabase 확인**: `counseling_cases` 테이블에 데이터가 정상적으로 동기화되었는지 확인
3. **웹사이트 확인**: 제안함 페이지에서 문제해결 사례와 라이더 피드백이 표시되는지 확인

## ⚠️ 주의사항

1. **필수 컬럼**: `아이디(G)` 또는 `상담내용(J)`이 비어있는 행은 동기화에서 제외됩니다.
2. **날짜 형식**: `방문일자(C)` 컬럼은 YYYY-MM-DD 형식을 권장합니다.
3. **조치 상태**: `완료`, `진행중`, `검토중`, `접수완료`, `취소`, `보류` 중 하나를 사용하세요.

## 🔧 문제 해결

### 동기화 실패 시

1. **환경변수 확인**: `.env` 파일의 모든 값이 올바른지 확인
2. **권한 확인**: Google Sheets API 권한이 설정되어 있는지 확인
3. **네트워크 확인**: 방화벽이나 프록시 설정 확인

### 데이터가 표시되지 않을 때

1. **테이블 확인**: Supabase에서 `counseling_cases` 테이블이 생성되었는지 확인
2. **데이터 확인**: 테이블에 데이터가 있고 `rider_feedback`이 비어있지 않은지 확인
3. **콘솔 확인**: 브라우저 개발자 도구에서 오류 메시지 확인

## 📞 지원

문제가 발생하면 다음 파일들을 확인하세요:
- `scripts/counseling-sync.js`: 동기화 스크립트
- `src/services/counselingService.js`: 데이터 조회 서비스
- `database_counseling_setup.sql`: 데이터베이스 설정

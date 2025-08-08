# Supabase 설정 및 Rider ID 마스킹 가이드

## 1. Supabase 테이블 컬럼명 변경

### 단계 1: Supabase Dashboard에 로그인
1. [Supabase Dashboard](https://app.supabase.com)에 접속
2. 프로젝트 선택

### 단계 2: SQL Editor에서 컬럼명 변경
1. 좌측 메뉴에서 "SQL Editor" 클릭
2. 다음 쿼리로 현재 테이블 확인:

```sql
-- proposer_name 컬럼이 있는 테이블 찾기
SELECT table_name 
FROM information_schema.columns 
WHERE column_name = 'proposer_name' 
AND table_schema = 'public';
```

3. 각 테이블별로 컬럼명 변경:

```sql
-- 예시: posts 테이블의 컬럼명 변경
ALTER TABLE posts RENAME COLUMN proposer_name TO rider_id;

-- 예시: comments 테이블의 컬럼명 변경  
ALTER TABLE comments RENAME COLUMN proposer_name TO rider_id;

-- 예시: suggestions 테이블의 컬럼명 변경
ALTER TABLE suggestions RENAME COLUMN proposer_name TO rider_id;
```

⚠️ **주의사항:**
- 백업을 먼저 받으세요
- 한 번에 하나씩 실행하여 오류 확인
- 실제 테이블명에 맞게 수정

## 2. 환경변수 설정

### 단계 1: .env 파일 생성
프로젝트 루트에 `.env` 파일을 만들고 다음 내용 추가:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 단계 2: Supabase 정보 확인
1. Supabase Dashboard → Settings → API
2. Project URL과 anon public key 복사
3. .env 파일에 붙여넣기

## 3. 코드에서 사용법

### 기본 사용법

```javascript
import { formatRiderName, maskRiderId } from './utils/maskRiderId';
import { fetchTableData } from './services/supabase';

// 단일 rider ID 마스킹
const maskedId = maskRiderId('BC9612345'); // 'BC96*****'
const displayName = formatRiderName('BC9612345'); // 'BC96***** 라이더님'

// Supabase에서 데이터 가져오기
const { data, error } = await fetchTableData('posts');
```

### 컴포넌트에서 사용

```javascript
import RiderCard from './components/RiderCard';
import RiderList from './components/RiderList';

// 단일 카드
<RiderCard 
  riderId="BC9612345"
  content="휴게실 개선 제안"
  date="2024-01-15"
/>

// 목록 컴포넌트
<RiderList tableName="posts" />
```

## 4. 마스킹 규칙

- **4글자 이상**: 앞 4글자만 표시, 나머지는 '*'로 마스킹
  - `BC9612345` → `BC96*****`
  - `XY1234567890` → `XY12********`

- **4글자 미만**: 전체 '*'로 마스킹
  - `ABC` → `***`
  - `AB` → `**`

- **잘못된 값**: `****`로 표시
  - `null`, `undefined`, 숫자, 객체 등

## 5. 테스트 실행

```bash
# 마스킹 함수 테스트
npm test maskRiderId.test.js

# 모든 테스트 실행
npm test
```

## 6. 사용 가능한 함수들

### maskRiderId(riderId)
```javascript
maskRiderId('BC9612345') // 'BC96*****'
```

### formatRiderName(riderId)
```javascript
formatRiderName('BC9612345') // 'BC96***** 라이더님'
```

### maskMultipleRiderIds(riderIds)
```javascript
maskMultipleRiderIds(['BC9612345', 'AB7889012']) 
// ['BC96*****', 'AB78*****']
```

### Supabase 함수들
```javascript
// 데이터 조회
fetchTableData('posts')
fetchDataByRiderId('posts', 'BC9612345')

// 데이터 조작
insertData('posts', newData)
updateData('posts', id, updateData)
deleteData('posts', id)
```

## 7. 문제 해결

### 흔한 오류들
1. **환경변수 인식 안됨**: `.env` 파일이 프로젝트 루트에 있는지 확인
2. **Supabase 연결 오류**: URL과 Key가 정확한지 확인
3. **컬럼명 오류**: 테이블에 `rider_id` 컬럼이 있는지 확인

### 개발자 도구 확인
```javascript
// 브라우저 콘솔에서 확인
console.log(process.env.REACT_APP_SUPABASE_URL);
console.log(process.env.REACT_APP_SUPABASE_ANON_KEY);
```
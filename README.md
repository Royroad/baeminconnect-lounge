# 🏢 배민커넥트 라운지 웹사이트

라이더님들을 위한 편안한 휴식 공간, 배민커넥트 라운지의 공식 웹사이트입니다.

## ✨ **주요 기능**

### 🏠 **라운지 소개**
- 라운지 시설 및 편의사항 안내
- 위치 및 운영시간 정보
- 갤러리 및 FAQ

### 💡 **라이더 제안함** (Supabase 연동)
- **통계 대시보드**: 총 제안수, 완료수, 진행률 등
- **개선 완료 아이템**: 라이더 제안으로 실제 개선된 사항들
- **진행 중인 개선**: 현재 진행 중인 개선 사항과 진행률
- **검토 중인 제안**: 새로 들어온 제안들
- **기여자 랭킹**: 가장 많은 기여를 해주신 라이더분들
- **제안하기**: 새로운 개선 제안 방법 안내

## 🛠️ **기술 스택**

- **Frontend**: React 19, Bootstrap 5, React Router
- **Backend**: Supabase (PostgreSQL)
- **Styling**: CSS3, Bootstrap
- **Icons**: React Icons

## 🚀 **빠른 시작**

### 1. 프로젝트 클론 및 설치
```bash
git clone <repository-url>
cd baemin-lounge
npm install
```

### 2. 환경변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 Supabase 정보를 입력:

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 개발 서버 실행
```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 🗃️ **Supabase 설정**

라이더 제안함 기능을 사용하려면 Supabase 데이터베이스 설정이 필요합니다.

### 빠른 설정
1. [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) 가이드 참고
2. `database_setup.sql` 파일을 Supabase SQL Editor에서 실행
3. 환경변수 설정 후 서버 재시작

### 데이터베이스 구조
- **suggestions**: 라이더 제안 데이터
- **improvements**: 완료된 개선 아이템
- **progress_items**: 진행 중인 개선 사항

## 📁 **프로젝트 구조**

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── Header.js       # 헤더 네비게이션
│   ├── Footer.js       # 푸터
│   ├── Gallery.js      # 갤러리
│   └── ImprovementBanner.js  # 개선사항 배너
├── pages/              # 페이지 컴포넌트
│   ├── MainPage.js     # 메인 페이지
│   └── SuggestionsPage.js    # 라이더 제안함 페이지
├── services/           # 데이터 서비스
│   └── suggestionService.js  # Supabase 연동 로직
├── config/             # 설정 파일
│   └── supabase.js     # Supabase 클라이언트 설정
├── images/             # 이미지 자원
└── App.js              # 메인 앱 컴포넌트
```

## 🎨 **스타일링**

- **메인 컬러**: 민트 (`#2AC1BC`)
- **폰트**: Apple SD Gothic Neo, Malgun Gothic, Nanum Gothic
- **반응형 디자인**: 모바일 최적화
- **호버 효과**: 부드러운 애니메이션

## 📱 **주요 화면**

### 메인 페이지
- 라운지 소개 및 기본 정보
- 개선사항 배너 (최근 완료된 개선 사항)
- 편의시설, 위치, 갤러리, FAQ

### 라이더 제안함 페이지
- 실시간 통계 대시보드
- 개선 완료/진행중/검토중 아이템들
- 기여자 랭킹 및 새로운 제안 안내

## 🔧 **개발 스크립트**

```bash
# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

## 🌐 **배포**

### Vercel (추천)
```bash
npm run build
# Vercel에 업로드 또는 Git 연동
```

### 기타 플랫폼
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📋 **TODO / 향후 계획**

- [ ] 실시간 알림 기능 (Supabase Realtime)
- [ ] 관리자 대시보드 (제안 승인/거부)
- [ ] 이메일 알림 (새 제안 시)
- [ ] 파일 업로드 (Before/After 이미지)
- [ ] PWA 지원 (오프라인 사용)

## 🤝 **기여하기**

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 **문의**

- **카카오톡**: @배민커넥트
- **이메일**: contact@baemin.com
- **주소**: 서울 송파구 백제고분로 364 대신빌딩 3층

---

**💚 라이더님들의 소중한 의견으로 만들어가는 더 나은 라운지!**

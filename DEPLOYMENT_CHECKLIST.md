# 📋 배포 체크리스트

서비스 종료 페이지 배포 전 확인사항입니다.

## ✅ 완료된 작업

- [x] 종료 안내 페이지 구현
- [x] 모든 라우트 리다이렉트 설정
- [x] 헤더 네비게이션 제거
- [x] 검색엔진 크롤링 차단 (`robots.txt`)
- [x] 프로덕션 빌드 완료

## 🚀 배포 전 확인

### 1. 빌드 확인
```bash
# build 폴더 확인
ls -la build/

# 로컬에서 테스트 (선택사항)
npx serve -s build
```

### 2. 배포 방법 (호스팅 플랫폼별)

#### Vercel
```bash
# 방법 1: CLI 사용
vercel --prod

# 방법 2: Git push (자동 배포)
git add .
git commit -m "서비스 종료 페이지 배포"
git push origin main
```

#### Netlify
```bash
# 방법 1: CLI 사용
netlify deploy --prod --dir=build

# 방법 2: Git push (자동 배포)
git add .
git commit -m "서비스 종료 페이지 배포"
git push origin main
```

#### GitHub Pages
```bash
# gh-pages 브랜치에 배포
npm install -g gh-pages
gh-pages -d build
```

#### 기타 정적 호스팅
- `build/` 폴더의 모든 내용을 호스팅 서버에 업로드
- `index.html`이 루트에 위치하도록 설정

### 3. 배포 후 확인

- [ ] 메인 페이지(`/`)에서 종료 안내가 표시되는지 확인
- [ ] `/suggestions` 등 다른 경로도 종료 페이지로 리다이렉트되는지 확인
- [ ] 모바일에서도 정상적으로 표시되는지 확인
- [ ] 로고 이미지가 정상적으로 로드되는지 확인
- [ ] 스타일이 정상적으로 적용되는지 확인

### 4. Supabase 처리 (선택사항)

데이터 백업이 필요 없는 경우:
- [ ] Supabase 프로젝트 일시 중지 또는 삭제
- [ ] Supabase 대시보드에서 프로젝트 설정 확인

### 5. 자동화 중지

- [ ] GitHub Actions 워크플로우 확인 및 중지 (현재 없음)
- [ ] Cron Job 확인 및 중지 (설정된 경우)

## 📝 배포 완료 후

배포가 완료되면:
1. 실제 도메인에서 종료 페이지가 정상 작동하는지 확인
2. 일정 기간 모니터링 (1주일 정도)
3. 필요시 Supabase 프로젝트 일시 중지

---

**배포일**: [배포 날짜 입력]
**배포자**: [이름 입력]


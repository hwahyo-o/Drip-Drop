# Drip Drop

Drip Drop (드립 드롭)은 로스터리 카페 전용 지도 웹앱(웹 사이트 페이지)입니다. 사용자는 현재 위치 주변의 검증된 로스터리 카페를 지도와 리스트로 탐색하고, 원두 구매 가능 여부, 필터/브루잉/드립 커피 제공 여부, 메뉴, 운영 시간, 리뷰를 확인할 수 있습니다.

## 핵심 기능

- Leaflet + OpenStreetMap 데이터 기반 CARTO Voyager 지도
- 접속 직후 현재 위치 권한 요청 및 현재 위치 중심 지도 표시
- Google Material Symbols 기반 현재 위치/카페 마커
- 지도 뷰 / 리스트 뷰 전환
- 관리자 네이버 지도 실존 검증을 통과한 카페만 공개 노출
- 카페명, 주소, 메뉴, 편의시설, 영업 상태 검색 및 필터
- 네이버 지도 이동 시 카페명 또는 네이버 검색명만 검색어로 사용
- Google 로그인
- 찜 목록, 취향 프로필, 보유 원두, 갖고 싶은 원두
- 규칙 기반 검증 카페/원두 추천
- 리뷰, 커뮤니티, 댓글, 대댓글, 공감, 알림
- 연간 취향/활동 리포트
- 라인 그리드 대시보드 스타일의 관리자 전용 검증 화면

## 실행 방법

정적 웹앱이므로 `index.html`을 브라우저로 열거나, VS Code Live Server 같은 정적 서버에서 실행하면 됩니다.

Firebase Authentication과 Firestore를 사용하려면 Firebase Console에서 다음 항목을 설정해야 합니다.

1. Authentication > Sign-in method > Google 활성화
2. Firestore Database 생성
3. 승인된 도메인에 GitHub Pages 도메인 추가
4. Firestore Rules 적용
5. GitHub repository secrets에 Firebase 배포 값 등록

## 배포

GitHub Pages 배포는 `.github/workflows/deploy.yml`에서 처리합니다. `main` 브랜치에 push되면 정적 파일이 Pages artifact로 업로드됩니다.

Firebase secrets가 비어 있으면 배포는 성공하지만 Google 로그인, 찜, 관리자, Firestore 저장 기능은 비활성화됩니다. 이 경우 공개 지도 UI는 계속 동작해야 합니다.

## 보안

`.env` 파일은 로컬 전용이며 GitHub에 올리지 않습니다. Firebase Web config는 저장소에 직접 커밋하지 않고 GitHub Actions secrets에서 배포 시점에 생성합니다. Google 로그인용 Firebase Web API key는 Google Cloud HTTP referrer 제한과 Firestore Rules로 보호해야 합니다.

지도는 기본적으로 Leaflet + OpenStreetMap 데이터 기반 CARTO Voyager 타일을 사용하므로 지도 API key가 필요하지 않습니다. IPstack key는 지도 타일 key가 아니며, 브라우저 JavaScript, GitHub 저장소, GitHub Pages 배포 산출물에 포함하지 않습니다. IP 기반 위치 조회가 필요해지면 백엔드 또는 서버리스 프록시에서만 처리합니다.

## 운영 문서

- `docs/FIREBASE_SETUP.md`: Firebase 로그인, Firestore, 관리자 권한 설정
- `docs/MAP_API_SECURITY.md`: 지도 API와 IPstack key 처리 정책
- `docs/DATA_SCHEMA.md`: Firestore 데이터 구조
- `docs/ADMIN_GUIDE.md`: 관리자 카페 등록 기준과 입력 방식
- `docs/DEPLOYMENT_QA.md`: GitHub Pages 배포 후 직접 확인할 체크리스트
- `docs/IMPLEMENTATION_AUDIT.md`: 개선 요청별 구현 증거와 감사 기록
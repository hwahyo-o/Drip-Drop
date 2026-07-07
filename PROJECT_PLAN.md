# Drip Drop 제작 플랜

## 요약

- Drip Drop (드립 드롭)은 로스터리 카페 전용 지도 웹앱(웹 사이트 페이지)로 제작한다.
- 구조는 정적 SPA + Firebase + GitHub Pages로 구성한다.
- 카페 데이터는 관리자 수동 등록/검수 방식으로 운영한다.
- 추천 기능은 무료 운영을 위해 규칙 기반 추천으로 시작한다.
- 배포 저장소는 `https://github.com/hwahyo-o/Drip-Drop`의 `main` 브랜치를 사용한다.

## 모듈

- `firebase.js`: Firebase App, Auth, Firestore 초기화
- `auth.js`: Google 로그인, 로그아웃, 관리자 권한 판별
- `map.js`: Leaflet 지도, 현재 위치, 카페 마커
- `cafeStore.js`: 카페 데이터 조회/등록/수정
- `search.js`: 키워드, 주소, 메뉴, 편의시설, 영업 상태 필터
- `recommendations.js`: 취향/거리/영업 상태 기반 규칙 추천
- `favorites.js`: 찜 추가/삭제/목록
- `reviews.js`: 카페 리뷰 작성/조회
- `community.js`: 게시글, 댓글, 대댓글, 공감
- `profile.js`: 취향, 보유 원두, 갖고 싶은 원두
- `reports.js`: 연간 리포트
- `notifications.js`: 반응 알림
- `admin.js`: 관리자 전용 카페 데이터 관리

## 좌표 정책

네이버 지도와 같은 좌표가 필요하면 관리자가 네이버 기준 좌표를 확인해 원본 문자열로 저장한다. 지도 렌더링에는 숫자 좌표를 사용한다. 소수점 20자리 동일성은 지도/데이터 소스 특성상 자동 보장하지 않는다.

## 비용 정책

무료 우선으로 운영한다. GitHub Pages, Firebase 무료 플랜, OpenStreetMap 타일을 우선 사용하고, 유료 API 또는 AI 추천은 후속 선택 기능으로 둔다.

# Implementation Audit

이 문서는 Drip Drop 개선 요청 10개가 현재 소스에서 어디에 반영되어 있는지 추적하기 위한 감사 기록입니다. 실제 배포 URL에서의 브라우저 확인은 `docs/DEPLOYMENT_QA.md`를 기준으로 별도 수행합니다.

## 1. Roadmap 지도

- 증거: `js/map.js`
- `L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", ...)`를 사용합니다.
- attribution에 `OpenStreetMap Roadmap`을 명시했습니다.
- 화면 라벨은 `index.html`의 `Roadmap View`, `Roadmap / 현재 위치 중심`입니다.

## 2. 검증되지 않은 카페 미노출 및 더미 데이터 제거

- 증거: `data/cafes.seed.json`
- 파일 내용은 빈 배열 `[]`입니다.
- 증거: `js/cafeStore.js`
- Firestore 쿼리는 `where("approved", "==", true)`와 `where("naverVerified", "==", true)` 조건을 모두 사용합니다.
- `loadSeedCafes()`는 빈 배열만 반환합니다.
- 증거: `firestore.rules`
- 공개 읽기는 `(resource.data.approved == true && resource.data.naverVerified == true) || isAdmin()` 조건만 허용합니다.

## 3. 네이버 지도 검색어는 카페명만 사용

- 증거: `js/cafeStore.js`
- `buildNaverMapUrl(cafe)`는 `cafe.naverPlaceName || cafe.name`만 인코딩합니다.
- 주소는 네이버 지도 검색어에 붙이지 않습니다.

## 4. 카페 위치 마커 coffee-maker 스타일

- 증거: `js/map.js`
- `renderCafeMarkers()`에서 `coffeeMakerIcon()`을 Leaflet marker icon으로 사용합니다.
- `coffeeMakerIcon()`은 커피 메이커 형태의 SVG path를 포함합니다.
- 증거: `css/map.css`
- `.coffee-maker-marker`, `.marker-pin`, `.maker` 스타일이 정의되어 있습니다.

## 5. 현재 위치 마커 coffee-beans 스타일

- 증거: `js/map.js`
- `showUserLocation()`에서 `coffeeBeansIcon()`을 Leaflet marker icon으로 사용합니다.
- `coffeeBeansIcon()`은 원두 형태의 SVG path를 포함합니다.
- 증거: `css/map.css`
- `.coffee-beans-marker`, `.beans-pulse`, `.bean`, `.bean-line` 스타일이 정의되어 있습니다.

## 6. 접속 직후 위치 권한 요청

- 증거: `js/app.js`
- `boot()`에서 `requestLocationOnLanding()`을 호출합니다.
- `requestLocationOnLanding()`은 `locateUser()`를 호출하고, 브라우저 Geolocation 권한 요청을 유도합니다.
- 사용자는 `위치 허용하기`, `나중에 하기`, 닫기 버튼으로 안내 카드를 제어할 수 있습니다.

## 7. 위치 허용 후 현재 위치 중심 지도

- 증거: `js/map.js`
- `showUserLocation(location)`이 사용자 위치 마커를 추가하고 `map.setView([location.lat, location.lng], 15)`를 호출합니다.
- 위치 권한을 허용하면 파주, 서울, 부산 등 사용자의 실제 좌표 중심으로 지도가 이동합니다.

## 8. 사용자 화면 디자인 방향

- 증거: `css/styles.css`
- 일반 사용자 화면은 미니멀한 웜톤/파스텔톤/모던/세련된 방향으로 구성했습니다.
- 배경에는 얇은 그리드 라인을 사용하고, 카드/검색/필터는 부드러운 라운드와 웜톤 표면을 사용합니다.

## 9. 관리자 모드 대시보드 + 얇은 선 그리드

- 증거: `css/admin.css`
- `.admin-shell`은 어두운 대시보드 배경과 얇은 선 그리드를 사용합니다.
- 관리자 모드는 일반 사용자 화면과 다르게 검증 작업용 대시보드 톤으로 분리되어 있습니다.

## 10. 라인 아이콘과 다이어그램 인포그래픽

- 증거: `js/admin.js`
- 관리자 화면에는 `01 네이버 지도에서 카페명 검색`, `02 실존 장소와 주소 확인`, `03 검증 완료 후 공개 승인` 단계 인포그래픽이 있습니다.
- 증거: `index.html`, `js/map.js`
- 브랜드/마커/빈 상태는 SVG 라인 아이콘 기반으로 구성되어 있습니다.

## 배포 후 확인

- 실제 GitHub Pages URL에서는 `docs/DEPLOYMENT_QA.md`의 항목을 기준으로 확인합니다.
- 이 환경에는 `node` 명령이 없어 JS 문법 체크는 수행하지 못했습니다.
- 사용자가 서버 접속 확인을 직접 수행한다고 했으므로 로컬 서버 실행과 배포 URL 렌더링 확인은 진행하지 않았습니다.

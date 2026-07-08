# Deployment QA

GitHub Pages 배포가 완료된 뒤 실제 URL에서 아래 항목을 확인합니다.

## Firebase 로그인

- `https://hwahyo-o.github.io/Drip-Drop/js/firebaseConfig.js`에서 `apiKey`가 빈 문자열이 아닌지 확인합니다.
- `apiKey`가 비어 있으면 GitHub Repository secrets에 Firebase 값이 등록되지 않았거나, 등록 후 Pages 재배포가 아직 완료되지 않은 상태입니다.
- Google 로그인 버튼을 누르면 팝업 또는 리다이렉트 로그인이 시작되는지 확인합니다.
- Firebase Authentication > Settings > Authorized domains에 `hwahyo-o.github.io`가 등록되어 있는지 확인합니다.
- 로그인이 되었지만 관리자 탭이 보이지 않으면 Firestore `users/{uid}.role` 또는 bootstrap admin 이메일 설정을 확인합니다.

## 공개 키 노출

- GitHub 저장소 코드에 Firebase Web API key 또는 기존 Google API key 문자열이 직접 커밋되지 않았는지 확인합니다.
- 배포된 HTML/JS에서 IPstack key `807e645c14a67c1a626e4955af39262b`가 노출되지 않는지 확인합니다.
- GitHub Security and quality > Secret scanning alert가 `Revoked` 또는 `Rotated` 상태로 닫혔는지 확인합니다.
- Firebase 로그인을 활성화한 경우 배포 산출물의 `js/firebaseConfig.js`에는 제한된 Firebase Web API key가 보일 수 있습니다. 이 값은 Google Cloud HTTP referrer 제한과 Firestore Rules로 보호합니다.

## 지도와 위치

- 첫 접속 시 브라우저 위치 권한 요청이 표시되는지 확인합니다.
- 위치를 허용하면 지도가 현재 위치 중심으로 이동하는지 확인합니다.
- 현재 위치 마커가 Google Material Symbols `local_cafe` 스타일 아이콘으로 표시되는지 확인합니다.
- 지도는 기본적으로 Leaflet + OpenStreetMap 데이터 기반 CARTO Voyager 화면으로 표시되어야 합니다.
- 지도 색감이 밝고 부드러운 도로 지도 형태로 보이는지 확인합니다.
- `js/mapConfig.js`의 `NAVER_MAP_CLIENT_ID`가 비어 있으면 Naver SDK가 로드되지 않아야 합니다.
- Network 탭에서 지도 타일 요청에 IPstack key가 포함되지 않는지 확인합니다.

## 검증 카페 노출

- Firestore에 `approved: true`와 `naverVerified: true`가 모두 있는 카페만 목록/지도/추천에 표시되는지 확인합니다.
- 미검증 카페는 목록, 추천, 마커에 표시되지 않아야 합니다.

## 네이버 지도 연결

- 카페 카드 또는 상세 패널의 네이버 길찾기 버튼을 누릅니다.
- 네이버 지도 검색란에 주소가 붙지 않고 카페명 또는 `naverPlaceName`만 들어가는지 확인합니다.

## 마커 디자인

- 카페 위치 마커가 Google Material Symbols `coffee_maker` 스타일 아이콘으로 표시되는지 확인합니다.
- 현재 위치 마커가 Google Material Symbols `local_cafe` 스타일 아이콘으로 표시되는지 확인합니다.

## 관리자 모드

- 관리자 계정으로 로그인했을 때 관리자 탭이 보이는지 확인합니다.
- 관리자 화면이 일반 사용자 화면과 다르게 라인/그리드 대시보드 스타일로 표시되는지 확인합니다.
- 카페 등록 시 `네이버 지도 실존 검증 완료`와 `사용자 화면 공개 승인` 체크가 필수인지 확인합니다.
- 위도/경도에 숫자가 아닌 값을 입력하면 저장이 차단되는지 확인합니다.
- 메뉴 JSON 형식이 잘못되면 저장이 차단되는지 확인합니다.
- 두 체크가 모두 적용된 카페만 공개 화면에 반영되는지 확인합니다.

## 디자인

- 일반 사용자 화면은 미니멀한 웜톤/파스텔톤/모던/세련된 느낌인지 확인합니다.
- 관리자 화면은 얇은 선 그리드, 라인 아이콘, 검증 단계 인포그래픽이 보이는지 확인합니다.
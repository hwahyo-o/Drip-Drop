# Map API Security Policy

Drip Drop의 기본 지도는 Leaflet + OpenStreetMap 데이터 기반 타일입니다. 현재 배포 버전은 NaverStyleMapTypeOption과 가장 흡사한 밝은 도로 지도 느낌을 위해 key가 필요 없는 CARTO Voyager raster tile을 사용합니다.

중요: IPstack은 지도 타일 API가 아니라 IP 기반 위치 조회 서비스입니다. OpenStreetMap 타일을 불러오기 위해 IPstack key를 브라우저에 넣으면 안 됩니다.

## Current Decision

- 기본 지도: Leaflet + OpenStreetMap 데이터 기반 CARTO Voyager raster tile
- 현재 위치: Browser Geolocation API의 high accuracy 모드와 다중 샘플링
- 지하철역 표시: OpenStreetMap Overpass API 기반 보조 레이어
- Naver 지도 스타일: 기본 비활성화
- IPstack: 현재 클라이언트 앱에서 사용하지 않음
- 지도 타일 API key: 사용하지 않음

## Leaflet Tile Style

현재 Leaflet 지도는 아래 공개 타일을 사용합니다.

```text
https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png
```

이 타일은 부드러운 색감, 명확한 도로 표현, 낮은 시각적 밀도 때문에 NaverStyleMapTypeOption의 일반 도로 지도에 더 가까운 경험을 제공합니다. API key가 필요하지 않으므로 GitHub Pages 정적 배포에 적합합니다.

## 지도 최신성

CARTO Voyager는 OpenStreetMap 데이터를 기반으로 합니다. 따라서 네이버 지도처럼 자체 수집 데이터가 실시간에 가깝게 반영되는 구조는 아닙니다. 최신성은 OpenStreetMap 편집 데이터와 CARTO 타일 갱신 주기에 따라 달라집니다.

운영 기준:

- 카페 위치와 주소는 관리자 검증 데이터가 우선입니다.
- 도로/건물/지하철역 배경 정보는 OpenStreetMap 데이터 갱신 상태를 따릅니다.
- 네이버 지도와 동일한 최신성을 반드시 요구하는 화면은 네이버 지도 링크 또는 별도 Naver Maps SDK 사용 검토가 필요합니다.
- 단, Naver Maps SDK의 브라우저 client id는 공개 식별자이므로 "키 절대 비노출" 정책과 충돌할 수 있습니다.

## 지하철역 표시

지하철역은 지도 확대 레벨 13 이상에서 현재 보이는 영역을 기준으로 Overpass API에서 아래 데이터를 조회해 표시합니다.

```text
railway=station + station=subway
railway=subway_entrance
```

이 레이어도 API key가 필요하지 않습니다. 공용 Overpass API가 일시적으로 느리거나 제한되면 지하철역 레이어만 표시되지 않을 수 있고, 기본 지도와 카페 마커는 계속 동작해야 합니다.

## 현재 위치 정확도

현재 위치는 브라우저 Geolocation API에서 가져옵니다. 앱은 단일 좌표를 바로 쓰지 않고 짧은 시간 동안 여러 측정값을 받아 정확도 값이 가장 낮은 좌표를 선택합니다. 지도에는 현재 위치 마커와 정확도 반경을 함께 표시합니다.

위치가 계속 어긋나는 경우는 브라우저/운영체제 위치 권한, Wi-Fi 위치 데이터, VPN, 데스크톱 유선 네트워크의 IP 기반 추정 한계 때문일 수 있습니다. 웹앱은 사용자가 허용한 브라우저 위치값보다 더 정확한 실제 좌표를 임의로 알 수 없습니다.

## Naver Maps JavaScript SDK

Naver Maps JavaScript SDK의 `ncpKeyId`는 브라우저에서 로드되는 공개 식별자입니다. 도메인 제한을 적용해도 최종 HTML/JS 네트워크 요청에서는 보일 수 있습니다.

따라서 Drip Drop에서 "배포 화면에 지도 관련 키가 절대 노출되면 안 된다"는 정책을 우선하면 `js/mapConfig.js`의 `NAVER_MAP_CLIENT_ID`는 비워 두고 Leaflet + OpenStreetMap 데이터 기반 타일만 사용합니다.

Naver 지도가 꼭 필요해질 경우에는 아래 조건을 모두 만족해야 합니다.

- Naver Cloud Platform에서 허용 도메인을 `https://hwahyo-o.github.io`로 제한
- GitHub Actions secrets에서 배포 시점에만 값 주입
- 공개 클라이언트 식별자라는 점을 운영 문서에 명확히 기록
- Secret scanning 경고가 생기지 않도록 키 종류와 노출 가능 범위를 사전 확인

## IPstack Key

IPstack access key는 브라우저 JS, GitHub 저장소, GitHub Pages 배포 산출물에 넣지 않습니다. IP 기반 위치 조회가 나중에 필요하면 정적 GitHub Pages만으로 처리하지 않고 서버리스 함수 또는 백엔드 프록시를 둡니다.

프록시 요구사항:

- 키는 서버 환경 변수나 secret manager에만 저장
- 브라우저 응답에 원본 key를 절대 포함하지 않음
- origin 체크와 rate limit 적용
- 필요한 최소 필드만 반환
- 실패 시 Browser Geolocation 또는 수동 위치 검색으로 대체

## Firebase Web Config와 Google 로그인

Firebase Authentication의 Google 로그인은 브라우저에서 Firebase Web config를 사용합니다. 따라서 Google 로그인을 활성화하려면 배포된 `js/firebaseConfig.js`에 Firebase Web config가 주입되어야 합니다.

보안 기준:

- Firebase config 값은 GitHub 저장소 코드에 직접 커밋하지 않음
- GitHub Actions repository secrets로만 주입
- Firebase API key는 Google Cloud Console에서 HTTP referrer를 `https://hwahyo-o.github.io/*`로 제한
- Firestore Rules로 실제 데이터 접근 권한을 차단

## Deployment QA

배포 후 아래 문자열이 공개 저장소 코드와 지도 관련 파일에서 검색되지 않아야 합니다.

```text
807e645c14a67c1a626e4955af39262b
```

Google 로그인용 Firebase Web API key는 GitHub 저장소에 커밋하지 않습니다. 다만 Firebase 클라이언트 인증을 쓰는 정적 웹앱 특성상, secrets가 정상 주입된 Pages 배포 산출물의 `js/firebaseConfig.js`에서는 제한된 Firebase Web API key가 보일 수 있습니다. 이 값은 Google Cloud HTTP referrer 제한과 Firebase/Firestore Rules로 보호합니다.

확인 대상:

- `https://hwahyo-o.github.io/Drip-Drop/`
- `https://hwahyo-o.github.io/Drip-Drop/js/*.js`
- GitHub repository code search
- GitHub Security and quality > Secret scanning alerts
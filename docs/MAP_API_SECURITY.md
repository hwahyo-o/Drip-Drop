# Map API Security Policy

Drip Drop의 기본 지도는 Leaflet + OpenStreetMap 타일입니다. 이 조합은 브라우저에 API key를 넣지 않아도 동작하므로 GitHub Pages 정적 배포에 가장 안전한 기본값입니다.

## Current Decision

- 기본 지도: Leaflet + OpenStreetMap
- 현재 위치: Browser Geolocation API
- Naver 지도 스타일: 기본 비활성화
- IPstack: 현재 클라이언트 앱에서 사용하지 않음

## Naver Maps JavaScript SDK

Naver Maps JavaScript SDK의 `ncpKeyId`는 브라우저에서 로드되는 공개 식별자입니다. 도메인 제한을 적용해도 최종 HTML/JS 네트워크 요청에서는 보일 수 있습니다.

따라서 Drip Drop에서 "배포 화면에 지도 관련 키가 절대 노출되면 안 된다"는 정책을 우선하면 `js/mapConfig.js`의 `NAVER_MAP_CLIENT_ID`는 비워 두고 Leaflet + OpenStreetMap만 사용합니다.

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

## Deployment QA

배포 후 아래 문자열이 공개 파일에서 검색되지 않아야 합니다.

```text
AIza
807e645c14a67c1a626e4955af39262b
```

확인 대상:

- `https://hwahyo-o.github.io/Drip-Drop/`
- `https://hwahyo-o.github.io/Drip-Drop/js/*.js`
- GitHub repository code search
- GitHub Security and quality > Secret scanning alerts
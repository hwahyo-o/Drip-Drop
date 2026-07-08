# Admin Guide

관리자 페이지는 로스터리 카페 데이터를 직접 등록하고 검수하기 위한 화면입니다.

## 관리자 권한 조건

관리자 탭은 로그인한 사용자의 Firestore 문서가 아래 조건일 때 표시됩니다.

```json
{
  "role": "admin"
}
```

Firebase Console의 IAM 소유자 역할은 브라우저에서 직접 읽을 수 없습니다. 따라서 Firebase 소유자 계정을 Drip Drop 관리자처럼 쓰려면 아래 둘 중 하나로 연결해야 합니다.

1. `js/adminConfig.js`의 `FIREBASE_OWNER_EMAILS`에 소유자 Google 계정 이메일을 추가합니다.
2. `firestore.rules`의 `bootstrapAdminEmails()` 배열에도 같은 이메일을 추가한 뒤 Rules를 배포합니다.

예시:

```js
export const FIREBASE_OWNER_EMAILS = ["owner@example.com"];
```

```js
function bootstrapAdminEmails() {
  return ["owner@example.com"];
}
```

이미 로그인한 계정이라면 Firebase Console > Firestore Database > `users/{uid}` 문서에서 `role` 값을 `admin`으로 직접 설정해도 됩니다. UI에서 탭을 숨기는 것과 별개로, 실제 데이터 수정 권한은 `firestore.rules`에서 다시 차단합니다.

## Google 로그인 체크리스트

- Firebase Console > Authentication > Sign-in method에서 Google 제공업체를 활성화합니다.
- Firebase Console > Authentication > Settings > Authorized domains에 배포 도메인을 추가합니다.
  - 예: `hwahyo-o.github.io`
- GitHub repository secrets에 `docs/FIREBASE_SETUP.md`의 Firebase 배포 secrets를 등록합니다.
- 팝업 로그인이 막히는 브라우저에서는 앱이 자동으로 리다이렉트 로그인으로 전환합니다.

## 지도 설정

기본 지도는 Leaflet + OpenStreetMap입니다. 이 구성은 브라우저에 지도 API key를 배포하지 않아도 동작하므로 GitHub Pages 정적 배포에 가장 적합합니다.

Naver Maps JavaScript SDK를 사용하려면 `js/mapConfig.js`의 `NAVER_MAP_CLIENT_ID`에 `ncpKeyId`를 넣을 수 있지만, 이 값은 브라우저에서 보이는 공개 클라이언트 식별자입니다. "지도 관련 키가 배포 화면에 절대 노출되면 안 된다"는 정책을 우선하면 비워 두어야 합니다.

IPstack key는 관리자 페이지나 브라우저 JS에 입력하지 않습니다. IP 기반 위치 조회가 필요해지면 백엔드 또는 서버리스 프록시에서만 사용합니다.

## 카페 등록 기준

등록 대상은 아래 중 하나 이상을 만족해야 합니다.

- 로스팅 원두 구매 가능
- 필터 커피 제공
- 브루잉 커피 제공
- 드립 커피 제공

## 필수 입력 정보

- 카페명
- 네이버 지도 검색명
- 주소
- 위도/경도
- 운영시간 설명
- 메뉴와 가격
- 편의시설
- 원두 판매 여부
- 브루잉/필터/드립 제공 여부

## 좌표 입력 정책

- 네이버 지도에서 검수한 좌표를 원본 그대로 기록합니다.
- 원본 좌표 문자열은 `latText`, `lngText`로 보존합니다.
- 지도 표시는 `lat`, `lng` 값을 숫자로 변환해 사용합니다.
- 소수점 20자리 동일성은 자동 보장하지 않고, 운영자 검수 기준으로 관리합니다.

## 태그 예시

```text
필터, 브루잉, 드립, 원두판매, 산미, 고소함, 꽃향, 묵직함
```

## 편의시설 값

```text
wifi, parking, outlet, pet, takeout
```

## 메뉴 JSON 예시

```json
[
  { "name": "필터 커피", "price": "7,000원" },
  { "name": "원두 200g", "price": "18,000원" }
]
```
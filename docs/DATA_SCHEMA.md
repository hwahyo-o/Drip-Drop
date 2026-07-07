# Data Schema

Firestore 데이터는 운영자가 검수한 로스터리 카페 정보와 사용자 활동 데이터를 중심으로 구성합니다.

## cafes/{cafeId}

```json
{
  "name": "카페명",
  "naverPlaceName": "네이버 지도 검색명",
  "address": "주소",
  "lat": "37.000000",
  "lng": "127.000000",
  "latText": "원본 위도 문자열",
  "lngText": "원본 경도 문자열",
  "rating": 4.5,
  "hoursText": "매일 10:00-21:00",
  "facilities": ["wifi", "parking"],
  "beanSales": true,
  "brewMethods": ["filter", "drip"],
  "tags": ["필터", "원두판매", "산미"],
  "menus": [
    { "name": "필터 커피", "price": "7,000원" }
  ],
  "beans": [
    { "name": "Ethiopia Natural", "notes": "베리 꽃향 산미" }
  ],
  "approved": true,
  "naverVerified": true,
  "verificationSource": "naver-map-admin-check"
}
```

## users/{uid}

```json
{
  "displayName": "사용자명",
  "email": "user@example.com",
  "photoURL": "프로필 이미지",
  "role": "user",
  "tasteProfile": {
    "taste": "꽃향, 베리",
    "ownedBeans": "에티오피아 내추럴",
    "wantedBeans": "파나마 게이샤"
  }
}
```

## favorites/{uid_cafeId}

```json
{
  "uid": "사용자 uid",
  "cafeId": "카페 id",
  "createdAt": "serverTimestamp"
}
```

## reviews/{reviewId}

```json
{
  "uid": "사용자 uid",
  "cafeId": "카페 id",
  "rating": 5,
  "body": "리뷰 내용",
  "visitType": "visit",
  "createdAt": "serverTimestamp",
  "updatedAt": "serverTimestamp"
}
```

## 운영 원칙

- 네이버 지도 기준 좌표는 `latText`, `lngText`에 원본 문자열로 보존합니다.
- 공개 노출은 `approved: true`와 `naverVerified: true`가 모두 충족된 카페만 허용합니다.
- 네이버 길찾기 검색어는 주소를 붙이지 않고 카페명 또는 `naverPlaceName`만 사용합니다.
- 메뉴, 운영시간, 편의시설은 관리자 검수 후 저장합니다.
- 자동 수집 데이터는 사용하지 않고, 관리자 수동 등록을 기본값으로 합니다.

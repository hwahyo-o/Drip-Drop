# Firebase Setup

Drip Drop은 Firebase Authentication과 Firestore를 사용합니다. 아래 순서대로 설정하면 GitHub Pages 배포 후 Google 로그인과 데이터 저장 기능을 확인할 수 있습니다.

## 1. Authentication

1. Firebase Console에서 `dd-project-34af3` 프로젝트를 엽니다.
2. Authentication > Sign-in method로 이동합니다.
3. Google 제공업체를 활성화합니다.
4. Authentication > Settings > Authorized domains에 배포 도메인을 추가합니다.
   - 로컬 테스트: `localhost`
   - GitHub Pages: `hwahyo-o.github.io`

## 2. GitHub Actions Secrets

배포된 `js/firebaseConfig.js`는 GitHub Actions secrets에서 생성됩니다. 아래 값이 Repository secrets에 없으면 사이트는 공개 지도 UI만 실행하고, Google 로그인/찜/관리자/Firestore 저장 기능은 비활성화됩니다.

필수 secrets:

```text
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
```

배포 후 `https://hwahyo-o.github.io/Drip-Drop/js/firebaseConfig.js`에서 `apiKey: ""`처럼 비어 있으면 아직 secrets가 주입되지 않은 상태입니다.

## 3. Firestore

1. Firestore Database를 생성합니다.
2. 위치는 프로젝트 운영 지역에 맞게 선택합니다.
3. Rules 탭에 `firestore.rules` 내용을 적용합니다.
4. 공개 카페 데이터는 `cafes` 컬렉션에 저장합니다. 사용자 화면에는 `approved: true`와 `naverVerified: true`가 모두 설정된 카페만 표시됩니다.

## 4. 관리자 계정 부여

처음 Google 로그인한 계정은 기본적으로 `role: "user"`로 생성됩니다. 관리자 페이지를 사용하려면 Firestore에서 해당 사용자 문서를 수정해야 합니다.

1. 웹앱에서 Google 로그인합니다.
2. Firestore > `users/{uid}` 문서를 찾습니다.
3. `role` 값을 `"admin"`으로 변경합니다.
4. 웹앱을 새로고침하면 관리자 탭이 표시됩니다.

Firebase Console의 IAM 소유자 역할은 브라우저 앱에서 직접 조회할 수 없습니다. 소유자 계정을 자동 관리자처럼 쓰려면 `docs/ADMIN_GUIDE.md`의 bootstrap admin 설정도 함께 반영해야 합니다.

## 5. 배포 후 확인 항목

- 지도가 표시되는지 확인합니다.
- Google 로그인 팝업 또는 리다이렉트가 시작되는지 확인합니다.
- 로그인 후 취향 프로필 저장이 가능한지 확인합니다.
- 관리자 계정에서 관리자 탭이 표시되는지 확인합니다.
- 관리자 페이지에서 네이버 지도 실존 검증 완료와 공개 승인을 체크한 카페만 지도와 리스트에 반영되는지 확인합니다.
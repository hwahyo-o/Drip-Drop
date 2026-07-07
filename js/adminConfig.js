export const FIREBASE_OWNER_EMAILS = [
  // Firebase Console에서 소유자 역할로 등록한 Google 계정 이메일을 여기에 추가하세요.
  // 예: "owner@example.com"
];

export function isConfiguredAdminEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  return FIREBASE_OWNER_EMAILS.some((item) => String(item || "").trim().toLowerCase() === normalized);
}

export function getInitialRoleForEmail(email) {
  return isConfiguredAdminEmail(email) ? "admin" : "user";
}

import { getInitialRoleForEmail, isConfiguredAdminEmail } from "./adminConfig.js";
import {
  auth,
  db,
  doc,
  getDoc,
  getRedirectResult,
  googleProvider,
  isFirebaseReady,
  onAuthStateChanged,
  requireFirebase,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "./firebase.js";

let currentUser = null;
let currentProfile = null;
let redirectHandled = false;

export function watchAuth(onChange) {
  if (!isFirebaseReady()) {
    currentUser = null;
    currentProfile = null;
    onChange(currentUser, currentProfile);
    return () => {};
  }

  consumeRedirectResult();
  return onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    currentProfile = user ? await ensureUserProfile(user) : null;
    onChange(currentUser, currentProfile);
  });
}

export async function loginWithGoogle() {
  requireFirebase();
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (shouldUseRedirectFallback(error)) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    throw error;
  }
}

export async function logout() {
  requireFirebase();
  await signOut(auth);
}

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentProfile() {
  return currentProfile;
}

export function getAuthErrorMessage(error) {
  const code = error?.code || "";
  if (code === "firebase/not-configured") {
    return "Firebase 설정이 배포에 주입되지 않아 Google 로그인을 시작할 수 없습니다. GitHub Actions secrets 등록과 Pages 재배포 상태를 확인해 주세요.";
  }
  if (code === "auth/unauthorized-domain") {
    return "Firebase Authentication 승인 도메인에 현재 배포 도메인이 등록되어 있지 않습니다. Firebase Console > Authentication > Settings > Authorized domains에 GitHub Pages 도메인을 추가해 주세요.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google 로그인 창이 닫혀 로그인이 완료되지 않았습니다. 다시 시도해 주세요.";
  }
  if (code === "auth/network-request-failed") {
    return "네트워크 문제로 Google 로그인을 완료하지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.";
  }
  if (code === "permission-denied") {
    return "로그인은 되었지만 Firestore 프로필 권한 확인에 실패했습니다. Firestore Rules와 관리자 설정을 확인해 주세요.";
  }
  return error?.message || "Google 로그인을 완료하지 못했습니다.";
}

export async function saveUserTasteProfile(values) {
  requireFirebase();
  if (!currentUser) throw new Error("로그인이 필요합니다.");
  const payload = {
    tasteProfile: values,
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "users", currentUser.uid), payload, { merge: true });
  currentProfile = { ...currentProfile, ...payload };
  return currentProfile;
}

async function consumeRedirectResult() {
  if (redirectHandled || !isFirebaseReady()) return;
  redirectHandled = true;
  try {
    await getRedirectResult(auth);
  } catch (error) {
    console.warn(getAuthErrorMessage(error));
  }
}

function shouldUseRedirectFallback(error) {
  return [
    "auth/popup-blocked",
    "auth/cancelled-popup-request",
    "auth/operation-not-supported-in-this-environment"
  ].includes(error?.code);
}

async function ensureUserProfile(user) {
  requireFirebase();
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);
  const configuredRole = getInitialRoleForEmail(user.email);

  if (snapshot.exists()) {
    const profile = { uid: user.uid, ...snapshot.data() };
    if (profile.role !== "admin" && configuredRole === "admin") {
      return elevateConfiguredAdmin(ref, profile, user);
    }
    return profile;
  }

  const profile = {
    uid: user.uid,
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    role: configuredRole,
    tasteProfile: {
      taste: "",
      ownedBeans: "",
      wantedBeans: ""
    },
    createdAt: serverTimestamp()
  };
  await setDoc(ref, profile, { merge: true });
  return profile;
}

async function elevateConfiguredAdmin(ref, profile, user) {
  if (!isConfiguredAdminEmail(user.email)) return profile;
  const nextProfile = {
    ...profile,
    role: "admin",
    displayName: user.displayName || profile.displayName || "",
    email: user.email || profile.email || "",
    photoURL: user.photoURL || profile.photoURL || "",
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, nextProfile, { merge: true });
  return nextProfile;
}

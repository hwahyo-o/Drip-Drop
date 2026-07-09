import { getInitialRoleForEmail, isConfiguredAdminEmail } from "./adminConfig.js";
import {
  auth,
  createUserWithEmailAndPassword,
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
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "./firebase.js";

let currentUser = null;
let currentProfile = null;
let redirectHandled = false;

export async function watchAuth(onChange) {
  if (!isFirebaseReady()) {
    currentUser = null;
    currentProfile = null;
    onChange(currentUser, currentProfile);
    return () => {};
  }

  await consumeRedirectResult();
  return onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    currentProfile = user ? await loadProfileSafely(user) : null;
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

export async function loginWithEmail(email, password) {
  requireFirebase();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email, password) {
  requireFirebase();
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginAsGuest() {
  requireFirebase();
  await signInAnonymously(auth);
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
    return "Firebase 설정이 배포에 주입되지 않아 로그인을 시작할 수 없습니다. GitHub Pages 배포 소스와 Actions secrets를 확인해 주세요.";
  }
  if (code === "auth/unauthorized-domain") {
    return "Firebase Authentication 승인 도메인에 현재 배포 도메인이 등록되어 있지 않습니다. Firebase Console > Authentication > Settings > Authorized domains에 GitHub Pages 도메인을 추가해 주세요.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google 로그인 창이 닫혀 로그인이 완료되지 않았습니다. 다시 시도해 주세요.";
  }
  if (code === "auth/network-request-failed") {
    return "네트워크 문제로 로그인을 완료하지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.";
  }
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return "아이디 또는 비밀번호가 올바르지 않습니다.";
  }
  if (code === "auth/email-already-in-use") {
    return "이미 가입된 이메일입니다. 로그인으로 진행해 주세요.";
  }
  if (code === "auth/weak-password") {
    return "비밀번호는 6자 이상으로 입력해 주세요.";
  }
  if (code === "permission-denied") {
    return "로그인은 되었지만 Firestore 프로필 권한 확인에 실패했습니다. 기본 계정 상태로 계속 진행합니다.";
  }
  return error?.message || "로그인을 완료하지 못했습니다.";
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

async function loadProfileSafely(user) {
  try {
    return await ensureUserProfile(user);
  } catch (error) {
    console.warn(getAuthErrorMessage(error));
    return buildLocalProfile(user);
  }
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

  const profile = buildLocalProfile(user, configuredRole);
  await setDoc(ref, profile, { merge: true });
  return profile;
}

function buildLocalProfile(user, role = getInitialRoleForEmail(user.email)) {
  return {
    uid: user.uid,
    displayName: user.displayName || (user.isAnonymous ? "게스트" : ""),
    email: user.email || "",
    photoURL: user.photoURL || "",
    role,
    isAnonymous: Boolean(user.isAnonymous),
    tasteProfile: {
      taste: "",
      ownedBeans: "",
      wantedBeans: ""
    },
    createdAt: serverTimestamp()
  };
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
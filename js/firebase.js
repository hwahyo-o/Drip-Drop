import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firebaseConfig, hasFirebaseConfig } from "./firebaseConfig.js";

export const firebaseReady = hasFirebaseConfig();
export const app = firebaseReady ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = firebaseReady ? new GoogleAuthProvider() : null;
if (googleProvider) googleProvider.setCustomParameters({ prompt: "select_account" });

if (app) {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
} else {
  console.warn("Firebase 설정이 비어 있어 로그인, 찜, 관리자 기능은 비활성화됩니다. 지도와 검색 UI는 계속 사용할 수 있습니다.");
}

export function isFirebaseReady() {
  return firebaseReady;
}

export function requireFirebase() {
  if (!firebaseReady || !auth || !db) {
    const error = new Error("Firebase 설정이 비어 있습니다. GitHub Actions secrets 또는 배포 설정을 확인하세요.");
    error.code = "firebase/not-configured";
    throw error;
  }
}

export { firebaseConfig };

export {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getRedirectResult,
  limit,
  onAuthStateChanged,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateDoc,
  where
};

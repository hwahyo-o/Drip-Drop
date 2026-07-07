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

if (!hasFirebaseConfig()) {
  throw new Error("Firebase 설정이 비어 있습니다. GitHub Actions secrets 또는 로컬 js/firebaseConfig.js 설정을 확인하세요.");
}

export { firebaseConfig };
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

isAnalyticsSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

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

import { collection, db, deleteDoc, doc, getDocs, isFirebaseReady, query, serverTimestamp, setDoc, where } from "./firebase.js";

export async function loadFavorites(uid) {
  if (!uid || !isFirebaseReady()) return [];
  const snapshot = await getDocs(query(collection(db, "favorites"), where("uid", "==", uid)));
  return snapshot.docs.map((item) => item.data());
}

export async function toggleFavorite(uid, cafeId, active) {
  if (!uid) throw new Error("로그인이 필요합니다.");
  if (!isFirebaseReady()) throw new Error("Firebase 설정이 필요합니다.");
  const id = `${uid}_${cafeId}`;
  const ref = doc(db, "favorites", id);
  if (active) {
    await deleteDoc(ref);
    return false;
  }
  await setDoc(ref, { uid, cafeId, createdAt: serverTimestamp() });
  return true;
}

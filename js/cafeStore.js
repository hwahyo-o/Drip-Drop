import { collection, db, doc, getDocs, isFirebaseReady, query, serverTimestamp, setDoc, where } from "./firebase.js";

let cachedCafes = [];

export async function loadCafes() {
  if (!isFirebaseReady()) {
    console.warn("Firebase 설정이 비어 있어 검증 카페 데이터를 불러오지 못했습니다.");
    cachedCafes = await loadSeedCafes();
    return cachedCafes;
  }

  try {
    const verifiedCafeQuery = query(
      collection(db, "cafes"),
      where("approved", "==", true),
      where("naverVerified", "==", true)
    );
    const snapshot = await getDocs(verifiedCafeQuery);
    cachedCafes = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .filter(isPublicVerifiedCafe);
  } catch (error) {
    console.warn("Firestore verified cafe data is unavailable. No unverified seed data will be shown.", error);
    cachedCafes = await loadSeedCafes();
  }

  return cachedCafes;
}

export function getCachedCafes() {
  return cachedCafes;
}

export async function loadSeedCafes() {
  return [];
}

export async function saveCafeFromAdmin(cafe) {
  if (!isFirebaseReady()) throw new Error("Firebase 설정이 필요합니다.");
  const id = cafe.id || crypto.randomUUID();
  const payload = {
    ...cafe,
    id,
    updatedAt: serverTimestamp(),
    approved: Boolean(cafe.approved),
    naverVerified: Boolean(cafe.naverVerified),
    verificationSource: cafe.naverVerified ? "naver-map-admin-check" : "pending"
  };
  await setDoc(doc(db, "cafes", id), payload, { merge: true });
  return payload;
}

export function isPublicVerifiedCafe(cafe) {
  return cafe?.approved === true && cafe?.naverVerified === true;
}

export function buildNaverMapUrl(cafe) {
  const queryText = encodeURIComponent(cafe.naverPlaceName || cafe.name || "");
  return `https://map.naver.com/p/search/${queryText}`;
}

export function isCafeOpenNow(cafe, date = new Date()) {
  if (typeof cafe.openNow === "boolean") return cafe.openNow;
  const day = date.getDay();
  const rule = cafe.hoursRules?.find((item) => item.days.includes(day));
  if (!rule || rule.closed) return false;

  const minutes = date.getHours() * 60 + date.getMinutes();
  const [openHour, openMinute] = rule.open.split(":").map(Number);
  const [closeHour, closeMinute] = rule.close.split(":").map(Number);
  const open = openHour * 60 + openMinute;
  const close = closeHour * 60 + closeMinute;
  return close > open ? minutes >= open && minutes <= close : minutes >= open || minutes <= close;
}

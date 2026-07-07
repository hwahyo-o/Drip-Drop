import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAnalytics, isSupported as isAnalyticsSupported } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

export const firebaseConfig = { apiKey: "AIzaSyD_lTqxOS064xV-8eUX5Rr1ldllA4HDbMQ", authDomain: "dd-project-34af3.firebaseapp.com", projectId: "dd-project-34af3", storageBucket: "dd-project-34af3.firebasestorage.app", messagingSenderId: "16253235956", appId: "1:16253235956:web:f46564b2909240bd4f64a1", measurementId: "G-54JD6XLL4P" };
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
isAnalyticsSupported().then((supported) => { if (supported) getAnalytics(app); });
export { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onAuthStateChanged, onSnapshot, orderBy, query, serverTimestamp, setDoc, signInWithPopup, signOut, updateDoc, where };

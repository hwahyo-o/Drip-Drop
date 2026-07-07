import { addDoc, collection, db, getDocs, query, serverTimestamp, where } from "./firebase.js";
export async function loadCafeReviews(cafeId){const snapshot=await getDocs(query(collection(db,"reviews"),where("cafeId","==",cafeId)));return snapshot.docs.map((item)=>({id:item.id,...item.data()}));}
export async function createReview(uid,cafeId,values){if(!uid)throw new Error("로그인이 필요합니다.");return addDoc(collection(db,"reviews"),{uid,cafeId,rating:Number(values.rating||5),body:values.body||"",visitType:values.visitType||"visit",createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}

import { addDoc, collection, db, getDocs, limit, orderBy, query, serverTimestamp } from "./firebase.js";
export async function loadPosts(){const snapshot=await getDocs(query(collection(db,"posts"),orderBy("createdAt","desc"),limit(20)));return snapshot.docs.map((item)=>({id:item.id,...item.data()}));}
export async function createPost(uid,values){if(!uid)throw new Error("로그인이 필요합니다.");return addDoc(collection(db,"posts"),{uid,title:values.title,body:values.body,likeCount:0,shareCount:0,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}

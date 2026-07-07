import { collection, db, getDocs, query, where } from "./firebase.js";
export async function loadNotifications(uid){if(!uid)return [];const snapshot=await getDocs(query(collection(db,"notifications"),where("receiverUid","==",uid)));return snapshot.docs.map((item)=>({id:item.id,...item.data()}));}

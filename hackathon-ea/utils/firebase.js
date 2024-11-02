import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGAJ3d76htv_0tRcbDbR4uqD7nkTadebM",
  authDomain: "hackaton-ea.firebaseapp.com",
  projectId: "hackaton-ea",
  storageBucket: "hackaton-ea.firebasestorage.app",
  messagingSenderId: "257760940755",
  appId: "1:257760940755:web:b767ec30d74d82ddba3a26",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

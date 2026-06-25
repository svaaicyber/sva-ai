// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5j-wh_-mmtoGTT--v6YCpsMFON6Au0_w",
  authDomain: "sva-ai-8244b.firebaseapp.com",
  projectId: "sva-ai-8244b",
  storageBucket: "sva-ai-8244b.firebasestorage.app",
  messagingSenderId: "771763808774",
  appId: "1:771763808774:web:721091e804bc425cd0b187",
  measurementId: "G-28QWRSCF6K"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
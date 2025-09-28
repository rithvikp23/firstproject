// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBX7IVy6ZvS2gQXbPNbjUKt_clG0upODtg",
  authDomain: "firstproject-4c54e.firebaseapp.com",
  projectId: "firstproject-4c54e",
  storageBucket: "firstproject-4c54e.firebasestorage.app",
  messagingSenderId: "149410899801",
  appId: "1:149410899801:web:babe28951c9d00f54c4e48",
  measurementId: "G-HJXV1W25N2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
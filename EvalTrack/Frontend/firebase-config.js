// Firebase Configuration for EvalTrack
// This file initializes Firebase with your project credentials

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA90M1tOW7qIjy3-odQaSyR4a6xcTlPObU",
  authDomain: "evaltrack-system.firebaseapp.com",
  projectId: "evaltrack-system",
  storageBucket: "evaltrack-system.firebasestorage.app",
  messagingSenderId: "407757043757",
  appId: "1:407757043757:web:e8aef13e040c2777ba20a4",
  measurementId: "G-MC0SLTSPLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services for use in other modules
export {
  app,
  analytics,
  auth,
  db,
  storage,
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  // Firestore functions
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL
};

console.log('Firebase initialized for EvalTrack');

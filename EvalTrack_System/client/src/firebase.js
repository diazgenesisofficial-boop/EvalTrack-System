// Firebase Configuration for EvalTrack System Client (React/Vite)
// This file initializes Firebase with your project credentials

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  getFirestore, 
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
  onSnapshot,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  uploadBytesResumable
} from "firebase/storage";

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

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Helper for Google Sign In (used by AuthContext)
export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// Firebase helper functions
const firebaseService = {
  // Auth functions
  login: (email, password) => signInWithEmailAndPassword(auth, email, password),
  register: (email, password) => createUserWithEmailAndPassword(auth, email, password),
  logout: () => signOut(auth),
  onAuthChange: (callback) => onAuthStateChanged(auth, callback),
  loginWithGoogle: () => signInWithPopup(auth, googleProvider),
  resetPassword: (email) => sendPasswordResetEmail(auth, email),
  
  // Firestore functions
  getDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },
  
  getCollection: async (collectionName, constraints = []) => {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
  
  setDocument: async (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return docId;
  },
  
  addDocument: async (collectionName, data) => {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },
  
  updateDocument: async (collectionName, docId, data) => {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },
  
  deleteDocument: async (collectionName, docId) => {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  },
  
  // Real-time listener
  onDocumentChange: (collectionName, docId, callback) => {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  },
  
  // Storage functions
  uploadFile: async (file, path) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress:', progress + '%');
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },
  
  getFileURL: async (path) => {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }
};

// Export Firebase services
export {
  app,
  analytics,
  auth,
  db,
  storage,
  firebaseService,
  // Individual exports for flexibility
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
  onSnapshot,
  addDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};

console.log('Firebase initialized for EvalTrack System Client');

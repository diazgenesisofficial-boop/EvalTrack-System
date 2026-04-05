// Firebase Admin SDK Configuration for EvalTrack Backend
// This file initializes Firebase Admin for server-side operations

let admin = null;
let firebaseInitialized = false;
let auth = null;
let firestore = null;
let storage = null;
let firebaseAdmin = {};

try {
  // Try to load Firebase Admin module
  admin = require('firebase-admin');
  
  // Firebase service account configuration
  // NOTE: You need to download your service account key from Firebase Console
  // Project Settings > Service Accounts > Generate New Private Key
  // Save it as firebase-service-account.json in this directory
  
  try {
    // Try to load service account key
    const serviceAccount = require('./firebase-service-account.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.firebasestorage.app`
    });
    
    firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
    
    // Get Firebase services
    auth = admin.auth();
    firestore = admin.firestore();
    storage = admin.storage();
    
  } catch (error) {
    console.log('Firebase Admin SDK not initialized:', error.message);
    console.log('To enable Firebase Admin, download your service account key from:');
    console.log('Firebase Console > Project Settings > Service Accounts > Generate New Private Key');
    console.log('Save it as firebase-service-account.json in the server directory');
  }
  
  // Firebase Admin helper functions
  firebaseAdmin = {
    isInitialized: () => firebaseInitialized,
    
    // Verify Firebase ID token from frontend
    verifyToken: async (idToken) => {
      if (!firebaseInitialized || !auth) {
        throw new Error('Firebase Admin not initialized');
      }
      try {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken;
      } catch (error) {
        console.error('Token verification failed:', error);
        throw error;
      }
    },
    
    // Get user by UID
    getUser: async (uid) => {
      if (!firebaseInitialized || !auth) return null;
      try {
        const userRecord = await auth.getUser(uid);
        return userRecord;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    },
    
    // Create or update user in Firestore
    syncUserToFirestore: async (userId, userData) => {
      if (!firebaseInitialized || !firestore) return false;
      try {
        const userRef = firestore.collection('users').doc(userId);
        await userRef.set({
          ...userData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
      } catch (error) {
        console.error('Error syncing user to Firestore:', error);
        return false;
      }
    },
    
    // Get document from Firestore
    getDocument: async (collection, docId) => {
      if (!firebaseInitialized || !firestore) return null;
      try {
        const docRef = firestore.collection(collection).doc(docId);
        const docSnap = await docRef.get();
        return docSnap.exists ? docSnap.data() : null;
      } catch (error) {
        console.error('Error fetching document:', error);
        return null;
      }
    },
    
    // Query Firestore collection
    queryCollection: async (collection, conditions = [], limitCount = 100) => {
      if (!firebaseInitialized || !firestore) return [];
      try {
        let query = firestore.collection(collection);
        
        conditions.forEach(condition => {
          const { field, operator, value } = condition;
          query = query.where(field, operator, value);
        });
        
        query = query.limit(limitCount);
        const snapshot = await query.get();
        
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error querying collection:', error);
        return [];
      }
    },
    
    // Save data to Firestore
    saveDocument: async (collection, docId, data) => {
      if (!firebaseInitialized || !firestore) return false;
      try {
        const docRef = firestore.collection(collection).doc(docId);
        await docRef.set({
          ...data,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        return true;
      } catch (error) {
        console.error('Error saving document:', error);
        return false;
      }
    },
    
    // Delete document from Firestore
    deleteDocument: async (collection, docId) => {
      if (!firebaseInitialized || !firestore) return false;
      try {
        await firestore.collection(collection).doc(docId).delete();
        return true;
      } catch (error) {
        console.error('Error deleting document:', error);
        return false;
      }
    }
  };
  
} catch (moduleError) {
  // firebase-admin module not installed
  console.log('Firebase Admin module not installed:', moduleError.message);
  console.log('Install with: npm install firebase-admin');
  
  // Create stub functions that return appropriate defaults
  firebaseAdmin = {
    isInitialized: () => false,
    verifyToken: async () => { throw new Error('Firebase Admin not installed'); },
    getUser: async () => null,
    syncUserToFirestore: async () => false,
    getDocument: async () => null,
    queryCollection: async () => [],
    saveDocument: async () => false,
    deleteDocument: async () => false
  };
}

module.exports = {
  admin,
  auth,
  firestore,
  storage,
  firebaseAdmin,
  firebaseInitialized
};

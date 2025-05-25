import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
   apiKey: "AIzaSyB4KUNgcvDdiSFYvKt_Ar8xHSDMvYIaGK8",
  authDomain: "contie.firebaseapp.com",
  projectId: "contie",
  storageBucket: "contie.firebasestorage.app",
  messagingSenderId: "22383226056",
  appId: "1:22383226056:web:8b33adc5d8b15a92dec9fd",
  measurementId: "G-MVG59KNE92"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const provider = new GoogleAuthProvider();
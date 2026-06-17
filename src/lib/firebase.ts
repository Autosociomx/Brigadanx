import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0054230241",
  appId: "1:1026998379053:web:909a2683882bdbd6b0cea4",
  apiKey: "AIzaSyBjXkNr4GxuoCkZAEtpo12eyCboUJ7r3Z8",
  authDomain: "gen-lang-client-0054230241.firebaseapp.com",
  storageBucket: "gen-lang-client-0054230241.firebasestorage.app",
  messagingSenderId: "1026998379053",
};

const app = initializeApp(firebaseConfig);
// Note: We use the specific firestoreDatabaseId from the config if needed, 
// but by default getFirestore uses the default database or the one provisioned.
export const db = getFirestore(app);

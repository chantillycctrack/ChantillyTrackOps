import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// PASTE YOUR KEYS FROM FIREBASE BELOW THIS LINE
const firebaseConfig = {
  apiKey: "AIzaSyB3qNOOkt41kVycFJJdkqMtRy_RL_uQgwA",
  authDomain: "chantillytrackops.firebaseapp.com",
  projectId: "chantillytrackops",
  storageBucket: "chantillytrackops.firebasestorage.app",
  messagingSenderId: "808372506425",
  appId: "1:808372506425:web:9a0a57c5382c864577a2e8",
  measurementId: "G-YYL1RYS0M1"
};
// PASTE YOUR KEYS ABOVE THIS LINE

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

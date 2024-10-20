import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDqruI1WEfAAt10ruHQDoNhj4hxxctZgjg",
  authDomain: "appointment-scheduler-acc37.firebaseapp.com",
  projectId: "appointment-scheduler-acc37",
  storageBucket: "appointment-scheduler-acc37.appspot.com",
  messagingSenderId: "476320321574",
  appId: "1:476320321574:web:fc3a6a926b0992e07996e7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
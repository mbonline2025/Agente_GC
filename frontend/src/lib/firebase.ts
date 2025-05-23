import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBgRr8C3-E5gcUX08DYFh9Fdt1pLl_aDC4",
  authDomain: "iagovernanca-12e0b.firebaseapp.com",
  projectId: "iagovernanca-12e0b",
  storageBucket: "iagovernanca-12e0b.firebasestorage.app",
  messagingSenderId: "842564511562",
  appId: "1:842564511562:web:f08299b909e5e5b2d6c3b3",
  measurementId: "G-MTZCY6DQYR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };


import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "demointerview-8e665.firebaseapp.com",
  projectId: "demointerview-8e665",
  storageBucket: "demointerview-8e665.firebasestorage.app",
  messagingSenderId: "99214690150",
  appId: "1:99214690150:web:97880e2517db4eb757aaa7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export { auth , provider}
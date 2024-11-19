// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSAAM1QUpD6erFSDTpa9s-s5s_8njIc2c",
  authDomain: "vue-firebase-cff27.firebaseapp.com",
  projectId: "vue-firebase-cff27",
  storageBucket: "vue-firebase-cff27.firebasestorage.app",
  messagingSenderId: "117211972129",
  appId: "1:117211972129:web:bfd63a27dfcb2ad5575960"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(firebase);

export { auth, googleProvider, db };
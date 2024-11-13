// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAhV9MYd5aXA_pXAg3HT5HAEYNzTzSogv8",
  authDomain: "flowthink-a5892.firebaseapp.com",
  projectId: "flowthink-a5892",
  storageBucket: "flowthink-a5892.firebasestorage.app",
  messagingSenderId: "331842548649",
  appId: "1:331842548649:web:6f48c17b8fcd98f577cab8",
  measurementId: "G-7ZZSK671SZ",
};

// Authentication

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

// Sign Up
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Sign Up (User): ", userCredential.user);
  } catch (error) {
    console.error("Error when signing up: ", error.message);
  }
};

// Sign In

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log("Sign In (User): ", userCredential.user);
  } catch (error) {
    console.error("Error when signing in: ", error.message);
  }
};

// Sign Out

export const signOut = async () => {
  try {
    await signOut(auth);
    console.log("Signed Out");
  } catch (error) {
    console.error("Error when signing out: ", error.message);
  }
};

// Monitor State

export const monitorAuthState = (callback) => {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

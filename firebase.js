// Import Firebase core and required services
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhV9MYd5aXA_pXAg3HT5HAEYNzTzSogv8",
  authDomain: "flowthink-a5892.firebaseapp.com",
  projectId: "flowthink-a5892",
  storageBucket: "flowthink-a5892.appspot.com",
  messagingSenderId: "331842548649",
  appId: "1:331842548649:web:6f48c17b8fcd98f577cab8",
  measurementId: "G-7ZZSK671SZ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export auth and db for use in other modules
export { auth, db };

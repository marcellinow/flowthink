// Import auth and db from firebase.js
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signin-link").addEventListener("click", () => {
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("signin-section").style.display = "block";
  });

  document.getElementById("signup-link").addEventListener("click", () => {
    document.getElementById("signin-section").style.display = "none";
    document.getElementById("signup-section").style.display = "block";
  });
});

// Sign Up function
async function signUp(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      createdAt: new Date(),
    });

    console.log("User signed up and additional data saved:", user);
    alert("Sign up successful!");
  } catch (error) {
    console.error("Sign up failed:", error.message);
    alert(`Sign up failed: ${error.message}`);
  }
}

// Form event listener
document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const name = document.getElementById("signup-name").value;
    await signUp(email, password, name);
  });

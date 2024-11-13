import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signin-link").addEventListener("click", () => {
    // console.log("Sign In link clicked");
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("signin-section").style.display = "block";
  });

  document.getElementById("signup-link").addEventListener("click", () => {
    // console.log("Sign Up link clicked");
    document.getElementById("signin-section").style.display = "none";
    document.getElementById("signup-section").style.display = "block";
  });
});
// Sign Up button to stores the use data in
document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const name = document.getElementById("signup-name").value;

    await signUp(email, password, name);
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

    // Store additional user information in Firestore
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

// Sign In function
async function signIn(email, password) {
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
}

// Sign Out function
async function logOut() {
  try {
    await signOut(auth);
    console.log("Signed Out");
  } catch (error) {
    console.error("Error when signing out: ", error.message);
  }
}

// Monitor State function
function monitorAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

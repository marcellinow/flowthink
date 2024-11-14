import { auth, db } from "../firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  // Toggle between Sign-Up and Sign-In sections
  document.getElementById("signin-link").addEventListener("click", () => {
    document.getElementById("signup-section").style.display = "none";
    document.getElementById("signin-section").style.display = "block";
  });

  document.getElementById("signup-link").addEventListener("click", () => {
    document.getElementById("signin-section").style.display = "none";
    document.getElementById("signup-section").style.display = "block";
  });
});

// Function to display the user’s profile picture and name
function displayUserInfo(user) {
  const userPic = document.getElementById("user-pic");
  const userName = document.getElementById("user-name");
  const userInfo = document.getElementById("user-info");

  // Update the profile picture and name with fallback options
  userPic.src = user.photoURL || "../assets/img/default-profile-pic.svg";
  userName.textContent = user.displayName || "User";

  // Show the user info section
  userInfo.style.display = "block";
}

// Sign-Up form submission handler
document
  .getElementById("signup-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;
    const name = document.getElementById("signup-name").value;

    await signUp(email, password, name);
  });

// Sign-Up function
async function signUp(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: name,
      photoURL: user.photoURL,
      createdAt: new Date(),
    });

    alert("Sign up successful!");
  } catch (error) {
    console.error("Sign up failed:", error.message);
    alert(`Sign up failed: ${error.message}`);
  }
}

// Sign-In function
async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    window.location.href = "landingPage.html";
  } catch (error) {
    console.error("Error when signing in:", error.message);
    alert(`Sign in failed: ${error.message}`);
  }
}

// Sign-In form submission handler
document
  .getElementById("signin-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signin-email").value;
    const password = document.getElementById("signin-password").value;

    await signIn(email, password);
  });

// Google Sign-In function
async function signInGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Store or update user information in Firestore with Google profile data
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL, // Save the Google profile picture URL
      createdAt: new Date(),
    });

    // Display the user picture and name on successful Google Sign-In
    displayUserInfo(user);

    alert("Google Sign-In successful!");
    window.location.href = "landingPage.html";
  } catch (error) {
    console.error("Error when signing in with Google: ", error.message);
    alert(`Google Sign-In failed: ${error.message}`);
  }
}

// Add event listeners for Google Sign-In buttons
document
  .getElementById("google-signup")
  .addEventListener("click", signInGoogle);
document
  .getElementById("google-signin")
  .addEventListener("click", signInGoogle);

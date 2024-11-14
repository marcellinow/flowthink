import { auth, db } from "../firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Function to fetch and display flowchart catalog from Firestore
async function displayFlowchartCatalog(userId) {
  try {
    const flowchartsRef = collection(db, "flowcharts");
    const q = query(flowchartsRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const flowchartList = document.getElementById("flowchart-list");
    flowchartList.innerHTML = ""; // Clear previous list

    querySnapshot.forEach((doc) => {
      const flowchartData = doc.data();
      const flowchartItem = document.createElement("div");
      flowchartItem.className = "flowchart-item";

      flowchartItem.innerHTML = `
        <h4>${flowchartData.title}</h4>
        <p>${flowchartData.description}</p>
        <button class="view-flowchart-btn" data-id="${doc.id}">View Flowchart</button>
        <button class="delete-flowchart-btn" data-id="${doc.id}">Delete Flowchart</button>
      `;
      flowchartList.appendChild(flowchartItem);
    });

    // Add event listener to all view buttons
    const viewButtons = document.querySelectorAll(".view-flowchart-btn");
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const flowchartId = e.target.getAttribute("data-id");
        viewFlowchart(flowchartId);
      });
    });

    // Add event listener to all delete buttons
    const deleteButtons = document.querySelectorAll(".delete-flowchart-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const flowchartId = e.target.getAttribute("data-id");
        deleteFlowchart(flowchartId);
      });
    });
  } catch (error) {
    console.error("Error fetching flowcharts:", error);
  }
}

// delete flowchart
// Function to delete flowchart from database
async function deleteFlowchart(flowchartId) {
  try {
    const flowchartRef = doc(db, "flowcharts", flowchartId);

    // Delete the document from database
    await deleteDoc(flowchartRef);

    // Remove the flowchart item from the UI
    const flowchartItem = document
      .querySelector(`[data-id="${flowchartId}"]`)
      .closest(".flowchart-item");
    if (flowchartItem) {
      flowchartItem.remove();
    }

    console.log("Flowchart deleted successfully");
  } catch (error) {
    console.error("Error deleting flowchart:", error);
  }
}

// Function to handle viewing the flowchart
function viewFlowchart(flowchartId) {
  // Redirect to the flowchartMaker page with the ID as a URL parameter
  window.location.href = `flowchartMaker.html?id=${flowchartId}`;
}

document.addEventListener("DOMContentLoaded", () => {
  // Function to fetch and display user data
  async function displayUserData(user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Extract the first name from the user's full name
        const firstName = userData.name.split(" ")[0];

        // Update profile details and welcome message
        document.getElementById("profile-name").textContent = userData.name;
        document.getElementById("profile-email").textContent = userData.email;
        document.getElementById(
          "welcome-message"
        ).textContent = `Welcome, ${firstName}`;

        // Set profile picture URL with fallback options
        const profilePicUrl =
          userData.profilePicUrl ||
          user.photoURL ||
          "../assets/img/profile-pic.svg";

        // Set the src attribute for the profile picture element
        document.getElementById("profile-pic").src = profilePicUrl;

        // Display user's flowchart catalog
        await displayFlowchartCatalog(user.uid);
      } else {
        console.error("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  // Monitor authentication state to load the user data on profile page load
  onAuthStateChanged(auth, (user) => {
    if (user) {
      displayUserData(user);
    } else {
      window.location.href = "authentication.html";
    }
  });

  // Sign Out
  document
    .getElementById("signout-button")
    .addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "authentication.html";
      } catch (error) {
        console.error("Error signing out:", error);
      }
    });
});

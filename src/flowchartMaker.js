import { db, auth } from "../firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const flowchartId = getFlowchartIdFromUrl();
  if (flowchartId) {
    await loadFlowchart(flowchartId);
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Redirect to login page if user is not logged in
      window.location.href = "authentication.html";
    }
  });

  // Function to load flowchart if ID is found in the URL
  async function loadFlowchart(flowchartId) {
    try {
      const flowchartDocRef = doc(db, "flowcharts", flowchartId);
      const flowchartDoc = await getDoc(flowchartDocRef);

      if (flowchartDoc.exists()) {
        const flowchartData = flowchartDoc.data();
        const nodes = flowchartData.nodes;

        nodes.forEach((node) => {
          const item = document.createElement("div");
          item.className = "canvas-item";
          item.draggable = true; // Ensure draggable is set to true
          item.style.position = "absolute";
          item.style.left = `${node.position.x}px`;
          item.style.top = `${node.position.y}px`;

          if (node.data.width) item.style.width = `${node.data.width}px`;
          if (node.data.height) item.style.height = `${node.data.height}px`;
          if (node.data.borderRadius)
            item.style.borderRadius = node.data.borderRadius;

          if (node.data.image) {
            const img = document.createElement("img");
            img.src = node.data.image;
            img.width = node.data.width || 150;
            img.height = node.data.height || 150;
            item.appendChild(img);
          }

          if (node.data.label) {
            const textInput = document.createElement("input");
            textInput.type = "text";
            textInput.className = "text-input";
            textInput.value = node.data.label;
            textInput.style.display = "block";
            item.appendChild(textInput);
          }

          const deleteBtn = document.createElement("button");
          deleteBtn.className = "delete-btn";
          deleteBtn.textContent = "X";
          deleteBtn.addEventListener("click", () => canvas.removeChild(item));
          item.appendChild(deleteBtn);

          canvas.appendChild(item);

          // Add dragstart listener to set draggedElement
          item.addEventListener("dragstart", (e) => {
            draggedElement = e.target;
            const rect = draggedElement.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
          });
        });
      } else {
        console.error("Flowchart not found!");
        alert("Flowchart not found!");
      }
    } catch (error) {
      console.error("Error fetching flowchart:", error);
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const sidebar = document.getElementById("sidebar");

  sidebar.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("draggable")) {
      draggedElement = e.target;
      e.dataTransfer.setData("type", e.target.dataset.type);
      offsetX = 0;
      offsetY = 0;
    }
  });

  canvas.addEventListener("dragover", (e) => {
    e.preventDefault(); // Necessary to allow dropping
  });

  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type"); // Retrieve the type of element being dragged
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (draggedElement && draggedElement.parentElement === sidebar) {
      createCanvasItem(type, x, y);
    } else if (draggedElement) {
      draggedElement.style.left = `${x - offsetX}px`;
      draggedElement.style.top = `${y - offsetY}px`;
    }

    draggedElement = null;
  });

  // Create new canvas item function
  function createCanvasItem(type, x, y) {
    const item = document.createElement("div");
    item.className = "canvas-item";
    item.draggable = true;
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;

    const img = document.createElement("img");
    img.src = `../assets/img/${getImageFileName(type)}`;

    if (type === "start-end") {
      img.width = 200;
    } else if (type === "vertical-line") {
      img.width = 6;
      img.style.height = "100px";
    } else if (type === "horizontal-line") {
      img.height = 6;
      img.style.width = "100px";
    } else {
      img.width = 150;
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";
    deleteBtn.addEventListener("click", () => canvas.removeChild(item));

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "text-input";
    textInput.style.display = "none";

    item.appendChild(img);
    item.appendChild(deleteBtn);
    item.appendChild(textInput);
    canvas.appendChild(item);

    item.addEventListener("dragstart", (e) => {
      draggedElement = e.target;
      const rect = draggedElement.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });
  }

  function getImageFileName(type) {
    switch (type) {
      case "vertical-line":
        return "Vertical Line.svg";
      case "horizontal-line":
        return "Horizontal Line.svg";
      default:
        return `${type}.svg`;
    }
  }
});

// Save Flowchart with dimensions and styles
function getFlowchartIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

document.addEventListener("DOMContentLoaded", () => {
  async function saveFlowchart() {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save your flowchart.");
      return;
    }

    const flowchartId = getFlowchartIdFromUrl();
    const flowchartData = {
      title: prompt("Enter a title for your flowchart:"),
      description: prompt("Enter a description for your flowchart:"),
      userId: user.uid,
      updatedAt: Timestamp.now(),
      nodes: [],
    };

    const items = document.querySelectorAll(".canvas-item, .text-item");
    items.forEach((item) => {
      const img = item.querySelector("img");
      const textInput = item.querySelector(".text-input");

      const nodeData = {
        id: item.id || `node-${Date.now()}`,
        type: item.dataset.type || "custom",
        position: {
          x: parseInt(item.style.left, 10),
          y: parseInt(item.style.top, 10),
        },
        data: {
          label: textInput ? textInput.value : "",
          image: img ? img.src : null,
          width: img ? img.width : item.style.width,
          height: img ? img.height : item.style.height,
          borderRadius: item.style.borderRadius || "0px",
        },
      };
      flowchartData.nodes.push(nodeData);
    });

    try {
      if (flowchartId) {
        const flowchartDocRef = doc(db, "flowcharts", flowchartId);
        await setDoc(flowchartDocRef, flowchartData, { merge: true });
        alert("Flowchart updated successfully!");
      } else {
        const newFlowchartDocRef = doc(
          db,
          "flowcharts",
          `flowchart-${Date.now()}`
        );
        await setDoc(newFlowchartDocRef, {
          ...flowchartData,
          createdAt: Timestamp.now(),
        });
        alert("Flowchart saved successfully!");
      }
    } catch (error) {
      console.error("Error saving flowchart:", error);
      alert("Failed to save flowchart.");
    }
  }

  document
    .getElementById("save-flowchart")
    .addEventListener("click", saveFlowchart);
});

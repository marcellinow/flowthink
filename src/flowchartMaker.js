import { db, auth } from "../firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const flowchartId = getFlowchartIdFromUrl();
  if (flowchartId) {
    await loadFlowchart(flowchartId);
  }

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // Arahkan pengguna ke halaman login jika belum login
      window.location.href = "authentication.html";
    }
  });

  const sidebar = document.getElementById("sidebar");
  const canvas = document.getElementById("canvas");
  let draggedElement = null;
  let offsetX, offsetY;

  sidebar.addEventListener("dragstart", (e) => {
    if (e.target.classList.contains("draggable")) {
      draggedElement = e.target;
      e.dataTransfer.setData("text/plain", e.target.dataset.type);
    }
  });

  canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("text");
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    if (draggedElement.parentElement === sidebar) {
      createCanvasItem(type, x, y);
    } else {
      const rect = draggedElement.getBoundingClientRect();
      draggedElement.style.left = `${x - offsetX}px`;
      draggedElement.style.top = `${y - offsetY}px`;
    }
  });

  // Fungsi untuk menyimpan flowchart ke Firestore
  async function saveFlowchart() {
    // Ambil ID pengguna yang sedang login
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to save your flowchart.");
      return;
    }

    // Dapatkan ID flowchart dari URL jika ada
    let flowchartId = getFlowchartIdFromUrl();

    // Kumpulkan data flowchart dari elemen canvas
    const flowchartData = {
      title: prompt("Enter a title for your flowchart:"), // Meminta judul dari pengguna
      description: prompt("Enter a description for your flowchart:"), // Meminta deskripsi dari pengguna
      userId: user.uid,
      updatedAt: Timestamp.now(),
      nodes: [],
      connections: [],
    };

    // Ambil semua elemen di canvas
    const items = document.querySelectorAll(".canvas-item, .text-item");
    items.forEach((item) => {
      const img = item.querySelector("img");
      const textInput = item.querySelector(".text-input");

      // Data untuk setiap node
      const nodeData = {
        id: item.id || `node-${Date.now()}`, // Gunakan ID unik atau buat ID baru
        type: item.dataset.type || "custom", // Menyimpan jenis node
        position: {
          x: parseInt(item.style.left, 10),
          y: parseInt(item.style.top, 10),
        },
        data: {
          label: textInput ? textInput.value : "",
          image: img ? img.src : null,
        },
      };
      flowchartData.nodes.push(nodeData);
    });

    // Menyimpan data ke Firestore
    try {
      if (flowchartId) {
        // Jika ada ID, update flowchart yang sudah ada
        const flowchartDocRef = doc(db, "flowcharts", flowchartId);
        await setDoc(flowchartDocRef, flowchartData, { merge: true });
        alert("Flowchart updated successfully!");
      } else {
        // Jika tidak ada ID, simpan flowchart baru
        const newFlowchartDocRef = doc(
          db,
          "flowcharts",
          `flowchart-${Date.now()}`
        );
        await setDoc(newFlowchartDocRef, {
          ...flowchartData,
          createdAt: Timestamp.now(),
        });
        flowchartId = newFlowchartDocRef.id;
        alert("Flowchart saved successfully!");

        // Ubah URL agar mengandung ID flowchart baru
        const newUrl = `${window.location.pathname}?id=${flowchartId}`;
        window.history.pushState({ path: newUrl }, "", newUrl);
      }
    } catch (error) {
      console.error("Error saving flowchart:", error);
      alert("Failed to save flowchart.");
    }
  }

  // Event listener untuk tombol Save
  document
    .getElementById("save-flowchart")
    .addEventListener("click", saveFlowchart);

  // Utility function untuk mendapatkan ID flowchart dari URL
  function getFlowchartIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  // Fungsi untuk memuat flowchart jika ID ditemukan di URL
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
          item.draggable = true;
          item.style.position = "absolute";
          item.style.left = `${node.position.x}px`;
          item.style.top = `${node.position.y}px`;

          if (node.data.image) {
            const img = document.createElement("img");
            img.src = node.data.image;
            img.width = 150; // Set default width or adjust according to type
            item.appendChild(img);
          }

          if (node.data.label) {
            const textInput = document.createElement("input");
            textInput.type = "text";
            textInput.className = "text-input";
            textInput.value = node.data.label;
            textInput.style.display = "block"; // Show text input
            item.appendChild(textInput);
          }

          const deleteBtn = document.createElement("button");
          deleteBtn.className = "delete-btn";
          deleteBtn.textContent = "X";
          deleteBtn.addEventListener("click", () => canvas.removeChild(item));
          item.appendChild(deleteBtn);

          canvas.appendChild(item);

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

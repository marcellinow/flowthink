document.addEventListener("DOMContentLoaded", () => {
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

  // New event listener for adding text on canvas click
  canvas.addEventListener("click", (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    createTextItem(x, y);
  });

  function createCanvasItem(type, x, y) {
    const item = document.createElement("div");
    item.className = "canvas-item";
    item.draggable = true;
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;

    const img = document.createElement("img");
    img.src = `assets/img/${getImageFileName(type)}`;

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

    item.addEventListener("click", (e) => {
      if (e.target !== deleteBtn) {
        handleItemClick(item, type);
      }
    });
  }

  // New function to create text item
  function createTextItem(x, y) {
    const textContainer = document.createElement("div");
    textContainer.className = "text-item";
    textContainer.style.position = "absolute";
    textContainer.style.left = `${x}px`;
    textContainer.style.top = `${y}px`;

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.className = "text-input";
    textInput.value = "Click to edit";
    textInput.style.display = "block"; // Make input visible

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "X";
    deleteBtn.addEventListener("click", () =>
      canvas.removeChild(textContainer)
    );

    textContainer.appendChild(textInput);
    textContainer.appendChild(deleteBtn);
    canvas.appendChild(textContainer);

    // Handle editing text
    textInput.addEventListener("blur", () => {
      if (textInput.value.trim() === "") {
        canvas.removeChild(textContainer);
      }
    });

    textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        textInput.blur();
      }
    });

    // Make text container draggable
    textContainer.draggable = true;
    textContainer.addEventListener("dragstart", (e) => {
      draggedElement = textContainer;
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

  function handleItemClick(item, type) {
    const img = item.querySelector("img");
    const textInput = item.querySelector(".text-input");

    if (["vertical-line", "horizontal-line"].includes(type)) {
      const dimension = type === "vertical-line" ? "height" : "width";
      const newSize = prompt(
        `Enter new ${dimension} for the line (in pixels):`
      );
      if (newSize && !isNaN(newSize)) {
        img.style[dimension] = `${newSize}px`;
      }
    } else {
      textInput.style.display = "block";
      textInput.value = textInput.value || ""; // Preserve existing text
      textInput.focus();

      const handleBlur = () => {
        if (textInput.value.trim() === "") {
          textInput.style.display = "none";
        }
        textInput.removeEventListener("blur", handleBlur);
        textInput.removeEventListener("keypress", handleKeyPress);
      };

      const handleKeyPress = (e) => {
        if (e.key === "Enter") {
          textInput.blur();
        }
      };

      textInput.addEventListener("blur", handleBlur);
      textInput.addEventListener("keypress", handleKeyPress);
    }
  }
});

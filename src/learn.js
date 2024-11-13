const videoContainers = document.querySelectorAll(".video-container");
const videoIds = [
  "nlotZCvL9RU",
  "qPfgQK8ZsI4",
  "mn4-torkXOI",
  "3q1Z_zzqrwg",
  "VkzAUhsia4I",
];

videoContainers.forEach((container, index) => {
  // Create the thumbnail image
  const thumbnail = document.createElement("img");
  thumbnail.src = `https://img.youtube.com/vi/${videoIds[index]}/hqdefault.jpg`;
  thumbnail.style.width = "100%";
  thumbnail.style.cursor = "pointer";

  container.innerHTML = ""; // Clear any existing content
  container.appendChild(thumbnail); // Add the thumbnail image

  // Add the click event to play the video
  container.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoIds[index]}?autoplay=1`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    container.innerHTML = ""; // Clear the thumbnail
    container.appendChild(iframe); // Add the video iframe
  });
});

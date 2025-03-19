// index.js
import { downscaleImage } from './utils/processImage.js';

document.addEventListener("DOMContentLoaded", function () {
  const imageUpload = document.getElementById("imageUpload");
  const imageUrlInput = document.getElementById("imageUrl");
  const toggleImageSource = document.getElementById("toggleImageSource");
  const uploadSection = document.getElementById("uploadSection");
  const urlSection = document.getElementById("urlSection");
  const loadImageUrlBtn = document.getElementById("loadImageUrl");
  const progressBar = document.querySelector(".progress");
  const progressBarFill = document.querySelector(".progress-bar");
  const generatePaintBtn = document.getElementById("generatePaint");
  const outputLabel = document.getElementById("outputLabel");
  const copyButton = document.getElementById("copyButton");
  const clearButton = document.getElementById("clearButton");
  const actionButtons = document.getElementById("actionButtons");
  const imageComparison = document.getElementById("imageComparison");
  const originalPreview = document.getElementById("originalPreview");
  const resizedPreview = document.getElementById("resizedPreview");
  const sizeSelector = document.getElementById("sizeSelector");
  const resizeAlgorithm = document.getElementById("resizeAlgorithm");
  let uploadedImageDataUrl = null;

  toggleImageSource.addEventListener("change", function () {
    if (this.checked) {
      uploadSection.style.display = "none";
      urlSection.style.display = "block";
      imageUpload.value = "";
    } else {
      uploadSection.style.display = "block";
      urlSection.style.display = "none";
      imageUrlInput.value = "";
    }
  });

  imageUpload.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        uploadedImageDataUrl = e.target.result;
        originalPreview.innerHTML = `<img src="${uploadedImageDataUrl}" class="img-thumbnail" style="max-width: 200px;">`;
        generatePaintBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  });

  loadImageUrlBtn.addEventListener("click", function () {
    const imageUrl = imageUrlInput.value.trim();
    if (!imageUrl) {
      alert("Please enter a valid image URL.");
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = function () {
      uploadedImageDataUrl = imageUrl;
      originalPreview.innerHTML = `<img src="${uploadedImageDataUrl}" class="img-thumbnail" style="max-width: 200px;">`;
      generatePaintBtn.disabled = false;
    };
    img.onerror = function () {
      alert("Failed to load the image. Please check the URL.");
    };
  });

  generatePaintBtn.addEventListener("click", function () {
    if (!uploadedImageDataUrl) return;
    const img = new Image();
    if (toggleImageSource.checked) {
      img.crossOrigin = "Anonymous";
    }
    img.src = uploadedImageDataUrl;
    img.onload = function () {
      const targetSize = parseInt(sizeSelector.value);
      const downscaledCanvas = downscaleImage(img, targetSize, targetSize, resizeAlgorithm.value);
      const resizedDataUrl = downscaledCanvas.toDataURL();
      resizedPreview.innerHTML = `<img src="${resizedDataUrl}" class="img-thumbnail" style="max-width: 300px;">`;
      imageComparison.style.display = "flex";
    };
  });
});

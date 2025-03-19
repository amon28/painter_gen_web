import {downscaleImage} from './utils/processImage.js';

document.addEventListener("DOMContentLoaded", function () {
  const imageUpload = document.getElementById("imageUpload");
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

  // New dropdowns for size and algorithm
  const sizeSelector = document.getElementById("sizeSelector");
  const resizeAlgorithm = document.getElementById("resizeAlgorithm");

  let uploadedImageDataUrl = null;

  // File upload and preview
  imageUpload.addEventListener("change", function (event) {
      const file = event.target.files[0];

      if (file) {
          const reader = new FileReader();

          // Clear previous data
          outputLabel.textContent = "";
          actionButtons.style.display = "none";
          imageComparison.style.display = "none";
          originalPreview.innerHTML = "";
          resizedPreview.innerHTML = "";

          progressBar.style.display = "block"; // Show progress bar

          reader.onprogress = function (e) {
              if (e.lengthComputable) {
                  let percentLoaded = Math.round((e.loaded / e.total) * 100);
                  progressBarFill.style.width = percentLoaded + "%";
                  progressBarFill.textContent = percentLoaded + "%";
              }
          };

          reader.onload = function (e) {
              uploadedImageDataUrl = e.target.result;
              originalPreview.innerHTML = `<img src="${uploadedImageDataUrl}" class="img-thumbnail" style="max-width: 200px;">`;
              generatePaintBtn.disabled = false; // Enable the generate button

              progressBarFill.style.width = "100%";
              progressBarFill.textContent = "Upload Complete";
          };

          reader.readAsDataURL(file);
      }
  });

  // Generate paint event using iterative downscaling
  generatePaintBtn.addEventListener("click", function () {
      if (!uploadedImageDataUrl) return;

      const img = new Image();
      img.src = uploadedImageDataUrl;

      img.onload = function () {
          // Get target size from dropdown (e.g., 16 or 32)
          const targetSize = parseInt(sizeSelector.value);

          // Use the iterative algorithm to downscale the image
          const downscaledCanvas = downscaleImage(img, targetSize, targetSize, resizeAlgorithm.value);

          // For preview, create a larger version while keeping pixelation
          const scaleFactor = 10; // adjust preview size if needed
          const scaledCanvas = document.createElement("canvas");
          scaledCanvas.width = targetSize * scaleFactor;
          scaledCanvas.height = targetSize * scaleFactor;
          const scaledCtx = scaledCanvas.getContext("2d");
          scaledCtx.imageSmoothingEnabled = false;
          scaledCtx.drawImage(downscaledCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

          // Show the resized image preview
          const resizedDataUrl = scaledCanvas.toDataURL();
          resizedPreview.innerHTML = `<img src="${resizedDataUrl}" class="img-thumbnail" style="max-width: 300px;">`;
          imageComparison.style.display = "flex";

          // Extract pixel data from the downscaled canvas
          const ctx = downscaledCanvas.getContext("2d");
          const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
          const data = imageData.data;

          let pixelArray = [];
          for (let y = 0; y < targetSize; y++) {
              let row = [];
              for (let x = 0; x < targetSize; x++) {
                  let index = (y * targetSize + x) * 4;
                  row.push({
                      r: (data[index] / 255).toFixed(2),
                      g: (data[index + 1] / 255).toFixed(2),
                      b: (data[index + 2] / 255).toFixed(2),
                      a: (data[index + 3] / 255).toFixed(2),
                  });
              }
              pixelArray.push(row);
          }

          // Flip image data for correct orientation
          pixelArray.reverse();
          pixelArray.forEach(row => row.reverse());

          // Format output as a JavaScript array with resolution and return value
          let outputStr = "export function yourUniquePaintName() {\n";
          outputStr += "  const resolution = " + targetSize + ";\n";
          outputStr += "  const customImage = [\n";
          pixelArray.forEach(row => {
              let rowStr = row.map(pixel => `{ r: ${pixel.r}, g: ${pixel.g}, b: ${pixel.b}, a: ${pixel.a} }`).join(", ");
              outputStr += "      [" + rowStr + "],\n";
          });
          outputStr += "  ];\n";
          outputStr += "  return {customImage, resolution};";
          outputStr += "\n}";

          outputLabel.textContent = outputStr;
          actionButtons.style.display = "block"; // Show copy & clear buttons
      };
  });

  // Copy to clipboard functionality
  copyButton.addEventListener("click", function () {
      navigator.clipboard.writeText(outputLabel.textContent).then(() => alert("Copied to clipboard!"));
  });

  // Clear function to reset the app
  clearButton.addEventListener("click", function () {
      imageUpload.value = "";
      uploadedImageDataUrl = null;
      originalPreview.innerHTML = "";
      resizedPreview.innerHTML = "";
      progressBar.style.display = "none";
      outputLabel.textContent = "";
      generatePaintBtn.disabled = true;
      actionButtons.style.display = "none";
      imageComparison.style.display = "none";
  });

  // Open Tutorial Modal
  document.getElementById("openTutorialBtn").addEventListener("click", function () {
    $("#tutorialModal").modal("show")
  });

  document.getElementById("content-links-btn").addEventListener('click', function() {
    $("#linksModal").modal("show")
  })
});

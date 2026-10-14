import { DEFAULT_AVATAR } from "./constants";

/**
 * Compresses an image file or data URL to a lightweight JPEG DataURL.
 * This ensures portraits stay ~10-25 KB and never hit Firestore's 1MB document limit.
 *
 * @param {File|Blob} file 
 * @param {number} maxDimension - maximum width/height in px (default 260)
 * @param {number} quality - JPEG compression quality 0.1 - 1.0 (default 0.82)
 * @returns {Promise<string>} Base64 DataURL
 */
export const compressImageFile = (file, maxDimension = 260, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!file) {
      return resolve(DEFAULT_AVATAR);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          // Fill background white in case of transparent PNGs
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch (err) {
          console.warn("Canvas compression note:", err);
          resolve(e.target?.result || DEFAULT_AVATAR);
        }
      };

      img.onerror = () => {
        resolve(DEFAULT_AVATAR);
      };

      img.src = e.target?.result;
    };

    reader.onerror = () => {
      resolve(DEFAULT_AVATAR);
    };

    reader.readAsDataURL(file);
  });
};

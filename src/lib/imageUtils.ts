/**
 * Image compression and optimization utilities
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compress image using Canvas API
 * @param file - Original image file
 * @param options - Compression options
 * @returns Compressed file
 */
export const compressImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<File> => {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images in parallel
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed files
 */
export const compressImages = async (
  files: File[],
  options?: CompressOptions
): Promise<File[]> => {
  try {
    const compressionPromises = files.map((file) =>
      compressImage(file, options)
    );
    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error("Image compression error:", error);
    throw error;
  }
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

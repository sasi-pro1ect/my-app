export async function resizePngToFit(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<File> {

  if (file.type !== "image/png") {
    throw new Error("Only PNG images are allowed");
  }
  const imageBitmap = await createImageBitmap(file);
  try {
    if (imageBitmap.width === targetWidth && imageBitmap.height === targetHeight) {
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not supported in this browser");
    }

    const scale = Math.min(targetWidth / imageBitmap.width, targetHeight / imageBitmap.height);
    const drawWidth = imageBitmap.width * scale;
    const drawHeight = imageBitmap.height * scale;
    const x = (targetWidth - drawWidth) / 2;
    const y = (targetHeight - drawHeight) / 2;

    ctx.drawImage(
      imageBitmap,
      0,
      0,
      imageBitmap.width,
      imageBitmap.height,
      x,
      y,
      drawWidth,
      drawHeight
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Failed to create PNG"))), "image/png");
    });

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.png`, { type: "image/png", lastModified: file.lastModified });
  } finally {
    imageBitmap.close();
  }
}

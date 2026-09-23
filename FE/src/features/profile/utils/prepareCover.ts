export type CoverCropOptions = {
  zoom?: number;
  x?: number;
  y?: number;
};

export async function prepareCover(file: File, options: CoverCropOptions = {}): Promise<string> {
  if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024) {
    throw new Error('Invalid image');
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = 2560;
    canvas.height = 640;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing unavailable');

    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = canvas.width / canvas.height;
    let baseWidth = image.naturalWidth;
    let baseHeight = image.naturalHeight;
    let baseX = 0;
    let baseY = 0;

    if (sourceRatio > targetRatio) {
      baseWidth = image.naturalHeight * targetRatio;
      baseX = (image.naturalWidth - baseWidth) / 2;
    } else {
      baseHeight = image.naturalWidth / targetRatio;
      baseY = (image.naturalHeight - baseHeight) / 2;
    }

    const zoom = Math.min(Math.max(options.zoom ?? 1, 1), 3);
    const panX = Math.min(Math.max(options.x ?? 50, 0), 100) / 100;
    const panY = Math.min(Math.max(options.y ?? 50, 0), 100) / 100;
    const sourceWidth = baseWidth / zoom;
    const sourceHeight = baseHeight / zoom;
    const sourceX = baseX + (baseWidth - sourceWidth) * panX;
    const sourceY = baseY + (baseHeight - sourceHeight) * panY;

    context.fillStyle = '#111827';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

    for (const quality of [0.88, 0.78, 0.68, 0.58, 0.48, 0.38, 0.30, 0.22]) {
      const result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= 900000) return result;
    }

    throw new Error('Image too large');
  } finally {
    URL.revokeObjectURL(url);
  }
}





export type AvatarCropOptions = {
  zoom?: number;
  x?: number;
  y?: number;
};

export async function prepareAvatar(file: File, options: AvatarCropOptions = {}): Promise<string> {
  if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024) {
    throw new Error('Invalid image');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image processing unavailable');
    const baseSize = Math.min(image.naturalWidth, image.naturalHeight);
    const baseX = (image.naturalWidth - baseSize) / 2;
    const baseY = (image.naturalHeight - baseSize) / 2;
    const zoom = Math.min(Math.max(options.zoom ?? 1, 1), 3);
    const panX = Math.min(Math.max(options.x ?? 50, 0), 100) / 100;
    const panY = Math.min(Math.max(options.y ?? 50, 0), 100) / 100;
    const size = baseSize / zoom;
    const sourceX = baseX + (baseSize - size) * panX;
    const sourceY = baseY + (baseSize - size) * panY;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 256, 256);
    for (const quality of [0.85, 0.65, 0.45]) {
      const result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= 60000) return result;
    }
    throw new Error('Image too large');
  } finally {
    URL.revokeObjectURL(url);
  }
}

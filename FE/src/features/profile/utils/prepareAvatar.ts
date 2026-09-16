export async function prepareAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
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
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, 256, 256);
    context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 256, 256);
    for (const quality of [0.85, 0.65, 0.45]) {
      const result = canvas.toDataURL('image/jpeg', quality);
      if (result.length <= 60000) return result;
    }
    throw new Error('Image too large');
  } finally {
    URL.revokeObjectURL(url);
  }
}

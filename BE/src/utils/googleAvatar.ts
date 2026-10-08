const GOOGLE_AVATAR_HOSTS = new Set([
  'lh3.googleusercontent.com',
]);

const MAX_GOOGLE_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const isGoogleAvatarUrl = (value?: string | null): boolean => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GOOGLE_AVATAR_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
};

export const downloadGoogleAvatar = async (url: string): Promise<string | null> => {
  if (!isGoogleAvatarUrl(url)) return null;

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() || '';
    if (!ALLOWED_IMAGE_TYPES.has(contentType)) return null;

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_GOOGLE_AVATAR_BYTES) return null;

    return `data:${contentType};base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
};

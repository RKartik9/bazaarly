export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "res.cloudinary.com", "img.clerk.com"] as const;

export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(url.hostname);
  } catch {
    return false;
  }
}

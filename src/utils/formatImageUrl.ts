import envConfig from "../config";

export function formatImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `${envConfig.SERVER_PROTOCOL}://${envConfig.SERVER_DOMAIN}/public/${trimmed.replace(/^\/+/, '')}`;
}

export function getServerApiBaseUrl(): string {
  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("API_URL is not set");
  }

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function toServerApiUrl(path: string): string {
  return `${getServerApiBaseUrl()}${path}`;
}

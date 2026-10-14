import { resolveApiBaseUrl } from "./resolveApiBaseUrl";
export { authenticatedFetch } from "./auth";

export const API_BASE_URL = resolveApiBaseUrl(
  globalThis.__VAXCARE_CONFIG__?.apiBaseUrl,
  import.meta.env.VITE_API_BASE_URL
);

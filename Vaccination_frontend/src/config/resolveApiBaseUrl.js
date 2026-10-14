export function resolveApiBaseUrl(runtimeApiUrl, buildApiUrl) {
  return (runtimeApiUrl || buildApiUrl || "http://localhost:9000").replace(
    /\/+$/,
    ""
  );
}

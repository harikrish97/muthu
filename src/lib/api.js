const rawBase = import.meta.env.VITE_API_BASE_URL || "/api";

const API_BASE_URL = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export const apiFetch = async (path, options = {}) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, options);

  let body = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    body = await response.json();
  } else if (!response.ok) {
    body = { error: "Request failed" };
  }

  if (!response.ok) {
    const message = body?.error || body?.detail || "Request failed";
    throw new Error(message);
  }

  return body;
};

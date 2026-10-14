const SESSION_KEYS = [
  "accessToken",
  "userId",
  "userName",
  "userEmail",
  "userRole",
  "selectedRole",
];

export function saveAuthSession(data) {
  if (!data?.token || !data?.user?.id || !data?.user?.role) {
    throw new Error("The server did not return a valid authenticated session.");
  }

  localStorage.setItem("accessToken", data.token);
  localStorage.setItem("userId", data.user.id);
  localStorage.setItem("userName", data.user.name || "");
  localStorage.setItem("userEmail", data.user.email || "");
  localStorage.setItem("userRole", data.user.role);
  localStorage.removeItem("selectedRole");
}

export function clearAuthSession() {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

export async function authenticatedFetch(resource, options = {}) {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("accessToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resource, { ...options, headers });
  if (response.status === 401) {
    clearAuthSession();
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }
  return response;
}

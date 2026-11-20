const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Hindi nakumpleto ang request. Subukan ulit.");
  }
  return data;
}

function withId(product) {
  return { ...product, id: product._id || product.id };
}

export async function getProducts() {
  const products = await request("/products");
  return products.map(withId);
}

export async function createProduct(product) {
  return withId(await request("/products", {
    method: "POST",
    body: JSON.stringify(product),
  }));
}

export async function updateProduct(id, updates) {
  return withId(await request(`/products/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  }));
}

export async function deleteProduct(id) {
  return request(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

function saveAuthSession(data) {
  sessionStorage.setItem("kabsuhayan-token", data.token);
  sessionStorage.setItem("kabsuhayan-user", JSON.stringify(data.user));
  return data;
}

export async function registerAccount(account) {
  const data = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(account),
  });
  return saveAuthSession(data);
}

export async function loginAccount(credentials) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return saveAuthSession(data);
}

export function clearAuthSession() {
  sessionStorage.removeItem("kabsuhayan-token");
  sessionStorage.removeItem("kabsuhayan-user");
  sessionStorage.removeItem("kabsuhayan-demo-user");
}

export function getStoredUser() {
  try {
    return JSON.parse(sessionStorage.getItem("kabsuhayan-user") || "null");
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const token = sessionStorage.getItem("kabsuhayan-token");
  if (!token) throw new Error("Please log in first.");
  return request("/auth/me", { headers: { Authorization: `Bearer ${token}` } });
}

export async function updateCurrentUser(updates) {
  const token = sessionStorage.getItem("kabsuhayan-token");
  if (!token) throw new Error("Please log in first.");
  return request("/auth/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
}

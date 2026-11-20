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

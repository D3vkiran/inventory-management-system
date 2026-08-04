const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8081/api";
const TOKEN_KEY = "inventory.jwt";

const getToken = () => sessionStorage.getItem(TOKEN_KEY);

const setToken = (token) => {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
};

const request = async (path, options = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "Request failed");
  }
  return payload?.data ?? payload;
};

const normalizeProduct = (product) => ({
  id: product.id,
  sku: product.sku || "",
  asin: product.asin || "",
  upc: product.upc || "",
  name: product.name || "",
  brand: product.brand || "",
  category: product.category || "",
  size: product.size || "",
  color: product.color || "",
  image: product.image || "",
  reorderPoint: Number(product.reorderPoint || 0),
  targetStock: Number(product.targetStock || 0),
  defaultCost: Number(product.defaultCost || 0),
  defaultPrice: Number(product.defaultPrice || 0)
});

const normalizeInventory = (item) => ({
  id: item.id,
  productId: item.productId,
  location: item.location || "Amazon FBA",
  status: String(item.status || "AVAILABLE").toLowerCase(),
  quantity: Number(item.quantity || 0)
});

const normalizeInventoryMovement = (item) => ({
  id: item.id,
  productId: item.productId,
  productName: item.productName || "",
  sku: item.sku || "",
  action: item.action || "",
  quantity: Number(item.quantity || 0),
  previousStock: Number(item.previousStock || 0),
  newStock: Number(item.newStock || 0),
  reason: item.reason || "",
  revenue: Number(item.revenue || 0),
  cost: Number(item.cost || 0),
  profit: Number(item.profit || 0),
  notes: item.notes || "",
  user: item.user || "",
  timestamp: item.timestamp || ""
});

const toProductRequest = (product) => ({
  sku: product.sku,
  asin: product.asin || null,
  upc: product.upc || null,
  name: product.name,
  brand: product.brand || null,
  category: product.category || null,
  size: product.size || null,
  color: product.color || null,
  image: product.image || null,
  reorderPoint: Number(product.reorderPoint || 0),
  targetStock: Number(product.targetStock || 0),
  defaultCost: Number(product.defaultCost || 0),
  defaultPrice: Number(product.defaultPrice || 0)
});

const toInventoryRequest = (item) => ({
  productId: Number(item.productId),
  location: item.location,
  status: String(item.status || "available").toUpperCase(),
  quantity: Number(item.quantity || 0)
});

const toInventoryActionRequest = (item) => ({
  productId: Number(item.productId),
  location: item.location,
  action: item.action,
  quantity: Number(item.quantity || 0),
  reason: item.reason || null,
  notes: item.notes || null
});

export const api = {
  hasToken: () => Boolean(getToken()),
  clearToken: () => setToken(null),
  async login(credentials) {
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: credentials.email, password: credentials.password })
    });
    setToken(data.accessToken);
    return data.user;
  },
  async me() {
    return request("/auth/me");
  },
  async getProducts() {
    const products = await request("/products");
    return products.map(normalizeProduct);
  },
  async createProduct(product) {
    const created = await request("/products", {
      method: "POST",
      body: JSON.stringify(toProductRequest(product))
    });
    return normalizeProduct(created);
  },
  async updateProduct(id, product) {
    const updated = await request(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(toProductRequest(product))
    });
    return normalizeProduct(updated);
  },
  deleteProduct(id) {
    return request(`/products/${id}`, { method: "DELETE" });
  },
  async getInventory() {
    const inventory = await request("/inventory");
    return inventory.map(normalizeInventory);
  },
  async getInventoryHistory() {
    const movements = await request("/inventory/history");
    return movements.map(normalizeInventoryMovement);
  },
  deleteInventoryHistory(id) {
    return request(`/inventory/history/${id}`, { method: "DELETE" });
  },
  async applyInventoryAction(item) {
    const result = await request("/inventory/actions", {
      method: "POST",
      body: JSON.stringify(toInventoryActionRequest(item))
    });
    return {
      inventory: normalizeInventory(result.inventory),
      movement: normalizeInventoryMovement(result.movement)
    };
  },
  async createInventory(item) {
    const created = await request("/inventory", {
      method: "POST",
      body: JSON.stringify(toInventoryRequest(item))
    });
    return normalizeInventory(created);
  },
  async updateInventory(id, item) {
    const updated = await request(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(toInventoryRequest(item))
    });
    return normalizeInventory(updated);
  },
  deleteInventory(id) {
    return request(`/inventory/${id}`, { method: "DELETE" });
  }
};

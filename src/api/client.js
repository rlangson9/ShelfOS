const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthToken = () => {
  return localStorage.getItem('shelfos_token');
};

const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refresh: (token) => request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: token }) }),
  me: () => request('/auth/me'),
};

export const userAPI = {
  getAll: () => request('/users'),
  getPending: () => request('/users/pending'),
  getById: (id) => request(`/users/${id}`),
  approve: (id) => request(`/users/${id}/approve`, { method: 'PUT' }),
  suspend: (id) => request(`/users/${id}/suspend`, { method: 'PUT' }),
  verify: (id) => request(`/users/${id}/verify`, { method: 'PUT' }),
  update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (id, data) => request(`/users/${id}/password`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};

export const productAPI = {
  getAll: () => request('/products'),
  getById: (id) => request(`/products/${id}`),
  create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateTag: (id, data) => request(`/products/${id}/tag`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  getLowStock: () => request('/products/low-stock'),
};

export const orderAPI = {
  getStoreOrders: () => request('/orders/store'),
  getSupplierOrders: () => request('/orders/supplier'),
  getById: (id) => request(`/orders/${id}`),
  create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, data) => request(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
};

export const catalogAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/catalog?${query}`);
  },
  getBySupplier: () => request('/catalog/supplier'),
  getById: (id) => request(`/catalog/${id}`),
  create: (data) => request('/catalog', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/catalog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/catalog/${id}`, { method: 'DELETE' }),
  getCategories: () => request('/catalog/categories'),
};

export const subscriptionAPI = {
  getUserSubscriptions: () => request('/subscriptions/user'),
  getById: (id) => request(`/subscriptions/${id}`),
  create: (data) => request('/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancel: (id) => request(`/subscriptions/${id}/cancel`, { method: 'PUT' }),
};

export const paymentAPI = {
  getUserPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments/user?${query}`);
  },
  getById: (id) => request(`/payments/${id}`),
  create: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
  getSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments/summary/user?${query}`);
  },
};

export const pricetagAPI = {
  getStoreTags: () => request('/pricetags/store'),
  getById: (productId) => request(`/pricetags/${productId}`),
  sync: (productId, data) => request(`/pricetags/${productId}/sync`, { method: 'PUT', body: JSON.stringify(data) }),
  updateColor: (productId, data) => request(`/pricetags/${productId}/color`, { method: 'PUT', body: JSON.stringify(data) }),
  syncAll: () => request('/pricetags/sync-all', { method: 'POST' }),
};

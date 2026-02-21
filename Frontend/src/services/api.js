const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok)
    throw { status: res.status, message: data.message || "Request failed" };
  return data;
}

export const authAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMe: () => request("/auth/me"),
};

export const vehicleAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/vehicles${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/vehicles/${id}`),
  create: (payload) =>
    request("/vehicles", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/vehicles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export const driverAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/drivers${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/drivers/${id}`),
  checkAssignable: (id) => request(`/drivers/${id}/assignable`),
  create: (payload) =>
    request("/drivers", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/drivers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};

export const tripAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/trips${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/trips/${id}`),
  create: (payload) =>
    request("/trips", { method: "POST", body: JSON.stringify(payload) }),
  dispatch: (id) => request(`/trips/${id}/dispatch`, { method: "PATCH" }),
  complete: (id, payload) =>
    request(`/trips/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  cancel: (id) => request(`/trips/${id}/cancel`, { method: "PATCH" }),
};

export const maintenanceAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/maintenance${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/maintenance/${id}`),
  create: (payload) =>
    request("/maintenance", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  start: (id) => request(`/maintenance/${id}/start`, { method: "PATCH" }),
  complete: (id, payload) =>
    request(`/maintenance/${id}/complete`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  cancel: (id) => request(`/maintenance/${id}/cancel`, { method: "PATCH" }),
  addExpense: (id, payload) =>
    request(`/maintenance/${id}/expenses`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  listExpenses: (id) => request(`/maintenance/${id}/expenses`),
};

export const fuelLogAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/fuel-logs${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/fuel-logs/${id}`),
  create: (payload) =>
    request("/fuel-logs", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) =>
    request(`/fuel-logs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getExpense: (id) => request(`/fuel-logs/${id}/expense`),
};

export const expenseAPI = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/expenses${query ? `?${query}` : ""}`);
  },
  getById: (id) => request(`/expenses/${id}`),
  summary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/expenses/summary${query ? `?${query}` : ""}`);
  },
};

export const analyticsAPI = {
  fleetUtilization: () => request("/analytics/fleet-utilization"),
  fuelEfficiency: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/analytics/fuel-efficiency${query ? `?${query}` : ""}`);
  },
  costPerKm: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/analytics/cost-per-km${query ? `?${query}` : ""}`);
  },
  vehicleROI: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/analytics/vehicle-roi${query ? `?${query}` : ""}`);
  },
  monthlyExpenses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/analytics/monthly-expenses${query ? `?${query}` : ""}`);
  },
  trips: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/analytics/trips${query ? `?${query}` : ""}`);
  },
};

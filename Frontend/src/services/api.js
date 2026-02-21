const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || "Request failed" };
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
    request(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
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
    request(`/drivers/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
};

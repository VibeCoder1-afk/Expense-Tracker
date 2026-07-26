import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE });

// Attach the JWT (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server ever says the token is invalid/expired, clear it so the app
// falls back to the login screen instead of looping on failed requests.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const register = (email, password, name) =>
  api.post("/auth/register", { email, password, name }).then((res) => res.data);

export const login = (email, password) =>
  api.post("/auth/login", { email, password }).then((res) => res.data);

export const getMe = () => api.get("/auth/me").then((res) => res.data);

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// --- Transactions ---
export const getTransactions = (params = {}) =>
  api.get("/transactions", { params }).then((res) => res.data);

export const getSummary = (params = {}) =>
  api.get("/transactions/summary", { params }).then((res) => res.data);

export const createTransaction = (payload) =>
  api.post("/transactions", payload).then((res) => res.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((res) => res.data);

export const getMonthlyTrends = (months = 6) =>
  api.get("/transactions/trends", { params: { months } }).then((res) => res.data);

export const getStats = (params = {}) =>
  api.get("/transactions/stats", { params }).then((res) => res.data);

// --- Budget ---
export const getBudget = () =>
  api.get("/budget").then((res) => res.data);

export const setBudget = (monthlyLimit) =>
  api.put("/budget", { monthlyLimit }).then((res) => res.data);

export default api;

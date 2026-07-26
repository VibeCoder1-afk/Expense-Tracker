import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API_BASE });

export const getTransactions = (params = {}) =>
  api.get("/transactions", { params }).then((res) => res.data);

export const getSummary = (params = {}) =>
  api.get("/transactions/summary", { params }).then((res) => res.data);

export const createTransaction = (payload) =>
  api.post("/transactions", payload).then((res) => res.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then((res) => res.data);

export default api;

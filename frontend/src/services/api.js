// services/api.js
// Responsibility: create ONE Axios instance that every page uses to talk to
// the backend, and attach the JWT token automatically to each request.

import axios from "axios";

// The backend URL comes from the frontend .env file (VITE_API_URL).
// If it is missing, we fall back to the local backend so development works.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Before every request, if we have a saved token, add it to the headers.
api.interceptors.request.use(function (config) {
  const token = localStorage.getItem("sra_token");

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

// Turn any Axios error into a simple, readable message for the UI.
export function getErrorMessage(error) {
  if (error.response && error.response.data) {
    const data = error.response.data;

    // Zod validation errors arrive as an "errors" array.
    if (data.errors && data.errors.length > 0) {
      return data.errors.join(", ");
    }

    if (data.message) {
      return data.message;
    }
  }

  if (error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export default api;

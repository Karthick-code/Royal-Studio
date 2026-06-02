import axios from "axios";

const API = axios.create({
  baseURL: "/api"
});

// Auto-inject JWT security tokens to outbound headers
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("photo_studio_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;

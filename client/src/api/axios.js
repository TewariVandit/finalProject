import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

let pendingRequests = 0;

const emitLoading = () => {
  window.dispatchEvent(
    new CustomEvent("api-loading", {
      detail: { loading: pendingRequests > 0 }
    })
  );
};

API.interceptors.request.use(
  (config) => {
    pendingRequests += 1;
    emitLoading();
    return config;
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    emitLoading();
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    emitLoading();
    return response;
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1);
    emitLoading();
    return Promise.reject(error);
  }
);

export default API;

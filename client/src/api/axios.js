import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
export const SERVER_URL = API_BASE_URL.replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export default API;

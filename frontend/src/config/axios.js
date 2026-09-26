import axios from "axios";
import { BACKEND_URL } from "./env";

axios.defaults.baseURL = BACKEND_URL;

axios.interceptors.request.use((config) => {
  config.headers["X-User-Id"] = localStorage.getItem("userId") || "1";
  return config;
});

export default axios;
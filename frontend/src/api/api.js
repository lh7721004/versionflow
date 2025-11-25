import axios from "axios";

const API_BASE = "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 쿠키 포함
});

// ----- 401 시 refresh 재시도 -----
let isRefreshing = false;
let pendingQueue = [];

function runQueue(error, tokenRefreshed) {
  pendingQueue.forEach(({ resolve, reject }) => {
    tokenRefreshed ? resolve() : reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (!error.response) throw error;

    if (error.response.status !== 401 || original.__retry) {
      throw error;
    }

    if (isRefreshing) {
      await new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }));
      original.__retry = true;
      return api(original);
    }

    isRefreshing = true;
    original.__retry = true;

    try {
      // refresh 쿠키로 access 쿠키 재발급
      await api.post("/auth/refresh");
      runQueue(null, true);
      return api(original);
    } catch (e) {
      runQueue(e, false);
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);


import axios from "axios";

const API_BASE = "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
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

    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 🔴 1. refresh 요청 자체가 401이면 → 바로 실패 처리
    if (original?.url?.includes("/auth/refresh")) {
      runQueue(error, false);   // 대기 중인 요청들 전부 실패
      isRefreshing = false;
      return Promise.reject(error);
    }

    // 🔴 2. 401이 아닌 경우, 혹은 이미 재시도한 요청이면 그냥 실패
    if (status !== 401 || original.__retry) {
      return Promise.reject(error);
    }

    // 🔴 3. 이미 다른 곳에서 refresh 중이면 → 큐에 넣고 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: () => {
            original.__retry = true;
            resolve(api(original)); // 토큰 갱신 후 원래 요청 재시도
          },
          reject: (err) => {
            reject(err); // refresh 실패 시 에러 전파
          },
        });
      });
    }

    // 🔴 4. 여기까지 왔다는 건: 처음 401 + 아직 refresh 안 돌고 있는 상태
    isRefreshing = true;
    original.__retry = true;

    try {
      // refresh 쿠키로 access 쿠키 재발급 시도
      await api.post("/auth/refresh");

      // 성공 → 큐에 있던 요청들 재실행
      runQueue(null, true);

      // 현재 original 요청 재시도
      return api(original);
    } catch (e) {
      // refresh 자체 실패 → 큐에 있는 것도 전부 실패
      runQueue(e, false);
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

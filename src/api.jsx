import axios from "axios";

const api = axios.create({
  baseURL: "https://emc-backend.onrender.com/",
  withCredentials: true, // send refresh token cookie
});

// Attach Access Token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto Refresh Token When 403
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 403 && !original._retry) {
      original._retry = true;

      try {
        const res = await axios.post(
          "https://emc-backend.onrender.com/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;
        sessionStorage.setItem("accessToken", newToken);
        original.headers.Authorization = `Bearer ${newToken}`;

        return api(original); // retry original request
      } catch {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;

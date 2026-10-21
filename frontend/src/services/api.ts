import axios from 'axios';

let inMemoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token if set in memory
api.interceptors.request.use((config) => {
  if (inMemoryToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryToken}`;
  }
  return config;
});

// Response Interceptor: Handle 401 and attempt automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      try {
        const refreshUrl = API_BASE_URL.endsWith('/')
          ? `${API_BASE_URL}auth/refresh`
          : `${API_BASE_URL}/auth/refresh`;
        const refreshRes = await axios.post(refreshUrl, {}, { withCredentials: true });
        if (refreshRes.data?.data?.accessToken) {
          const newToken = refreshRes.data.data.accessToken;
          setAuthToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (_refreshError) {
        setAuthToken(null);
        // Let component handle logout/redirect if necessary
      }
    }
    return Promise.reject(error);
  }
);

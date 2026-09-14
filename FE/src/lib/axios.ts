import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer JWT Token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('planora_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthenticated safely
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthPath = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthPath) {
        localStorage.removeItem('planora_token');
        // Dispatch custom event so auth store can clear state without infinite loop
        window.dispatchEvent(new Event('planora_unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

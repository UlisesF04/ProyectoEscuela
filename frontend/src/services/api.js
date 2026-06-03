import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      console.warn(
        'Rate limit (429) alcanzado. Esperá un momento antes de reintentar.'
      );
    }
    return Promise.reject(error);
  }
);

export default api;

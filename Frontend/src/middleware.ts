import { api } from './shared/services/api';

export function setupMiddleware() {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bcb_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

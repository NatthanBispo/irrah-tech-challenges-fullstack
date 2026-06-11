import { api } from './shared/services/api';
import { CLIENT_KEY, TOKEN_KEY } from './shared/constants';

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

function clearSessionStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENT_KEY);
  delete api.defaults.headers.common.Authorization;
}

export function setupMiddleware() {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const status =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status;

      if (status === 401) {
        clearSessionStorage();
        if (onUnauthorized) {
          onUnauthorized();
        } else if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register'
        ) {
          window.location.href = '/login';
        }
      }

      return Promise.reject(error);
    },
  );
}

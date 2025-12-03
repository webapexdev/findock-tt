import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

const getRetryDelay = (attempt: number): number => {
  return RETRY_DELAY * Math.pow(2, attempt);
};

const shouldRetry = (error: AxiosError, retryCount: number): boolean => {
  if (retryCount >= MAX_RETRIES) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const status = error.response.status;
  if (RETRYABLE_STATUS_CODES.includes(status)) {
    return true;
  }

  if (status >= 400 && status < 500 && status !== 429) {
    return false;
  }

  return false;
};

interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('task_app_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;

    if (!config) {
      return Promise.reject(error);
    }

    const retryCount = config._retryCount || 0;

    if (shouldRetry(error, retryCount)) {
      config._retryCount = retryCount + 1;

      const delay = getRetryDelay(retryCount);

      console.warn(
        `API request failed (attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`,
        error.response?.status || 'Network error'
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      return apiClient(config);
    }

    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);

      const responseData = error.response.data;
      if (responseData && typeof responseData === 'object' && 'errors' in responseData) {
        const validationError = new Error(
          (responseData as { message?: string }).message || 'Validation failed'
        );
        (validationError as any).errors = (responseData as { errors: any }).errors;
        (validationError as any).status = error.response.status;
        return Promise.reject(validationError);
      }

      const apiError = new Error(
        (responseData && typeof responseData === 'object' && 'message' in responseData
          ? (responseData as { message: string }).message
          : null) || 'An error occurred'
      );
      (apiError as any).status = error.response.status;
      return Promise.reject(apiError);
    } else if (error.request) {
      console.error('Network Error:', error.message);
      console.error('Make sure the backend is running on', API_BASE_URL);
      const networkError = new Error(
        'Network error. Please check your connection and ensure the server is running.'
      );
      return Promise.reject(networkError);
    } else {
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

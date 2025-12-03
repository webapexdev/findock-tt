import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
  (error) => {
    // Log errors for debugging
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.status, error.response.data);
      
      // Create a custom error with validation errors if available
      const responseData = error.response.data;
      if (responseData?.errors) {
        const validationError = new Error(responseData.message || 'Validation failed');
        (validationError as any).errors = responseData.errors;
        (validationError as any).status = error.response.status;
        return Promise.reject(validationError);
      }
      
      // Create error with message
      const apiError = new Error(responseData?.message || 'An error occurred');
      (apiError as any).status = error.response.status;
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request was made but no response received (network error, CORS, etc.)
      console.error('Network Error:', error.message);
      console.error('Make sure the backend is running on', API_BASE_URL);
      const networkError = new Error('Network error. Please check your connection and ensure the server is running.');
      return Promise.reject(networkError);
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);


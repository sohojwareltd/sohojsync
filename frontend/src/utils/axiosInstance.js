import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Axios instance configured for Laravel Sanctum authentication
 * - Uses cookies for session management
 * - Automatically includes credentials (cookies) with every request
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important: enables cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Ensure CSRF cookie is set before login/register
 * This function should be called before any state-changing operations
 * that require CSRF protection.
 */
export const ensureCsrf = async () => {
  try {
    await axiosInstance.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.error('Failed to fetch CSRF cookie:', error);
    throw error;
  }
};

export default axiosInstance;

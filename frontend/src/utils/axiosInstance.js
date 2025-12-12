import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api';

/**
 * Axios instance configured for Laravel Sanctum authentication
 * - Uses cookies for session management
 * - Automatically includes credentials (cookies) with every request
 */
const axiosInstance = axios.create({
  baseURL: API_URL + API_PREFIX,
  withCredentials: true, // Important: enables cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Ensure CSRF cookie is set before login/register
 * Sanctum exposes this route without the /api prefix, so call it on the raw API URL.
 */
export const ensureCsrf = async () => {
  try {
    await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
  } catch (error) {
    console.error('Failed to fetch CSRF cookie:', error);
    throw error;
  }
};

export default axiosInstance;

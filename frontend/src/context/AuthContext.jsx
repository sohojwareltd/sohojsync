import React, { createContext, useState, useEffect } from 'react';
import axiosInstance, { ensureCsrf } from '../utils/axiosInstance';

export const AuthContext = createContext(null);

/**
 * AuthProvider
 * 
 * Manages authentication state and operations:
 * - User login/logout
 * - Current user retrieval
 * - Loading state during authentication checks
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch the currently authenticated user
   */
  const fetchUser = async () => {
    try {
      const response = await axiosInstance.get('/me');
      setUser(response.data);
    } catch (error) {
      // User is not authenticated (401) or other error - silently set to null
      // Don't log 401 errors as they're expected when not logged in
      if (error.response?.status !== 401) {
        console.error('Error fetching user:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email and password
   * @param {Object} credentials - { email, password, remember }
   */
  const login = async (credentials) => {
    try {
      // Ensure CSRF cookie is set before login
      await ensureCsrf();
      
      // Attempt login
      const response = await axiosInstance.post('/login', credentials);
      setUser(response.data);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  /**
   * Register a new user
   * @param {Object} data - { name, email, password, password_confirmation }
   */
  const register = async (data) => {
    try {
      // Ensure CSRF cookie is set before registration
      await ensureCsrf();
      
      // Attempt registration
      const response = await axiosInstance.post('/register', data);
      setUser(response.data);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Check if user is authenticated on mount
  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

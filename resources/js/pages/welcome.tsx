import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

/**
 * Login Page
 * Handles user authentication
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fillDemo = (email) => {
    setFormData({ email, password: 'password', remember: false });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await login(formData);
    
    setLoading(false);

    if (result.success) {
      // Redirect based on user role
      const user = result.user;
      let rolePrefix = '/admin';
      
      if (user.role === 'project_manager') {
        rolePrefix = '/manager';
      } else if (user.role === 'developer') {
        rolePrefix = '/developer';
      } else if (user.role === 'client') {
        rolePrefix = '/client';
      }
      
      // Use window.location for immediate redirect to ensure state is updated
      window.location.href = `${rolePrefix}/dashboard`;
    } else {
      setErrors({ general: result.error });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{background: '#f5f6fa'}}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Minimalist Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Simple Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4" style={{background: 'rgb(89, 86, 157)'}}>
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">SohojSync</h1>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm flex items-center">
              <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {errors.general}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            error={errors.email}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            error={errors.password}
          />

          {/* Remember me checkbox */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-4 h-4 border-gray-300 rounded focus:ring-2"
              style={{accentColor: 'rgb(89, 86, 157)'}}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{background: 'rgb(89, 86, 157)'}}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Demo Accounts</p>
            
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fillDemo('admin@example.com')}>
                <p className="text-xs font-semibold text-gray-700 mb-1">👑 Admin</p>
                <p className="text-xs text-gray-600">admin@example.com • password</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fillDemo('manager@example.com')}>
                <p className="text-xs font-semibold text-gray-700 mb-1">👔 Manager</p>
                <p className="text-xs text-gray-600">manager@example.com • password</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fillDemo('member@example.com')}>
                <p className="text-xs font-semibold text-gray-700 mb-1">👤 Member</p>
                <p className="text-xs text-gray-600">member@example.com • password</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => fillDemo('demo.client@sohojsync.com')}>
                <p className="text-xs font-semibold text-gray-700 mb-1">💼 Client</p>
                <p className="text-xs text-gray-600">demo.client@sohojsync.com • password</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

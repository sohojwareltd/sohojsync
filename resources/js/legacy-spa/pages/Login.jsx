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
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-md relative z-10">
        {/* Clean card with subtle shadow */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          {/* Logo with animation */}
          <div className="mb-8 flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300" style={{background: '#59569d'}}></div>
              <div className="relative w-12 h-12 rounded-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-105" style={{background: '#59569d'}}>
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{color: '#59569d'}}>SohojSync</h1>
              <p className="text-gray-500 text-sm">Welcome back!</p>
            </div>
          </div>

          {/* Error message with animation */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
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
              className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 transition-all"
              style={{accentColor: '#59569d'}}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl overflow-hidden group"
              style={{background: 'linear-gradient(135deg, #59569d, #8b86d4)'}}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <span className="relative flex items-center justify-center gap-2">
                {loading && (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Signing in...' : 'Sign In'}
              </span>
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Demo Credentials</p>
              <span className="text-xs text-gray-400">Click to fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin@sync.sohojware.dev')}
                className="w-full relative p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border transition-all duration-200 transform hover:scale-[1.01] active:scale-95 text-sm"
                style={{
                  borderColor: formData.email === 'admin@sync.sohojware.dev' ? '#59569d' : '#e5e7eb',
                  backgroundColor: formData.email === 'admin@sync.sohojware.dev' ? '#f8f6ff' : ''
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👑</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Admin Manager</p>
                    <p className="text-[11px] text-gray-500 leading-tight">admin@sync.sohojware.dev</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('raj.khan@company.com')}
                className="w-full relative p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border transition-all duration-200 transform hover:scale-[1.01] active:scale-95 text-sm"
                style={{
                  borderColor: formData.email === 'raj.khan@company.com' ? '#59569d' : '#e5e7eb',
                  backgroundColor: formData.email === 'raj.khan@company.com' ? '#f8f6ff' : ''
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👔</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Raja Khan (PM)</p>
                    <p className="text-[11px] text-gray-500 leading-tight">raj.khan@company.com</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('priya.singh@company.com')}
                className="w-full relative p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border transition-all duration-200 transform hover:scale-[1.01] active:scale-95 text-sm"
                style={{
                  borderColor: formData.email === 'priya.singh@company.com' ? '#59569d' : '#e5e7eb',
                  backgroundColor: formData.email === 'priya.singh@company.com' ? '#f8f6ff' : ''
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">👩‍💼</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Priya Singh (PM)</p>
                    <p className="text-[11px] text-gray-500 leading-tight">priya.singh@company.com</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('ahmed@company.com')}
                className="w-full relative p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border transition-all duration-200 transform hover:scale-[1.01] active:scale-95 text-sm"
                style={{
                  borderColor: formData.email === 'ahmed@company.com' ? '#59569d' : '#e5e7eb',
                  backgroundColor: formData.email === 'ahmed@company.com' ? '#f8f6ff' : ''
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💻</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Ahmed Hassan</p>
                    <p className="text-[11px] text-gray-500 leading-tight">ahmed@company.com</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('contact@techinnovations.com')}
                className="col-span-2 w-full relative p-3 text-left bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border transition-all duration-200 transform hover:scale-[1.01] active:scale-95 text-sm"
                style={{
                  borderColor: formData.email === 'contact@techinnovations.com' ? '#59569d' : '#e5e7eb',
                  backgroundColor: formData.email === 'contact@techinnovations.com' ? '#f8f6ff' : ''
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🤝</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">Client Contact</p>
                    <p className="text-[11px] text-gray-500 leading-tight">contact@techinnovations.com</p>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-3 italic">
              All passwords: <span className="font-semibold text-gray-700">password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

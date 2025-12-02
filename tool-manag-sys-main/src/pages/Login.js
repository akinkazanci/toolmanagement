import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Shield, Server, LogIn, Globe } from 'lucide-react';
import logo from '../assets/daiichi-logo.png';
import { API_BASE_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';

const Login = ({ onLogin }) => {
  const { t, currentLanguage, toggleLanguage } = useLanguage();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const validateToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(token),
      });
      
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        const validationResult = await validateToken(data.data.token);
        
        if (validationResult) {
          const authData = {
            token: data.data.token,
            user: {
              id: validationResult.userId,
              username: validationResult.username,
              email: validationResult.email,
              firstName: validationResult.firstName,
              lastName: validationResult.lastName,
              roles: validationResult.roles,
              permissions: validationResult.permissions,
              organizationId: validationResult.organizationId,
              organizationName: validationResult.organizationName,
              detailedRoles: validationResult.detailedRoles,
              hasAdminRole: validationResult.hasAdminRole,
              hasUserRole: validationResult.hasUserRole,
              expiresAt: data.data.expiresAt
            }
          };

          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('authToken', authData.token);
          storage.setItem('userInfo', JSON.stringify(authData.user));
         
          onLogin(authData);
        } else {
          setError(t('token_validation_failed'));
        }
      } else {
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join(', '));
        } else {
          setError(t('login_failed'));
        }
      }
    } catch (err) {
      setError(t('connection_error'));
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Dil Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-20 p-2 bg-gray-800/70 hover:bg-gray-700 rounded-lg text-white flex items-center space-x-1"
        title={currentLanguage === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{currentLanguage === 'tr' ? 'TR' : 'EN'}</span>
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/10 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-500/10 rounded-lg rotate-12 animate-bounce delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Light effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Corporate Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 backdrop-blur-sm">
          <div className="flex flex-col justify-center px-12 xl:px-16 w-full">
            {/* Logo and Company Info */}
            <div className="mb-12">
              <img src={logo} alt="DAIICHI" className="h-16 w-auto mb-6" />
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4">
                {t('authorization_management_system')}
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                {t('manage_access_rights')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <img src={logo} alt="DAIICHI" className="h-12 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white">{t('system_login')}</h2>
              <p className="text-gray-400 mt-2">{t('secure_login_info')}</p>
            </div>

            {/* Desktop Form Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{t('welcome')}</h2>
              <p className="text-gray-400">{t('please_enter_credentials')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                data-testid="error-box"
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('username')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    data-testid="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('enter_username')}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    data-testid="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('enter_password')}
                    required
                  />
                  <button
                    type="button"
                    data-testid="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    data-testid="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">{t('remember_me')}</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t('forgot_password')}
                </button>
              </div>

              {/* Login Button */}
              <button
                data-testid="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{t('logging_in')}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    <span>{t('login')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center space-y-4">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span></span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span></span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {t('authorization_management_system')} v1 1.0
              </p>
              <p className="text-xs text-gray-500">
                © 2025 DAIICHI ELEKTRONIK SAN. VE TİC. A.Ş. Tüm hakları saklıdır.
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span></span>
                <span>•</span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default Login;

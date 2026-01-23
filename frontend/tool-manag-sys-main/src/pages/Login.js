import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, User, Shield, Server, LogIn, Globe } from 'lucide-react';
import Logo from '../components/Logo';
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

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    const savedUsername = localStorage.getItem('rememberedUsername') || '';
    if (savedRememberMe && savedUsername) {
      setFormData(prev => ({
        ...prev,
        username: savedUsername
      }));
      setRememberMe(true);
    }
  }, []);

  const handleForgotPasswordClick = () => {
    const to = 'ITDepartment@daiichi.com';
    const subject = encodeURIComponent('Şifremi Unuttum - Yetki Yönetim Sistemi');
    const bodyLines = [
      'Merhaba Bilgi İşlem Ekibi,',
      '',
      'Sistem şifremi unuttum, yardım rica ediyorum.',
      `Kullanıcı adım: ${formData.username || ''}`,
      '',
      'Teşekkürler.'
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

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
          if (rememberMe) {
            localStorage.setItem('rememberedUsername', formData.username);
            localStorage.setItem('rememberMe', 'true');
          } else {
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberMe');
          }
         
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Dil Toggle */}
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white rounded-lg text-slate-700 shadow-sm border border-slate-200 flex items-center space-x-1 transition-colors"
        title={currentLanguage === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{currentLanguage === 'tr' ? 'TR' : 'EN'}</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Panel - Corporate Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 bg-slate-300 border-r border-slate-400">
          <div className="flex flex-col justify-center px-12 xl:px-16 w-full">
            {/* Logo and Company Info */}
            <div className="mb-12">
              <Logo alt="DAIICHI" className="h-16 w-auto mb-6 mix-blend-multiply" />
              <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 mb-4">
                {t('authorization_management_system')}
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                {t('manage_access_rights')}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-slate-300">
          {/* Dynamic Background for Right Panel */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-slate-300"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-slate-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-zinc-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Logo alt="DAIICHI" className="h-12 w-auto mx-auto mb-4 mix-blend-multiply" />
              <h2 className="text-2xl font-bold text-gray-900">{t('system_login')}</h2>
              <p className="text-gray-600 mt-2">{t('secure_login_info')}</p>
            </div>

            {/* Desktop Form Header */}
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('welcome')}</h2>
              <p className="text-gray-600">{t('please_enter_credentials')}</p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                data-testid="error-box"
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('enter_username')}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('enter_password')}
                    required
                  />
                  <button
                    type="button"
                    data-testid="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-700">{t('remember_me')}</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('forgot_password')}
                </button>
              </div>

              {/* Login Button */}
              <button
                data-testid="login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
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
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
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
                {t('authorization_management_system')} v1.0
              </p>
              <p className="text-xs text-gray-500">
                © 2025 DAIICHI ELEKTRONIK SAN. VE TİC. A.Ş. Tüm hakları saklıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

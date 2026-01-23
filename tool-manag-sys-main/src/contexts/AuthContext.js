import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        const { token, username: userName, fullName, email, roles } = data.data;
        
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', token);
        setToken(token);
        
        // User bilgilerini state'e kaydet
        setUser({
          username: userName,
          fullName,
          email,
          roles,
        });

        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  };



  // Logout function
  const logout = async () => {
    try {
      // Backend'e logout isteği gönder
      if (token && token !== 'emergency-bypass-token') {
        await fetch(`${API_BASE_URL}/Auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Her durumda local state'i temizle
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Token validation function
  const validateToken = async (tokenToValidate) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/validate-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenToValidate || token),
      });

      const data = await response.json();

      if (data.success) {
        const { userId, username, roles, detailedRoles } = data.data;
        
        setUser({
          userId,
          username,
          roles,
          detailedRoles,
          hasAdminRole: data.data.hasAdminRole,
          hasUserRole: data.data.hasUserRole,
        });

        return { success: true, data: data.data };
      } else {
        // Token geçersiz, logout yap
        logout();
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
      return { success: false, error: 'Token validation failed' };
    }
  };



  // Sayfa yüklendiğinde token'ı kontrol et
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        await validateToken(token);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    validateToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

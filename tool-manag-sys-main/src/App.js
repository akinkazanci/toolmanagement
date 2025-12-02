import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import Login from './pages/Login';
import OrganizationManagement from './pages/OrganizationManagement';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Applications from './pages/Applications';
import Authentications from './pages/Authentications';
import UserManagement from './pages/UserManagement';
import AccessManagement from './pages/AccessManagement';
import ProjectManagement from './pages/ProjectManagement';
import YetkiTalep from './pages/YetkiTalep';
import OnayaGonder from './pages/OnayaGonder';
import Certificates from './pages/Certificates';
import Monitoring from './pages/Monitoring';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [currentPage, setCurrentPage] = useState('user-management');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Token validation function
  const validateToken = async (token) => {
    try {
      const response = await fetch('https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/Auth/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(token)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          isValid: true,
          data: data.data
        };
      } else {
        return {
          isValid: false,
          error: data.message
        };
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return {
        isValid: false,
        error: 'Network error during token validation'
      };
    }
  };

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
      
      if (token && userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          
          // Check if token is expired
          if (parsedUser.expiresAt && new Date(parsedUser.expiresAt) > new Date()) {
            // Validate token with API
            const validation = await validateToken(token);
            
            if (validation.isValid) {
              // Update user info with latest data from API
              const updatedUser = {
                ...parsedUser,
                userId: validation.data.userId,
                detailedRoles: validation.data.detailedRoles,
                hasAdminRole: validation.data.hasAdminRole,
                hasUserRole: validation.data.hasUserRole
              };
              
              setUser(updatedUser);
              setIsAuthenticated(true);
              
              // Update stored user info
              const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
              storage.setItem('userInfo', JSON.stringify(updatedUser));
            } else {
              console.log('Token validation failed:', validation.error);
              clearAuthData();
            }
          } else {
            console.log('Token expired');
            clearAuthData();
          }
        } catch (error) {
          console.error('Error parsing user info:', error);
          clearAuthData();
        }
      }
      setIsLoading(false);
    };

    const clearAuthData = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userInfo');
      sessionStorage.removeItem('token');
    };

    checkAuth();
  }, []);

  const handleLogin = (authData) => {
    setUser(authData.user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token');
    
    // API'ye logout isteği gönder
    if (token) {
      try {
        await fetch('https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/Auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }

    // Clear all stored data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userInfo');
    sessionStorage.removeItem('token');
    
    setUser(null);
    setIsAuthenticated(false);
    // Logout sonrasında default sayfayı kullanıcı yönetimine ayarla
    setCurrentPage('user-management');
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'activity':
        return <Activity />;
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'applications':
        return <Applications user={user} />;
      case 'authentications':
        return <Authentications user={user} />;
      case 'organizations':
        return <OrganizationManagement user={user} />;
      case 'user-management':
        return <UserManagement user={user} />;
      case 'onaya-gonder':
        return null;
      case 'access-management':
        return <AccessManagement user={user} />;
      case 'project-management':
        return <ProjectManagement user={user} />;
      case 'yetki-talep':
        return <YetkiTalep user={user} />;
      case 'certificates':
        return <Certificates />;
      case 'monitoring':
        return <Monitoring />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <UserManagement user={user} />;
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Verifying authentication...</p>
            </div>
          </div>
        </LanguageProvider>
      </AuthProvider>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthProvider>
        <LanguageProvider>
          <Login onLogin={handleLogin} />
        </LanguageProvider>
      </AuthProvider>
    );
  }

  // Show main application if authenticated
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="App">
          <Layout 
            onPageChange={setCurrentPage} 
            currentPage={currentPage}
            user={user}
            onLogout={handleLogout}
          >
            {renderPage()}
          </Layout>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

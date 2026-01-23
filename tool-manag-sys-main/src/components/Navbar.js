import React, { useState, useEffect } from 'react';
import { 
  Search,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Sun,
  Moon,
  Globe
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ onMenuToggle, isDarkMode, onThemeToggle, user, onLogout, onPageChange }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { currentLanguage, toggleLanguage, t } = useLanguage();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, title: 'New user registered', time: '2 min ago', unread: true },
    { id: 2, title: 'System update completed', time: '1 hour ago', unread: true },
    { id: 3, title: 'Backup completed successfully', time: '3 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = async () => {
    setShowUserMenu(false);
    await onLogout();
  };

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-l border-gray-600 px-4 py-3 flex items-center justify-between shadow-lg">
      
      {/* Left Side */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors lg:hidden text-white"
        >
          <Menu size={20} />
        </button>


      </div>

      {/* Right Side */}
      <div className="flex items-center space-x-4">
        
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-white flex items-center space-x-1"
          title={currentLanguage === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
        >
          <Globe size={16} />
          <span className="text-sm font-medium">
            {currentLanguage === 'tr' ? 'TR' : 'EN'}
          </span>
        </button>

        {/* Theme Toggle */}
     

        {/* Notifications removed */}

        {/* User Menu */}
        <div className="relative dropdown-container">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-300">
                {user?.hasAdminRole ? t('administrator') : user?.roles?.join(', ') || t('user')}
              </p>
            </div>
            <ChevronDown size={16} className="text-gray-300" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="mr-3" />
                  {t('sign_out')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;

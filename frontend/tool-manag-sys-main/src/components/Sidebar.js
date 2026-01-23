import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Home,
  Grid3X3,
  Shield,
  Building2,
  Users,
  Award,
  Monitor,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Globe
} from 'lucide-react';
import Logo from './Logo';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ activeItem, onItemClick, isCollapsed, onToggleCollapse, user, onLogout }) => {
  const { t, toggleLanguage, currentLanguage } = useLanguage();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const userInfoRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        userInfoRef.current &&
        !userInfoRef.current.contains(e.target)
      ) {
        setShowUserInfo(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home, enabled: true },
    //{ id: 'activity', label: t('activity'), icon: Activity, enabled: false }, // Disabled
    { id: 'user-management', label: t('user_management'), icon: Users, enabled: true },
    // { id: 'onaya-gonder', label: 'Onaya Gönder', icon: FileText, enabled: true },
    { id: 'access-management', label: t('access_management'), icon: Shield, enabled: true },
    //{ id: 'yetki-talep', label: 'Yetki Talep', icon: FileText, enabled: true },
    //{ id: 'authentications', label: t('authentications'), icon: Shield, enabled: false },
    //{ id: 'organizations', label: t('organization_management'), icon: Building2, enabled: true },
   
    //{ id: 'certificates', label: t('certificates'), icon: Award, enabled: false }, // Disabled
    //{ id: 'monitoring', label: t('monitoring'), icon: Monitor, enabled: false }, // Disabled
    //{ id: 'applications', label: t('applications'), icon: Grid3X3, enabled: true },
    { id: 'settings', label: t('settings'), icon: Settings, enabled: true },
  ];
 
  const handleItemClick = (item) => {
    if (item.enabled) {
      onItemClick(item.id);
    }
  };
 
  return (
    <div className={`bg-slate-300 text-slate-900 border-r border-slate-400 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
     
      {/* Header - Navbar ile aynı yükseklikte */}
      <div className="px-4 py-3 border-b border-slate-400 h-[76px] flex items-center bg-slate-300">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed ? (
            <div className="flex items-center">
              <Logo className="h-8 w-auto mr-3 mix-blend-multiply" />
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <button
                onClick={onToggleCollapse}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-800"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
         
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-800"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isDisabled = !item.enabled;
           
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={isDisabled}
                  className={`w-full flex items-center transition-all duration-200 rounded-lg ${
                    isCollapsed
                      ? 'justify-center p-3'
                      : 'px-3 py-3'
                  } ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed text-slate-400'
                      : isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-900 hover:bg-slate-200'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                  {isDisabled && !isCollapsed && (
                    <span className="ml-auto text-xs text-slate-400">(Soon)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
 
      {/* Footer */}
      <div className={`border-t border-slate-400 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <div className={`flex ${isCollapsed ? 'flex-col space-y-4 items-center' : 'flex-col space-y-3'} relative`}>
          
          {/* User Info */}
          <div
            ref={userInfoRef}
            className={`flex items-center ${isCollapsed ? 'justify-center' : ''} cursor-pointer`}
            onClick={() => setShowUserInfo((v) => !v)}
            title={t('user')}
          >
            <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Users size={16} className="text-slate-800" />
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.fullName || user?.username || 'User'}
                </p>
                {user?.email && (
                  <p className="text-xs text-slate-700/70 truncate">
                    {user.email}
                  </p>
                )}
                {user?.hasAdminRole && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white mt-1">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>
          
          {showUserInfo && (
            <div
              ref={popoverRef}
              className={`absolute ${isCollapsed ? 'left-4' : 'left-4'} bottom-20 z-50 w-64 bg-white border border-slate-200 rounded-lg shadow-xl`}
            >
              <div className="p-3 border-b border-slate-200 flex items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-2">
                  <Users size={16} className="text-slate-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {user?.fullName || user?.username || 'User'}
                  </div>
                  {user?.email && (
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                  )}
                </div>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">{t('department')}</span>
                  <span className="text-xs font-semibold text-slate-800">{user?.department || t('notSpecified')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">{t('location')}</span>
                  <span className="text-xs font-semibold text-slate-800">{user?.location || t('notSpecified')}</span>
                </div>
                {user?.hasAdminRole && (
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">{t('administrator')}</span>
                    <span className="text-xs font-semibold text-blue-700">Yes</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-2' : 'justify-between pt-2 border-t border-slate-400/50'}`}>
             <button
                onClick={toggleLanguage}
                className={`p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-800 flex items-center ${!isCollapsed ? 'space-x-2' : ''}`}
                title={currentLanguage === 'tr' ? 'Switch to English' : 'Türkçeye Geç'}
             >
                <Globe size={20} />
                {!isCollapsed && <span className="text-sm font-medium">{currentLanguage === 'tr' ? 'TR' : 'EN'}</span>}
             </button>

             <button
                onClick={onLogout}
                className={`p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center ${!isCollapsed ? 'space-x-2' : ''}`}
                title={t('sign_out')}
             >
                <LogOut size={20} />
                {!isCollapsed && <span className="text-sm font-medium">{t('sign_out')}</span>}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

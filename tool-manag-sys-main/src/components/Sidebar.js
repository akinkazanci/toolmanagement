import React from 'react';
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
  FileText
} from 'lucide-react';
import daichiLogo from '../assets/daiichi-logo.png';
import { useLanguage } from '../contexts/LanguageContext';
 
const Sidebar = ({ activeItem, onItemClick, isCollapsed, onToggleCollapse, user }) => {
  const { t } = useLanguage();
  
  const menuItems = [
    //{ id: 'dashboard', label: t('dashboard'), icon: Home, enabled: true },
    //{ id: 'activity', label: t('activity'), icon: Activity, enabled: false }, // Disabled
    { id: 'user-management', label: t('user_management'), icon: Users, enabled: true },
    // { id: 'onaya-gonder', label: 'Onaya Gönder', icon: FileText, enabled: true },
    { id: 'access-management', label: t('access_management'), icon: Shield, enabled: true },
    { id: 'project-management', label: t('project_management'), icon: FileText, enabled: true },
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
    <div className={`bg-gray-900 text-white transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    } min-h-screen flex flex-col`}>
     
      {/* Header - Navbar ile aynı yükseklikte */}
      <div className="px-4 py-3 border-b border-gray-700 h-[76px] flex items-center">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed ? (
            <div className="flex items-center">
              <img
                src={daichiLogo}
                alt="Daiichi Logo"
                className="h-8 w-auto mr-3"
              />
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <button
                onClick={onToggleCollapse}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
         
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
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
                      ? 'text-gray-500 cursor-not-allowed opacity-50'
                      : isActive
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                  {isDisabled && !isCollapsed && (
                    <span className="ml-auto text-xs text-gray-500">(Soon)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
 
      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
              <Users size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-400">
                {user?.email || 'user@company.com'}
              </p>
              {user?.hasAdminRole && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-600 text-white mt-1">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default Sidebar;

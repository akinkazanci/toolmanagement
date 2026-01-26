import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Building2, 
  MapPin, 
  Grid3X3,
  Loader2,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    byDepartment: {},
    byLocation: {},
    byApplication: {},
    applications: []
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch Users
        const usersResponse = await fetch(`${API_BASE_URL}/Users`, { headers: getAuthHeaders() });
        const usersData = await usersResponse.json();

        // Fetch Applications
        const appsResponse = await fetch(`${API_BASE_URL}/Applications`, { headers: getAuthHeaders() });
        const appsData = await appsResponse.json();

        // Process Data
        const active = usersData.filter(u => u.status === 'Active' || u.isActive === true || u.status === 'Aktif').length;
        const inactive = usersData.length - active; // Simplification, or filter specifically
        
        // Department Distribution
        const depts = {};
        usersData.forEach(u => {
          const dept = u.department || 'Other';
          depts[dept] = (depts[dept] || 0) + 1;
        });

        // Location Distribution
        const locs = {};
        usersData.forEach(u => {
          const loc = u.location || 'Other';
          locs[loc] = (locs[loc] || 0) + 1;
        });

        // Application Distribution
        const appsDist = {};
        appsData.forEach(a => {
          const name = a.appName || 'Uygulama';
          const count = a.userRoleCount || 0;
          appsDist[name] = (appsDist[name] || 0) + count;
        });

        setStats({
          totalUsers: usersData.length,
          activeUsers: active,
          inactiveUsers: inactive,
          byDepartment: depts,
          byLocation: locs,
          byApplication: appsDist,
          applications: appsData
        });

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  // Helper for max value in distribution to calculate bar width
  const getMaxCount = (obj) => Math.max(...Object.values(obj), 1);

  const COLORS = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#EF4444', // red-500
    '#8B5CF6', // violet-500
    '#EC4899', // pink-500
    '#06B6D4', // cyan-500
    '#6366F1', // indigo-500
  ];

  const renderDistributionCard = (title, icon, data) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    const items = Object.entries(data)
      .sort(([, a], [, b]) => b - a) // Sort by count desc
      .map(([label, value], index) => ({
        label,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
        color: COLORS[index % COLORS.length]
      }));

    // Create conic gradient
    let currentDeg = 0;
    const gradientParts = items.map(item => {
      const deg = (item.value / total) * 360;
      const part = `${item.color} ${currentDeg}deg ${currentDeg + deg}deg`;
      currentDeg += deg;
      return part;
    });
    const gradient = items.length > 0 
      ? `conic-gradient(${gradientParts.join(', ')})` 
      : 'conic-gradient(#e2e8f0 0deg 360deg)';

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
        <div className="flex items-center mb-6 pb-4 border-b border-slate-100">
          {icon}
          <h3 className="text-lg font-semibold text-slate-800 ml-2">{title}</h3>
        </div>

        <div className="flex flex-col xl:flex-row items-center gap-8">
          {/* Donut Chart */}
          <div className="relative w-48 h-48 flex-shrink-0">
             {/* Gradient Circle */}
            <div 
              className="w-full h-full rounded-full transition-all duration-1000 ease-out"
              style={{ background: gradient }}
            />
            {/* Inner White Circle (Donut hole) */}
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col shadow-inner">
               <span className="text-3xl font-bold text-slate-800">{total}</span>
               <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{t('total')}</span>
            </div>
          </div>

          {/* Legend / List */}
          <div className="flex-1 w-full space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item) => (
              <div key={item.label} className="group">
                <div className="flex justify-between items-center mb-1.5 text-sm">
                  <div className="flex items-center">
                    <span 
                      className="w-3 h-3 rounded-full mr-2 shadow-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-slate-800">{item.value}</span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full min-w-[3rem] text-center">
                      %{item.percentage}
                    </span>
                  </div>
                </div>
                {/* Progress bar visual for extra clarity */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <PieChart size={32} className="mb-2 opacity-50" />
                <p className="text-sm">{t('no_data')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('dashboard')}</h1>
          <p className="text-xl text-slate-600">{t('dashboard_description')}</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center transition-transform hover:scale-[1.02] duration-200">
          <div className="p-4 bg-blue-50 rounded-xl mr-4 border border-blue-100">
            <Users className="text-blue-600" size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{t('total_personnel')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.totalUsers}</h3>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center transition-transform hover:scale-[1.02] duration-200">
          <div className="p-4 bg-emerald-50 rounded-xl mr-4 border border-emerald-100">
            <CheckCircle className="text-emerald-600" size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{t('active_personnel')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.activeUsers}</h3>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center transition-transform hover:scale-[1.02] duration-200">
          <div className="p-4 bg-red-50 rounded-xl mr-4 border border-red-100">
            <XCircle className="text-red-600" size={32} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{t('inactive_personnel')}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stats.inactiveUsers}</h3>
          </div>
        </div>
      </div>

      {/* Middle Section: Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {renderDistributionCard(
          t('department_distribution'), 
          <Building2 className="text-blue-500" size={24} />, 
          stats.byDepartment
        )}
        {renderDistributionCard(
          t('location_distribution'), 
          <MapPin className="text-emerald-500" size={24} />, 
          stats.byLocation
        )}
        {renderDistributionCard(
          t('application_distribution'),
          <Grid3X3 className="text-indigo-500" size={24} />,
          stats.byApplication
        )}
      </div>
    </div>
  );
};

export default Dashboard;

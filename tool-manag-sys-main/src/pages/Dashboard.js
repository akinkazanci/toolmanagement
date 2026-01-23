import React, { useEffect } from 'react';
import { 
  Users, 
  Building2, 
  Award, 
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');

    if (!token || !userInfo || !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const stats = [
    {
      title: 'Total Organizations',
      value: '12',
      change: '+2.5%',
      trend: 'up',
      icon: Building2,
      color: 'blue'
    },
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Active Certificates',
      value: '89',
      change: '-2.1%',
      trend: 'down',
      icon: Award,
      color: 'yellow'
    },
    {
      title: 'System Activity',
      value: '98.5%',
      change: '+0.8%',
      trend: 'up',
      icon: Activity,
      color: 'purple'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const trendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';

          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon size={24} className={`text-${stat.color}-600 mr-3`} />
                  <h3 className="text-gray-900 font-medium">{stat.title}</h3>
                </div>
                <span className={`flex items-center ${trendColor}`}>
                  {React.createElement(trendIcon, { size: 16, className: 'mr-1' })}
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <BarChart3 size={20} className="text-gray-600" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Users size={24} className="text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Users</h4>
            <p className="text-sm text-gray-500">Add or edit user accounts</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Building2 size={24} className="text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Organizations</h4>
            <p className="text-sm text-gray-500">Add or edit organizations</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Award size={24} className="text-yellow-600 mb-2" />
            <h4 className="font-medium text-gray-900">Issue Certificate</h4>
            <p className="text-sm text-gray-500">Generate new certificates</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

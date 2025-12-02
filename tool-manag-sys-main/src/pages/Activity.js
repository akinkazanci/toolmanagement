import React from 'react';
import { Activity as ActivityIcon, Clock, User, Calendar } from 'lucide-react';

const Activity = () => {
  const activities = [
    {
      id: 1,
      type: 'user_login',
      user: 'John Doe',
      action: 'Logged into the system',
      timestamp: '2024-01-15 10:30:00',
      status: 'success'
    },
    {
      id: 2,
      type: 'org_update',
      user: 'Jane Smith',
      action: 'Updated organization structure',
      timestamp: '2024-01-15 09:15:00',
      status: 'success'
    },
    {
      id: 3,
      type: 'cert_issue',
      user: 'Mike Johnson',
      action: 'Issued new certificate',
      timestamp: '2024-01-15 08:45:00',
      status: 'success'
    },
    {
      id: 4,
      type: 'login_failed',
      user: 'Unknown User',
      action: 'Failed login attempt',
      timestamp: '2024-01-15 08:30:00',
      status: 'error'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <ActivityIcon size={24} className="text-blue-600 mr-3" />
            <h2 className="text-lg font-semibold">Recent Activities</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">by {activity.user}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Calendar size={12} className="mr-1" />
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activity;

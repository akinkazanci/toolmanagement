import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Key,
  Bell,
  Globe,
  Clock,
  Award
} from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);

  // Mock user data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const userData = {
        id: 1,
        fullName: 'Haydar Doğanyılmaz',
        username: 'haydar.doganyilmaz',
        email: 'haydar.doganyilmaz@daiichi.com.tr',
        phone: '+90 532 123 45 67',
        department: 'IT Department',
        position: 'System Administrator',
        location: 'Istanbul, Turkey',
        joinDate: '2023-01-15',
        lastLogin: '2024-01-15 14:30',
        roles: ['Admin', 'User Manager'],
        permissions: ['Read', 'Write', 'Execute', 'Admin'],
        avatar: null,
        bio: 'Experienced system administrator with expertise in user management and system security.',
        preferences: {
          language: 'Turkish',
          timezone: 'Europe/Istanbul',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        }
      };
      setUser(userData);
      setEditForm(userData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/10 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-purple-500/10 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-500/10 rounded-lg rotate-12 animate-bounce animation-delay-4000"></div>
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                  <User className="h-6 w-6 text-blue-300" />
                </div>
                <h1 className="text-2xl font-bold text-white">Profile</h1>
              </div>
              <p className="text-gray-300">Manage your personal information and preferences</p>
            </div>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm transition-all"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="bg-gray-600/80 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm transition-all"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm transition-all disabled:opacity-50"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6">
              {/* Avatar Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={48} className="text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors">
                      <Camera size={16} />
                    </button>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{user?.fullName}</h2>
                <p className="text-gray-300 mb-2">@{user?.username}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {user?.roles?.map((role, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">Joined</span>
                  </div>
                  <span className="text-white text-sm">{new Date(user?.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">Last Login</span>
                  </div>
                  <span className="text-white text-sm">{user?.lastLogin}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">Permissions</span>
                  </div>
                  <span className="text-white text-sm">{user?.permissions?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-blue-300" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{user?.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                  <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{user?.username}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      {user?.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      {user?.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{user?.department}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.position || ''}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                      <Award size={16} className="text-gray-400" />
                      {user?.position}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      {user?.location}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
                    />
                  ) : (
                    <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{user?.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security & Permissions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={20} className="text-green-300" />
                Security & Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {user?.roles?.map((role, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {user?.permissions?.map((permission, index) => (
                      <span key={index} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <button className="bg-yellow-600/80 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm transition-all">
                  <Key size={16} />
                  Change Password
                </button>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Globe size={20} className="text-cyan-300" />
                Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                  <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{user?.preferences?.language}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timezone</label>
                  <p className="text-white bg-white/5 px-3 py-2 rounded-lg">{user?.preferences?.timezone}</p>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">Notification Preferences</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-white">Email Notifications</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${user?.preferences?.notifications?.email ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${user?.preferences?.notifications?.email ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-gray-400" />
                      <span className="text-white">Push Notifications</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${user?.preferences?.notifications?.push ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${user?.preferences?.notifications?.push ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <span className="text-white">SMS Notifications</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${user?.preferences?.notifications?.sms ? 'bg-blue-600' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform mt-0.5 ${user?.preferences?.notifications?.sms ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

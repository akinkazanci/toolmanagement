import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Plus, 
  Search, 
  Trash2,
  Users,
  Edit,
  X,
  ChevronDown,
  List,
  AlertCircle,
  Save,
  Loader2,
  Calendar,
  Timer,
  UserCheck,
  Shield
} from 'lucide-react';

const ApplicationManagement = () => {
  // State Management
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('appName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL
  const API_BASE_URL = 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

  // Available Icons for Applications
  const availableIcons = [
    '🎯', '📊', '💬', '📝', '☁️', '🔶', '📈', '🔧', '⚙️', '🛠️',
    '📱', '💻', '🖥️', '📋', '🔍', '📧', '🔔', '📅', '🗂️', '🔐',
    '🔑', '🛡️', '🌐', '📡', '💾', '🗄️', '📤', '📥', '🔄', '⚡'
  ];

  // API Helper Functions
  const getAuthHeaders = () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  const handleApiError = async (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      try {
        const errorText = await error.response.text();
        console.error('Error Response Text:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return errorData.message || errorData.title || 'An error occurred';
        } catch (jsonError) {
          if (errorText.includes('Microsoft')) {
            return 'Server configuration error. Please contact administrator.';
          }
          return errorText || 'An error occurred';
        }
      } catch (textError) {
        console.error('Could not read error response:', textError);
      }
    }
    
    return error.message || 'An error occurred';
  };

  // Fetch Applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/Applications`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        error.response = response;
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (error) {
      const errorMessage = await handleApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create Application
  const createApplication = async (appData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create application');
      }

      const newApp = await response.json();
      return newApp;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  };

  // Update Application
  const updateApplication = async (appId, appData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Applications/${appId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(appData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update application');
      }

      const updatedApp = await response.json();
      return updatedApp;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  };

  // Delete Application
  const deleteApplication = async (appId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Applications/${appId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete application');
      }

      return true;
    } catch (error) {
      throw new Error(await handleApiError(error));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter and sort applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (app.description && app.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || app.appType === filterType;
    
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    let aValue = a[sortBy] || '';
    let bValue = b[sortBy] || '';
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  // Stats calculation
  const stats = {
    total: applications.length,
    totalPermissions: applications.reduce((sum, app) => sum + (app.permissionCount || 0), 0),
    totalUserRoles: applications.reduce((sum, app) => sum + (app.userRoleCount || 0), 0),
    appTypes: [...new Set(applications.map(app => app.appType))].length
  };

  // CRUD Operations
  const handleAddApplication = async (appData) => {
    try {
      await createApplication(appData);
      await fetchApplications();
      setShowAddModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditApplication = async (appData) => {
    try {
      await updateApplication(selectedApp.appId, appData);
      await fetchApplications();
      setShowEditModal(false);
      setSelectedApp(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await deleteApplication(appId);
        await fetchApplications();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Application Form Modal
  const ApplicationFormModal = ({ show, onClose, onSubmit, app = null, title }) => {
    const [formData, setFormData] = useState({
      appName: '',
      appType: 'Web',
      description: '',
      icon: '🔧'
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    useEffect(() => {
      if (app) {
        setFormData({
          appName: app.appName || '',
          appType: app.appType || 'Web',
          description: app.description || '',
          icon: app.icon || '🔧'
        });
      } else {
        setFormData({
          appName: '',
          appType: 'Web',
          description: '',
          icon: '🔧'
        });
      }
      setFormError(null);
    }, [app]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormLoading(true);
      setFormError(null);

      try {
        if (!formData.appName.trim()) {
          throw new Error('Application name is required');
        }

        await onSubmit(formData);
      } catch (error) {
        setFormError(error.message);
      } finally {
        setFormLoading(false);
      }
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          {formError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.appName}
                  onChange={(e) => setFormData({...formData, appName: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter application name"
                  disabled={formLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Type
                </label>
                <select
                  value={formData.appType}
                  onChange={(e) => setFormData({...formData, appType: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={formLoading}
                >
                  <option value="Web">Web Application</option>
                  <option value="Desktop">Desktop Application</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter application description"
                rows="3"
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Icon
              </label>
              <div className="grid grid-cols-10 gap-2 p-4 border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                {availableIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({...formData, icon})}
                    className={`p-2 text-2xl rounded-lg hover:bg-gray-100 transition-colors ${
                      formData.icon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'border border-gray-200'
                    }`}
                    disabled={formLoading}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Selected: {formData.icon}</p>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={formLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {formLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    {app ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {app ? 'Update' : 'Create'} Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Application Users Modal - Sade ve Modern Liste Tasarımı
  const ApplicationUsersModal = ({ show, onClose, app }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [editingRole, setEditingRole] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch application users
    const fetchApplicationUsers = async () => {
      if (!app) return;
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Applications/${app.appId}/users`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (error) {
        setError(await handleApiError(error));
      } finally {
        setLoading(false);
      }
    };

    const fetchAvailableUsers = async () => {
      if (!app) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/Applications/available-users/${app.appId}`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAvailableUsers(data);
      } catch (error) {
        console.error('Error fetching available users:', error);
      }
    };

    const fetchAvailableRoles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/Role`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAvailableRoles(data);
      } catch (error) {
        console.error('Error fetching available roles:', error);
      }
    };

    const removeUserRole = async (userRoleId) => {
      if (!window.confirm('Are you sure you want to remove this user role?')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/Applications/${app.appId}/remove-user/${userRoleId}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await fetchApplicationUsers();
      } catch (error) {
        setError(await handleApiError(error));
      }
    };

    const updateUserRole = async (userRoleId, newRoleId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/Applications/${app.appId}/update-user-role/${userRoleId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ roleId: newRoleId })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        await fetchApplicationUsers();
        setEditingRole(null);
      } catch (error) {
        setError(await handleApiError(error));
      }
    };

    const assignUserToApp = async (assignData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/Applications/${app.appId}/assign-user`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(assignData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to assign user');
        }

        await fetchApplicationUsers();
        await fetchAvailableUsers();
        setShowAssignModal(false);
      } catch (error) {
        setError(await handleApiError(error));
      }
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
      (user.fullName || user.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      user.roles.some(role => role.roleName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
      if (show && app) {
        fetchApplicationUsers();
        fetchAvailableUsers();
        fetchAvailableRoles();
      }
    }, [show, app]);

    if (!show || !app) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{app.icon || '🔧'}</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Application Users & Roles</h2>
                <p className="text-gray-600">{app.appName}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Controls */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users or roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {filteredUsers.length} users • {filteredUsers.reduce((sum, user) => sum + user.roles.length, 0)} total roles
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium"
              >
                <Plus size={16} className="mr-2" />
                Assign User
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <div key={user.userId} className="p-6 hover:bg-gray-50 transition-colors">
                    {/* User Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : user.username.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{user.fullName || user.username}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-500">
                            <span>@{user.username}</span>
                            {user.email && (
                              <>
                                <span>•</span>
                                <span>{user.email}</span>
                              </>
                            )}
                            {user.department && (
                              <>
                                <span>•</span>
                                <span>{user.department}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {user.roles.length} role{user.roles.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Roles Table */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">
                        Assigned Roles
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Role</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Permissions</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Assigned</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Expires</th>
                              <th className="text-left py-2 px-3 font-medium text-gray-600">Status</th>
                              <th className="text-center py-2 px-3 font-medium text-gray-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {user.roles.map(role => (
                              <tr key={role.userRoleId} className="border-b border-gray-100 hover:bg-white transition-colors">
                                <td className="py-3 px-3">
                                  {editingRole === role.userRoleId ? (
                                    <select
                                      defaultValue={role.roleId}
                                      onChange={(e) => updateUserRole(role.userRoleId, parseInt(e.target.value))}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      {availableRoles.map(availableRole => (
                                        <option key={availableRole.roleId} value={availableRole.roleId}>
                                          {availableRole.roleName}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div>
                                      <span className="font-medium text-gray-900">{role.roleName}</span>
                                      {role.description && (
                                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="text-gray-600">
                                    {role.permissions?.length || 0} permissions
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="text-gray-600">
                                    {role.assignedAt ? new Date(role.assignedAt).toLocaleDateString() : '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-sm ${role.isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                                    {role.expiresAt ? new Date(role.expiresAt).toLocaleDateString() : 'Never'}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    role.isExpired 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {role.isExpired ? 'Expired' : 'Active'}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center justify-center space-x-1">
                                    {editingRole === role.userRoleId ? (
                                      <button
                                        onClick={() => setEditingRole(null)}
                                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                        title="Cancel"
                                      >
                                        <X size={14} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setEditingRole(role.userRoleId)}
                                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Role"
                                      >
                                        <Edit size={14} />
                                      </button>
                                    )}
                                                                        <button
                                      onClick={() => removeUserRole(role.userRoleId)}
                                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                      title="Remove Role"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No users found' : 'No Users Assigned'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search criteria'
                    : 'No users have been assigned to this application yet.'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Assign First User
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {/* Assign User Modal */}
        {showAssignModal && (
          <AssignUserModal
            show={showAssignModal}
            onClose={() => setShowAssignModal(false)}
            onAssign={assignUserToApp}
            availableUsers={availableUsers}
            availableRoles={availableRoles}
            appName={app.appName}
          />
        )}
      </div>
    );
  };

  // Sade Assign User Modal
  const AssignUserModal = ({ show, onClose, onAssign, availableUsers, availableRoles, appName }) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        if (!selectedUserId || !selectedRoleId) {
          throw new Error('Please select both user and role');
        }

        const assignData = {
          userId: parseInt(selectedUserId),
          roleId: parseInt(selectedRoleId),
          expiresAt: expiresAt || null
        };

        await onAssign(assignData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const resetForm = () => {
      setSelectedUserId('');
      setSelectedRoleId('');
      setExpiresAt('');
      setError(null);
    };

    useEffect(() => {
      if (show) {
        resetForm();
      }
    }, [show]);

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assign User</h3>
              <p className="text-sm text-gray-600">to {appName}</p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Choose a user...</option>
                {availableUsers.map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName || user.username} ({user.username})
                    {user.email && ` - ${user.email}`}
                  </option>
                ))}
              </select>
              {availableUsers.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">No available users found</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role *
              </label>
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">Choose a role...</option>
                {availableRoles.map(role => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                    {role.description && ` - ${role.description}`}
                  </option>
                ))}
              </select>
              {availableRoles.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">No roles available</p>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for permanent assignment</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedUserId || !selectedRoleId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserCheck size={16} className="mr-2" />
                    Assign User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className='text-left'>
              <h1 className="text-3xl font-bold text-gray-900">Application Management</h1>
              <p className="mt-2 text-gray-600">Manage your applications and user permissions</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium shadow-sm"
              >
                <Plus size={16} className="mr-2" />
                Add Application
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle size={20} className="text-red-500 mr-3" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Apps</p>
                <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                <p className="text-xs text-blue-700 mt-1">
                  {stats.appTypes} types
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <Grid3X3 className="h-8 w-8 text-blue-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">User Roles</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalUserRoles}</p>
                <p className="text-xs text-green-700 mt-1">
                  Active assignments
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <Users className="h-8 w-8 text-green-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Permissions</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalPermissions}</p>
                <p className="text-xs text-purple-700 mt-1">
                  Total permissions
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-lg">
                <Shield className="h-8 w-8 text-purple-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">App Types</p>
                <p className="text-3xl font-bold text-orange-900">{stats.appTypes}</p>
                <p className="text-xs text-orange-700 mt-1">
                  Different types
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-lg">
                <Grid3X3 className="h-8 w-8 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-xl border shadow-sm mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                  />
                </div>
                
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Web">Web Application</option>
                  <option value="Desktop">Desktop Application</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="appName">Sort by Name</option>
                  <option value="appType">Sort by Type</option>
                  <option value="createdAt">Sort by Created Date</option>
                  <option value="updatedAt">Sort by Updated Date</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ChevronDown size={16} className={`transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Applications Content */}
          <div className="p-6">
            {filteredApplications.length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {paginatedApplications.map(app => (
                      <div key={app.appId} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
                        {/* App Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-3xl">{app.icon || '🔧'}</div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{app.appName}</h3>
                              <p className="text-sm text-gray-500">{app.appType}</p>
                            </div>
                          </div>
                        </div>

                        {/* App Details */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Permissions:</span>
                            <span className="font-medium">{app.permissionCount || 0}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">User Roles:</span>
                            <span className="font-medium">{app.userRoleCount || 0}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Created:</span>
                            <span className="text-gray-600">
                              {new Date(app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        {app.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 line-clamp-2">{app.description}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedApp(app);
                                setShowUsersModal(true);
                              }}
                              className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center transition-colors"
                            >
                              <Users size={14} className="mr-1" />
                              Users
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedApp(app);
                                setShowEditModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </button>
                          </div>
                          <button 
                            onClick={() => handleDeleteApplication(app.appId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center transition-colors"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Application
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Permissions
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Roles
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedApplications.map(app => (
                          <tr key={app.appId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-4">
                                <div className="text-2xl">{app.icon || '🔧'}</div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">{app.appName}</p>
                                  {app.description && (
                                    <p className="text-sm text-gray-500 truncate max-w-xs">{app.description}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 text-left">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {app.appType}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 text-left">
                              <span className="text-sm font-medium text-gray-900">{app.permissionCount || 0}</span>
                            </td>
                            
                            <td className="px-6 py-4 text-left">
                              <span className="text-sm font-medium text-gray-900">{app.userRoleCount || 0}</span>
                            </td>
                            
                            <td className="px-6 py-4 text-left">
                              <span className="text-sm text-gray-500">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4 text-left">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowUsersModal(true);
                                  }}
                                  className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                  title="Manage Users"
                                >
                                  <Users size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedApp(app);
                                    setShowEditModal(true);
                                  }}
                                  className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                  title="Edit Application"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteApplication(app.appId)}
                                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete Application"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApplications.length)} of {filteredApplications.length} applications
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Grid3X3 size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterType !== 'all'
                    ? 'No applications found' 
                    : 'No Applications Yet'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first application'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto transition-colors"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Your First Application
                  </button>
                )}
              </div>
            )}
          </div>  
        </div>
      </div>

      {/* Modals */}
      <ApplicationFormModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddApplication}
        title="Add New Application"
      />
      
      <ApplicationFormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedApp(null);
        }}
        onSubmit={handleEditApplication}
        app={selectedApp}
        title="Edit Application"
      />

      <ApplicationUsersModal
        show={showUsersModal}
        onClose={() => {
          setShowUsersModal(false);
          setSelectedApp(null);
        }}
        app={selectedApp}
      />
    </div>
  );
};

export default ApplicationManagement;

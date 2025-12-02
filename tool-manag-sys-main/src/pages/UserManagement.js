import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Crown, 
  Shield, 
  User, 
  X,
  Save,
  AlertCircle,
  Loader2,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MapPin,
  Building,
  Download,
  Eye,
  Settings,
  Lock,
  EyeOff,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';

const UserManagement = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDepartmentForExport, setSelectedDepartmentForExport] = useState('all');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showMultiApprovalModal, setShowMultiApprovalModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [addUserType, setAddUserType] = useState(null);

  // Excel benzeri başlık filtreleri için durumlar
  const [headerFilters, setHeaderFilters] = useState({
    userTerm: '',
    statuses: [],
    departments: [],
    locations: [],
    createdFrom: '',
    createdTo: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState({
    user: false,
    status: false,
    department: false,
    location: false,
    createdAt: false
  });

  const toggleFilterPanel = (key) => {
    setShowFilterPanel((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearHeaderFilter = (key) => {
    setHeaderFilters((prev) => {
      const next = { ...prev };
      if (key === 'user') next.userTerm = '';
      if (key === 'status') next.statuses = [];
      if (key === 'department') next.departments = [];
      if (key === 'location') next.locations = [];
      if (key === 'createdAt') { next.createdFrom = ''; next.createdTo = ''; }
      return next;
    });
  };

  const handleHeaderSort = (key) => {
    setSortBy(key);
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // API Base URL
  const API_BASE_URL = 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

  // API Helper Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return error.response?.data?.message || error.message || 'An error occurred';
  };

  // Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Users`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Roles for Profile
  const fetchUserRoles = async (userId) => {
    try {
      setProfileLoading(true);
      const response = await fetch(`${API_BASE_URL}/UserRole`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Filter roles for specific user
      const userSpecificRoles = data.filter(role => role.userId === userId);
      setUserRoles(userSpecificRoles);
    } catch (error) {
      console.error('User roles fetch error:', error);
      setUserRoles([]);
    } finally {
      setProfileLoading(false);
    }
  };

  // Open Profile Modal
  const openProfileModal = (user) => {
    setSelectedUserProfile(user);
    setShowProfileModal(true);
    fetchUserRoles(user.userId);
  };

  // Close Profile Modal
  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUserProfile(null);
    setUserRoles([]);
  };

  // Fetch Pending Users
  const fetchPendingUsers = async () => {
    try {
      setApprovalLoading(true);
      const response = await fetch(`${API_BASE_URL}/UserApproval/pending`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPendingUsers(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      setError(handleApiError(error));
    } finally {
      setApprovalLoading(false);
    }
  };

  // Fetch Roles
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Role`, { headers: getAuthHeaders() });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  // Approve User
  const approveUser = async (userId, approvalToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/UserApproval/approve?userId=${userId}&token=${approvalToken}&action=approve`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to approve user');
      }

      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Reject User
  const rejectUser = async (userId, approvalToken, reason = '') => {
    try {
      let url = `${API_BASE_URL}/UserApproval/approve?userId=${userId}&token=${approvalToken}&action=reject`;
      if (reason) {
        url += `&rejectionReason=${encodeURIComponent(reason)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reject user');
      }

      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Send Admin Notification
  const sendAdminNotification = async (adminEmail, adminName = 'Administrator') => {
    try {
      setNotificationLoading(true);
      const adminData = {
        adminEmail: adminEmail,
        adminName: adminName,
        approvalBaseUrl: `${window.location.origin}/api/UserApproval`
      };

      const response = await fetch(`${API_BASE_URL}/UserApproval/notify-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send notification');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(handleApiError(error));
    } finally {
      setNotificationLoading(false);
    }
  };

  // Create User
  const createUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Update User
  const updateUser = async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Delete User
  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      return true;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPendingUsers();
  }, []);

  // --- Dynamic options from users ---
  const departmentOptions = Array.from(
    new Set(users.map(u => (u.department || '').trim()).filter(Boolean))
  ).sort();

  const locationOptions = Array.from(
    new Set(users.map(u => (u.location || '').trim()).filter(Boolean))
  ).sort();

  // Filter + Search + Sort
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.fullName || '').toLowerCase().includes(q) ||
        (user.email || '').toLowerCase().includes(q) ||
        (user.username || '').toLowerCase().includes(q) ||
        (user.department || '').toLowerCase().includes(q) ||
        (user.location || '').toLowerCase().includes(q)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.roles?.some(r => r.roleName === filterRole));
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(u => (u.status || '').toLowerCase() === filterStatus);
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(u => (u.department || '').trim() === filterDepartment);
    }

    if (filterLocation !== 'all') {
      filtered = filtered.filter(u => (u.location || '').trim() === filterLocation);
    }

    // Başlık bazlı çoklu filtreler
    if (headerFilters.userTerm && headerFilters.userTerm.trim() !== '') {
      const qh = headerFilters.userTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.fullName || '').toLowerCase().includes(qh) ||
        (user.email || '').toLowerCase().includes(qh) ||
        (user.username || '').toLowerCase().includes(qh)
      );
    }

    if (Array.isArray(headerFilters.statuses) && headerFilters.statuses.length > 0) {
      const sset = new Set(headerFilters.statuses.map(s => s.toLowerCase()));
      filtered = filtered.filter(u => sset.has((u.status || '').toLowerCase()));
    }

    if (Array.isArray(headerFilters.departments) && headerFilters.departments.length > 0) {
      const dset = new Set(headerFilters.departments);
      filtered = filtered.filter(u => dset.has((u.department || '').trim()));
    }

    if (Array.isArray(headerFilters.locations) && headerFilters.locations.length > 0) {
      const lset = new Set(headerFilters.locations);
      filtered = filtered.filter(u => lset.has((u.location || '').trim()));
    }

    if (headerFilters.createdFrom || headerFilters.createdTo) {
      const from = headerFilters.createdFrom ? new Date(headerFilters.createdFrom) : null;
      const to = headerFilters.createdTo ? new Date(headerFilters.createdTo) : null;
      filtered = filtered.filter(u => {
        const d = new Date(u.createdAt || 0);
        if (from && d < from) return false;
        if (to) {
          const toEnd = new Date(to);
          toEnd.setHours(23,59,59,999);
          if (d > toEnd) return false;
        }
        return true;
      });
    }

    const collatorTr = new Intl.Collator('tr', { sensitivity: 'accent' });
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const cmp = collatorTr.compare(aValue, bValue);
        if (cmp < 0) return sortOrder === 'asc' ? -1 : 1;
        if (cmp > 0) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, filterRole, filterStatus, filterDepartment, filterLocation, sortBy, sortOrder, headerFilters]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Stats
  const stats = {
    total: users.length,
    active: users.filter(u => (u.status || '').toLowerCase() === 'active').length,
    inactive: users.filter(u => (u.status || '').toLowerCase() === 'inactive').length,
    pending: users.filter(u => (u.status || '').toLowerCase() === 'pending').length + pendingUsers.length,
    admins: users.filter(u => u.roles?.some(r => r.roleName === 'admin')).length,
    managers: users.filter(u => u.roles?.some(r => r.roleName === 'Manager')).length,
    regularUsers: users.filter(u => u.roles?.some(r => r.roleName === 'User')).length
  };

  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase();
    const badges = {
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle, text: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Inactive' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, text: 'Pending' }
    };
    const badge = badges[statusLower] || badges.active;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon size={12} className="mr-1.5" />
        {badge.text}
      </span>
    );
  };

  const getRoleBadge = (roleName) => {
    const badges = {
      Admin: { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Crown },
      Manager: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Shield },
      User: { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: User }
    };
    const badge = badges[roleName] || badges.User;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color} mr-1 mb-1`}>
        <Icon size={12} className="mr-1.5" />
        {roleName}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // CRUD handlers
  const handleAddUser = async (userData) => {
    try {
      await createUser(userData);
      await fetchUsers();
      setShowAddModal(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await updateUser(editingUser.userId, userData);
      await fetchUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      setError(error.message);
    }
  };

  // Excel Export Function
  const handleExportToExcel = () => {
    let dataToExport = users;
    
    // Filter by department if selected
    if (selectedDepartmentForExport !== 'all') {
      dataToExport = users.filter(user => 
        (user.department || '').trim() === selectedDepartmentForExport
      );
    }

    // Prepare data for Excel
    const excelData = dataToExport.map(user => ({
      'Ad Soyad': user.fullName || '',
      'Kullanıcı Adı': user.username || '',
      'E-posta': user.email || '',
      'Departman': user.department || '',
      'Lokasyon': user.location || '',
      'Durum': user.status || '',
      'Roller': user.roles?.map(role => role.roleName).join(', ') || '',
      'Oluşturma Tarihi': user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '',
      'Güncelleme Tarihi': user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('tr-TR') : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Ad Soyad
      { wch: 15 }, // Kullanıcı Adı
      { wch: 25 }, // E-posta
      { wch: 15 }, // Departman
      { wch: 15 }, // Lokasyon
      { wch: 10 }, // Durum
      { wch: 20 }, // Roller
      { wch: 15 }, // Oluşturma Tarihi
      { wch: 15 }  // Güncelleme Tarihi
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Kullanıcılar');

    // Generate filename
    const departmentText = selectedDepartmentForExport === 'all' ? 'Tum_Departmanlar' : selectedDepartmentForExport.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Kullanicilar_${departmentText}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    // Close modal
    setShowExportModal(false);
    setSelectedDepartmentForExport('all');
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        await fetchUsers();
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Approval operations
  const handleApproveUser = async (user) => {
    if (window.confirm(`Are you sure you want to approve ${user.fullName || user.username}?`)) {
      try {
        await approveUser(user.userId, user.approvalToken);
        await fetchPendingUsers();
        await fetchUsers();
        alert('User approved successfully!');
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleRejectUser = async (user, reason = '') => {
    const rejectionReason = reason || prompt('Please provide a reason for rejection (optional):') || '';
    if (window.confirm(`Are you sure you want to reject ${user.fullName || user.username}?`)) {
      try {
        await rejectUser(user.userId, user.approvalToken, rejectionReason);
        await fetchPendingUsers();
        await fetchUsers();
        alert('User rejected successfully!');
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Email Notification Modal
  const EmailNotificationModal = ({ show, onClose }) => {
    const [emailData, setEmailData] = useState({
      adminEmail: '',
      adminName: 'Administrator'
    });
    const [emailError, setEmailError] = useState(null);

    useEffect(() => {
      if (show) {
        setEmailData({
          adminEmail: '',
          adminName: 'Administrator'
        });
        setEmailError(null);
      }
    }, [show]);

    const handleSendNotification = async (e) => {
      e.preventDefault();
      setEmailError(null);

      if (!emailData.adminEmail.trim()) {
        setEmailError('Email address is required');
        return;
      }

      if (!emailData.adminName.trim()) {
        setEmailError('Admin name is required');
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailData.adminEmail)) {
        setEmailError('Please enter a valid email address');
        return;
      }

      try {
        const result = await sendAdminNotification(emailData.adminEmail, emailData.adminName);
        alert(result.message || 'Notification sent successfully!');
        onClose();
      } catch (error) {
        setEmailError(error.message);
      }
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('send_email_notification')}</h2>
              <p className="text-sm text-gray-500 mt-1">{t('email_notification_info')}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          {emailError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle size={16} className="text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{emailError}</span>
            </div>
          )}
          
          <form onSubmit={handleSendNotification} className="p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <div className="flex items-center mb-2">
                <Mail size={16} className="text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">{t('notification_details')}</span>
              </div>
              <p className="text-xs text-blue-700">
                An email will be sent with details of {pendingUsers.length} pending user(s) awaiting approval.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin_email_address')} *</label>
              <input
                type="email"
                required
                value={emailData.adminEmail}
                onChange={(e) => setEmailData({...emailData, adminEmail: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="admin@company.com"
                disabled={notificationLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Name *</label>
              <input
                type="text"
                required
                value={emailData.adminName}
                onChange={(e) => setEmailData({...emailData, adminName: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Administrator"
                disabled={notificationLoading}
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" disabled={notificationLoading}>
                Cancel
              </button>
              <button type="submit" disabled={notificationLoading || pendingUsers.length === 0} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50">
                {notificationLoading ? (<><Loader2 size={16} className="mr-2 animate-spin" />Sending...</>) : (<><Mail size={16} className="mr-2" />Send Notification</>)}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Pending Users Approval Modal
  const PendingUsersModal = ({ show, onClose }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pending User Approvals</h2>
              <p className="text-sm text-gray-500 mt-1">{pendingUsers.length} users awaiting approval</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            {pendingUsers.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-900">{t('notifications')}</h3>
                    <p className="text-xs text-blue-700 mt-1">{t('email_notification_info')}</p>
                  </div>
                  <button onClick={() => setShowNotificationModal(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm">
                    <Mail size={14} className="mr-1.5" />
                    {t('send_email')}
                  </button>
                </div>
              </div>
            )}

            {approvalLoading ? (
              <div className="text-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">{t('loading_pending_users')}</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                <p className="text-gray-500">All users have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((user) => (
                  <div key={user.userId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : user.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{user.fullName || user.username}</h4>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar size={14} className="mr-2" />
                              Registered: {formatDate(user.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button onClick={() => handleApproveUser(user)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center text-sm">
                          <UserCheck size={16} className="mr-2" />
                          Approve
                        </button>
                        <button onClick={() => handleRejectUser(user)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm">
                          <UserX size={16} className="mr-2" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const MultiApprovalModal = ({ show, onClose, users }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [emailData, setEmailData] = useState({ adminEmail: "", adminName: "Administrator" });
    const [loading, setLoading] = useState(false);
    const [allUserRoles, setAllUserRoles] = useState([]);

    useEffect(() => {
      const fetchAllRolesForModal = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/UserRole`, { headers: getAuthHeaders() });
          if (!res.ok) return;
          const data = await res.json();
          setAllUserRoles(data || []);
        } catch (e) {
          console.error('Modal roles fetch error:', e);
          setAllUserRoles([]);
        }
      };
      if (show) fetchAllRolesForModal();
    }, [show]);

    const toggleUserSelection = (userId) => {
      if (selectedUsers.includes(userId)) {
        setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      } else {
        setSelectedUsers([...selectedUsers, userId]);
      }
    };

    const toggleSelectAll = () => {
      const allIds = (users || []).map(u => u.userId);
      if (selectedUsers.length === allIds.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(allIds);
      }
    };

    const handleSend = async () => {
      const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValidEmail(emailData.adminEmail)) {
        alert(t('admin_email_required'));
        return;
      }
      if (selectedUsers.length === 0) {
        alert(t('select_at_least_one_user'));
        return;
      }

      const selectedUserDetails = (users || [])
        .filter((u) => selectedUsers.includes(u.userId))
        .map((u) => {
          const userRoles = (allUserRoles || []).filter(r => r.userId === u.userId);
          const appNames = userRoles.map(r => r.applicationName || r.appName || r.roleName).filter(Boolean);
          const roleNames = userRoles.map(r => r.roleName).filter(Boolean);
          const projects = userRoles.flatMap(r => (r.projects || []).map(p => p.projectName)).filter(Boolean);
          return {
            userId: u.userId,
            fullName: u.fullName,
            username: u.username,
            email: u.email,
            department: u.department,
            location: u.location,
            applications: appNames,
            roles: roleNames,
            projects,
            status: u.status,
            createdAt: u.createdAt
          };
        });

      const emailSubject = 'Kullanıcı Erişim Onayı';
      const emailBodyHtml = `
        <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
          <p>Seçili kullanıcılar için erişim bilgileri:</p>
          <table style="border-collapse:collapse;width:100%">
            <thead>
              <tr>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">Kullanıcı</th>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">Departman</th>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">Lokasyon</th>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">Uygulama</th>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">Projeler</th>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">Erişim Yetkisi</th>
                <th style="border:1px solid #ddd;padding:8px;text-align:left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              ${selectedUserDetails.map(u => `
                <tr>
                  <td style="border:1px solid #ddd;padding:8px">${u.fullName || '-'}</td>
                  <td style="border:1px solid #ddd;padding:8px">${u.department || '-'}</td>
                  <td style="border:1px solid #ddd;padding:8px">${u.location || '-'}</td>
                  <td style="border:1px solid #ddd;padding:8px">${u.applications.length ? u.applications.join(', ') : '-'}</td>
                  <td style="border:1px solid #ddd;padding:8px">${u.projects.length ? u.projects.join(', ') : '-'}</td>
                  <td style="border:1px solid #ddd;padding:8px">${u.roles.length ? u.roles.join(', ') : '-'}</td>
                  <td style="border:1px solid #ddd;padding:8px">
                    <a href="${API_BASE_URL}/UserApproval/approve-simple?userId=${u.userId}&action=approve" style="background:#28a745;color:#fff;padding:6px 10px;text-decoration:none;border-radius:4px;margin-right:6px">Approve</a>
                    <a href="${API_BASE_URL}/UserApproval/approve-simple?userId=${u.userId}&action=reject" style="background:#dc3545;color:#fff;padding:6px 10px;text-decoration:none;border-radius:4px">Reject</a>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `;

      const notifyPayload = {
        adminEmail: emailData.adminEmail,
        adminName: emailData.adminName,
        approvalBaseUrl: `${API_BASE_URL}/UserApproval`,
        emailSubject,
        emailBodyHtml,
        entries: selectedUserDetails.map(u => ({
          userId: u.userId,
          fullName: u.fullName,
          username: u.username,
          email: u.email,
          department: u.department,
          location: u.location,
          status: u.status,
          createdAt: u.createdAt,
          appName: u.applications.join(', '),
          roles: u.roles,
          projects: u.projects
        }))
      };

      const multiPayload = {
        adminEmail: emailData.adminEmail,
        adminName: emailData.adminName,
        approvalBaseUrl: `${API_BASE_URL}/UserApproval`,
        users: selectedUserDetails.map(u => ({
          userId: u.userId,
          fullName: u.fullName || '',
          username: u.username || '',
          email: u.email || '',
          department: u.department || '',
          location: u.location || ''
        }))
      };

      try {
        setLoading(true);
        let res = await fetch(`${API_BASE_URL}/Email/send`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            to: emailData.adminEmail,
            subject: emailSubject,
            body: emailBodyHtml,
            isHtml: true
          })
        });
        if (!res.ok) {
          res = await fetch(`${API_BASE_URL}/UserApproval/send-multi-approval`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(multiPayload)
          });
        }
        if (!res.ok) {
          res = await fetch(`${API_BASE_URL}/UserApproval/notify-admin`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(notifyPayload)
          });
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to send approval');
        }
        alert(t('email_sent'));
        onClose();
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-blue-900/20 relative">
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-lg font-semibold text-white">{t('send_approval')}</h2>
            <button onClick={onClose} className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">{t('admin_email_address')}</label>
              <input
                type="email"
                value={emailData.adminEmail}
                onChange={(e) => setEmailData({ ...emailData, adminEmail: e.target.value })}
                placeholder="ornek@firma.com"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Pending Kullanıcılar</h3>
              <button type="button" onClick={toggleSelectAll} className="text-sm text-blue-300 hover:text-blue-200">Tümünü Seç</button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-white/20 rounded-lg">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Seç</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Kullanıcı</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Departman</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Lokasyon</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Durum</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Uygulama</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-white/80">Erişim Yetkisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(users || []).map((u) => {
                    const checked = selectedUsers.includes(u.userId);
                    const userRoles = (allUserRoles || []).filter(r => r.userId === u.userId);
                    const appNames = userRoles.map(r => r.applicationName || r.appName).filter(Boolean);
                    const roleNames = userRoles.map(r => r.roleName).filter(Boolean);
                    return (
                      <tr key={u.userId} className="hover:bg-white/5">
                        <td className="px-3 py-2"><input type="checkbox" checked={checked} onChange={() => toggleUserSelection(u.userId)} /></td>
                        <td className="px-3 py-2 text-sm text-gray-200">{u.fullName || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-200">{u.department || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-200">{u.location || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-200">{(u.status || '').toLowerCase() || '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-200">{appNames.length > 0 ? appNames.join(', ') : '-'}</td>
                        <td className="px-3 py-2 text-sm text-gray-200">{roleNames.length > 0 ? roleNames.join(', ') : '-'}</td>
                      </tr>
                    );
                  })}
                  {(users || []).length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-gray-300">Pending kullanıcı yok</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-6 border-t border-white/20 bg-white/5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20">{t('cancel')}</button>
            <button type="button" onClick={handleSend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{loading ? t('loading') : t('send_approval')}</button>
          </div>
        </div>
      </div>
    );
  };

  // User Type Selection Modal
  const UserTypeSelectionModal = ({ show, onClose, onSelect }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Dynamic background accents */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/40 to-indigo-500/40 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-indigo-500/40 to-blue-500/40 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.04),transparent_40%)]"></div>
        
        {/* Glass card */}
        <div className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-white/20">
            <h2 className="text-lg font-bold text-white">{t('select_user_type')}</h2>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-sm text-white/80">{t('select_user_type_desc')}</p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => onSelect('admin')}
                className="px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {t('admin_user')}
              </button
>              <button
                onClick={() => onSelect('normal')}
                className="px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {t('normal_user')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modern User Form Modal - YENİ TASARIM
  const UserFormModal = ({ show, onClose, onSubmit, user = null, title }) => {
    const departments = [
      "İDARİ İŞLER","HR","PROJE","ARGE","MUHASEBE","HUKUK",
      "KALİTE GÜVENCE","LOJİSTİK VE PLANLAMA","İŞ GELİŞTİRME",
    ];
    const locations = ["Ataşehir","Bursa","Gebze","Ankara","İFM"];

    const [formData, setFormData] = useState({
      username: '', email: '', fullName: '', password: '',
      status: 'Active', department: '', location: ''
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
      if (user) {
        setFormData({
          username: user.username || '',
          email: user.email || '',
          fullName: user.fullName || '',
          password: '',
          status: user.status || 'Active',
          department: user.department || '',
          location: user.location || '',
          // roleIds kaldırıldı
        });
      } else {
        setFormData({
          username: '', email: '', fullName: '', password: '',
          status: 'Active', department: '', location: ''
        });
      }
      setFormError(null);
      setShowPassword(false);
    }, [user, show]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormLoading(true);
      setFormError(null);
      try {
        if (!formData.username.trim()) throw new Error('Username is required');
        if (!formData.email.trim()) throw new Error('Email is required');
        if (!formData.fullName.trim()) throw new Error('Full name is required');
        // Normal kullanıcı için arka planda şifreyi otomatik ayarla
        const isNew = !user;
        const isNormal = addUserType === 'normal';
        const submitData = { ...formData };
        if (isNew) {
          if (isNormal) {
            submitData.password = 'password';
          } else {
            if (!submitData.password.trim()) throw new Error('Password is required for new users');
          }
        }
        await onSubmit(submitData);
      } catch (error) {
        setFormError(error.message);
      } finally {
        setFormLoading(false);
      }
    };

    const statusOptions = [
      { value: 'Active', label: 'Aktif', color: 'green', icon: CheckCircle },
      { value: 'Inactive', label: 'Pasif', color: 'red', icon: AlertCircle },
      { value: 'Pending', label: 'Beklemede', color: 'yellow', icon: Clock }
    ];

    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-blue-900/20 relative">
          {/* Global Dynamic Background for Modal */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-16 left-8 w-24 h-24 bg-blue-500/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-16 right-12 w-16 h-16 bg-purple-500/10 rounded-xl animate-pulse delay-700"></div>
          </div>
          
          {/* Header - Dynamic Blue Background */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              {/* Floating geometric shapes */}
              <div className="absolute top-6 left-6 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-24 w-16 h-16 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
              {/* Grid pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              {/* Light effects */}
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <User className="w-6 h-6 text-white/90" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <p className="text-gray-300 text-sm mt-1">
                    Sistem kullanıcısı bilgilerini girin ve yetkilendirin
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={formLoading}
                className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-center transition-all duration-200 group disabled:opacity-50"
              >
                <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {formError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center shadow-sm">
              <AlertCircle size={18} className="text-red-500 mr-3 flex-shrink-0" />
              <span className="text-red-700 text-sm font-medium">{formError}</span>
            </div>
          )}

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto" style={{
            scrollbarWidth: '6px',
          }}>
            <div className="space-y-6">
              
              {/* User Information Section */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  Kullanıcı Bilgileri
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white/90">
                      {t('username')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white/10 hover:border-white/30"
                        placeholder={t('enterUsername')}
                        disabled={formLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white/90">
                      Tam Ad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="block w-full px-4 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white/10 hover:border-white/30"
                      placeholder="Tam adınızı girin"
                      disabled={formLoading}
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label className="block text-sm font-semibold text-white/90">
                      E-posta <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white/10 hover:border-white/30"
                        placeholder="E-posta adresinizi girin"
                        disabled={formLoading}
                      />
                    </div>
                  </div>

                  {!user && addUserType !== 'normal' && (
                    <div className="space-y-2 lg:col-span-2">
                      <label className="block text-sm font-semibold text-white/90">
                        Şifre <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="block w-full pl-10 pr-12 py-3 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white/10 hover:border-white/30"
                          placeholder="Şifrenizi girin (en az 6 karakter)"
                          minLength={6}
                          disabled={formLoading}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={formLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Information */}
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white/90 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3">
                    <Building className="w-4 h-4 text-green-600" />
                  </div>
                  Organizasyon Bilgileri
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-white/90">{t('status')}</label>
                    <div className="space-y-2">
                      {statusOptions.map((status) => {
                        const Icon = status.icon;
                        const isSelected = formData.status === status.value;
                        return (
                          <label key={status.value} className={`flex items-center p-3 border-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-200 ${
                            isSelected ? 'border-blue-400 bg-blue-500/10' : 'border-white/20'
                          }`}>
                            <input
                              type="radio"
                              name="status"
                              value={status.value}
                              checked={isSelected}
                              onChange={(e) => setFormData({...formData, status: e.target.value})}
                              className="sr-only"
                              disabled={formLoading}
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                              isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <Icon className={`w-4 h-4 mr-2 ${
                              status.color === 'green' ? 'text-green-600' : 
                              status.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                            <span className="text-sm font-semibold text-white/90">{status.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white/90">
                      {t('department')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50"
                        disabled={formLoading}
                      >
                        <option value="" className="text-gray-500">{t('selectDepartment')}</option>
                        {departments.map(dep => <option key={dep} value={dep} className="text-gray-900">{dep}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-white/90">
                      {t('location')} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-gray-50"
                        disabled={formLoading}
                      >
                        <option value="" className="text-gray-500">{t('selectLocation')}</option>
                        {locations.map(loc => <option key={loc} value={loc} className="text-gray-900">{loc}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white/5 px-6 py-6 border-t border-white/20 backdrop-blur-sm flex items-center justify-between">
            <div className="text-sm text-white/90">
              <span className="text-red-500">*</span> ile işaretli alanlar zorunludur
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-white/30 text-white/90 rounded-lg bg-white/5 hover:bg-white/10 hover:shadow-sm transition-all duration-200 font-medium backdrop-blur-sm"
                disabled={formLoading}
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={formLoading}
                className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg transition-all duration-200 font-medium flex items-center disabled:opacity-50"
              >
                {formLoading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" />
                    {user ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    {user ? 'Güncelle' : 'Oluştur'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          .overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #cbd5e1;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #1e3a8a;
            border-radius: 10px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #1d4ed8;
          }
        `}</style>

      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/10 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-500/10 rounded-lg rotate-12 animate-bounce delay-500"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Light effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className='text-left'>
              <h1 className="text-4xl font-bold text-white mb-2">{t('user_management')}</h1>
              <p className="text-xl text-gray-300">{t('user_management_description') || 'Sistem kullanıcılarını ve yetkilerini yönetin'}</p>
            </div>
            <div className="flex flex-wrap gap-3">

              {/* Pending Approvals Button */}
              {/* <button
                onClick={() => setShowApprovalModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg flex items-center relative shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <UserCheck size={18} className="mr-2" />
                {t('pending_approvals') || 'Onay Bekleyenler'}
                {pendingUsers.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingUsers.length}
                  </span>
                )}
              </button> */}
              <button onClick={() => setShowUserTypeModal(true)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus size={18} className="mr-2" />
                {t('add_user')}
              </button>
              {/* Approvals Button (moved next to Add User, navy style) */}
              <button
                onClick={() => { fetchPendingUsers(); setShowMultiApprovalModal(true); }}
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 flex items-center shadow-lg transition-all duration-200"
              >
                <Mail size={18} className="mr-2" />
                {t('send_approval')}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center backdrop-blur-sm">
            <AlertCircle size={20} className="text-red-400 mr-3" />
            <div>
              <p className="text-red-300 font-medium">Hata</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/30 rounded-lg group-hover:bg-blue-500/50 transition-all duration-200"><Users className="text-blue-200 group-hover:text-blue-100" size={20} /></div>
              <div className="ml-3"><p className="text-xs font-semibold text-white">{t('total')}</p><p className="text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-200">{stats.total}</p></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-500/30 rounded-lg group-hover:bg-emerald-500/50 transition-all duration-200"><CheckCircle className="text-emerald-200 group-hover:text-emerald-100" size={20} /></div>
              <div className="ml-3"><p className="text-xs font-semibold text-white">{t('active')}</p><p className="text-xl font-bold text-white group-hover:text-emerald-200 transition-colors duration-200">{stats.active}</p></div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 shadow-md hover:shadow-lg transition-all duration-200 group">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/30 rounded-lg group-hover:bg-red-500/50 transition-all duration-200"><XCircle className="text-red-200 group-hover:text-red-100" size={20} /></div>
              <div className="ml-3"><p className="text-xs font-semibold text-white">{t('inactive')}</p><p className="text-xl font-bold text-white group-hover:text-red-200 transition-colors duration-200">{stats.inactive}</p></div>
            </div>
          </div>
        </div>


        {/* Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-white/20">
              <thead className="bg-white/5">
                <tr>
                  {/* Kullanıcı */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider relative">
                    <div className="flex items-center gap-2">
                      <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('fullName')}>
                        {t('user')}
                        <ArrowUpDown size={14} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('user')} aria-label="Filter User">
                        <Filter size={14} className="text-white/80" />
                      </button>
                    </div>
                    {showFilterPanel.user && (
                      <div className="absolute z-20 mt-2 left-0 bg-gray-900 border border-white/20 rounded-lg p-3 w-64 shadow-xl">
                        <div className="mb-2 text-white text-xs font-semibold">{t('user')}</div>
                        <input
                          type="text"
                          value={headerFilters.userTerm}
                          onChange={(e) => setHeaderFilters((prev) => ({ ...prev, userTerm: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder={t('search')}
                        />
                        <div className="mt-3 flex justify-between">
                          <button className="px-3 py-1 text-xs bg-white/10 border border-gray-600 rounded text-white" onClick={() => clearHeaderFilter('user')}>{t('clear_filters')}</button>
                          <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white" onClick={() => toggleFilterPanel('user')}>OK</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Durum */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider relative">
                    <div className="flex items-center gap-2">
                      <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('status')}>
                        {t('status')}
                        <ArrowUpDown size={14} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('status')} aria-label="Filter Status">
                        <Filter size={14} className="text-white/80" />
                      </button>
                    </div>
                    {showFilterPanel.status && (
                      <div className="absolute z-20 mt-2 left-0 bg-gray-900 border border-white/20 rounded-lg p-3 w-56 shadow-xl">
                        <div className="mb-2 text-white text-xs font-semibold">{t('status')}</div>
                        <div className="space-y-1 text-white text-sm">
                          {['active','inactive','pending'].map(s => (
                            <label key={s} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={headerFilters.statuses.includes(s)}
                                onChange={(e) => setHeaderFilters((prev) => {
                                  const next = new Set(prev.statuses);
                                  if (e.target.checked) next.add(s); else next.delete(s);
                                  return { ...prev, statuses: Array.from(next) };
                                })}
                              />
                              <span className="capitalize">{t(s)}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex justify-between">
                          <button className="px-3 py-1 text-xs bg-white/10 border border-gray-600 rounded text-white" onClick={() => clearHeaderFilter('status')}>{t('clear_filters')}</button>
                          <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white" onClick={() => toggleFilterPanel('status')}>OK</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Departman */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider relative">
                    <div className="flex items-center gap-2">
                      <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('department')}>
                        {t('department')}
                        <ArrowUpDown size={14} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('department')} aria-label="Filter Department">
                        <Filter size={14} className="text-white/80" />
                      </button>
                    </div>
                    {showFilterPanel.department && (
                      <div className="absolute z-20 mt-2 left-0 bg-gray-900 border border-white/20 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto">
                        <div className="mb-2 text-white text-xs font-semibold">{t('department')}</div>
                        <div className="space-y-1 text-white text-sm">
                          {departmentOptions.map(dep => (
                            <label key={dep} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={headerFilters.departments.includes(dep)}
                                onChange={(e) => setHeaderFilters((prev) => {
                                  const next = new Set(prev.departments);
                                  if (e.target.checked) next.add(dep); else next.delete(dep);
                                  return { ...prev, departments: Array.from(next) };
                                })}
                              />
                              <span>{dep}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex justify-between">
                          <button className="px-3 py-1 text-xs bg-white/10 border border-gray-600 rounded text-white" onClick={() => clearHeaderFilter('department')}>{t('clear_filters')}</button>
                          <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white" onClick={() => toggleFilterPanel('department')}>OK</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Lokasyon */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider relative">
                    <div className="flex items-center gap-2">
                      <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('location')}>
                        {t('location')}
                        <ArrowUpDown size={14} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('location')} aria-label="Filter Location">
                        <Filter size={14} className="text-white/80" />
                      </button>
                    </div>
                    {showFilterPanel.location && (
                      <div className="absolute z-20 mt-2 left-0 bg-gray-900 border border-white/20 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto">
                        <div className="mb-2 text-white text-xs font-semibold">{t('location')}</div>
                        <div className="space-y-1 text-white text-sm">
                          {locationOptions.map(loc => (
                            <label key={loc} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={headerFilters.locations.includes(loc)}
                                onChange={(e) => setHeaderFilters((prev) => {
                                  const next = new Set(prev.locations);
                                  if (e.target.checked) next.add(loc); else next.delete(loc);
                                  return { ...prev, locations: Array.from(next) };
                                })}
                              />
                              <span>{loc}</span>
                            </label>
                          ))}
                        </div>
                        <div className="mt-3 flex justify-between">
                          <button className="px-3 py-1 text-xs bg-white/10 border border-gray-600 rounded text-white" onClick={() => clearHeaderFilter('location')}>{t('clear_filters')}</button>
                          <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white" onClick={() => toggleFilterPanel('location')}>OK</button>
                        </div>
                      </div>
                    )}
                  </th>

                  {/* Oluşturma Tarihi */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider relative">
                    <div className="flex items-center gap-2">
                      <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('createdAt')}>
                        {t('creationDate')}
                        <ArrowUpDown size={14} />
                      </button>
                      <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('createdAt')} aria-label="Filter CreatedAt">
                        <Filter size={14} className="text-white/80" />
                      </button>
                    </div>
                    {showFilterPanel.createdAt && (
                      <div className="absolute z-20 mt-2 left-0 bg-gray-900 border border-white/20 rounded-lg p-3 w-72 shadow-xl">
                        <div className="mb-2 text-white text-xs font-semibold">{t('creationDate')}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={headerFilters.createdFrom}
                            onChange={(e) => setHeaderFilters((prev) => ({ ...prev, createdFrom: e.target.value }))}
                            className="px-2 py-1 bg-white/10 border border-gray-600 rounded-md text-white text-sm focus:outline-none"
                          />
                          <span className="text-white/70 text-xs">→</span>
                          <input
                            type="date"
                            value={headerFilters.createdTo}
                            onChange={(e) => setHeaderFilters((prev) => ({ ...prev, createdTo: e.target.value }))}
                            className="px-2 py-1 bg-white/10 border border-gray-600 rounded-md text-white text-sm focus:outline-none"
                          />
                        </div>
                        <div className="mt-3 flex justify-between">
                          <button className="px-3 py-1 text-xs bg-white/10 border border-gray-600 rounded text-white" onClick={() => clearHeaderFilter('createdAt')}>{t('clear_filters')}</button>
                          <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white" onClick={() => toggleFilterPanel('createdAt')}>OK</button>
                        </div>
                      </div>
                    )}
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-white/10">
                {currentUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-white/10 hover:shadow-lg transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-semibold text-sm">
                              {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : (user.username || '').substring(0,2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-white">{user.fullName || user.username}</div>
                            <div className="text-sm font-semibold text-white/90">{user.email}</div>
                            <div className="text-xs font-medium text-white/80">{user.username}</div>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-white">{user.department || t('notSpecified')}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-bold text-white">{user.location || t('notSpecified')}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-semibold text-white/90">{formatDate(user.createdAt)}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openProfileModal(user)} className="text-green-300 hover:text-green-200 p-2 rounded-lg hover:bg-green-500/30 hover:shadow-md transition-all duration-200 transform hover:scale-105" title={t('viewProfile')}>
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setEditingUser(user); setShowEditModal(true); }} className="text-blue-300 hover:text-blue-200 p-2 rounded-lg hover:bg-blue-500/30 hover:shadow-md transition-all duration-200 transform hover:scale-105" title={t('editUser')}>
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteUser(user.userId)} className="text-red-400 hover:text-red-200 p-2 rounded-lg hover:bg-red-500/30 hover:shadow-md transition-all duration-200 transform hover:scale-105" title={t('deleteUser')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-t border-white/20">
              <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-600 rounded-lg bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200">{t('previous')}</button>
                <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="ml-3 px-4 py-2 border border-gray-600 rounded-lg bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200">{t('next')}</button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    <span className="font-bold">{indexOfFirstUser + 1}</span> - <span className="font-bold">{Math.min(indexOfLastUser, filteredUsers.length)}</span> {t('of')} <span className="font-bold">{filteredUsers.length}</span> {t('results')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-l-lg border border-gray-600 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200">{t('previous')}</button>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button key={page} onClick={() => setCurrentPage(page)} className={`px-4 py-2 border text-sm font-semibold ${currentPage === page ? 'z-10 bg-blue-500/20 border-blue-500 text-blue-300' : 'bg-white/5 border-gray-600 text-white hover:bg-white/10'} transition-all duration-200`}>
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-4 py-2 border border-gray-600 bg-white/5 text-sm font-semibold text-white">...</span>;
                      }
                      return null;
                    })}
                    <button onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-r-lg border border-gray-600 bg-white/5 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-200">{t('next')}</button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-12">
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Users Found</h3>
              <p className="text-gray-100 font-semibold mb-6">No Users Found</p>
              {users.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterRole('all');
                    setFilterStatus('all');
                    setFilterDepartment('all');
                    setFilterLocation('all');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t('clear_filters')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserTypeSelectionModal
        show={showUserTypeModal}
        onClose={() => { setShowUserTypeModal(false); setAddUserType(null); }}
        onSelect={(type) => { setAddUserType(type); setShowUserTypeModal(false); setShowAddModal(true); }}
      />
      <UserFormModal
        show={showAddModal}
        onClose={() => { setShowAddModal(false); setAddUserType(null); }}
        onSubmit={handleAddUser}
        title={addUserType === 'normal' ? 'Normal Kullanıcı Ekle' : 'Yeni Kullanıcı Ekle'}
      />
      <UserFormModal
        show={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingUser(null); }}
        onSubmit={handleEditUser}
        user={editingUser}
        title="Kullanıcı Düzenle"
      />
      
      {/* Pending Users Approval Modal */}
      <PendingUsersModal
        show={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
      />

      {/* Email Notification Modal */}
      <EmailNotificationModal
        show={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-blue-900/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl overflow-hidden">
            {/* Dynamic background accents */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-10 left-6 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-6 w-12 h-12 bg-purple-500/10 rounded-xl animate-pulse delay-700"></div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Excel'e Aktar</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                {t('selectDepartment')}
              </label>
              <select
                value={selectedDepartmentForExport}
                onChange={(e) => setSelectedDepartmentForExport(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all" className="text-gray-900">{t('allDepartments')}</option>
                {departmentOptions.map(dep => (
                  <option key={dep} value={dep} className="text-gray-900">{dep}</option>
                ))}
              </select>
              
              <p className="text-sm text-white/70 mt-2">
                {selectedDepartmentForExport === 'all' 
                  ? `${t('total')} ${users.length} ${t('usersWillBeExported')}`
                : `${users.filter(u => (u.department || '').trim() === selectedDepartmentForExport).length} ${t('usersWillBeExported')}`
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20"
              >
                İptal
              </button>
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download size={16} className="mr-2" />
                Aktar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi Approval Modal */}
      <MultiApprovalModal
        show={showMultiApprovalModal}
        onClose={() => setShowMultiApprovalModal(false)}
        users={pendingUsers}
      />

      {/* Profile Modal */}
      {showProfileModal && selectedUserProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Floating geometric shapes */}
              <div className="absolute top-6 left-6 w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 left-24 w-16 h-16 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
              {/* Grid pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              {/* Light effects */}
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative flex items-center justify-between p-6 border-b border-white/20 bg-white/5">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <User className="mr-3 text-white/90" size={28} />
                {t('userProfile')}
              </h2>
              <button
                onClick={closeProfileModal}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="relative p-6">
              {/* User Basic Info */}
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-6">
                  <span className="text-white font-bold text-2xl">
                    {selectedUserProfile.fullName 
                      ? selectedUserProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase() 
                      : selectedUserProfile.username.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedUserProfile.fullName || selectedUserProfile.username}
                  </h3>
                  <p className="text-white/80 text-lg">@{selectedUserProfile.username}</p>
                  <div className="mt-2">{getStatusBadge(selectedUserProfile.status)}</div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <Mail className="text-blue-300 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-white/70">E-posta</p>
                      <p className="text-white font-semibold">{selectedUserProfile.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <Building className="text-green-300 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-white/70">{t('department')}</p>
                      <p className="text-white font-semibold">{selectedUserProfile.department || t('notSpecified')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <MapPin className="text-red-300 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-white/70">{t('location')}</p>
                      <p className="text-white font-semibold">{selectedUserProfile.location || t('notSpecified')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
                    <Calendar className="text-purple-300 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-white/70">{t('creationDate')}</p>
                      <p className="text-white font-semibold">{formatDate(selectedUserProfile.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Roles and Applications */}
              <div className="border-t border-white/20 pt-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center">
                  <Shield className="mr-2 text-white/80" size={20} />
                  Uygulama Erişimleri ve Roller
                </h4>
                
                {profileLoading ? (
                  <div className="text-center py-8">
                    <Loader2 size={32} className="animate-spin text-white mx-auto mb-4" />
                    <p className="text-white/80">Roller yükleniyor...</p>
                  </div>
                ) : userRoles.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      userRoles.reduce((acc, role) => {
                        const appName = role.applicationName || role.appName || 'Bilinmeyen Uygulama';
                        if (!acc[appName]) {
                          acc[appName] = [];
                        }
                        acc[appName].push(role);
                        return acc;
                      }, {})
                    ).map(([appName, appRoles]) => (
                      <div key={appName} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center mr-3">
                            <Settings className="text-white" size={16} />
                          </div>
                          <h4 className="font-semibold text-white text-lg">{appName}</h4>
                        </div>
                        <div className="ml-13 space-y-2">
                          {appRoles.map((role, index) => (
                            <div key={index} className="bg-white/10 backdrop-blur-md rounded-md p-3 border border-white/20">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-200 mr-3">
                                    {role.roleName}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-200">
                                    Aktif
                                  </span>
                                </div>
                                {role.assignedAt && (
                                  <p className="text-xs text-white/70 flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(role.assignedAt).toLocaleDateString('tr-TR')}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield size={48} className="text-white/40 mx-auto mb-4" />
                    <p className="text-white/70 text-lg">{t('noRoleAssigned')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-white/20 bg-white/5">
              <button
                onClick={closeProfileModal}
                className="px-6 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/20 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

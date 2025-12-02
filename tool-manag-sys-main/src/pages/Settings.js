import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Crown,
  Key,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Users,
  Lock,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  Globe,
  Calendar,
  FolderKanban,
  Download,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Settings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('applications');
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expandedApps, setExpandedApps] = useState({});
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [editingPermission, setEditingPermission] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [permissionTypes, setPermissionTypes] = useState([]);
  const [importing, setImporting] = useState(false);
  const API_BASE_URL = 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

  // API Functions
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Role`);
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Permission`);
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissionTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Permission/types`);
      const data = await response.json();
      setPermissionTypes(data.types || []);
    } catch (error) {
      console.error('Error fetching permission types:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Applications`);
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Projects`);
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'roles') {
      fetchRoles();
      fetchPermissions();
    } else if (activeTab === 'permissions') {
      fetchPermissions();
      fetchPermissionTypes();
      fetchApplications();
    } else if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'projects') {
      fetchProjects();
      fetchApplications();
    }
  }, [activeTab]);

  // Role Management Functions
  const handleSaveRole = async (roleData) => {
    try {
      const url = editingRole 
        ? `${API_BASE_URL}/Role/${editingRole.roleId}`
        : `${API_BASE_URL}/Role`;
      
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      });

      if (response.ok) {
        fetchRoles();
        setShowRoleModal(false);
        setEditingRole(null);
      }
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Bu rolü silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Role/${roleId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchRoles();
          alert('Rol başarıyla silindi!');
        } else {
          const errorText = await response.text();
          console.error('Delete failed:', response.status, errorText);
          
          if (errorText.includes('kullanıcılar tarafından kullanılıyor')) {
            alert('Bu rol kullanıcılar tarafından kullanılıyor ve silinemez. Önce bu rolü kullanan kullanıcıları başka bir role atayın.');
          } else {
            alert(`Rol silinirken hata oluştu: ${response.status} - ${errorText}`);
          }
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        alert(`Rol silinirken hata oluştu: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Permission Management Functions
  const handleSavePermission = async (permissionData) => {
    try {
      const url = editingPermission 
        ? `${API_BASE_URL}/Permission/${editingPermission.permissionId}`
        : `${API_BASE_URL}/Permission`;
      
      const method = editingPermission ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissionData)
      });

      if (response.ok) {
        fetchPermissions();
        setShowPermissionModal(false);
        setEditingPermission(null);
      }
    } catch (error) {
      console.error('Error saving permission:', error);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (window.confirm('Bu izni silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/Permission/${permissionId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchPermissions();
        }
      } catch (error) {
        console.error('Error deleting permission:', error);
      }
    }
  };

  // Application Management Functions
  const handleSaveApplication = async (applicationData) => {
    try {
      const url = editingApplication 
        ? `${API_BASE_URL}/Applications/${editingApplication.appId}`
        : `${API_BASE_URL}/Applications`;
      
      const method = editingApplication ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        fetchApplications();
        setShowApplicationModal(false);
        setEditingApplication(null);
        alert(editingApplication ? 'Uygulama başarıyla güncellendi!' : 'Uygulama başarıyla eklendi!');
      } else {
        const errorText = await response.text();
        alert(`Uygulama kaydedilirken hata oluştu: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving application:', error);
      alert(`Uygulama kaydedilirken hata oluştu: ${error.message}`);
    }
  };

  const handleDeleteApplication = async (appId) => {
    if (window.confirm('Bu uygulamayı silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Applications/${appId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchApplications();
          alert('Uygulama başarıyla silindi!');
        } else {
          const errorText = await response.text();
          console.error('Delete failed:', response.status, errorText);
          alert(`Uygulama silinirken hata oluştu: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error deleting application:', error);
        alert(`Uygulama silinirken hata oluştu: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Project Management Functions - handleSaveProject fonksiyonunu güncelleyin
  const handleSaveProject = async (projectData) => {
    try {
      let url, method, body;
      
      if (editingProject) {
        // PUT için ProjectCreateDto formatında gönder
        url = `${API_BASE_URL}/Projects/${editingProject.projectId}`;
        method = 'PUT';
        body = {
          appId: parseInt(projectData.appId),
          projectName: projectData.projectName,
          description: projectData.description || ''
        };
      } else {
        // POST için de aynı format
        url = `${API_BASE_URL}/Projects`;
        method = 'POST';
        body = {
          appId: parseInt(projectData.appId),
          projectName: projectData.projectName,
          description: projectData.description || ''
        };
      }
      
      console.log('Sending to API:', method, url, body); // Debug için
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchProjects();
        setShowProjectModal(false);
        setEditingProject(null);
        alert(editingProject ? 'Proje başarıyla güncellendi!' : 'Proje başarıyla eklendi!');
      } else {
        const errorText = await response.text();
        console.error('Save failed:', response.status, errorText);
        alert(`Proje kaydedilirken hata oluştu: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert(`Proje kaydedilirken hata oluştu: ${error.message}`);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/Projects/${projectId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchProjects();
          alert('Proje başarıyla silindi!');
        } else {
          const errorText = await response.text();
          console.error('Delete failed:', response.status, errorText);
          alert(`Proje silinirken hata oluştu: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(`Proje silinirken hata oluştu: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImportFromJira = async () => {
    if (!window.confirm('Jira\'dan projeleri içe aktarmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setImporting(true);
      const response = await fetch(`${API_BASE_URL}/Projects/import/jira`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Başarılı! ${result.imported} proje içe aktarıldı. (Toplam: ${result.total})`);
        fetchProjects();
      } else {
        const errorText = await response.text();
        alert(`İçe aktarma başarısız: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error importing from Jira:', error);
      alert(`İçe aktarma hatası: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Render Functions
  const renderApplications = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
      <div className="p-6 border-b border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{t('application_management')}</h2>
            <p className="text-gray-300">{t('application_management_desc')}</p>
          </div>
          <button
            onClick={() => {
              setEditingApplication(null);
              setShowApplicationModal(true);
            }}
            className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <Plus size={16} />
            {t('add_application')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_applications')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('application')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('application_type')}</th>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('description')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('users_count')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('created')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                applications
                  .filter(app => 
                    app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    app.description?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((app) => (
                    <tr key={app.appId} className="hover:bg-white/10">
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <Package size={16} className="text-orange-300 mr-2 flex-shrink-0" />
                          <span className="font-medium truncate text-white">{app.appName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                          app.appType === 'Web' ? 'bg-blue-500/20 text-blue-300' :
                          app.appType === 'Desktop' ? 'bg-green-500/20 text-green-300' :
                          app.appType === 'Mobile' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          <Globe size={12} className="inline mr-1" />
                          {app.appType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-gray-300 truncate block">{app.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <Users size={16} className="text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{app.userRoleCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-300">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingApplication(app);
                              setShowApplicationModal(true);
                            }}
                            className="text-blue-300 hover:text-blue-100 p-1"
                            title={t('edit_application')}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(app.appId)}
                            disabled={loading}
                            className={`p-1 ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-red-300 hover:text-red-100'}`}
                            title={t('delete_application')}
                          >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
      <div className="p-6 border-b border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{t('project_management')}</h2>
            <p className="text-gray-300">{t('project_management_desc')}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleImportFromJira}
              disabled={importing}
              className="bg-purple-600/80 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {t('import_from_jira')}
            </button>
            <button
              onClick={() => {
                setEditingProject(null);
                setShowProjectModal(true);
              }}
              className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm"
            >
              <Plus size={16} />
              {t('add_project')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_projects')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('project_name')}</th>
                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('application')}</th>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('description')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('created')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                (() => {
                  const filtered = projects.filter(project => 
                    project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    project.appName?.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  const groups = filtered.reduce((acc, project) => {
                    const key = project.appName || 'Diğer';
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(project);
                    return acc;
                  }, {});

                  const entries = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));

                  if (entries.length === 0) {
                    return (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-300">{t('no_results') || 'Sonuç bulunamadı'}</td>
                      </tr>
                    );
                  }

                  return entries.map(([appName, appProjects]) => (
                    <React.Fragment key={appName}>
                      <tr className="bg-white/5">
                        <td colSpan="5" className="px-6 py-3">
                          <button
                            onClick={() => setExpandedApps(prev => ({ ...prev, [appName]: !prev[appName] }))}
                            className="w-full flex items-center justify-between text-left text-white hover:text-blue-200"
                          >
                            <div className="flex items-center gap-3">
                              {expandedApps[appName] ? <ChevronDown size={16} className="text-blue-300" /> : <ChevronRight size={16} className="text-blue-300" />}
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 whitespace-nowrap">
                                <Package size={12} className="inline mr-1" />
                                {appName}
                              </span>
                            </div>
                            <span className="text-sm text-gray-300">{appProjects.length} {t('projects') || 'Proje'}</span>
                          </button>
                        </td>
                      </tr>

                      {expandedApps[appName] && appProjects.map((project) => (
                        <tr key={project.projectId} className="hover:bg-white/10">
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center">
                              <FolderKanban size={16} className="text-cyan-300 mr-2 flex-shrink-0" />
                              <span className="font-medium truncate text-white">{project.projectName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 whitespace-nowrap">
                              <Package size={12} className="inline mr-1" />
                              {project.appName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span className="text-gray-300 truncate block">{project.description || '-'}</span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center">
                              <Calendar size={16} className="text-gray-400 mr-1 flex-shrink-0" />
                              <span className="text-sm text-gray-300">
                                {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingProject(project);
                                  setShowProjectModal(true);
                                }}
                                className="text-blue-300 hover:text-blue-100 p-1"
                                title={t('edit_project')}
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(project.projectId)}
                                disabled={loading}
                                className={`p-1 ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-red-300 hover:text-red-100'}`}
                                title={t('delete_project')}
                              >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ));
                })()
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRoles = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
      <div className="p-6 border-b border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{t('role_management')}</h2>
            <p className="text-gray-300">{t('role_management_desc')}</p>
          </div>
          <button
            onClick={() => {
              setEditingRole(null);
              setShowRoleModal(true);
            }}
            className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <Plus size={16} />
            {t('add_role')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_roles')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-left">{t('role')}</th>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-left">{t('description')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-left">{t('users')}</th>
                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-left">{t('permissions')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                roles
                  .filter(role => 
                    role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((role) => (
                    <tr key={role.roleId} className="hover:bg-white/10">
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <Crown size={16} className="text-purple-300 mr-2 flex-shrink-0" />
                          <span className="font-medium truncate text-white">{role.roleName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-gray-300 truncate block">{role.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <Users size={16} className="text-gray-400 mr-1 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{role.userCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-sm text-gray-300">
                          {role.permissions?.length || 0} {t('permissions')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingRole(role);
                              setShowRoleModal(true);
                            }}
                            className="text-blue-300 hover:text-blue-100 p-1"
                            title={t('edit_role')}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role.roleId)}
                            disabled={loading}
                            className={`p-1 ${loading ? 'text-gray-400 cursor-not-allowed' : 'text-red-300 hover:text-red-100'}`}
                            title={t('delete_role')}
                          >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
      <div className="p-6 border-b border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{t('permission_management')}</h2>
            <p className="text-gray-300">{t('permission_management_desc')}</p>
          </div>
          <button
            onClick={() => {
              setEditingPermission(null);
              setShowPermissionModal(true);
            }}
            className="bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm"
          >
            <Plus size={16} />
            {t('add_permission')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('search_permissions')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white placeholder-gray-400 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-white/5">
              <tr>
                <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('permission')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('type')}</th>
                <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('application')}</th>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('description')}</th>
                <th className="w-1/8 px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <Loader2 size={20} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                permissions
                  .filter(permission => 
                    permission.permissionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    permission.description?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((permission) => (
                    <tr key={permission.permissionId} className="hover:bg-white/10">
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center">
                          <Key size={16} className="text-yellow-300 mr-2 flex-shrink-0" />
                          <span className="font-medium truncate text-white">{permission.permissionName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                          permission.permissionType === 'Read' ? 'bg-green-500/20 text-green-300' :
                          permission.permissionType === 'Write' ? 'bg-blue-500/20 text-blue-300' :
                          permission.permissionType === 'Execute' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {permission.permissionType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-gray-300 truncate block">{permission.appName || 'System'}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <span className="text-gray-300 truncate block">{permission.description || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingPermission(permission);
                              setShowPermissionModal(true);
                            }}
                            className="text-blue-300 hover:text-blue-100 p-1"
                            title={t('edit_permission')}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePermission(permission.permissionId)}
                            className="text-red-300 hover:text-red-100 p-1"
                            title={t('delete_permission')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-indigo-500/10 rounded-lg rotate-45 animate-bounce"></div>
        <div className="absolute bottom-32 left-40 w-28 h-28 bg-purple-500/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-cyan-500/10 rounded-lg rotate-12 animate-bounce delay-500"></div>
        
        {/* Light effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full space-y-6 p-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg backdrop-blur-sm">
                  <SettingsIcon className="h-6 w-6 text-blue-300" />
                </div>
                <h1 className="text-2xl font-bold text-white">{t('settings_title')}</h1>
              </div>
              <p className="text-gray-300">
                {t('settings_description')}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl">
          <div className="border-b border-white/20 px-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
                }`}
              >
                {t('applications')}
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
                }`}
              >
                {t('projects')}
              </button>
              <button
                onClick={() => setActiveTab('roles')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
                }`}
              >
                {t('roles')}
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'permissions'
                    ? 'border-blue-400 text-blue-300'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
                }`}
              >
                {t('permissions')}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content for Applications, Projects, Roles and Permissions */}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'roles' && renderRoles()}
        {activeTab === 'permissions' && renderPermissions()}
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          application={editingApplication}
          onSave={handleSaveApplication}
          onClose={() => {
            setShowApplicationModal(false);
            setEditingApplication(null);
          }}
        />
      )}

      {/* Project Modal */}
      {showProjectModal && (
        <ProjectModal
          project={editingProject}
          applications={applications}
          onSave={handleSaveProject}
          onClose={() => {
            setShowProjectModal(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <RoleModal
          role={editingRole}
          permissions={permissions}
          onSave={handleSaveRole}
          onClose={() => {
            setShowRoleModal(false);
            setEditingRole(null);
          }}
        />
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <PermissionModal
          permission={editingPermission}
          permissionTypes={permissionTypes}
          applications={applications}
          onSave={handleSavePermission}
          onClose={() => {
            setShowPermissionModal(false);
            setEditingPermission(null);
          }}
        />
      )}
    </div>
  );
};

// Application Modal Component
const ApplicationModal = ({ application, onSave, onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    appName: application?.appName || '',
    appType: application?.appType || 'Web',
    description: application?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const appTypes = ['Web', 'Desktop', 'Mobile', 'API', 'Service'];

  return (
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
          <h3 className="text-lg font-semibold text-white">
            {application ? t('edit_application') : t('add_new_application')}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('application_name')} *
            </label>
            <input
              type="text"
              value={formData.appName}
              onChange={(e) => setFormData(prev => ({ ...prev, appName: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              required
              placeholder={t('enter_application_name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('application_type')} *
            </label>
            <select
              value={formData.appType}
              onChange={(e) => setFormData(prev => ({ ...prev, appType: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {appTypes.map((type) => (
                <option key={type} value={type} className="text-gray-900">{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              rows="3"
              placeholder={t('enter_application_description')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              {t('save_application')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ project, applications, onSave, onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    projectName: project?.projectName || '',
    appId: project?.appId || (applications.length > 0 ? applications[0].appId : null),
    description: project?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
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
          <h3 className="text-lg font-semibold text-white">
            {project ? t('edit_project') : t('add_new_project')}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('project_name')} *
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              required
              placeholder={t('enter_project_name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('application')} *
            </label>
            <select
              value={formData.appId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, appId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" className="text-gray-900">{t('select_application')}</option>
              {applications.map((app) => (
                <option key={app.appId} value={app.appId} className="text-gray-900">{app.appName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              rows="3"
              placeholder={t('enter_project_description')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              {t('save_project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Role Modal Component
const RoleModal = ({ role, permissions, onSave, onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    roleName: role?.roleName || '',
    description: role?.description || '',
    permissionIds: role?.permissions?.map(p => p.permissionId) || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-blue-900/20 rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Dynamic background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-10 left-6 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-6 w-12 h-12 bg-purple-500/10 rounded-xl animate-pulse delay-700"></div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {role ? t('edit_role') : t('add_new_role')}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('role_name')} *
            </label>
            <input
              type="text"
              value={formData.roleName}
              onChange={(e) => setFormData(prev => ({ ...prev, roleName: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              required
              placeholder={t('enter_role_name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              rows="3"
              placeholder={t('enter_role_description')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('permissions')}
            </label>
            <div className="max-h-60 overflow-y-auto border border-white/20 rounded-lg p-3 bg-white/5">
              {permissions.map((permission) => (
                <div key={permission.permissionId} className="flex items-center mb-2 text-white">
                  <input
                    type="checkbox"
                    id={`permission-${permission.permissionId}`}
                    className="mr-3 accent-blue-500"
                    checked={formData.permissionIds.includes(permission.permissionId)}
                    onChange={() => handlePermissionToggle(permission.permissionId)}
                  />
                  <label htmlFor={`permission-${permission.permissionId}`} className="flex-1">
                    <div className="font-medium">{permission.permissionName}</div>
                    <div className="text-sm text-white/80">
                      {permission.permissionType} • {permission.appName || 'System'}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              {t('save_role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Permission Modal Component
const PermissionModal = ({ permission, permissionTypes, applications, onSave, onClose }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    permissionName: permission?.permissionName || '',
    permissionType: permission?.permissionType || 'Read',
    description: permission?.description || '',
    appId: permission?.appId || (applications.length > 0 ? applications[0].appId : null)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
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
          <h3 className="text-lg font-semibold text-white">
            {permission ? t('edit_permission') : t('add_new_permission')}
          </h3>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('permission_name')} *
            </label>
            <input
              type="text"
              value={formData.permissionName}
              onChange={(e) => setFormData(prev => ({ ...prev, permissionName: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              required
              placeholder={t('enter_permission_name')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('permission_type')} *
            </label>
            <select
              value={formData.permissionType}
              onChange={(e) => setFormData(prev => ({ ...prev, permissionType: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {permissionTypes.map((type) => (
                <option key={type} value={type} className="text-gray-900">{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {t('application')} *
            </label>
            <select
              value={formData.appId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, appId: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" className="text-gray-900">{t('select_application')}</option>
              {applications.map((app) => (
                <option key={app.appId} value={app.appId} className="text-gray-900">{app.appName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-white/60"
              rows="3"
              placeholder={t('enter_permission_description')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Save size={16} />
              {t('save_permission')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

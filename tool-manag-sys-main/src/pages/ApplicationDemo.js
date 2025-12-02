import React, { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  Plus, 
  Search, 
  Filter,
  Settings,
  Trash2,
  Eye,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Users,
  Activity,
  Globe,
  Key,
  Shield,
  Lock,
  Server,
  Edit,
  Copy,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronDown,
  MoreVertical,
  List,
  Calendar,
  TrendingUp,
  BarChart3,
  History,
  FileText,
  Zap,
  AlertCircle,
  Info,
  ChevronRight,
  Wifi,
  WifiOff,
  MapPin,
  Monitor,
  Layers,
  Database,
  Cloud,
  Link,
  UserCheck,
  UserX,
  Timer,
  Target,
  Gauge,
  Star,
  Archive,
  Power,
  Bookmark
} from 'lucide-react';

const ApplicationDemo = () => {
  // Enhanced State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [selectedApps, setSelectedApps] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [copiedAppId, setCopiedAppId] = useState(null);

  // Enhanced Mock Applications Data
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: 'Jira',
      description: 'Project management and issue tracking for agile teams',
      url: 'https://jira.company.com',
      type: 'SAML',
      status: 'Integrated',
      category: 'Project Management',
      users: 245,
      activeUsers: 189,
      lastSync: '2 hours ago',
      logo: '🎯',
      version: '9.4.0',
      uptime: 99.9,
      environment: 'Production',
      metadata: {
        entityId: 'https://jira.company.com/sso',
        acsUrl: 'https://jira.company.com/saml/acs',
        certificate: 'Valid until 2025-12-31',
        ssoUrl: 'https://sso.company.com/saml/jira'
      },
      permissions: ['read', 'write', 'admin'],
      createdAt: '2024-01-15',
      lastActivity: '2024-03-15 14:30:22',
      integrationHealth: 'Excellent',
      monthlyRequests: 15420,
      avgResponseTime: 120,
      tags: ['Critical', 'Development', 'Agile'],
      owner: 'John Smith',
      cost: 2500,
      license: 'Enterprise'
    },
    {
      id: 2,
      name: 'GitLab',
      description: 'DevOps platform for code collaboration and CI/CD',
      url: 'https://gitlab.company.com',
      type: 'OAuth2',
      status: 'Integrated',
      category: 'Development',
      users: 89,
      activeUsers: 76,
      lastSync: '1 hour ago',
      logo: '🦊',
      version: '16.8.1',
      uptime: 99.7,
      environment: 'Production',
      metadata: {
        clientId: 'gitlab-oauth-client-id',
        redirectUri: 'https://gitlab.company.com/oauth/callback',
        scopes: ['read_user', 'read_repository', 'write_repository'],
        tokenExpiry: '7 days'
      },
      permissions: ['read', 'write'],
      createdAt: '2024-02-01',
      lastActivity: '2024-03-15 13:45:10',
      integrationHealth: 'Good',
      monthlyRequests: 8750,
      avgResponseTime: 95,
      tags: ['Development', 'CI/CD', 'Git'],
      owner: 'Sarah Johnson',
      cost: 1800,
      license: 'Premium'
    },
    {
      id: 3,
      name: 'Grafana',
      description: 'Monitoring and observability platform for metrics visualization',
      url: 'https://grafana.company.com',
      type: 'JWT',
      status: 'Pending',
      category: 'Monitoring',
      users: 0,
      activeUsers: 0,
      lastSync: 'Never',
      logo: '📊',
      version: '10.2.0',
      uptime: 0,
      environment: 'Staging',
      metadata: {
        secret: 'jwt-secret-key',
        algorithm: 'HS256',
        expiration: '24h',
        issuer: 'company-sso'
      },
      permissions: ['read'],
      createdAt: '2024-03-01',
      lastActivity: 'Never',
      error: 'Configuration incomplete - JWT secret not configured',
      integrationHealth: 'Poor',
      monthlyRequests: 0,
      avgResponseTime: 0,
      tags: ['Monitoring', 'Analytics', 'New'],
      owner: 'Mike Wilson',
      cost: 0,
      license: 'Open Source'
    },
    {
      id: 4,
      name: 'Confluence',
      description: 'Team collaboration and documentation workspace',
      url: 'https://confluence.company.com',
      type: 'SAML',
      status: 'Integrated',
      category: 'Documentation',
      users: 156,
      activeUsers: 134,
      lastSync: '30 minutes ago',
      logo: '📝',
      version: '8.5.0',
      uptime: 99.8,
      environment: 'Production',
      metadata: {
        entityId: 'https://confluence.company.com/sso',
        acsUrl: 'https://confluence.company.com/saml/acs',
        certificate: 'Valid until 2025-06-30'
      },
      permissions: ['read', 'write'],
      createdAt: '2024-01-20',
      lastActivity: '2024-03-15 14:15:33',
      integrationHealth: 'Excellent',
      monthlyRequests: 12300,
      avgResponseTime: 110,
      tags: ['Documentation', 'Collaboration', 'Knowledge'],
      owner: 'Lisa Chen',
      cost: 2000,
      license: 'Standard'
    },
    {
      id: 5,
      name: 'Slack',
      description: 'Team communication and collaboration platform',
      url: 'https://company.slack.com',
      type: 'OAuth2',
      status: 'Error',
      category: 'Communication',
      users: 0,
      activeUsers: 0,
      lastSync: '2 days ago',
      logo: '💬',
      version: 'Cloud',
      uptime: 95.2,
      environment: 'Production',
      metadata: {
        clientId: 'slack-oauth-client-id',
        teamId: 'T1234567890',
        botToken: 'xoxb-***',
        webhookUrl: 'https://hooks.slack.com/***'
      },
      permissions: ['read'],
      createdAt: '2024-02-15',
      lastActivity: '2024-03-13 09:20:15',
      error: 'OAuth token expired - requires re-authorization',
      integrationHealth: 'Critical',
      monthlyRequests: 0,
      avgResponseTime: 0,
      tags: ['Communication', 'Chat', 'Notifications'],
      owner: 'David Brown',
      cost: 1200,
      license: 'Pro'
    },
    {
      id: 6,
      name: 'Salesforce',
      description: 'Customer relationship management and sales automation',
      url: 'https://company.salesforce.com',
      type: 'SAML',
      status: 'Integrated',
      category: 'CRM',
      users: 67,
      activeUsers: 58,
      lastSync: '4 hours ago',
      logo: '☁️',
      version: 'Spring 24',
      uptime: 99.95,
      environment: 'Production',
      metadata: {
        entityId: 'https://company.salesforce.com',
        loginUrl: 'https://company.salesforce.com/saml/login',
        orgId: '00D000000000000EAA'
      },
      permissions: ['read', 'write'],
      createdAt: '2024-01-10',
      lastActivity: '2024-03-15 12:30:45',
      integrationHealth: 'Excellent',
      monthlyRequests: 9800,
      avgResponseTime: 85,
      tags: ['CRM', 'Sales', 'Customer'],
      owner: 'Emily Davis',
      cost: 3500,
      license: 'Enterprise'
    },
    {
      id: 7,
      name: 'AWS Console',
      description: 'Amazon Web Services cloud management console',
      url: 'https://console.aws.amazon.com',
      type: 'SAML',
      status: 'Integrated',
      category: 'Cloud Infrastructure',
      users: 23,
      activeUsers: 19,
      lastSync: '1 hour ago',
      logo: '🔶',
      version: 'Current',
      uptime: 99.99,
      environment: 'Production',
      metadata: {
        roleArn: 'arn:aws:iam::123456789012:role/SSO-Role',
        principalArn: 'arn:aws:iam::123456789012:saml-provider/CompanySSO'
      },
      permissions: ['read', 'write', 'admin'],
      createdAt: '2024-01-05',
      lastActivity: '2024-03-15 15:20:10',
      integrationHealth: 'Excellent',
      monthlyRequests: 3200,
      avgResponseTime: 200,
      tags: ['Cloud', 'Infrastructure', 'DevOps'],
      owner: 'Alex Rodriguez',
      cost: 0,
      license: 'Pay-as-you-go'
    },
    {
      id: 8,
      name: 'Tableau',
      description: 'Business intelligence and data visualization platform',
      url: 'https://tableau.company.com',
      type: 'SAML',
      status: 'Maintenance',
      category: 'Analytics',
      users: 45,
      activeUsers: 0,
      lastSync: '6 hours ago',
      logo: '📈',
      version: '2023.3',
      uptime: 98.5,
      environment: 'Production',
      metadata: {
        entityId: 'https://tableau.company.com/saml',
        acsUrl: 'https://tableau.company.com/saml/acs'
      },
      permissions: ['read', 'write'],
      createdAt: '2024-02-20',
      lastActivity: '2024-03-15 08:45:22',
      integrationHealth: 'Fair',
      monthlyRequests: 5600,
      avgResponseTime: 150,
      tags: ['Analytics', 'BI', 'Visualization'],
      owner: 'Rachel Green',
      cost: 4200,
      license: 'Creator'
    }
  ]);

  // Enhanced Stats calculation
  const stats = {
    total: applications.length,
    integrated: applications.filter(app => app.status === 'Integrated').length,
    pending: applications.filter(app => app.status === 'Pending').length,
    errors: applications.filter(app => app.status === 'Error').length,
    maintenance: applications.filter(app => app.status === 'Maintenance').length,
    totalUsers: applications.reduce((sum, app) => sum + app.users, 0),
    activeUsers: applications.reduce((sum, app) => sum + app.activeUsers, 0),
    totalCost: applications.reduce((sum, app) => sum + app.cost, 0),
    avgUptime: applications.reduce((sum, app) => sum + app.uptime, 0) / applications.length,
    totalRequests: applications.reduce((sum, app) => sum + app.monthlyRequests, 0),
    avgResponseTime: applications.reduce((sum, app) => sum + app.avgResponseTime, 0) / applications.length
  };

  // Enhanced Filter and Sort Functions
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || app.type === filterType;
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || app.category === filterCategory;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
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

  // Utility Functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Integrated':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'Pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'Error':
        return <XCircle size={16} className="text-red-600" />;
      case 'Maintenance':
        return <Settings size={16} className="text-blue-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Integrated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Maintenance':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAuthTypeIcon = (type) => {
    switch (type) {
      case 'SAML':
        return <Shield size={16} className="text-blue-600" />;
      case 'OAuth2':
        return <Key size={16} className="text-green-600" />;
      case 'JWT':
        return <Lock size={16} className="text-purple-600" />;
      case 'API Key':
        return <Server size={16} className="text-orange-600" />;
      default:
        return <Globe size={16} className="text-gray-600" />;
    }
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'Excellent':
        return 'text-green-600';
      case 'Good':
        return 'text-blue-600';
      case 'Fair':
        return 'text-yellow-600';
      case 'Poor':
        return 'text-orange-600';
      case 'Critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const copyToClipboard = (text, appId) => {
    navigator.clipboard.writeText(text);
    setCopiedAppId(appId);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Enhanced Modal Components
  const AddApplicationModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      url: '',
      type: 'SAML',
      category: 'Other',
      logo: '🔧',
      environment: 'Development',
      owner: '',
      tags: []
    });

    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      const newApp = {
        id: applications.length + 1,
        ...formData,
        status: 'Pending',
        users: 0,
        activeUsers: 0,
        lastSync: 'Never',
        uptime: 0,
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: 'Never',
        monthlyRequests: 0,
        avgResponseTime: 0,
        cost: 0,
        license: 'Unknown',
        integrationHealth: 'Poor',
        permissions: ['read']
      };
      setApplications([...applications, newApp]);
      setShowAddModal(false);
    };

    const addTag = () => {
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({...formData, tags: [...formData.tags, newTag]});
        setNewTag('');
      }
    };

    const removeTag = (tagToRemove) => {
      setFormData({...formData, tags: formData.tags.filter(tag => tag !== tagToRemove)});
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Application</h2>
              <p className="text-gray-600 mt-1">Configure a new application integration</p>
            </div>
            <button 
              onClick={() => setShowAddModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Jira"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Project Management">Project Management</option>
                  <option value="Development">Development</option>
                  <option value="Communication">Communication</option>
                  <option value="Documentation">Documentation</option>
                  <option value="CRM">CRM</option>
                  <option value="Analytics">Analytics</option>
                  <option value="Monitoring">Monitoring</option>
                  <option value="Cloud Infrastructure">Cloud Infrastructure</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the application"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Application URL *</label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://app.company.com"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Authentication Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="SAML">SAML 2.0</option>
                  <option value="OAuth2">OAuth 2.0</option>
                  <option value="JWT">JWT Token</option>
                  <option value="API Key">API Key</option>
                  <option value="LDAP">LDAP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                <select 
                  value={formData.environment}
                  onChange={(e) => setFormData({...formData, environment: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Development">Development</option>
                  <option value="Staging">Staging</option>
                  <option value="Production">Production</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="🔧"
                  maxLength="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({...formData, owner: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Application owner"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Application
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 p-6">
      {/* Enhanced Header */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Grid3X3 className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            </div>
            <p className="text-gray-600">
              Manage your applications, integrations, and authentication configurations across your organization
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.integrated} of {stats.total} Active
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {formatCurrency(stats.totalCost)}/month total cost
              </p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Application
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Apps</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-blue-700 mt-1">
                {stats.integrated} integrated
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
              <p className="text-sm font-medium text-green-600">Active Users</p>
              <p className="text-3xl font-bold text-green-900">{stats.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-1">
                of {stats.totalUsers.toLocaleString()} total
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
              <p className="text-sm font-medium text-purple-600">Monthly Requests</p>
              <p className="text-3xl font-bold text-purple-900">{(stats.totalRequests / 1000).toFixed(1)}K</p>
              <p className="text-xs text-purple-700 mt-1">
                Avg: {Math.round(stats.avgResponseTime)}ms
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Activity className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Uptime</p>
              <p className="text-3xl font-bold text-orange-900">{stats.avgUptime.toFixed(1)}%</p>
              <p className="text-xs text-orange-700 mt-1">
                Average across all apps
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Gauge className="h-8 w-8 text-orange-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Issues</p>
              <p className="text-3xl font-bold text-red-900">{stats.errors}</p>
              <p className="text-xs text-red-700 mt-1">
                {stats.pending} pending
              </p>
            </div>
            <div className="p-3 bg-red-200 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600">Monthly Cost</p>
              <p className="text-3xl font-bold text-emerald-900">{formatCurrency(stats.totalCost / 1000)}K</p>
              <p className="text-xs text-emerald-700 mt-1">
                Total spend
              </p>
            </div>
            <div className="p-3 bg-emerald-200 rounded-lg">
              <TrendingUp className="h-8 w-8 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications, descriptions, or tags..."
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
                <option value="SAML">SAML</option>
                <option value="OAuth2">OAuth2</option>
                <option value="JWT">JWT</option>
                <option value="API Key">API Key</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Integrated">Integrated</option>
                <option value="Pending">Pending</option>
                <option value="Error">Error</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Project Management">Project Management</option>
                <option value="Development">Development</option>
                <option value="Communication">Communication</option>
                <option value="Documentation">Documentation</option>
                <option value="CRM">CRM</option>
                <option value="Analytics">Analytics</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Cloud Infrastructure">Cloud Infrastructure</option>
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
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="users">Sort by Users</option>
                <option value="lastActivity">Sort by Activity</option>
                <option value="uptime">Sort by Uptime</option>
                <option value="cost">Sort by Cost</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <ChevronDown size={16} className={`transform transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
              </button>
              
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center transition-colors">
                <Download size={16} className="mr-2" />
                Export
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
                    <div key={app.id} className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-200">
                      {/* App Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{app.logo}</div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">{app.name}</h3>
                            <p className="text-sm text-gray-500">{app.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Status and Health */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1">{app.status}</span>
                        </span>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            app.uptime > 99 ? 'bg-green-400' : 
                            app.uptime > 95 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className="text-xs text-gray-600">{app.uptime}% uptime</span>
                        </div>
                      </div>

                      {/* App Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Auth Type:</span>
                          <div className="flex items-center space-x-1">
                            {getAuthTypeIcon(app.type)}
                            <span className="font-medium">{app.type}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Users:</span>
                          <div className="text-right">
                            <span className="font-medium">{app.activeUsers}</span>
                            <span className="text-gray-400">/{app.users}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Monthly Cost:</span>
                          <span className="font-medium">{formatCurrency(app.cost)}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Last Sync:</span>
                          <span className="text-gray-600">{app.lastSync}</span>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Performance</span>
                          <span className={getHealthColor(app.integrationHealth)}>{app.integrationHealth}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span>Requests/month</span>
                            <span>{app.monthlyRequests.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span>Avg response</span>
                            <span>{app.avgResponseTime}ms</span>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      {app.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <AlertTriangle size={14} className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-red-800">{app.error}</span>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {app.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                              {tag}
                            </span>
                          ))}
                          {app.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">
                              +{app.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {setSelectedApp(app); setShowConfigModal(true);}}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                          >
                            <Settings size={14} className="mr-1" />
                            Configure
                          </button>
                          <button 
                            onClick={() => {setSelectedApp(app); setShowDetailsModal(true);}}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center transition-colors"
                          >
                            <Eye size={14} className="mr-1" />
                            Details
                          </button>
                        </div>
                        <a 
                          href={app.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center transition-colors"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          Visit
                        </a>
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
                          Auth & Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Users & Activity
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost & Owner
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedApplications.map(app => (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-4">
                              <div className="text-2xl">{app.logo}</div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900">{app.name}</p>
                                  <a 
                                    href={app.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                                <p className="text-sm text-gray-500">{app.category}</p>
                                <p className="text-xs text-gray-400 truncate max-w-xs">{app.description}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                {getAuthTypeIcon(app.type)}
                                <span className="text-sm font-medium">{app.type}</span>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                {getStatusIcon(app.status)}
                                <span className="ml-1">{app.status}</span>
                              </span>
                              {app.error && (
                                <p className="text-xs text-red-600 truncate max-w-xs">{app.error}</p>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Users size={14} className="text-gray-400" />
                                <span className="text-sm font-medium">{app.activeUsers}</span>
                                <span className="text-sm text-gray-500">/ {app.users}</span>
                              </div>
                              <p className="text-xs text-gray-500">Last sync: {app.lastSync}</p>
                              <p className="text-xs text-gray-500">Last activity: {app.lastActivity !== 'Never' ? formatDateTime(app.lastActivity) : 'Never'}</p>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  app.uptime > 99 ? 'bg-green-400' : 
                                  app.uptime > 95 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}></div>
                                <span className="text-sm font-medium">{app.uptime}%</span>
                                <span className="text-xs text-gray-500">uptime</span>
                              </div>
                              <p className="text-xs text-gray-500">{app.monthlyRequests.toLocaleString()} req/month</p>
                              <p className="text-xs text-gray-500">{app.avgResponseTime}ms avg</p>
                              <span className={`text-xs font-medium ${getHealthColor(app.integrationHealth)}`}>
                                {app.integrationHealth}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{formatCurrency(app.cost)}/mo</p>
                              <p className="text-xs text-gray-500">{app.license}</p>
                              <p className="text-xs text-gray-600">{app.owner}</p>
                              <p className="text-xs text-gray-500">{app.environment}</p>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {setSelectedApp(app); setShowDetailsModal(true);}}
                                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => {setSelectedApp(app); setShowConfigModal(true);}}
                                className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Configure"
                              >
                                <Settings size={16} />
                              </button>
                              <button 
                                onClick={() => copyToClipboard(app.url, app.id)}
                                className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                title="Copy URL"
                              >
                                {copiedAppId === app.id ? (
                                  <CheckCircle size={16} className="text-green-600" />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                              <button 
                                onClick={() => {setSelectedApp(app); setShowDeleteConfirmModal(true);}}
                                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete"
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

              {/* Enhanced Pagination */}
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
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'No applications found' 
                  : 'No Applications Yet'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first application integration'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && filterCategory === 'all' && (
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

      {/* Modals */}
      {showAddModal && <AddApplicationModal />}
      
      {/* Enhanced Configuration Modal */}
      {showConfigModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedApp.logo}</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Configure {selectedApp.name}</h2>
                  <p className="text-gray-600">{selectedApp.type} Authentication Setup</p>
                </div>
              </div>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Configuration */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Basic Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                      <input
                        type="text"
                        value={selectedApp.name}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value={selectedApp.category}>{selectedApp.category}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Application URL</label>
                      <input
                        type="url"
                        value={selectedApp.url}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Environment</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value={selectedApp.environment}>{selectedApp.environment}</option>
                        <option value="Development">Development</option>
                        <option value="Staging">Staging</option>
                        <option value="Production">Production</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Auth-specific configuration */}
                {selectedApp.type === 'SAML' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Shield className="mr-2 text-blue-600" size={20} />
                      SAML 2.0 Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
                        <input
                          type="text"
                          value={selectedApp.metadata?.entityId || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://app.company.com/saml/metadata"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ACS URL (Assertion Consumer Service)</label>
                        <input
                          type="url"
                          value={selectedApp.metadata?.acsUrl || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://app.company.com/saml/acs"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">SSO URL</label>
                        <input
                          type="url"
                          value={selectedApp.metadata?.ssoUrl || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://sso.company.com/saml/login"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Certificate Status</label>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-600" size={16} />
                          <span className="text-sm text-green-700">{selectedApp.metadata?.certificate || 'Not configured'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedApp.type === 'OAuth2' && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Key className="mr-2 text-green-600" size={20} />
                      OAuth 2.0 Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={selectedApp.metadata?.clientId || ''}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="oauth-client-id"
                          />
                          <button
                            onClick={() => copyToClipboard(selectedApp.metadata?.clientId || '', selectedApp.id)}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            value="••••••••••••••••"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Redirect URI</label>
                        <input
                          type="url"
                          value={selectedApp.metadata?.redirectUri || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://app.company.com/oauth/callback"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedApp.metadata?.scopes?.map(scope => (
                            <span key={scope} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-200">
                              {scope}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Token Expiry</label>
                        <input
                          type="text"
                          value={selectedApp.metadata?.tokenExpiry || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="7 days"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedApp.type === 'JWT' && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                      <Lock className="mr-2 text-purple-600" size={20} />
                      JWT Token Configuration
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                        <div className="flex space-x-2">
                          <input
                            type="password"
                            value="••••••••••••••••••••••••••••••••"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            readOnly
                          />
                          <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm</label>
                          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value={selectedApp.metadata?.algorithm}>{selectedApp.metadata?.algorithm}</option>
                            <option value="HS256">HS256</option>
                            <option value="HS384">HS384</option>
                            <option value="HS512">HS512</option>
                            <option value="RS256">RS256</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Token Expiration</label>
                          <input
                            type="text"
                            value={selectedApp.metadata?.expiration || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="24h"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
                        <input
                          type="text"
                          value={selectedApp.metadata?.issuer || ''}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="company-sso"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Settings */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Advanced Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Auto-provisioning</label>
                        <p className="text-xs text-gray-500">Automatically create users on first login</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Force re-authentication</label>
                        <p className="text-xs text-gray-500">Require users to re-authenticate periodically</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Session timeout</label>
                        <p className="text-xs text-gray-500">Automatically log out inactive users</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                        <option>8 hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Application Info</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedApp.status)}`}>
                        {getStatusIcon(selectedApp.status)}
                        <span className="ml-1">{selectedApp.status}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version:</span>
                      <span className="font-medium">{selectedApp.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Uptime:</span>
                      <span className="font-medium">{selectedApp.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Users:</span>
                      <span className="font-medium">{selectedApp.activeUsers}/{selectedApp.users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Monthly Cost:</span>
                      <span className="font-medium">{formatCurrency(selectedApp.cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Owner:</span>
                      <span className="font-medium">{selectedApp.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{formatDate(selectedApp.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Health:</span>
                      <span className={`font-medium ${getHealthColor(selectedApp.integrationHealth)}`}>
                        {selectedApp.integrationHealth}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Requests/month:</span>
                      <span className="font-medium">{selectedApp.monthlyRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg Response:</span>
                      <span className="font-medium">{selectedApp.avgResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Last Sync:</span>
                      <span className="font-medium">{selectedApp.lastSync}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center">
                      <RefreshCw size={14} className="mr-2" />
                      Test Connection
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center">
                      <Download size={14} className="mr-2" />
                      Export Config
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center">
                      <History size={14} className="mr-2" />
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center">
                  <Trash2 size={14} className="mr-2" />
                  Delete Application
                </button>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Details Modal */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{selectedApp.logo}</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedApp.name}</h2>
                  <p className="text-gray-600">{selectedApp.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApp.status)}`}>
                      {getStatusIcon(selectedApp.status)}
                      <span className="ml-1">{selectedApp.status}</span>
                    </span>
                    <span className="text-sm text-gray-500">{selectedApp.category}</span>
                    <a 
                      href={selectedApp.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Visit Application
                    </a>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-blue-900">Active Users</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{selectedApp.activeUsers}</p>
                    <p className="text-xs text-blue-700">of {selectedApp.users} total</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Gauge className="text-green-600" size={16} />
                      <span className="text-sm font-medium text-green-900">Uptime</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{selectedApp.uptime}%</p>
                    <p className="text-xs text-green-700">Last 30 days</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="text-purple-600" size={16} />
                      <span className="text-sm font-medium text-purple-900">Requests</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{(selectedApp.monthlyRequests / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-purple-700">This month</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Timer className="text-orange-600" size={16} />
                      <span className="text-sm font-medium text-orange-900">Response</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{selectedApp.avgResponseTime}</p>
                    <p className="text-xs text-orange-700">ms average</p>
                  </div>
                </div>

                {/* Authentication Details */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {getAuthTypeIcon(selectedApp.type)}
                    <span className="ml-2">Authentication Configuration</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <p className="text-sm text-gray-900">{selectedApp.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                      <p className="text-sm text-gray-900">{selectedApp.environment}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Sync</label>
                      <p className="text-sm text-gray-900">{selectedApp.lastSync}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Integration Health</label>
                      <p className={`text-sm font-medium ${getHealthColor(selectedApp.integrationHealth)}`}>
                        {selectedApp.integrationHealth}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <History className="mr-2" size={20} />
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Successful authentication</p>
                        <p className="text-xs text-gray-500">User john.doe@company.com logged in</p>
                      </div>
                      <span className="text-xs text-gray-500">2 min ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Configuration updated</p>
                        <p className="text-xs text-gray-500">SAML settings modified by admin</p>
                      </div>
                      <span className="text-xs text-gray-500">1 hour ago</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Sync completed</p>
                        <p className="text-xs text-gray-500">User directory synchronized</p>
                      </div>
                      <span className="text-xs text-gray-500">2 hours ago</span>
                    </div>
                  </div>
                </div>

                {/* Error Details */}
                {selectedApp.error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                      <AlertTriangle className="mr-2" size={20} />
                      Current Issues
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <XCircle className="text-red-600 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-medium text-red-900">Authentication Error</p>
                          <p className="text-sm text-red-700">{selectedApp.error}</p>
                          <div className="mt-2 flex space-x-2">
                            <button className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-md hover:bg-red-200 transition-colors">
                              Troubleshoot
                            </button>
                            <button className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-md hover:bg-red-200 transition-colors">
                              View Logs
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Application Details</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <label className="block text-gray-500 mb-1">Owner</label>
                      <p className="font-medium">{selectedApp.owner}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Version</label>
                      <p className="font-medium">{selectedApp.version}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">License</label>
                      <p className="font-medium">{selectedApp.license}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Monthly Cost</label>
                      <p className="font-medium">{formatCurrency(selectedApp.cost)}</p>
                                        </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Created</label>
                      <p className="font-medium">{formatDate(selectedApp.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Last Activity</label>
                      <p className="font-medium">
                        {selectedApp.lastActivity !== 'Never' ? formatDateTime(selectedApp.lastActivity) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Permissions</h4>
                  <div className="space-y-2">
                    {selectedApp.permissions.map(permission => (
                      <div key={permission} className="flex items-center space-x-2">
                        <CheckCircle size={14} className="text-green-600" />
                        <span className="text-sm capitalize">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApp.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button 
                      onClick={() => {setShowDetailsModal(false); setShowConfigModal(true);}}
                      className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                    >
                      <Settings size={14} className="mr-2" />
                      Configure
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center">
                      <RefreshCw size={14} className="mr-2" />
                      Test Connection
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center">
                      <Download size={14} className="mr-2" />
                      Export Data
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors flex items-center">
                      <History size={14} className="mr-2" />
                      View Audit Logs
                    </button>
                    <button className="w-full px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center">
                      <Copy size={14} className="mr-2" />
                      Copy App ID
                    </button>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Integration Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Connection</span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${selectedApp.status === 'Integrated' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="text-sm font-medium">{selectedApp.status === 'Integrated' ? 'Connected' : 'Disconnected'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto-sync</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-sm font-medium">Enabled</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Monitoring</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Application ID: {selectedApp.id}</span>
                <span>•</span>
                <span>Created {formatDate(selectedApp.createdAt)}</span>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Delete Application</h2>
              </div>
              <button 
                onClick={() => setShowDeleteConfirmModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <strong>{selectedApp.name}</strong>? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">This will:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Remove all authentication configurations</li>
                  <li>• Disconnect {selectedApp.users} users</li>
                  <li>• Delete all integration logs and data</li>
                  <li>• Stop all automated syncing</li>
                </ul>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setApplications(applications.filter(app => app.id !== selectedApp.id));
                  setShowDeleteConfirmModal(false);
                  setSelectedApp(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDemo;

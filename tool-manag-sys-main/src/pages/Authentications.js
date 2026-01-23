import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Settings,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Globe,
  Smartphone,
  Mail,
  Server,
  Activity,
  Filter,
  Search,
  Download,
  RefreshCw,
  X,
  Copy,
  MoreVertical,
  Calendar,
  TrendingUp,
  BarChart3,
  History,
  FileText,
  Zap,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
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
  Gauge
} from 'lucide-react';

const Authentications = () => {
  // Enhanced State Management
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, table
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showEditProviderModal, setShowEditProviderModal] = useState(false);
  const [showProviderDetailsModal, setShowProviderDetailsModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterEnvironment, setFilterEnvironment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [dateRange, setDateRange] = useState('7d');

  // Enhanced Mock Data with more realistic structure
  const [authProviders, setAuthProviders] = useState([
    {
      id: 1,
      name: 'Corporate SAML SSO',
      type: 'SAML',
      status: 'Active',
      health: 'Healthy',
      users: 1245,
      activeUsers: 892,
      entityId: 'https://company.com/sso',
      ssoUrl: 'https://sso.company.com/saml',
      domains: ['@company.com', '@subsidiary.com', '@partner.com'],
      lastSync: '2 minutes ago',
      certificate: 'Valid until 2025-12-31',
      createdAt: '2024-01-15T10:30:00Z',
      lastActivity: '2024-03-15T14:30:22Z',
      successRate: 98.5,
      totalLogins: 15420,
      failedLogins: 231,
      avgResponseTime: '1.2s',
      uptime: 99.8,
      environment: 'production',
      priority: 'high',
      tags: ['enterprise', 'sso', 'production'],
      config: {
        autoProvisioning: true,
        jitProvisioning: false,
        signRequests: true,
        encryptAssertions: true,
        singleLogout: true
      },
      metadata: {
        version: '2.0',
        binding: 'HTTP-POST',
        nameIdFormat: 'emailAddress'
      },
      monitoring: {
        responseTime: [1.1, 1.3, 0.9, 1.2, 1.4, 1.0, 1.2],
        errorRate: [0.1, 0.2, 0.0, 0.1, 0.3, 0.1, 0.2],
        throughput: [120, 135, 98, 142, 156, 134, 128]
      }
    },
    {
      id: 2,
      name: 'Google Workspace OAuth',
      type: 'OAuth2',
      status: 'Active',
      health: 'Healthy',
      users: 589,
      activeUsers: 423,
      clientId: 'google-oauth-client-id-12345',
      domains: ['@company.com', '@dev.company.com'],
      lastSync: '5 minutes ago',
      scopes: ['email', 'profile', 'openid', 'groups'],
      createdAt: '2024-02-01T09:15:00Z',
      lastActivity: '2024-03-15T13:45:10Z',
      successRate: 99.2,
      totalLogins: 8680,
      failedLogins: 67,
      avgResponseTime: '0.8s',
      uptime: 99.9,
      environment: 'production',
      priority: 'high',
      tags: ['oauth', 'google', 'cloud'],
      config: {
        autoProvisioning: true,
        jitProvisioning: true,
        refreshTokens: true,
        pkce: true,
        consentScreen: 'internal'
      },
      metadata: {
        version: '2.0',
        grantTypes: ['authorization_code', 'refresh_token'],
        tokenEndpoint: 'https://oauth2.googleapis.com/token'
      },
      monitoring: {
        responseTime: [0.7, 0.9, 0.6, 0.8, 1.0, 0.7, 0.8],
        errorRate: [0.0, 0.1, 0.0, 0.0, 0.2, 0.0, 0.1],
        throughput: [89, 95, 76, 92, 98, 87, 91]
      }
    },
    {
      id: 3,
      name: 'Azure Active Directory',
      type: 'OIDC',
      status: 'Warning',
      health: 'Degraded',
      users: 0,
      activeUsers: 0,
      tenantId: 'azure-tenant-id-67890',
      domains: [],
      lastSync: 'Never',
      error: 'Configuration incomplete - Missing client secret',
      createdAt: '2024-03-01T14:20:00Z',
      lastActivity: 'Never',
      successRate: 0,
      totalLogins: 0,
      failedLogins: 0,
      avgResponseTime: 'N/A',
      uptime: 0,
      environment: 'staging',
      priority: 'medium',
      tags: ['azure', 'oidc', 'staging'],
      config: {
        autoProvisioning: false,
        jitProvisioning: false,
        implicitFlow: false,
        hybridFlow: true
      },
      metadata: {
        version: '1.0',
        issuer: 'https://login.microsoftonline.com/tenant-id',
        authEndpoint: 'https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize'
      },
      monitoring: {
        responseTime: [0, 0, 0, 0, 0, 0, 0],
        errorRate: [0, 0, 0, 0, 0, 0, 0],
        throughput: [0, 0, 0, 0, 0, 0, 0]
      }
    },
    {
      id: 4,
      name: 'Corporate LDAP Directory',
      type: 'LDAP',
      status: 'Active',
      health: 'Healthy',
      users: 756,
      activeUsers: 634,
      server: 'ldaps://directory.company.com:636',
      baseDn: 'dc=company,dc=com',
      domains: ['@company.com', '@internal.company.com'],
      lastSync: '1 hour ago',
      createdAt: '2024-01-10T08:45:00Z',
      lastActivity: '2024-03-15T15:20:05Z',
      successRate: 97.8,
      totalLogins: 12920,
      failedLogins: 284,
      avgResponseTime: '2.1s',
      uptime: 99.5,
      environment: 'production',
      priority: 'high',
      tags: ['ldap', 'directory', 'legacy'],
      config: {
        ssl: true,
        autoProvisioning: true,
        groupSync: true,
        nestedGroups: false,
        passwordSync: false
      },
      metadata: {
        version: '3',
        schema: 'Active Directory',
        searchBase: 'ou=users,dc=company,dc=com'
      },
      monitoring: {
        responseTime: [2.0, 2.3, 1.8, 2.1, 2.4, 1.9, 2.1],
        errorRate: [0.2, 0.3, 0.1, 0.2, 0.4, 0.2, 0.3],
        throughput: [67, 72, 58, 69, 74, 65, 68]
      }
    },
    {
      id: 5,
      name: 'GitHub Enterprise OAuth',
      type: 'OAuth2',
      status: 'Active',
      health: 'Healthy',
      users: 234,
      activeUsers: 189,
      clientId: 'github-oauth-client-54321',
      domains: ['@company.com'],
      lastSync: '15 minutes ago',
      scopes: ['user:email', 'read:org', 'repo'],
      createdAt: '2024-02-15T11:30:00Z',
      lastActivity: '2024-03-15T14:45:33Z',
      successRate: 98.9,
      totalLogins: 3456,
      failedLogins: 38,
      avgResponseTime: '1.1s',
      uptime: 99.7,
      environment: 'production',
      priority: 'medium',
      tags: ['github', 'oauth', 'developer'],
      config: {
        autoProvisioning: true,
        jitProvisioning: true,
        refreshTokens: false,
        pkce: false,
        webhooks: true
      },
      metadata: {
        version: '2.0',
        grantTypes: ['authorization_code'],
        apiUrl: 'https://api.github.com'
      },
      monitoring: {
        responseTime: [1.0, 1.2, 0.9, 1.1, 1.3, 1.0, 1.1],
        errorRate: [0.1, 0.1, 0.0, 0.1, 0.2, 0.1, 0.1],
        throughput: [45, 48, 39, 47, 52, 44, 46]
      }
    },
    {
      id: 6,
      name: 'Okta SAML Integration',
      type: 'SAML',
      status: 'Inactive',
      health: 'Offline',
      users: 0,
      activeUsers: 0,
      entityId: 'https://dev-12345.okta.com',
      ssoUrl: 'https://dev-12345.okta.com/app/company/sso/saml',
      domains: [],
      lastSync: '3 days ago',
      error: 'Connection timeout - Service unreachable',
      createdAt: '2024-03-10T16:00:00Z',
      lastActivity: '2024-03-12T10:15:22Z',
      successRate: 0,
      totalLogins: 145,
      failedLogins: 23,
      avgResponseTime: 'N/A',
      uptime: 0,
      environment: 'development',
      priority: 'low',
      tags: ['okta', 'saml', 'development'],
      config: {
        autoProvisioning: false,
        jitProvisioning: false,
        signRequests: false,
        encryptAssertions: false,
        singleLogout: false
      },
      metadata: {
        version: '2.0',
        binding: 'HTTP-POST',
        nameIdFormat: 'unspecified'
      },
      monitoring: {
        responseTime: [0, 0, 0, 0, 0, 0, 0],
        errorRate: [0, 0, 0, 0, 0, 0, 0],
        throughput: [0, 0, 0, 0, 0, 0, 0]
      }
    }
  ]);

  // Enhanced API Keys Data
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Production Authentication API',
      key: 'pk_live_1234567890abcdef1234567890abcdef12345678',
      keyPreview: 'pk_live_***************5678',
      created: '2024-01-15T10:30:00Z',
      lastUsed: '2024-03-15T14:25:33Z',
      permissions: ['auth:read', 'auth:write', 'users:read', 'providers:manage'],
      status: 'Active',
      usage: 15420,
      rateLimit: 10000,
      rateLimitWindow: 'hour',
      environment: 'production',
      description: 'Main production API key for authentication services and user management',
      ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
      expiresAt: '2024-12-31T23:59:59Z',
      createdBy: 'admin@company.com',
      lastUsedBy: 'api-service@company.com',
      tags: ['production', 'critical', 'main-api']
    },
    {
      id: 2,
      name: 'Development Testing API',
      key: 'pk_test_abcdef1234567890abcdef1234567890abcdef12',
      keyPreview: 'pk_test_***************ef12',
      created: '2024-02-01T09:15:00Z',
      lastUsed: '2024-03-14T16:42:18Z',
      permissions: ['auth:read', 'users:read'],
      status: 'Active',
      usage: 2340,
      rateLimit: 1000,
      rateLimitWindow: 'hour',
      environment: 'development',
      description: 'Development environment API key for testing authentication flows',
      ipWhitelist: [],
      expiresAt: '2024-06-30T23:59:59Z',
      createdBy: 'dev@company.com',
      lastUsedBy: 'test-runner@company.com',
      tags: ['development', 'testing']
    },
    {
      id: 3,
      name: 'Mobile App Authentication',
      key: 'pk_live_fedcba0987654321fedcba0987654321fedcba09',
      keyPreview: 'pk_live_***************ba09',
      created: '2024-02-15T11:30:00Z',
      lastUsed: '2024-03-15T14:30:45Z',
      permissions: ['auth:read', 'auth:write', 'users:read'],
      status: 'Active',
      usage: 8750,
      rateLimit: 5000,
      rateLimitWindow: 'hour',
      environment: 'production',
      description: 'API key for mobile application authentication and user profile access',
      ipWhitelist: [],
      expiresAt: '2025-02-15T11:30:00Z',
      createdBy: 'mobile-team@company.com',
      lastUsedBy: 'mobile-app@company.com',
      tags: ['mobile', 'production', 'client-app']
    },
    {
      id: 4,
      name: 'Analytics Service Key',
      key: 'pk_live_9876543210fedcba9876543210fedcba98765432',
      keyPreview: 'pk_live_***************5432',
      created: '2024-03-01T14:20:00Z',
      lastUsed: '2024-03-15T13:15:22Z',
      permissions: ['auth:read', 'analytics:read'],
      status: 'Active',
      usage: 4567,
      rateLimit: 2000,
      rateLimitWindow: 'hour',
      environment: 'production',
      description: 'Read-only API key for analytics and reporting services',
      ipWhitelist: ['10.1.0.0/16'],
      expiresAt: '2024-09-01T14:20:00Z',
      createdBy: 'analytics@company.com',
      lastUsedBy: 'reporting-service@company.com',
      tags: ['analytics', 'read-only', 'reporting']
    }
  ]);

  // Enhanced Authentication Logs
  const [authLogs, setAuthLogs] = useState([
    {
      id: 1,
      user: 'john.smith@company.com',
      userId: 'usr_12345',
      provider: 'Corporate SAML SSO',
      providerId: 1,
      action: 'Login Success',
      ip: '192.168.1.100',
      timestamp: '2024-03-15T14:30:22Z',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      location: 'New York, US',
      status: 'success',
      duration: 1.2,
      sessionId: 'sess_abc123def456',
      deviceId: 'dev_laptop_001',
      riskScore: 0.1,
      mfaUsed: true,
      mfaMethod: 'authenticator_app'
    },
    {
      id: 2,
      user: 'jane.doe@company.com',
      userId: 'usr_67890',
      provider: 'Google Workspace OAuth',
      providerId: 2,
      action: 'Login Failed',
      ip: '192.168.1.101',
      timestamp: '2024-03-15T14:25:15Z',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      location: 'London, UK',
      status: 'failed',
      error: 'Invalid credentials',
      duration: 0.8,
      attempts: 3,
      deviceId: 'dev_macbook_002',
      riskScore: 0.7,
      mfaUsed: false,
      blockedReason: 'Too many failed attempts'
    },
    {
      id: 3,
      user: 'mike.wilson@company.com',
      userId: 'usr_11111',
      provider: 'Corporate SAML SSO',
      providerId: 1,
      action: '2FA Required',
      ip: '192.168.1.102',
      timestamp: '2024-03-15T14:20:10Z',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      location: 'San Francisco, US',
      status: 'pending',
      duration: null,
      mfaMethod: 'sms',
      deviceId: 'dev_iphone_003',
      riskScore: 0.3,
      mfaUsed: false,
      challengeId: 'chall_xyz789'
    },
    {
      id: 4,
      user: 'sarah.johnson@company.com',
      userId: 'usr_22222',
      provider: 'Corporate LDAP Directory',
      providerId: 4,
      action: 'Logout',
      ip: '192.168.1.103',
      timestamp: '2024-03-15T14:15:05Z',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      location: 'Toronto, CA',
      status: 'success',
      duration: 0.3,
      sessionDuration: 9900, // 2h 45m in seconds
      deviceId: 'dev_desktop_004',
      riskScore: 0.0,
      mfaUsed: true,
      mfaMethod: 'hardware_key'
    }
  ]);

  // Enhanced MFA Settings
  const [mfaSettings, setMfaSettings] = useState({
    enabled: true,
    required: false,
    methods: {
      sms: { enabled: true, priority: 1, cost: 0.05 },
      email: { enabled: true, priority: 4, cost: 0.01 },
      authenticator: { enabled: true, priority: 2, cost: 0.00 },
      hardware: { enabled: false, priority: 3, cost: 0.00 },
      backup: { enabled: true, priority: 5, cost: 0.00 }
    },
    gracePeriod: 7,
    maxAttempts: 3,
    lockoutDuration: 15,
    rememberDevice: true,
    deviceTrustDuration: 30,
    riskBasedAuth: true,
    adaptiveAuth: true,
    geoBlocking: false,
    allowedCountries: ['US', 'CA', 'GB', 'DE', 'FR'],
    sessionTimeout: 480, // 8 hours
    concurrentSessions: 3
  });

  // Utility Functions
  const copyToClipboard = async (text, keyId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'success':
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
      case 'failed':
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
      case 'degraded':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (health) => {
    switch (health?.toLowerCase()) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'SAML':
        return <Shield size={20} className="text-blue-600" />;
      case 'OAuth2':
        return <Key size={20} className="text-green-600" />;
      case 'OIDC':
        return <Lock size={20} className="text-purple-600" />;
      case 'LDAP':
        return <Server size={20} className="text-orange-600" />;
      default:
        return <Globe size={20} className="text-gray-600" />;
    }
  };

  const getRiskScoreColor = (score) => {
    if (score <= 0.3) return 'text-green-600';
    if (score <= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Enhanced Filter Functions
  const filteredProviders = authProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.domains.some(domain => domain.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || provider.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'all' || provider.type.toLowerCase() === filterType.toLowerCase();
    const matchesEnvironment = filterEnvironment === 'all' || provider.environment === filterEnvironment;
    
    return matchesSearch && matchesStatus && matchesType && matchesEnvironment;
  });

  const filteredLogs = authLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredApiKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || key.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesEnvironment = filterEnvironment === 'all' || key.environment === filterEnvironment;
    
    return matchesSearch && matchesStatus && matchesEnvironment;
  });

  // Enhanced Statistics
  const stats = {
    totalProviders: authProviders.length,
    activeProviders: authProviders.filter(p => p.status === 'Active').length,
    healthyProviders: authProviders.filter(p => p.health === 'Healthy').length,
    totalUsers: authProviders.reduce((sum, p) => sum + p.users, 0),
    activeUsers: authProviders.reduce((sum, p) => sum + p.activeUsers, 0),
    totalLogins: authProviders.reduce((sum, p) => sum + p.totalLogins, 0),
    successfulLogins: authLogs.filter(l => l.status === 'success').length,
    failedLogins: authLogs.filter(l => l.status === 'failed').length,
    pendingLogins: authLogs.filter(l => l.status === 'pending').length,
    mfaEnabled: mfaSettings.enabled,
    mfaAdoption: Math.round((authLogs.filter(l => l.mfaUsed).length / authLogs.length) * 100),
    totalApiKeys: apiKeys.length,
    activeApiKeys: apiKeys.filter(k => k.status === 'Active').length,
    avgSuccessRate: Math.round(
      authProviders.filter(p => p.successRate > 0).reduce((sum, p) => sum + p.successRate, 0) / 
      authProviders.filter(p => p.successRate > 0).length
    ),
    avgResponseTime: authProviders.filter(p => p.avgResponseTime !== 'N/A')
      .reduce((sum, p) => sum + parseFloat(p.avgResponseTime), 0) / 
      authProviders.filter(p => p.avgResponseTime !== 'N/A').length,
    totalUptime: Math.round(
      authProviders.reduce((sum, p) => sum + p.uptime, 0) / authProviders.length
    )
  };

  // Pagination
  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Enhanced Overview Dashboard
  const renderOverviewTab = () => (
    <div className="space-y-6">
            {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Providers</p>
              <p className="text-3xl font-bold text-blue-900">{stats.activeProviders}</p>
              <p className="text-xs text-blue-700 mt-1">
                {stats.healthyProviders} healthy • {stats.totalProviders - stats.activeProviders} inactive
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Server className="h-8 w-8 text-blue-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-1 bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stats.activeProviders / stats.totalProviders) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-xs font-medium text-blue-700">
              {Math.round((stats.activeProviders / stats.totalProviders) * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Users</p>
              <p className="text-3xl font-bold text-green-900">{stats.activeUsers.toLocaleString()}</p>
              <p className="text-xs text-green-700 mt-1">
                {stats.totalUsers.toLocaleString()} total registered
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Users className="h-8 w-8 text-green-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-xs font-medium text-green-700">
              +12% from last month
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-900">{stats.avgSuccessRate}%</p>
              <p className="text-xs text-purple-700 mt-1">
                {stats.totalLogins.toLocaleString()} total logins
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Target className="h-8 w-8 text-purple-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <CheckCircle className="h-4 w-4 text-purple-600 mr-1" />
            <span className="text-xs font-medium text-purple-700">
              {stats.successfulLogins} successful today
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Response</p>
              <p className="text-3xl font-bold text-orange-900">{stats.avgResponseTime.toFixed(1)}s</p>
              <p className="text-xs text-orange-700 mt-1">
                {stats.totalUptime}% uptime
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Gauge className="h-8 w-8 text-orange-700" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <Timer className="h-4 w-4 text-orange-600 mr-1" />
            <span className="text-xs font-medium text-orange-700">
              -0.2s from last week
            </span>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Provider Health Status</h3>
            <div className="flex items-center space-x-2">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            {authProviders.slice(0, 4).map(provider => (
              <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    provider.type === 'SAML' ? 'bg-blue-100' :
                    provider.type === 'OAuth2' ? 'bg-green-100' :
                    provider.type === 'OIDC' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {getTypeIcon(provider.type)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{provider.name}</h4>
                    <p className="text-sm text-gray-600">{provider.users} users • {provider.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{provider.successRate}%</p>
                    <p className="text-xs text-gray-500">Success Rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{provider.avgResponseTime}</p>
                    <p className="text-xs text-gray-500">Avg Response</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    provider.health === 'Healthy' ? 'bg-green-400' :
                    provider.health === 'Degraded' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {authLogs.slice(0, 6).map(log => (
              <div key={log.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  log.status === 'success' ? 'bg-green-400' :
                  log.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{log.user}</p>
                  <p className="text-xs text-gray-600">{log.action} via {log.provider}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Logs →
          </button>
        </div>
      </div>

      {/* MFA & Security Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Multi-Factor Authentication</h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
              mfaSettings.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {mfaSettings.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MFA Adoption Rate</span>
              <span className="text-sm font-medium text-gray-900">{stats.mfaAdoption}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.mfaAdoption}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {Object.entries(mfaSettings.methods).map(([method, config]) => (
                <div key={method} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {method === 'sms' && <Smartphone size={20} className="text-blue-600" />}
                    {method === 'email' && <Mail size={20} className="text-green-600" />}
                    {method === 'authenticator' && <Shield size={20} className="text-purple-600" />}
                    {method === 'hardware' && <Key size={20} className="text-orange-600" />}
                    {method === 'backup' && <FileText size={20} className="text-gray-600" />}
                  </div>
                  <p className="text-xs font-medium text-gray-900 capitalize">{method}</p>
                  <p className={`text-xs ${config.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                    {config.enabled ? 'Active' : 'Inactive'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">API Keys Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total API Keys</span>
              <span className="text-sm font-medium text-gray-900">{stats.totalApiKeys}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Keys</span>
              <span className="text-sm font-medium text-green-600">{stats.activeApiKeys}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Requests (24h)</span>
              <span className="text-sm font-medium text-gray-900">
                {apiKeys.reduce((sum, key) => sum + key.usage, 0).toLocaleString()}
              </span>
            </div>
            
            <div className="mt-6 space-y-3">
              {apiKeys.slice(0, 3).map(key => (
                <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{key.name}</p>
                    <p className="text-xs text-gray-600">{key.environment}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{key.usage.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">requests</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Providers Tab
  const renderProvidersTab = () => (
    <div className="space-y-6">
      {/* Enhanced Filters and Controls */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search providers, domains, or types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="warning">Warning</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="saml">SAML</option>
              <option value="oauth2">OAuth2</option>
              <option value="oidc">OIDC</option>
              <option value="ldap">LDAP</option>
            </select>

            <select
              value={filterEnvironment}
              onChange={(e) => setFilterEnvironment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
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
                <Layers size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 size={16} />
              </button>
            </div>
            
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
              <Download size={16} className="mr-2" />
              Export
            </button>
            
            <button 
              onClick={() => setShowAddProviderModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
            >
              <Plus size={16} className="mr-2" />
              Add Provider
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Providers Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedProviders.map(provider => (
            <div key={provider.id} className="bg-white rounded-xl border hover:shadow-lg transition-all duration-200 overflow-hidden">
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      provider.type === 'SAML' ? 'bg-blue-100' :
                      provider.type === 'OAuth2' ? 'bg-green-100' :
                      provider.type === 'OIDC' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {getTypeIcon(provider.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{provider.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600">{provider.type}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(provider.priority)}`}>
                          {provider.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(provider.status)}`}>
                      {provider.status}
                    </span>
                    <div className="relative">
                      <button 
                        onClick={() => setExpandedCards(prev => ({...prev, [provider.id]: !prev[provider.id]}))}
                        className="p-1 hover:bg-gray-100 rounded-md"
                      >
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{provider.users.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Users</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{provider.successRate}%</p>
                    <p className="text-xs text-gray-600">Success Rate</p>
                  </div>
                </div>

                {/* Health Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      provider.health === 'Healthy' ? 'bg-green-400' :
                      provider.health === 'Degraded' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className={`text-sm font-medium ${getHealthColor(provider.health)}`}>
                      {provider.health}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{provider.avgResponseTime} avg</span>
                </div>

                {/* Domains */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Allowed Domains</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.domains.slice(0, 2).map(domain => (
                      <span key={domain} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border">
                        {domain}
                      </span>
                    ))}
                    {provider.domains.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{provider.domains.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Last Activity */}
                <div className="text-xs text-gray-500 mb-4">
                  Last sync: {provider.lastSync}
                </div>

                {/* Error Display */}
                {provider.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle size={14} className="text-red-600 mr-2" />
                      <span className="text-sm text-red-800">{provider.error}</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {provider.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowProviderDetailsModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowEditProviderModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Provider"
                    >
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setSelectedProvider(provider);
                      setShowDeleteConfirmModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Provider"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Authentication Providers</h3>
            <p className="text-gray-600 mt-1">
              Showing {paginatedProviders.length} of {filteredProviders.length} providers
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {paginatedProviders.map(provider => (
              <div key={provider.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      provider.type === 'SAML' ? 'bg-blue-100' :
                      provider.type === 'OAuth2' ? 'bg-green-100' :
                      provider.type === 'OIDC' ? 'bg-purple-100' : 'bg-orange-100'
                    }`}>
                      {getTypeIcon(provider.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{provider.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(provider.status)}`}>
                          {provider.status}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {provider.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(provider.priority)}`}>
                          {provider.priority}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Users size={14} className="mr-2" />
                          {provider.users.toLocaleString()} users ({provider.activeUsers.toLocaleString()} active)
                        </div>
                        <div className="flex items-center">
                          <Activity size={14} className="mr-2" />
                          {provider.successRate}% success rate
                        </div>
                        <div className="flex items-center">
                          <Timer size={14} className="mr-2" />
                          {provider.avgResponseTime} avg response
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-2" />
                          Last sync: {provider.lastSync}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        {provider.domains.slice(0, 3).map(domain => (
                          <span key={domain} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border">
                            {domain}
                          </span>
                        ))}
                        {provider.domains.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{provider.domains.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            provider.health === 'Healthy' ? 'bg-green-400' :
                            provider.health === 'Degraded' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}></div>
                          <span className={`text-sm font-medium ${getHealthColor(provider.health)}`}>
                            {provider.health}
                                                    </span>
                        </div>
                        <span className="text-sm text-gray-600">{provider.uptime}% uptime</span>
                        <span className="text-sm text-gray-600">{provider.environment}</span>
                      </div>

                      {provider.error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle size={16} className="text-red-600 mr-2" />
                            <span className="text-sm text-red-800">{provider.error}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowProviderDetailsModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowEditProviderModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Provider"
                    >
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowDeleteConfirmModal(true);
                      }}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Provider"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProviders.length)} of {filteredProviders.length} results
              </div>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={6}>6 per page</option>
                <option value={12}>12 per page</option>
                <option value={24}>24 per page</option>
                <option value={48}>48 per page</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Enhanced MFA Tab
  const renderMFATab = () => (
    <div className="space-y-6">
      {/* MFA Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">MFA Status</p>
              <p className="text-3xl font-bold text-green-900">{mfaSettings.enabled ? 'Enabled' : 'Disabled'}</p>
              <p className="text-xs text-green-700 mt-1">
                {mfaSettings.required ? 'Required for all users' : 'Optional for users'}
              </p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Shield className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Adoption Rate</p>
              <p className="text-3xl font-bold text-blue-900">{stats.mfaAdoption}%</p>
              <p className="text-xs text-blue-700 mt-1">
                {Math.round(stats.activeUsers * (stats.mfaAdoption / 100)).toLocaleString()} users protected
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Users className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Methods</p>
              <p className="text-3xl font-bold text-purple-900">
                {Object.values(mfaSettings.methods).filter(method => method.enabled).length}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                of {Object.keys(mfaSettings.methods).length} available
              </p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Zap className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Security Score</p>
              <p className="text-3xl font-bold text-orange-900">A+</p>
              <p className="text-xs text-orange-700 mt-1">
                Excellent security posture
              </p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Target className="h-8 w-8 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced MFA Settings */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Multi-Factor Authentication Settings</h3>
              <p className="text-gray-600 mt-1">Configure additional security layers for user authentication</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
              <Settings size={16} className="mr-2" />
              Advanced Settings
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Global MFA Toggle */}
          <div className="flex items-center justify-between p-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Enable Multi-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Require additional verification for user logins across all providers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={mfaSettings.enabled}
                onChange={(e) => setMfaSettings({...mfaSettings, enabled: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* MFA Methods */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-6">Authentication Methods</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(mfaSettings.methods).map(([method, config]) => (
                <div key={method} className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        method === 'sms' ? 'bg-blue-100' :
                        method === 'email' ? 'bg-green-100' :
                        method === 'authenticator' ? 'bg-purple-100' :
                        method === 'hardware' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        {method === 'sms' && <Smartphone size={20} className="text-blue-600" />}
                        {method === 'email' && <Mail size={20} className="text-green-600" />}
                        {method === 'authenticator' && <Shield size={20} className="text-purple-600" />}
                        {method === 'hardware' && <Key size={20} className="text-orange-600" />}
                        {method === 'backup' && <FileText size={20} className="text-gray-600" />}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 capitalize">
                          {method === 'authenticator' ? 'Authenticator App' : 
                           method === 'hardware' ? 'Hardware Keys' :
                           method === 'backup' ? 'Backup Codes' : method.toUpperCase()}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {method === 'sms' && 'Send verification codes via SMS'}
                          {method === 'email' && 'Send verification codes via email'}
                          {method === 'authenticator' && 'Use TOTP apps like Google Authenticator'}
                          {method === 'hardware' && 'Support for FIDO2/WebAuthn keys'}
                          {method === 'backup' && 'One-time use recovery codes'}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={config.enabled}
                        onChange={(e) => setMfaSettings({
                          ...mfaSettings, 
                          methods: {
                            ...mfaSettings.methods, 
                            [method]: {...config, enabled: e.target.checked}
                          }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Priority</span>
                      <span className="font-medium text-gray-900">#{config.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cost per use</span>
                      <span className="font-medium text-gray-900">
                        {config.cost === 0 ? 'Free' : `$${config.cost.toFixed(3)}`}
                      </span>
                    </div>
                    {config.enabled && (
                      <div className="pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {method === 'sms' && 'Supported carriers: All major providers worldwide'}
                          {method === 'email' && 'Fallback method when SMS is unavailable'}
                          {method === 'authenticator' && 'Most secure option, works offline'}
                          {method === 'hardware' && 'YubiKey, Google Titan, and other FIDO2 devices'}
                          {method === 'backup' && 'Emergency access when other methods fail'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Security Settings */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-6">Advanced Security Settings</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (days)
                  </label>
                  <input
                    type="number"
                    value={mfaSettings.gracePeriod}
                    onChange={(e) => setMfaSettings({...mfaSettings, gracePeriod: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="30"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Days before MFA becomes mandatory for new users
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Failed Attempts
                  </label>
                  <input
                    type="number"
                    value={mfaSettings.maxAttempts}
                    onChange={(e) => setMfaSettings({...mfaSettings, maxAttempts: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Account lockout after failed attempts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lockout Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={mfaSettings.lockoutDuration}
                    onChange={(e) => setMfaSettings({...mfaSettings, lockoutDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="5"
                    max="1440"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long accounts remain locked
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Trust Duration (days)
                  </label>
                  <input
                    type="number"
                    value={mfaSettings.deviceTrustDuration}
                    onChange={(e) => setMfaSettings({...mfaSettings, deviceTrustDuration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="90"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long to remember trusted devices
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={mfaSettings.sessionTimeout}
                    onChange={(e) => setMfaSettings({...mfaSettings, sessionTimeout: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="30"
                    max="1440"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Automatic logout after inactivity
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concurrent Sessions
                  </label>
                  <input
                    type="number"
                    value={mfaSettings.concurrentSessions}
                    onChange={(e) => setMfaSettings({...mfaSettings, concurrentSessions: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="10"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum simultaneous sessions per user
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk-Based Authentication */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-6">Risk-Based Authentication</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Risk-Based Authentication</h5>
                  <p className="text-sm text-gray-600">Require MFA based on login risk assessment</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={mfaSettings.riskBasedAuth}
                    onChange={(e) => setMfaSettings({...mfaSettings, riskBasedAuth: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Adaptive Authentication</h5>
                  <p className="text-sm text-gray-600">Adjust security requirements based on user behavior</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={mfaSettings.adaptiveAuth}
                    onChange={(e) => setMfaSettings({...mfaSettings, adaptiveAuth: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h5 className="font-medium text-gray-900">Geographic Blocking</h5>
                  <p className="text-sm text-gray-600">Block logins from specific countries or regions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={mfaSettings.geoBlocking}
                    onChange={(e) => setMfaSettings({...mfaSettings, geoBlocking: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Reset to Defaults
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors">
                <CheckCircle size={16} className="mr-2" />
                Save MFA Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Enhanced Logs Tab
  const renderLogsTab = () => (
    <div className="space-y-6">
      {/* Enhanced Logs Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Events</p>
              <p className="text-3xl font-bold text-blue-900">{authLogs.length}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Successful</p>
              <p className="text-3xl font-bold text-green-900">{stats.successfulLogins}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Failed</p>
              <p className="text-3xl font-bold text-red-900">{stats.failedLogins}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pendingLogins}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">MFA Used</p>
              <p className="text-3xl font-bold text-purple-900">{stats.mfaAdoption}%</p>
            </div>
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Enhanced Logs Table */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Authentication Logs</h3>
              <p className="text-gray-600 mt-1">Monitor all authentication events and security activities</p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Filter size={16} className="mr-2" />
                Filters
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                <Download size={16} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Device
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location & IP
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-gray-600" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{log.user}</p>
                        <p className="text-xs text-gray-500">ID: {log.userId}</p>
                        <div className="flex items-center mt-1">
                          <Monitor size={12} className="text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">{log.userAgent.split(' ')[0]}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(authProviders.find(p => p.id === log.providerId)?.type || 'SAML')}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{log.provider}</p>
                        <p className="text-xs text-gray-500">
                          {authProviders.find(p => p.id === log.providerId)?.type || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{log.action}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                      {log.error && (
                        <p className="text-xs text-red-600 mt-1">{log.error}</p>
                      )}
                      {log.attempts && (
                        <p className="text-xs text-gray-500">Attempts: {log.attempts}</p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getRiskScoreColor(log.riskScore)}`}></div>
                        <span className={`text-xs font-medium ${getRiskScoreColor(log.riskScore)}`}>
                          Risk: {(log.riskScore * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {log.mfaUsed ? (
                          <Shield size={12} className="text-green-600" />
                        ) : (
                          <AlertTriangle size={12} className="text-yellow-600" />
                        )}
                        <span className="text-xs text-gray-600">
                          MFA: {log.mfaUsed ? log.mfaMethod : 'Not used'}
                        </span>
                      </div>
                      {log.sessionId && (
                        <p className="text-xs text-gray-500">Session: {log.sessionId.slice(-8)}</p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Globe size={12} className="text-gray-400" />
                        <p className="text-sm text-gray-900">{log.ip}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} className="text-gray-400" />
                        <p className="text-sm text-gray-600">{log.location}</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">{formatDateTime(log.timestamp)}</p>
                      <p className="text-xs text-gray-500">
                        Duration: {log.duration ? `${log.duration}s` : 'N/A'}
                      </p>
                      {log.sessionDuration && (
                        <p className="text-xs text-gray-500">
                          Session: {formatDuration(log.sessionDuration)}
                        </p>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or date range.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Enhanced API Keys Tab
  const renderApiKeysTab = () => (
    <div className="space-y-6">
      {/* Enhanced API Keys Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Keys</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalApiKeys}</p>
              <p className="text-xs text-blue-700 mt-1">
                {stats.activeApiKeys} active • {stats.totalApiKeys - stats.activeApiKeys} inactive
              </p>
            </div>
            <div className="p-3 bg-blue-200 rounded-lg">
              <Key className="h-8 w-8 text-blue-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Requests</p>
              <p className="text-3xl font-bold text-green-900">
                {apiKeys.reduce((sum, key) => sum + key.usage, 0).toLocaleString()}
              </p>
              <p className="text-xs text-green-700 mt-1">Last 24 hours</p>
            </div>
            <div className="p-3 bg-green-200 rounded-lg">
              <Activity className="h-8 w-8 text-green-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Rate Limit</p>
              <p className="text-3xl font-bold text-purple-900">
                {apiKeys.reduce((sum, key) => sum + key.rateLimit, 0).toLocaleString()}
              </p>
              <p className="text-xs text-purple-700 mt-1">Requests per hour</p>
            </div>
            <div className="p-3 bg-purple-200 rounded-lg">
              <Zap className="h-8 w-8 text-purple-700" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg Usage</p>
              <p className="text-3xl font-bold text-orange-900">
                {Math.round(apiKeys.reduce((sum, key) => sum + (key.usage / key.rateLimit * 100), 0) / apiKeys.length)}%
              </p>
              <p className="text-xs text-orange-700 mt-1">Of rate limits</p>
            </div>
            <div className="p-3 bg-orange-200 rounded-lg">
              <Gauge className="h-8 w-8 text-orange-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced API Keys Management */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">API Keys Management</h3>
              <p className="text-gray-600 mt-1">Manage API keys for authentication services and integrations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search API keys..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
              <button 
                onClick={() => setShowApiKeyModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Generate Key
              </button>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredApiKeys.map(apiKey => (
            <div key={apiKey.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <Key size={20} className="text-blue-600" />
                      <h4 className="font-semibold text-gray-900 text-lg">{apiKey.name}</h4>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(apiKey.status)}`}>
                      {apiKey.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      apiKey.environment === 'production' ? 'bg-red-100 text-red-800' : 
                      apiKey.environment === 'staging' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {apiKey.environment}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-3 flex-1">
                      <code className="text-sm font-mono text-gray-700 flex-1">{apiKey.keyPreview}</code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy full key"
                      >
                        {copiedKey === apiKey.id ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{apiKey.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Created</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(apiKey.created)}</p>
                      <p className="text-xs text-gray-500">by {apiKey.createdBy}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Last Used</p>
                      <p className="text-sm font-medium text-gray-900">{formatDateTime(apiKey.lastUsed)}</p>
                      <p className="text-xs text-gray-500">by {apiKey.lastUsedBy}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Usage</p>
                      <p className="text-sm font-medium text-gray-900">
                        {apiKey.usage.toLocaleString()} / {apiKey.rateLimit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">per {apiKey.rateLimitWindow}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Expires</p>
                      <p className="text-sm font-medium text-gray-900">{formatDate(apiKey.expiresAt)}</p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(apiKey.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  </div>

                  {/* Usage Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Usage ({apiKey.rateLimitWindow})</span>
                      <span className="text-gray-600">
                        {Math.round((apiKey.usage / apiKey.rateLimit) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (apiKey.usage / apiKey.rateLimit) > 0.8 ? 'bg-red-600' :
                          (apiKey.usage / apiKey.rateLimit) > 0.6 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min((apiKey.usage / apiKey.rateLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map(permission => (
                        <span key={permission} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* IP Whitelist */}
                  {apiKey.ipWhitelist.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">IP Whitelist</p>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.ipWhitelist.map(ip => (
                          <span key={ip} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                            {ip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {apiKey.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button 
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Regenerate Key"
                  >
                    <RefreshCw size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Edit Key"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Key"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApiKeys.length === 0 && (
          <div className="text-center py-12">
            <Key size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API keys found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first API key.</p>
            <button 
              onClick={() => setShowApiKeyModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
            >
              <Plus size={16} className="mr-2" />
              Generate API Key
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Authentication Management</h1>
              </div>
              <p className="text-gray-600">
                Configure authentication providers, security settings, and monitor access logs across your organization
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">System Operational</span>
                </div>
                <p className="text-xs text-gray-500">All services running normally</p>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3, description: 'System dashboard' },
                { id: 'providers', name: 'Auth Providers', icon: Server, count: stats.totalProviders, description: 'Manage authentication providers' },
                { id: 'mfa', name: 'Multi-Factor Auth', icon: Shield, status: mfaSettings.enabled, description: 'Security settings' },
                { id: 'logs', name: 'Authentication Logs', icon: Activity, count: authLogs.length, description: 'Monitor access logs' },
                { id: 'apikeys', name: 'API Keys', icon: Key, count: stats.totalApiKeys, description: 'Manage API access' }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    title={tab.description}
                  >
                    <Icon size={16} className="mr-2" />
                    {tab.name}
                    {tab.count !== undefined && (
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tab.count}
                      </span>
                    )}
                    {tab.status !== undefined && (
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        tab.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {tab.status ? 'ON' : 'OFF'}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Tab Content */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'providers' && renderProvidersTab()}
            {activeTab === 'mfa' && renderMFATab()}
            {activeTab === 'logs' && renderLogsTab()}
            {activeTab === 'apikeys' && renderApiKeysTab()}
          </div>
        </div>

        {/* Modals and other components would be rendered here */}
        {/* ... (previous modal code remains the same) ... */}
      </div>
    </div>
  );
};

export default Authentications;

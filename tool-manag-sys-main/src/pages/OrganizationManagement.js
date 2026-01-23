import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { 
  Building2, 
  Users, 
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Search,
  Filter,
  User,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Save,
  X,
  Download,
  Upload,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Move,
  AlertCircle,
  CheckCircle,
  XCircle,
  Briefcase,
  GraduationCap,
  Star,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Zap,
  Shield,
  Crown,
  Layers
} from 'lucide-react';

const OrganizationManager = () => {
  const [organizations, setOrganizations] = useState({});
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedPersonDetails, setSelectedPersonDetails] = useState(null);
  const [organizationHistory, setOrganizationHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [orgsPerPage] = useState(9);

  // Enhanced person data structure
  const personTemplate = {
    id: null,
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    department: '',
    startDate: '',
    status: 'active', // active, inactive, on-leave
    level: 1,
    skills: [],
    certifications: [],
    performance: 0,
    salary: '',
    manager: null,
    subordinates: [],
    avatar: null,
    bio: '',
    projects: [],
    goals: []
  };

  // Available titles for each organization with levels
  const availableTitles = {
    "R&D Director": {
      titles: [
        "Deputy R&D Director",
        "Technical Project Management Office Manager", 
        "System & Software Engineering Manager",
        "Hardware Engineering Team Leader",
        "Senior Software Architect",
        "Lead System Architect",
        "System Engineering Team Leader",
        "System Test Engineering Team Leader",
        "Software Engineering Team Leader"
      ],
      level: 5
    },
    "System & Software Engineering Manager": {
      titles: [
        "System Engineering Team Leader",
        "System Test Engineering Team Leader",
        "Senior Software Engineer",
        "Software Engineer",
        "Junior Software Engineer"
      ],
      level: 4
    },
    "Hardware Engineering Team Leader": {
      titles: [
        "Lead Hardware Engineer",
        "Hardware Engineer", 
        "Senior Hardware Engineer",
        "Junior Hardware Engineer"
      ],
      level: 3
    }
  };

  // Organization templates
  const organizationTemplates = {
    "R&D Department": {
      structure: "Hierarchical",
      defaultTitles: ["Director", "Manager", "Team Leader", "Senior Engineer", "Engineer"],
      description: "Research and Development focused structure"
    },
    "Sales Department": {
      structure: "Regional",
      defaultTitles: ["Sales Director", "Regional Manager", "Sales Manager", "Account Manager", "Sales Rep"],
      description: "Sales and customer relationship structure"
    },
    "Operations": {
      structure: "Process-based",
      defaultTitles: ["Operations Director", "Process Manager", "Team Leader", "Specialist", "Coordinator"],
      description: "Operations and process management structure"
    }
  };

  // Enhanced mock data
  useEffect(() => {
    const mockData = {
      "R&D Director": {
        "name": "Emrah Yürüklü",
        "id": 1,
        "email": "emrah.yuruklu@company.com",
        "phone": "+90 532 123 4567",
        "location": "Istanbul, Turkey",
        "startDate": "2020-01-15",
        "status": "active",
        "level": 5,
        "performance": 95,
        "skills": ["Leadership", "Strategic Planning", "R&D Management"],
        "bio": "Experienced R&D Director with 15+ years in technology leadership",
        "subordinates": [
          {
            "title": "Deputy R&D Director",
            "name": "Sefa Ocaklı",
            "id": 2,
            "email": "sefa.ocakli@company.com",
            "phone": "+90 532 123 4568",
            "location": "Istanbul, Turkey",
            "startDate": "2021-03-10",
            "status": "active",
            "level": 4,
            "performance": 88,
            "skills": ["Project Management", "Team Leadership"],
            "subordinates": [
              {
                "title": "Technical Project Management Office Manager",
                "name": "Şadi Askeroğlu",
                "id": 3,
                "email": "sadi.askeroglu@company.com",
                "phone": "+90 532 123 4569",
                "startDate": "2021-06-01",
                "status": "active",
                "level": 3,
                "performance": 92,
                "subordinates": [
                  {
                    "title": "Technical Project Manager", 
                    "name": "Oğuzhan Şahin", 
                    "id": 4,
                    "email": "oguzhan.sahin@company.com",
                    "startDate": "2022-01-15",
                    "status": "active",
                    "level": 2,
                    "performance": 85
                  },
                  {
                    "title": "Technical Project Engineer", 
                    "name": "Doğukan Ayhan", 
                    "id": 5,
                    "email": "dogukan.ayhan@company.com",
                    "startDate": "2022-03-01",
                    "status": "active",
                    "level": 2,
                    "performance": 78
                  }
                ]
              }
            ]
          }
        ]
      },
      "System & Software Engineering Manager": {
        "name": "Ömer Faruk Heybeli",
        "id": 13,
        "email": "omer.heybeli@company.com",
        "startDate": "2020-08-01",
        "status": "active",
        "level": 4,
        "performance": 89,
        "subordinates": [
          {
            "title": "System Engineering Team Leader",
            "name": "Sercan Ağaçdoğrayan",
            "id": 14,
            "email": "sercan.agacdograyan@company.com",
            "startDate": "2021-04-15",
            "status": "active",
            "level": 3,
            "performance": 86
          }
        ]
      },
      "Hardware Engineering Team Leader": {
        "name": "Beyazıt Cengiz",
        "id": 21,
        "email": "beyazit.cengiz@company.com",
        "startDate": "2020-11-15",
        "status": "active",
        "level": 3,
        "performance": 91,
        "subordinates": [
          {
            "title": "Lead Hardware Engineer", 
            "name": "Anıl Şen", 
            "id": 22,
            "email": "anil.sen@company.com",
            "startDate": "2021-05-01",
            "status": "active",
            "level": 3,
            "performance": 89
          }
        ]
      }
    };
    
    setOrganizations(mockData);
    
    // Initialize history
    setOrganizationHistory([
      { date: "2025-01-15", action: "Added Oğuzhan Şahin to TPMO", user: "Admin" },
      { date: "2025-01-10", action: "Promoted Emre Çelen to Senior Engineer", user: "HR Manager" },
      { date: "2024-12-20", action: "Created Hardware Engineering Team", user: "Admin" },
      { date: "2024-12-15", action: "Updated Walter Mosca status to on-leave", user: "HR Manager" }
    ]);
  }, []);

  // Statistics calculation
  const calculateStats = (orgKey) => {
    const org = organizations[orgKey];
    if (!org) return {};

    const stats = {
      totalEmployees: 0,
      activeEmployees: 0,
      onLeaveEmployees: 0,
      inactiveEmployees: 0,
      averagePerformance: 0,
      levelDistribution: {},
      openPositions: 0,
      recentHires: 0
    };

    const calculateRecursive = (person) => {
      stats.totalEmployees++;
      
      if (person.status === 'active') stats.activeEmployees++;
      else if (person.status === 'on-leave') stats.onLeaveEmployees++;
      else stats.inactiveEmployees++;

      if (person.performance) {
        stats.averagePerformance += person.performance;
      }

      const level = person.level || 1;
      stats.levelDistribution[level] = (stats.levelDistribution[level] || 0) + 1;

      // Check recent hires (last 6 months)
      if (person.startDate) {
        const startDate = new Date(person.startDate);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        if (startDate > sixMonthsAgo) {
          stats.recentHires++;
        }
      }

      if (person.subordinates) {
        person.subordinates.forEach(calculateRecursive);
      }
    };

    calculateRecursive(org);
    stats.averagePerformance = Math.round(stats.averagePerformance / stats.totalEmployees);

    return stats;
  };

  // Enhanced search and filter
  const getFilteredOrganizations = () => {
    let filtered = Object.entries(organizations);

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(([key, org]) => {
        const searchInOrg = (person) => {
          const matchesSearch = 
            person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            key.toLowerCase().includes(searchTerm.toLowerCase());

          if (matchesSearch) return true;
          
          if (person.subordinates) {
            return person.subordinates.some(searchInOrg);
          }
          return false;
        };
        return searchInOrg(org);
      });
    }

    // Status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(([key, org]) => {
        const hasStatus = (person) => {
          if (person.status === filterBy) return true;
          if (person.subordinates) {
            return person.subordinates.some(hasStatus);
          }
          return false;
        };
        return hasStatus(org);
      });
    }

    // Sort
    filtered.sort(([keyA, orgA], [keyB, orgB]) => {
      switch (sortBy) {
        case 'name':
          return keyA.localeCompare(keyB);
        case 'employees':
          return countEmployees(orgB) - countEmployees(orgA);
        case 'performance':
          const statsA = calculateStats(keyA);
          const statsB = calculateStats(keyB);
          return statsB.averagePerformance - statsA.averagePerformance;
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Pagination
  const filteredOrgs = getFilteredOrganizations();
  const indexOfLastOrg = currentPage * orgsPerPage;
  const indexOfFirstOrg = indexOfLastOrg - orgsPerPage;
  const currentOrgs = filteredOrgs.slice(indexOfFirstOrg, indexOfLastOrg);
  const totalPages = Math.ceil(filteredOrgs.length / orgsPerPage);

  // Count total employees in organization
  const countEmployees = (org) => {
    let count = 1;
    if (org.subordinates) {
      org.subordinates.forEach(sub => {
        count += countEmployees(sub);
      });
    }
    return count;
  };

  // Overall statistics
  const overallStats = {
    totalOrganizations: Object.keys(organizations).length,
    totalEmployees: Object.values(organizations).reduce((acc, org) => acc + countEmployees(org), 0),
    activeEmployees: Object.keys(organizations).reduce((acc, orgKey) => {
      const stats = calculateStats(orgKey);
      return acc + stats.activeEmployees;
    }, 0),
    averagePerformance: Math.round(
      Object.keys(organizations).reduce((acc, orgKey) => {
        const stats = calculateStats(orgKey);
        return acc + stats.averagePerformance;
      }, 0) / Object.keys(organizations).length
    ),
    recentHires: Object.keys(organizations).reduce((acc, orgKey) => {
      const stats = calculateStats(orgKey);
      return acc + stats.recentHires;
    }, 0)
  };

  const handleOrganizationClick = (orgKey) => {
    setSelectedOrganization(orgKey);
    setShowChart(true);
    setExpandedNodes(new Set([organizations[orgKey].id]));
  };

  const handleBackToOrganizations = () => {
    setShowChart(false);
    setSelectedOrganization(null);
    setExpandedNodes(new Set());
  };

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getNextId = () => {
    let maxId = 0;
    const findMaxId = (obj) => {
      if (obj.id && obj.id > maxId) maxId = obj.id;
      if (obj.subordinates) {
        obj.subordinates.forEach(findMaxId);
      }
    };
    
    Object.values(organizations).forEach(findMaxId);
    return maxId + 1;
  };

  const addToHistory = (action) => {
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      action,
      user: "Current User"
    };
    setOrganizationHistory(prev => [newEntry, ...prev]);
  };

  const addPerson = (parentId, newPerson) => {
    const newOrgs = { ...organizations };
    
    const addToParent = (obj) => {
      if (obj.id === parentId) {
        if (!obj.subordinates) obj.subordinates = [];
        const person = {
          ...newPerson,
          id: getNextId(),
          subordinates: []
        };
        obj.subordinates.push(person);
        addToHistory(`Added ${person.name} as ${person.title}`);
        return true;
      }
      if (obj.subordinates) {
        return obj.subordinates.some(addToParent);
      }
      return false;
    };

    Object.values(newOrgs).some(addToParent);
    setOrganizations(newOrgs);
  };

  const editPerson = (personId, updatedPerson) => {
    const newOrgs = { ...organizations };
    
    const updatePerson = (obj) => {
      if (obj.id === personId) {
        const oldName = obj.name;
        Object.assign(obj, updatedPerson);
        addToHistory(`Updated ${oldName} information`);
        return true;
      }
      if (obj.subordinates) {
        return obj.subordinates.some(updatePerson);
      }
      return false;
    };

    Object.values(newOrgs).some(updatePerson);
    setOrganizations(newOrgs);
  };

  const deletePerson = (personId) => {
    const newOrgs = { ...organizations };
    let deletedName = '';
    
    const removeFromParent = (obj) => {
      if (obj.subordinates) {
        obj.subordinates = obj.subordinates.filter(sub => {
          if (sub.id === personId) {
            deletedName = sub.name;
            return false;
          }
          removeFromParent(sub);
          return true;
        });
      }
    };

    Object.values(newOrgs).forEach(removeFromParent);
    if (deletedName) {
      addToHistory(`Removed ${deletedName} from organization`);
    }
    setOrganizations(newOrgs);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(organizations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'organization-structure.json';
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setOrganizations(imported);
          addToHistory('Imported organization structure');
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle, text: 'Active' },
      'on-leave': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, text: 'On Leave' },
      inactive: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Inactive' }
    };
    
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        <Icon size={12} className="mr-1.5" />
        {badge.text}
      </span>
    );
  };

  // Get performance badge
  const getPerformanceBadge = (performance) => {
    if (!performance) return null;
    
    let color = 'bg-slate-100 text-slate-800 border-slate-200';
    let icon = Activity;
    
    if (performance >= 90) {
      color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      icon = Star;
    } else if (performance >= 80) {
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      icon = TrendingUp;
    } else if (performance >= 70) {
      color = 'bg-amber-100 text-amber-800 border-amber-200';
      icon = Target;
    } else {
      color = 'bg-red-100 text-red-800 border-red-200';
      icon = AlertCircle;
    }
    
    const Icon = icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon size={12} className="mr-1.5" />
        {performance}%
      </span>
    );
  };

  // Organization List View
  const OrganizationList = () => {
    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Organizations</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalOrganizations}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="text-emerald-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalEmployees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.activeEmployees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.averagePerformance}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="text-orange-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Hires</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.recentHires}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 flex-1">
                <div className="relative min-w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search organizations, people, titles..."
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-32"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-40"
                >
                  <option value="name">Sort by Name</option>
                  <option value="employees">Sort by Employee Count</option>
                  <option value="performance">Sort by Performance</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStatsModal(true)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
                >
                  <BarChart3 size={16} className="mr-2" />
                  Statistics
                </button>
                
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
                >
                  <Clock size={16} className="mr-2" />
                  History
                </button>
                
                <button
                  onClick={() => setShowCreateOrgModal(true)}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium shadow-sm"
                >
                  <Plus size={16} className="mr-2" />
                  New Organization
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Cards */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentOrgs.map(([orgKey, org]) => {
                const stats = calculateStats(orgKey);
                return (
                  <div
                    key={orgKey}
                    className="bg-gray-50 rounded-xl border border-gray-100 p-6 cursor-pointer hover:shadow-lg hover:bg-white transition-all duration-200 hover:border-blue-200"
                    onClick={() => handleOrganizationClick(orgKey)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <button 
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show organization menu
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">
                      {orgKey}
                    </h3>
                    <p className="mb-3 text-gray-600 text-sm">
                      {org.name}
                    </p>
                    
                    {/* Status and Performance */}
                    <div className="flex items-center space-x-2 mb-4">
                      {getStatusBadge(org.status)}
                      {getPerformanceBadge(org.performance)}
                    </div>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">{stats.totalEmployees}</span>
                        <span className="ml-1">employees</span>
                      </div>
                                            <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">{stats.averagePerformance}%</span>
                        <span className="ml-1">avg</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <CheckCircle size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">{stats.activeEmployees}</span>
                        <span className="ml-1">active</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span className="font-medium">{stats.recentHires}</span>
                        <span className="ml-1">new</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                        View Organization Chart →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {currentOrgs.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No organizations found</h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterBy('all');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstOrg + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastOrg, filteredOrgs.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredOrgs.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Enhanced Organization Chart Node Component with fixed dimensions
  const PersonNode = ({ person, isRoot = false }) => {
    const hasSubordinates = person.subordinates && person.subordinates.length > 0;
    const isExpanded = expandedNodes.has(person.id);

    return (
      <div 
        className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-blue-300"
        style={{ 
          width: '280px', 
          minHeight: '120px',
          maxHeight: '120px'
        }}
        onClick={() => setSelectedPersonDetails(person)}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                isRoot ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-400 to-gray-600'
              }`}>
                <span className="text-white font-semibold text-sm">
                  {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm truncate text-gray-900">
                  {person.name}
                </h4>
                <p className="text-xs truncate text-gray-600">
                  {person.title || selectedOrganization}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPerson(person);
                  setShowEditModal(true);
                }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Edit person"
              >
                <Edit3 size={12} />
              </button>
              {!isRoot && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this person?')) {
                      deletePerson(person.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete person"
                >
                  <Trash2 size={12} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingPerson(person);
                  setShowAddModal(true);
                }}
                className="p-1 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                title="Add subordinate"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          
          {/* Status and Performance */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              {getStatusBadge(person.status)}
            </div>
            {getPerformanceBadge(person.performance)}
          </div>
          
          {/* Contact Info */}
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <Mail size={10} className="mr-1 text-gray-400" />
            <span className="truncate">{person.email}</span>
          </div>
          
          {/* Expand/Collapse Button */}
          {hasSubordinates && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(person.id);
              }}
              className={`w-full flex justify-center p-1 hover:bg-gray-100 rounded-lg transition-all duration-200 ${
                !isExpanded ? 'rotate-180' : ''
              }`}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Recursive Tree Node with enhanced styling
  const TreeNodeComponent = ({ person, isRoot = false }) => {
    const hasSubordinates = person.subordinates && person.subordinates.length > 0;
    const isExpanded = expandedNodes.has(person.id);

    if (isRoot) {
      return (
        <div className="flex flex-col items-center">
          <PersonNode person={person} isRoot={true} />
          {hasSubordinates && isExpanded && (
            <div className="flex flex-row gap-8 mt-8 relative">
              {/* Vertical line from parent */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300"></div>
              {person.subordinates.map((subordinate, index) => (
                <div key={subordinate.id} className="flex flex-col items-center relative">
                  {/* Horizontal line */}
                  {person.subordinates.length > 1 && (
                    <div className="absolute -top-4 w-full h-0.5 bg-gray-300" 
                        style={{
                          left: index === 0 ? '50%' : 
                                index === person.subordinates.length - 1 ? '-50%' : '-50%',
                          width: index === 0 || index === person.subordinates.length - 1 ? '50%' : '100%'
                        }}>
                    </div>
                  )}
                  {/* Vertical line to child */}
                  <div className="w-0.5 h-4 bg-gray-300 mb-4"></div>
                  <TreeNodeComponent person={subordinate} isRoot={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center">
        <PersonNode person={person} isRoot={false} />
        {hasSubordinates && isExpanded && (
          <div className="flex flex-row gap-8 mt-8 relative">
            {/* Vertical line from parent */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-gray-300"></div>
            {person.subordinates.map((subordinate, index) => (
              <div key={subordinate.id} className="flex flex-col items-center relative">
                {/* Horizontal line */}
                {person.subordinates.length > 1 && (
                  <div className="absolute -top-4 w-full h-0.5 bg-gray-300" 
                      style={{
                        left: index === 0 ? '50%' : 
                              index === person.subordinates.length - 1 ? '-50%' : '-50%',
                        width: index === 0 || index === person.subordinates.length - 1 ? '50%' : '100%'
                      }}>
                  </div>
                )}
                {/* Vertical line to child */}
                <div className="w-0.5 h-4 bg-gray-300 mb-4"></div>
                <TreeNodeComponent person={subordinate} isRoot={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Organization Chart View
  const OrganizationChart = () => {
    const org = organizations[selectedOrganization];
    if (!org) return null;

    const stats = calculateStats(selectedOrganization);

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBackToOrganizations}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{selectedOrganization}</h1>
              <p className="mt-2 text-gray-600">Organization Chart</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowStatsModal(true)}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
            >
              <BarChart3 size={16} className="mr-2" />
              Statistics
            </button>
            
            <button
              onClick={exportData}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
            
            <label className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center cursor-pointer font-medium">
              <Upload size={16} className="mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            
            <button
              onClick={() => {
                setEditingPerson(org);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              Add Person
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averagePerformance}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Hires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentHires}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <AlertCircle className="text-amber-600" size={20} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">{stats.onLeaveEmployees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <div className="overflow-auto">
              <div className="flex justify-center w-full">
                <TreeNodeComponent person={org} isRoot={true} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Add Person Modal
  const AddPersonModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      startDate: '',
      status: 'active',
      performance: 75,
      skills: '',
      bio: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const newPerson = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      
      if (editingPerson) {
        addPerson(editingPerson.id, newPerson);
      }
      
      setShowAddModal(false);
      setEditingPerson(null);
      setFormData({
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        startDate: '',
        status: 'active',
        performance: 75,
        skills: '',
        bio: ''
      });
    };

    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Add New Person</h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter job title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performance}
                  onChange={(e) => setFormData({...formData, performance: parseInt(e.target.value)})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="JavaScript, React, Node.js"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Brief description about the person..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Add Person
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Enhanced Edit Person Modal
  const EditPersonModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      startDate: '',
      status: 'active',
      performance: 75,
      skills: '',
      bio: ''
    });

    useEffect(() => {
      if (editingPerson) {
        setFormData({
          name: editingPerson.name || '',
          title: editingPerson.title || '',
          email: editingPerson.email || '',
          phone: editingPerson.phone || '',
          location: editingPerson.location || '',
          startDate: editingPerson.startDate || '',
          status: editingPerson.status || 'active',
          performance: editingPerson.performance || 75,
          skills: editingPerson.skills ? editingPerson.skills.join(', ') : '',
          bio: editingPerson.bio || ''
        });
      }
    }, [editingPerson]);

    const handleSubmit = (e) => {
      e.preventDefault();
      const updatedPerson = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      };
      
      editPerson(editingPerson.id, updatedPerson);
      setShowEditModal(false);
      setEditingPerson(null);
    };

    if (!showEditModal || !editingPerson) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Edit Person</h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                                    type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter job title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="on-leave">On Leave</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Performance Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.performance}
                  onChange={(e) => setFormData({...formData, performance: parseInt(e.target.value)})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="JavaScript, React, Node.js"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Brief description about the person..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Enhanced Statistics Modal
  const StatisticsModal = () => {
    if (!showStatsModal) return null;

    const allStats = Object.keys(organizations).reduce((acc, orgKey) => {
      acc[orgKey] = calculateStats(orgKey);
      return acc;
    }, {});

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Organization Statistics</h2>
            <button
              onClick={() => setShowStatsModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Overall Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Overall Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Building2 className="text-blue-600 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Organizations</p>
                      <p className="text-2xl font-bold text-blue-900">{overallStats.totalOrganizations}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center">
                    <Users className="text-emerald-600 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Total Employees</p>
                      <p className="text-2xl font-bold text-emerald-900">{overallStats.totalEmployees}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <TrendingUp className="text-purple-600 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-purple-800">Avg Performance</p>
                      <p className="text-2xl font-bold text-purple-900">{overallStats.averagePerformance}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center">
                    <Activity className="text-orange-600 mr-3" size={20} />
                    <div>
                      <p className="text-sm font-medium text-orange-800">Recent Hires</p>
                      <p className="text-2xl font-bold text-orange-900">{overallStats.recentHires}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Organization Statistics */}
            {Object.entries(allStats).map(([orgKey, stats]) => (
              <div key={orgKey} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">{orgKey}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <Users className="text-blue-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Total Employees</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalEmployees}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center">
                      <TrendingUp className="text-emerald-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm font-medium text-emerald-800">Avg Performance</p>
                        <p className="text-2xl font-bold text-emerald-900">{stats.averagePerformance}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center">
                      <Clock className="text-purple-600 mr-3" size={20} />
                      <div>
                        <p className="text-sm font-medium text-purple-800">Recent Hires</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.recentHires}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900">Status Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-sm font-medium text-emerald-800">Active</span>
                        <span className="font-bold text-emerald-900">{stats.activeEmployees}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-sm font-medium text-amber-800">On Leave</span>
                        <span className="font-bold text-amber-900">{stats.onLeaveEmployees}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-sm font-medium text-red-800">Inactive</span>
                        <span className="font-bold text-red-900">{stats.inactiveEmployees}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900">Level Distribution</h4>
                    <div className="space-y-3">
                      {Object.entries(stats.levelDistribution).map(([level, count]) => (
                        <div key={level} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <span className="text-sm font-medium text-slate-800">Level {level}</span>
                          <span className="font-bold text-slate-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced History Modal
  const HistoryModal = () => {
    if (!showHistoryModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Organization History</h2>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {organizationHistory.map((entry, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{entry.date}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">by {entry.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {organizationHistory.length === 0 && (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No history available</h3>
                <p className="text-gray-500">Organization changes will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Person Details Modal
  const PersonDetailsModal = () => {
    if (!selectedPersonDetails) return null;

    const person = selectedPersonDetails;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Employee Details</h2>
            <button
              onClick={() => setSelectedPersonDetails(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {person.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{person.name}</h3>
                <p className="text-gray-600">{person.title || selectedOrganization}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getStatusBadge(person.status)}
                  {getPerformanceBadge(person.performance)}
                </div>
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Contact Information</h4>
                
                {person.email && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Mail size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">{person.email}</span>
                  </div>
                )}
                
                {person.phone && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Phone size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">{person.phone}</span>
                  </div>
                )}
                
                {person.location && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <MapPin size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">{person.location}</span>
                  </div>
                )}
                
                {person.startDate && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">Started {person.startDate}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Professional Info</h4>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Briefcase size={16} className="text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700">Level {person.level || 1}</span>
                </div>
                
                {person.performance && (
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <TrendingUp size={16} className="text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700">Performance: {person.performance}%</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Skills */}
            {person.skills && person.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {person.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bio */}
            {person.bio && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{person.bio}</p>
              </div>
            )}
            
            {/* Subordinates */}
            {person.subordinates && person.subordinates.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Direct Reports</h4>
                <div className="space-y-3">
                  {person.subordinates.map((subordinate) => (
                    <div
                      key={subordinate.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedPersonDetails(subordinate)}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {subordinate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{subordinate.name}</p>
                        <p className="text-xs text-gray-500">{subordinate.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => {
                setEditingPerson(person);
                setShowEditModal(true);
                setSelectedPersonDetails(null);
              }}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center font-medium"
            >
              <Edit3 size={16} className="mr-2" />
              Edit
            </button>
            <button
              onClick={() => setSelectedPersonDetails(null)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Create Organization Modal
  const CreateOrganizationModal = () => {
    const [orgData, setOrgData] = useState({
      name: '',
      title: '',
      template: '',
      description: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const newOrg = {
        name: orgData.name,
        id: getNextId(),
        email: `${orgData.name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
        title: orgData.title,
        status: 'active',
        level: 5,
        performance: 85,
        subordinates: []
      };
      
      setOrganizations(prev => ({
        ...prev,
        [orgData.title]: newOrg
      }));
      
      addToHistory(`Created new organization: ${orgData.title}`);
      setShowCreateOrgModal(false);
      setOrgData({ name: '', title: '', template: '', description: '' });
    };

    if (!showCreateOrgModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Organization</h2>
            <button
              onClick={() => setShowCreateOrgModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leader Name *
              </label>
              <input
                type="text"
                required
                value={orgData.name}
                onChange={(e) => setOrgData({...orgData, name: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Title *
              </label>
              <input
                type="text"
                required
                value={orgData.title}
                onChange={(e) => setOrgData({...orgData, title: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Marketing Director"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={orgData.template}
                onChange={(e) => setOrgData({...orgData, template: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Select Template</option>
                {Object.entries(organizationTemplates).map(([key, template]) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={orgData.description}
                onChange={(e) => setOrgData({...orgData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Brief description of the organization..."
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateOrgModal(false)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                Create Organization
                            </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">Organization Manager</h1>
              <p className="mt-2 text-gray-600">Manage organizational structure and personnel</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {/* <button
                onClick={() => setShowStatsModal(true)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
              >
                <BarChart3 size={16} className="mr-2" />
                Statistics
              </button>
              
              <button
                onClick={() => setShowHistoryModal(true)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
              >
                <Clock size={16} className="mr-2" />
                History
              </button> */}
              
              <button
                onClick={exportData}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center font-medium"
              >
                <Download size={16} className="mr-2" />
                Export
              </button>
              
              <label className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all flex items-center cursor-pointer font-medium">
                <Upload size={16} className="mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              
              {/* <button
                onClick={() => setShowCreateOrgModal(true)}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center font-medium shadow-sm"
              >
                <Plus size={16} className="mr-2" />
                New Organization
              </button> */}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {showChart ? <OrganizationChart /> : <OrganizationList />}

        {/* Modals */}
        <AddPersonModal />
        <EditPersonModal />
        <StatisticsModal />
        <HistoryModal />
        <PersonDetailsModal />
        <CreateOrganizationModal />
      </div>
    </div>
  );
};

export default OrganizationManager;

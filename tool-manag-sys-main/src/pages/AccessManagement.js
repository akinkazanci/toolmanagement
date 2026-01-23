import React, { useMemo, useState, useEffect } from "react";
import {
  FileText,
  X,
  Save,
  ChevronDown,
  Check,
  Search,
  Download,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';

// --- Çoklu Seçim Bileşeni ---
function MultiSelect({ options, selected, onChange, placeholder = "Seçiniz" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggle = (val) => {
    const exists = selected.includes(val);
    onChange(exists ? selected.filter((v) => v !== val) : [...selected, val]);
  };

  const selectedLabels = useMemo(
    () => options.filter((o) => selected.includes(o.value)).map((o) => o.label),
    [options, selected]
  );

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
      >
        <span className="truncate">
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">{t('no_options')}</div>
          ) : (
            options.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => toggle(opt.value)}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <div
                    className={`mr-2 flex h-4 w-4 items-center justify-center rounded border ${
                      checked
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {checked && <Check size={12} />}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// --- DUMMY PROJE / KLASÖR VERİLERİ ---
const APP_ITEMS = {
  Jira: [
    { label: "DE-ERP", value: "DE-ERP" },
    { label: "DE-HR", value: "DE-HR" },
    { label: "DE-QA", value: "DE-QA" },
  ],
  "File Server": [
    { label: "\\\\fs01\\Finans", value: "\\\\fs01\\Finans" },
    { label: "\\\\fs01\\Projeler", value: "\\\\fs01\\Projeler" },
  ],
  QDMS: [
    { label: "Kalite El Kitabı", value: "Kalite El Kitabı" },
    { label: "Prosedürler", value: "Prosedürler" },
  ],
  Sharepoint: [
    { label: "İnsan Kaynakları", value: "İnsan Kaynakları" },
    { label: "Projeler", value: "Projeler" },
    { label: "Kalite", value: "Kalite" },
  ],
};

export default function AccessManagement() {
  const { t } = useLanguage();
  const API_BASE_URL =
    "https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api";

  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [assetPermissions, setAssetPermissions] = useState([]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filteredRoles, setFilteredRoles] = useState([]);
  
  // Excel benzeri başlık filtreleri
  const [headerFilters, setHeaderFilters] = useState({
    userTerm: '',
    departments: [],
    applications: [],
  });
  const [showFilterPanel, setShowFilterPanel] = useState({
    user: false,
    department: false,
    application: false,
  });

  const toggleFilterPanel = (key) => {
    setShowFilterPanel((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearHeaderFilter = (key) => {
    setHeaderFilters((prev) => {
      const next = { ...prev };
      if (key === 'user') next.userTerm = '';
      if (key === 'department') next.departments = [];
      if (key === 'application') next.applications = [];
      return next;
    });
  };

  const handleHeaderSort = (key) => {
    setSortBy((prev) => {
      const next = key === 'user' ? 'fullName' : key;
      return next;
    });
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Excel export state'leri
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedDepartmentForExport, setSelectedDepartmentForExport] = useState('all');

  const [projects, setProjects] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editRole, setEditRole] = useState(null);

  // Sıralama state'leri
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');

  // --- USERS çek ---
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/Users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

  // --- APPS çek ---
  const fetchApps = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/Applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApps(data);
    } catch (err) {
      console.error("Apps fetch error", err);
    }
  };

  // --- Permissions (RolePermission) çek ---
  const fetchAppPermissions = async (appName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/RolePermission/by-app-name/${appName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setAssetPermissions(data);
    } catch (err) {
      console.error("Permission fetch error", err);
      setAssetPermissions([]);
    }
  };

  // --- UserRoles çek ---
  const fetchUserRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/UserRole`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("UserRole fetch failed");
      const data = await res.json();
      setUserRoles(data);
    } catch (err) {
      console.error("UserRole fetch error", err);
      setUserRoles([]);
    }
  };

  const handleEdit = async (role) => {
    const selectedProjectIds = role.projects?.map(p => p.projectId.toString()) || [];

    setEditRole({
      ...role,
      selectedProjectIds,
      selectedRoleId: role.roleId?.toString() || null
    });

    // App bul
    const app = apps.find(a => a.appId === role.appId);
    if (app) {
      // Projeleri getir
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/Projects/by-app/${app.appId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProjects(
          data.map((p) => ({
            label: p.projectName,
            value: p.projectId.toString(),
          }))
        );
        setSelectedItems([]);
      } catch (err) {
        console.error("Edit projeler fetch error", err);
        setProjects([]);
      }

      // izinleri getir
      fetchAppPermissions(app.appName);
    }

    setShowEditModal(true);
  };

  const handleDelete = async (userRoleId) => {
    if (!window.confirm("Bu rolü silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/UserRole/${userRoleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Silme başarısız");
      alert("Rol silindi");
      fetchUserRoles(); // tabloyu yenile
    } catch (err) {
      console.error("Delete error", err);
      alert("Hata: " + err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchApps();
    fetchUserRoles();
  }, []);

  useEffect(() => {
    if (selectedApp?.appId) {
      // Projeleri çek
      const fetchProjects = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE_URL}/Projects/by-app/${selectedApp.appId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Projeler alınamadı");
          const data = await res.json();
          setProjects(
            data.map((p) => ({
              label: p.projectName,
              value: p.projectId.toString(),
            }))
          );
        } catch (err) {
          console.error(err);
          setProjects([]);
        }
      };

      fetchProjects();
      fetchAppPermissions(selectedApp.appName); // senin mevcut fonksiyon
    } else {
      setProjects([]);
      setAssetPermissions([]);
    }
  }, [selectedApp]);

  // AccessManagement.js içinde handleSaveRequest
  const handleSaveRequest = async () => {
    if (!selectedUser || !selectedApp || selectedPerms.length === 0) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      for (const permId of selectedPerms) {
        const role = assetPermissions.find(
          (p) => p.rolePermissionId.toString() === permId
        );
        if (!role) continue;

        // 🔥 Burada payload’a projectIds ekledik
        const payload = {
          userId: parseInt(selectedUser),
          roleId: role.roleId,
          appId: selectedApp.appId,
          projectIds: selectedItems.map((id) => parseInt(id)), // ✅ projeler
          expiresAt: null,
        };

        const res = await fetch(`${API_BASE_URL}/UserRole`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("UserRole kaydı başarısız");
        }
      }

      alert("Yetki başarıyla kaydedildi!");
      setShowRequestModal(false);
      setSelectedUser("");
      setSelectedApp(null);
      setSelectedItems([]); // ✅ projeleri de sıfırlıyorsun
      setSelectedPerms([]);
      fetchUserRoles();
    } catch (err) {
      console.error(err);
      alert("Hata oluştu: " + err.message);
    }
  };

  // --- Gruplanmış roller ---
  const groupedRoles = useMemo(() => {
    const grouped = {};
    userRoles.forEach((role) => {
      const key = `${role.userId}-${role.appId}`;
      if (!grouped[key]) {
        // Kullanıcı bilgilerini users array'inden çek
        const user = users.find(u => u.userId === role.userId);
        grouped[key] = { 
          ...role, 
          roles: [],
          department: user?.department || '',
          location: user?.location || '',
          fullName: user?.fullName || '',
          email: user?.email || ''
        };
      }
      grouped[key].roles.push(role.roleName);
    });
    return Object.values(grouped);
  }, [userRoles, users]);

  // --- Dinamik seçenekler ---
  const departmentOptions = Array.from(
    new Set(users.map(u => (u.department || '').trim()).filter(Boolean))
  ).sort();

  const locationOptions = Array.from(
    new Set(users.map(u => (u.location || '').trim()).filter(Boolean))
  ).sort();

  const appOptions = Array.from(
    new Set(groupedRoles.map(r => (r.appName || r.applicationName || '').trim()).filter(Boolean))
  ).sort();

  // --- Filtreleme mantığı ---
  useEffect(() => {
    let filtered = [...groupedRoles];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(role =>
        (role.username || '').toLowerCase().includes(q) ||
        (role.fullName || '').toLowerCase().includes(q) ||
        (role.email || '').toLowerCase().includes(q) ||
        (role.department || '').toLowerCase().includes(q) ||
        (role.location || '').toLowerCase().includes(q)
      );
    }

    if (filterDepartment !== 'all') {
      filtered = filtered.filter(role => (role.department || '').trim() === filterDepartment);
    }

    if (filterLocation !== 'all') {
      filtered = filtered.filter(role => (role.location || '').trim() === filterLocation);
    }

    // Başlık bazlı filtreler: kullanıcı, departman, uygulama
    if (headerFilters.userTerm && headerFilters.userTerm.trim() !== '') {
      const qh = headerFilters.userTerm.toLowerCase();
      filtered = filtered.filter(role =>
        (role.username || '').toLowerCase().includes(qh) ||
        (role.fullName || '').toLowerCase().includes(qh) ||
        (role.email || '').toLowerCase().includes(qh)
      );
    }

    if (Array.isArray(headerFilters.departments) && headerFilters.departments.length > 0) {
      const dset = new Set(headerFilters.departments);
      filtered = filtered.filter(r => dset.has((r.department || '').trim()));
    }

    if (Array.isArray(headerFilters.applications) && headerFilters.applications.length > 0) {
      const aset = new Set(headerFilters.applications);
      filtered = filtered.filter(r => aset.has((r.appName || r.applicationName || '').trim()));
    }

    setFilteredRoles(filtered);
  }, [groupedRoles, searchTerm, filterDepartment, filterLocation, headerFilters]);

  // --- Kullanıcı bazlı gruplama (UI için) ---
  const userGroups = useMemo(() => {
    const map = {};
    (filteredRoles || []).forEach((role) => {
      if (!map[role.userId]) {
        map[role.userId] = {
          userId: role.userId,
          username: role.username,
          fullName: role.fullName,
          email: role.email,
          department: role.department,
          location: role.location,
          items: [],
        };
      }
      map[role.userId].items.push({
        appId: role.appId,
        appName: role.appName || role.applicationName,
        roles: role.roles || [],
        projects: role.projects || [],
        assignedAt: role.assignedAt,
        expiresAt: role.expiresAt,
        userRoleId: role.userRoleId,
      });
    });
    return Object.values(map);
  }, [filteredRoles]);

  // --- Sıralama uygulanmış kullanıcı grupları ---
  const sortedUserGroups = useMemo(() => {
    const arr = [...userGroups];
    const getCreatedAt = (group) => {
      const user = users.find(u => u.userId === group.userId);
      if (user?.createdAt) {
        const d = new Date(user.createdAt);
        return isNaN(d.getTime()) ? null : d;
      }
      const dates = (group.items || [])
        .map(i => i.assignedAt ? new Date(i.assignedAt) : null)
        .filter(d => d && !isNaN(d.getTime()));
      if (dates.length === 0) return null;
      return new Date(Math.min(...dates.map(d => d.getTime())));
    };

    const collatorTr = new Intl.Collator('tr', { sensitivity: 'accent' });
    arr.sort((a, b) => {
      let aVal;
      let bVal;
      switch (sortBy) {
        case 'department':
          aVal = (a.department || '');
          bVal = (b.department || '');
          break;
        case 'location':
          aVal = (a.location || '');
          bVal = (b.location || '');
          break;
        case 'application':
          {
            const aApps = (a.items || []).map(i => i.appName).filter(Boolean).sort((x, y) => collatorTr.compare(x, y));
            const bApps = (b.items || []).map(i => i.appName).filter(Boolean).sort((x, y) => collatorTr.compare(x, y));
            aVal = aApps[0] || '';
            bVal = bApps[0] || '';
          }
          break;
        case 'createdAt':
          aVal = getCreatedAt(a);
          bVal = getCreatedAt(b);
          const aTime = aVal ? aVal.getTime() : Number.POSITIVE_INFINITY;
          const bTime = bVal ? bVal.getTime() : Number.POSITIVE_INFINITY;
          if (aTime < bTime) return sortOrder === 'asc' ? -1 : 1;
          if (aTime > bTime) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        default:
          aVal = (a.fullName || a.username || '');
          bVal = (b.fullName || b.username || '');
      }
      const cmp = collatorTr.compare(aVal, bVal);
      if (cmp < 0) return sortOrder === 'asc' ? -1 : 1;
      if (cmp > 0) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [userGroups, sortBy, sortOrder, users]);

  // --- Kullanıcı gruplarını aç/kapat ---
  const [expandedUsers, setExpandedUsers] = useState({});
  const toggleExpanded = (userId) => {
    setExpandedUsers((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Excel Export Function
  const handleExportToExcel = () => {
    let dataToExport = filteredRoles;
    
    // Filter by department if selected
    if (selectedDepartmentForExport !== 'all') {
      dataToExport = filteredRoles.filter(role => 
        (role.department || '').trim() === selectedDepartmentForExport
      );
    }

    // Prepare data for Excel
    const excelData = dataToExport.map(role => ({
      'Kullanıcı Adı': role.username || '',
      'Ad Soyad': role.fullName || '',
      'E-posta': role.email || '',
      'Departman': role.department || '',
      'Lokasyon': role.location || '',
      'Uygulama': role.appName || '',
      'Roller': role.roles?.join(', ') || '',
      [t('projects')]: role.projects?.map(p => p.projectName).join(', ') || '',
      'Atama Tarihi': role.assignedDate ? new Date(role.assignedDate).toLocaleDateString('tr-TR') : '',
      'Geçerlilik Tarihi': role.expiryDate ? new Date(role.expiryDate).toLocaleDateString('tr-TR') : ''
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Kullanıcı Adı
      { wch: 20 }, // Ad Soyad
      { wch: 25 }, // E-posta
      { wch: 15 }, // Departman
      { wch: 15 }, // Lokasyon
      { wch: 15 }, // Uygulama
      { wch: 25 }, // Roller
      { wch: 15 }, // Atama Tarihi
      { wch: 15 }  // Geçerlilik Tarihi
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Erişim_Yetkileri');

    // Generate filename
    const departmentText = selectedDepartmentForExport === 'all' ? 'Tum_Departmanlar' : selectedDepartmentForExport.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Erisim_Yetkileri_${departmentText}_${timestamp}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);
    
    // Close modal
    setShowExportModal(false);
    setSelectedDepartmentForExport('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="relative z-10 max-w-full mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">{t('access_management_title')}</h1>
          <div className="flex gap-3">
            {/* Export Button */}
            <button
              onClick={() => setShowExportModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download size={18} className="mr-2" />
              {t('export_to_excel')}
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 flex items-center gap-2"
            >
              <FileText size={20} />
              {t('new_access_request')}
            </button>
          </div>
        </div>

      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mx-6 my-8">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                {/* Kullanıcı */}
                <th className="w-1/2 px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider relative">
                  <div className="flex items-center gap-2">
                    <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('user')}>
                      {t('user_column')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('user')} aria-label="Filter User">
                      <Filter size={14} className="text-white/80" />
                    </button>
                  </div>
                  {showFilterPanel.user && (
                    <div className="absolute z-20 mt-2 left-0 bg-gray-900 border border-white/20 rounded-lg p-3 w-64 shadow-xl">
                      <div className="mb-2 text-white text-xs font-semibold">{t('user_column')}</div>
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

                {/* Departman */}
                <th className="w-1/4 px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider relative">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('department')}>
                      {t('department')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('department')} aria-label="Filter Department">
                      <Filter size={14} className="text-white/80" />
                    </button>
                  </div>
                  {showFilterPanel.department && (
                    <div className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto">
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

                {/* Uygulama */}
                <th className="w-1/4 px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider relative">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-white/90 hover:text-white flex items-center gap-1" onClick={() => handleHeaderSort('application')}>
                      {t('application')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button className="p-1 rounded hover:bg-white/10" onClick={() => toggleFilterPanel('application')} aria-label="Filter Application">
                      <Filter size={14} className="text-white/80" />
                    </button>
                  </div>
                  {showFilterPanel.application && (
                    <div className="absolute z-20 mt-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto">
                      <div className="mb-2 text-white text-xs font-semibold">{t('application')}</div>
                      <div className="space-y-1 text-white text-sm">
                        {appOptions.map(app => (
                          <label key={app} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={headerFilters.applications.includes(app)}
                              onChange={(e) => setHeaderFilters((prev) => {
                                const next = new Set(prev.applications);
                                if (e.target.checked) next.add(app); else next.delete(app);
                                return { ...prev, applications: Array.from(next) };
                              })}
                            />
                            <span>{app}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button className="px-3 py-1 text-xs bg-white/10 border border-gray-600 rounded text-white" onClick={() => clearHeaderFilter('application')}>{t('clear_filters')}</button>
                        <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white" onClick={() => toggleFilterPanel('application')}>OK</button>
                      </div>
                    </div>
                  )}
                </th>

              </tr>
            </thead>

            <tbody className="bg-transparent divide-y divide-white/10">
              {sortedUserGroups.map((group) => {
                const isOpen = !!expandedUsers[group.userId];
                const allProjects = group.items.flatMap((i) => i.projects || []);
                const allRoles = group.items.flatMap((i) => i.roles || []);
                const uniqProjects = Array.from(new Set(allProjects.map(p => p.projectName))).slice(0, 3);
                const uniqRoles = Array.from(new Set(allRoles)).slice(0, 3);

                return (
                  <React.Fragment key={`user-${group.userId}`}>
                    <tr className="hover:bg-white/10 hover:shadow-lg transition-all duration-300 group">
                      {/* Kullanıcı */}
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpanded(group.userId)}
                            className={`mr-3 p-2 rounded-lg border border-white/20 bg-white/10 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            aria-label={isOpen ? t('collapse') : t('expand')}
                          >
                            <ChevronDown size={16} />
                          </button>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-semibold text-sm">
                              {(group.username || '').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-white">{group.username}</div>
                            {group.fullName && (
                              <div className="text-xs text-white/70">{group.fullName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Departman */}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="text-sm font-semibold text-gray-100 truncate">{group.department || "—"}</div>
                      </td>

                      {/* Uygulama (özet) */}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="text-sm font-bold text-white">{(group.items && group.items.length > 0)
                          ? group.items.map((item) => item.appName).filter(Boolean).join(', ')
                          : '—'}</div>
                      </td>




                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={3} className="px-4 py-3">
                          <div className="max-w-4xl mx-auto">
                            <ul className="space-y-2">
                              {group.items.map((item, idx) => (
                                <li key={`${group.userId}-${item.appId}-${idx}`} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center mr-2">
                                        <FileText className="text-white" size={14} />
                                      </div>
                                      <h4 className="font-semibold text-white text-base">{item.appName || t('application')}</h4>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleEdit({
                                          ...item,
                                          userId: group.userId,
                                          username: group.username,
                                        })}
                                        className="text-blue-400 hover:text-blue-200 px-2 py-1 text-sm rounded-lg hover:bg-blue-500/30 hover:shadow-md transition-all duration-200"
                                      >
                                        {t('edit')}
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.userRoleId)}
                                        className="text-red-400 hover:text-red-200 px-2 py-1 text-sm rounded-lg hover:bg-red-500/30 hover:shadow-md transition-all duration-200"
                                      >
                                        {t('delete')}
                                      </button>
                                    </div>
                                  </div>

                                  <table className="w-full text-sm text-left text-white">
                                    <thead className="text-xs text-white/70 uppercase">
                                      <tr>
                                        <th scope="col" className="px-6 py-3">PROJE</th>
                                        <th scope="col" className="px-6 py-3">ROLLER</th>
                                        <th scope="col" className="px-6 py-3">GEÇERLİLİK SÜRESİ</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.projects.map((p, pIdx) => (
                                        <tr key={pIdx} className="bg-white/5 border-b border-white/10">
                                          <td className="px-6 py-4">{p.projectName}</td>
                                          <td className="px-6 py-4">{item.roles.join(', ')}</td>
                                          <td className="px-6 py-4">{item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('tr-TR') : t('unlimited')}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-blue-900/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Dynamic background accents */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-10 left-6 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-6 w-12 h-12 bg-purple-500/10 rounded-xl animate-pulse delay-700"></div>
            </div>
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">{t('new_access_request')}</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Kullanıcı */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">{t('user_column')}</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-900">{t('select_user')}</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId} className="text-gray-900">
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* App */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">{t('application')}</label>
                <select
                  value={selectedApp?.appId || ""}
                  onChange={(e) =>
                    setSelectedApp(apps.find((a) => a.appId === parseInt(e.target.value)))
                  }
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-900">{t('select_application')}</option>
                  {apps.map((a) => (
                    <option key={a.appId} value={a.appId} className="text-gray-900">
                      {a.appName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Projeler / Klasörler (dummy) */}
              {selectedApp && projects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {selectedApp.appName} Projeleri
                  </label>
                  <MultiSelect
                    options={projects}
                    selected={selectedItems}
                    onChange={setSelectedItems}
                    placeholder={t('select_items')}
                  />
                </div>
              )}

              {/* Roller & İzinler */}
              {selectedApp && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {selectedApp.appName} Roller & İzinler
                  </label>
                  <MultiSelect
                    options={assetPermissions.map((p) => ({
                      label: `${p.roleName} → ${p.permissionName} (${p.permissionType})`,
                      value: p.rolePermissionId.toString(),
                    }))}
                    selected={selectedPerms}
                    onChange={setSelectedPerms}
                    placeholder={t('select_role_permission')}
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSaveRequest}
                  disabled={!selectedUser || !selectedApp || selectedPerms.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Save size={16} />
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Export Modal */}
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
              <h3 className="text-lg font-semibold text-white">{t('export_to_excel')}</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2">
                {t('select_department')}
              </label>
              <select
                value={selectedDepartmentForExport}
                onChange={(e) => setSelectedDepartmentForExport(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all" className="text-gray-900">{t('all_departments')}</option>
                {departmentOptions.map(dep => (
                  <option key={dep} value={dep} className="text-gray-900">{dep}</option>
                ))}
              </select>
              
              <p className="text-sm text-white/70 mt-2">
                {selectedDepartmentForExport === 'all' 
                  ? `${t('total')} ${filteredRoles.length} ${t('total_access_rights')}`
                  : `${filteredRoles.filter(role => (role.department || '').trim() === selectedDepartmentForExport).length} ${t('total_access_rights')}`
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Download size={16} className="mr-2" />
                {t('export')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-blue-900/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-10 left-6 w-16 h-16 bg-blue-500/10 rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-6 w-12 h-12 bg-purple-500/10 rounded-xl animate-pulse delay-700"></div>
            </div>
            <div className="flex justify-between items-center p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">Yetki Düzenle</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Kullanıcı */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Kullanıcı</label>
                <select
                  value={editRole?.userId || ""}
                  onChange={(e) => setEditRole({ ...editRole, userId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-900">{t('select_user')}</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId} className="text-gray-900">
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Uygulama */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Uygulama</label>
                <select
                  value={editRole?.appId || ""}
                  onChange={(e) => {
                    const app = apps.find(a => a.appId === parseInt(e.target.value));
                    setEditRole({ ...editRole, appId: app.appId });
                    fetchAppPermissions(app.appName);
                  }}
                  className="w-full px-3 py-2 border border-white/20 bg-white/10 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-900">{t('select_application')}</option>
                  {apps.map((a) => (
                    <option key={a.appId} value={a.appId} className="text-gray-900">
                      {a.appName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Projeler */}
              {projects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Projeler</label>
                  <MultiSelect
                    options={projects}
                    selected={editRole?.selectedProjectIds || []}   // ✅ seçili projeler
                    onChange={(vals) =>
                      setEditRole({
                        ...editRole,
                        selectedProjectIds: vals,
                        projects: vals.map(v => ({
                          projectId: parseInt(v),
                          projectName: projects.find(p => p.value === v)?.label || ""
                        }))
                      })
                    }
                    placeholder="Projeleri seçin"
                  />
                </div>
              )}

              {/* Roller */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Rol & İzin</label>
                <MultiSelect
                  options={assetPermissions.map((p) => ({
                    label: `${p.roleName} → ${p.permissionName} (${p.permissionType})`,
                    value: p.roleId.toString(),
                  }))}
                  selected={editRole?.selectedRoleId ? [editRole.selectedRoleId] : []}  // ✅ seçili rol
                  onChange={(vals) =>
                    setEditRole({
                      ...editRole,
                      selectedRoleId: vals[0],
                      roleId: parseInt(vals[0])
                    })
                  }
                  placeholder="Rol seçin"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    const payload = {
                      userId: editRole.userId,
                      roleId: editRole.roleId,
                      appId: editRole.appId,
                      expiresAt: editRole.expiresAt,
                      projectIds: editRole.projects?.map(p => p.projectId) || []
                    };

                    const res = await fetch(`${API_BASE_URL}/UserRole/${editRole.userRoleId}`, {
                      method: "PUT",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(payload),
                    });

                    if (!res.ok) {
                      alert("Güncelleme başarısız!");
                      return;
                    }

                    setShowEditModal(false);
                    fetchUserRoles();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={16} />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

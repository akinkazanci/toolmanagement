import React, { useMemo, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
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
  Clock,
  CalendarDays,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../config';

// --- Çoklu Seçim Bileşeni ---
function MultiSelect({ options, selected, onChange, placeholder = "Seçiniz" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  const toggle = (val) => {
    const exists = selected.includes(val);
    const nextSelected = exists ? selected.filter((v) => v !== val) : [...selected, val];
    onChange(nextSelected);
    setOpen(false);
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
    projects: [],
  });
  const [showFilterPanel, setShowFilterPanel] = useState({
    user: false,
    department: false,
    application: false,
    project: false,
  });
  const userFilterButtonRef = useRef(null);
  const departmentFilterButtonRef = useRef(null);
  const applicationFilterButtonRef = useRef(null);
  const projectFilterButtonRef = useRef(null);
  const [userFilterPosition, setUserFilterPosition] = useState({ top: 0, left: 0 });
  const [departmentFilterPosition, setDepartmentFilterPosition] = useState({ top: 0, left: 0 });
  const [applicationFilterPosition, setApplicationFilterPosition] = useState({ top: 0, left: 0 });
  const [projectFilterPosition, setProjectFilterPosition] = useState({ top: 0, left: 0 });
  const [toast, setToast] = useState({ message: "", type: "", visible: false });
  const [saving, setSaving] = useState(false);

  const clampToViewport = (desiredLeft, width) => {
    const margin = 12;
    const viewportLeft = window.scrollX;
    const viewportRight = window.scrollX + window.innerWidth;
    let left = desiredLeft;
    if (left + width + margin > viewportRight) {
      left = viewportRight - width - margin;
    }
    if (left < viewportLeft + margin) {
      left = viewportLeft + margin;
    }
    return left;
  };
  const computeLeft = (rect, width) => {
    const desired = rect.left + window.scrollX + rect.width / 2 - width / 2 - 16;
    return clampToViewport(desired, width);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };
  const toggleFilterPanel = (key) => {
    setShowFilterPanel((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleUserFilterPanel = () => {
    setShowFilterPanel((prev) => {
      const next = !prev.user;
      if (next && userFilterButtonRef.current) {
        const rect = userFilterButtonRef.current.getBoundingClientRect();
        const width = 256;
        const left = computeLeft(rect, width);
        setUserFilterPosition({ top: rect.bottom + window.scrollY + 4, left });
      }
      return { ...prev, user: next };
    });
  };
  const toggleDepartmentFilterPanel = () => {
    setShowFilterPanel((prev) => {
      const next = !prev.department;
      if (next && departmentFilterButtonRef.current) {
        const rect = departmentFilterButtonRef.current.getBoundingClientRect();
        const width = 256;
        const left = computeLeft(rect, width);
        setDepartmentFilterPosition({ top: rect.bottom + window.scrollY + 4, left });
      }
      return { ...prev, department: next };
    });
  };
  const toggleApplicationFilterPanel = () => {
    setShowFilterPanel((prev) => {
      const next = !prev.application;
      if (next && applicationFilterButtonRef.current) {
        const rect = applicationFilterButtonRef.current.getBoundingClientRect();
        const width = 256;
        const left = computeLeft(rect, width);
        setApplicationFilterPosition({ top: rect.bottom + window.scrollY + 4, left });
      }
      return { ...prev, application: next };
    });
  };
  const toggleProjectFilterPanel = () => {
    setShowFilterPanel((prev) => {
      const next = !prev.project;
      if (next && projectFilterButtonRef.current) {
        const rect = projectFilterButtonRef.current.getBoundingClientRect();
        const width = 256;
        const left = computeLeft(rect, width);
        setProjectFilterPosition({ top: rect.bottom + window.scrollY + 4, left });
      }
      return { ...prev, project: next };
    });
  };

  const clearHeaderFilter = (key) => {
    setHeaderFilters((prev) => {
      const next = { ...prev };
      if (key === 'user') next.userTerm = '';
      if (key === 'department') next.departments = [];
      if (key === 'application') next.applications = [];
      if (key === 'project') next.projects = [];
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
      showToast("Lütfen kullanıcı, uygulama ve rol/izin seçiniz!", "error");
      return;
    }

    try {
      setSaving(true);
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
          let reason = `HTTP ${res.status}`;
          try {
            const text = await res.text();
            if (text) reason = text;
          } catch {}
          throw new Error(reason);
        }
      }

      showToast("Yetki başarıyla kaydedildi!", "success");
      setShowRequestModal(false);
      setSelectedUser("");
      setSelectedApp(null);
      setSelectedItems([]); // ✅ projeleri de sıfırlıyorsun
      setSelectedPerms([]);
      fetchUserRoles();
    } catch (err) {
      showToast("Hata oluştu: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // handleSendApproval removed as requested


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

  const projectOptions = Array.from(
    new Set(
      groupedRoles
        .flatMap(r => (r.projects || []).map(p => (p.projectName || '').trim()))
        .filter(Boolean)
    )
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

    if (Array.isArray(headerFilters.projects) && headerFilters.projects.length > 0) {
      const pset = new Set(headerFilters.projects);
      filtered = filtered.filter(r => (r.projects || []).some(p => pset.has((p.projectName || '').trim())));
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
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 max-w-full mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('access_management_title')}</h1>
            <p className="text-xl text-slate-600">{t('access_management_subtitle') || "Erişim yetkilerini ve rollerini yönetin"}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Download size={18} className="mr-2" />
              {t('export_to_excel')}
            </button>
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FileText size={20} />
              {t('new_access_request')}
            </button>
          </div>
        </div>

      </div>

      <div className="relative z-10 bg-white rounded-2xl border border-gray-200 shadow-lg mx-6 my-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Kullanıcı */}
    <th className="w-2/5 px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider relative">
                  <div className="flex items-center gap-2">
                    <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1" onClick={() => handleHeaderSort('user')}>
                      {t('user_column')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button ref={userFilterButtonRef} className="p-1 rounded hover:bg-gray-200" onClick={toggleUserFilterPanel} aria-label="Filter User">
                      <Filter size={14} className="text-gray-500" />
                    </button>
                  </div>
                  {showFilterPanel.user && ReactDOM.createPortal(
                    <div className="fixed z-50 bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-xl" style={{ top: userFilterPosition.top, left: userFilterPosition.left }}>
                      <div className="mb-2 text-gray-700 text-xs font-semibold">{t('user_column')}</div>
                      <input
                        type="text"
                        value={headerFilters.userTerm}
                        onChange={(e) => setHeaderFilters((prev) => ({ ...prev, userTerm: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder={t('search')}
                      />
                      <div className="mt-3 flex justify-between">
                        <button className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600 hover:bg-gray-200" onClick={() => clearHeaderFilter('user')}>{t('clear_filters')}</button>
                        <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700" onClick={() => toggleFilterPanel('user')}>OK</button>
                      </div>
                    </div>,
                    document.body
                  )}
                </th>

                {/* Departman */}
    <th className="w-1/5 px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider relative">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1" onClick={() => handleHeaderSort('department')}>
                      {t('department')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button ref={departmentFilterButtonRef} className="p-1 rounded hover:bg-gray-200" onClick={toggleDepartmentFilterPanel} aria-label="Filter Department">
                      <Filter size={14} className="text-gray-500" />
                    </button>
                  </div>
                  {showFilterPanel.department && ReactDOM.createPortal(
                    <div className="fixed z-50 bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto" style={{ top: departmentFilterPosition.top, left: departmentFilterPosition.left }}>
                      <div className="mb-2 text-gray-700 text-xs font-semibold">{t('department')}</div>
                      <div className="space-y-1 text-gray-700 text-sm">
                        {departmentOptions.map(dep => (
                          <label key={dep} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={headerFilters.departments.includes(dep)}
                              onChange={(e) => setHeaderFilters((prev) => {
                                const next = new Set(prev.departments);
                                if (e.target.checked) next.add(dep); else next.delete(dep);
                                return { ...prev, departments: Array.from(next) };
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{dep}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600 hover:bg-gray-200" onClick={() => clearHeaderFilter('department')}>{t('clear_filters')}</button>
                        <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700" onClick={() => toggleFilterPanel('department')}>OK</button>
                      </div>
                    </div>,
                    document.body
                  )}
                </th>

                {/* Uygulama */}
    <th className="w-1/5 px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider relative">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1" onClick={() => handleHeaderSort('application')}>
                      {t('application')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button ref={applicationFilterButtonRef} className="p-1 rounded hover:bg-gray-200" onClick={toggleApplicationFilterPanel} aria-label="Filter Application">
                      <Filter size={14} className="text-gray-500" />
                    </button>
                  </div>
                  {showFilterPanel.application && ReactDOM.createPortal(
                    <div className="fixed z-50 bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto" style={{ top: applicationFilterPosition.top, left: applicationFilterPosition.left }}>
                      <div className="mb-2 text-gray-700 text-xs font-semibold">{t('application')}</div>
                      <div className="space-y-1 text-gray-700 text-sm">
                        {appOptions.map(app => (
                          <label key={app} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={headerFilters.applications.includes(app)}
                              onChange={(e) => setHeaderFilters((prev) => {
                                const next = new Set(prev.applications);
                                if (e.target.checked) next.add(app); else next.delete(app);
                                return { ...prev, applications: Array.from(next) };
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{app}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600 hover:bg-gray-200" onClick={() => clearHeaderFilter('application')}>{t('clear_filters')}</button>
                        <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700" onClick={() => toggleFilterPanel('application')}>OK</button>
                      </div>
                    </div>,
                    document.body
                  )}
                </th>

                {/* Proje */}
                <th className="w-1/5 px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider relative">
                  <div className="flex items-center justify-center gap-2">
                    <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1" onClick={() => handleHeaderSort('project')}>
                      {t('projects')}
                      <ArrowUpDown size={14} />
                    </button>
                    <button ref={projectFilterButtonRef} className="p-1 rounded hover:bg-gray-200" onClick={toggleProjectFilterPanel} aria-label="Filter Project">
                      <Filter size={14} className="text-gray-500" />
                    </button>
                  </div>
                  {showFilterPanel.project && ReactDOM.createPortal(
                    <div className="fixed z-50 bg-white border border-gray-200 rounded-lg p-3 w-64 shadow-xl max-h-64 overflow-auto" style={{ top: projectFilterPosition.top, left: projectFilterPosition.left }}>
                      <div className="mb-2 text-gray-700 text-xs font-semibold">{t('projects')}</div>
                      <div className="space-y-1 text-gray-700 text-sm">
                        {projectOptions.map(prj => (
                          <label key={prj} className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={headerFilters.projects.includes(prj)}
                              onChange={(e) => setHeaderFilters((prev) => {
                                const next = new Set(prev.projects);
                                if (e.target.checked) next.add(prj); else next.delete(prj);
                                return { ...prev, projects: Array.from(next) };
                              })}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{prj}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between">
                        <button className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded text-gray-600 hover:bg-gray-200" onClick={() => clearHeaderFilter('project')}>{t('clear_filters')}</button>
                        <button className="px-3 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700" onClick={() => toggleFilterPanel('project')}>OK</button>
                      </div>
                    </div>,
                    document.body
                  )}
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {sortedUserGroups.map((group) => {
                const isOpen = !!expandedUsers[group.userId];
                const allProjects = group.items.flatMap((i) => i.projects || []);
                const allRoles = group.items.flatMap((i) => i.roles || []);
                const uniqProjects = Array.from(new Set(allProjects.map(p => p.projectName))).slice(0, 3);
                const uniqRoles = Array.from(new Set(allRoles)).slice(0, 3);

                return (
                  <React.Fragment key={`user-${group.userId}`}>
                    <tr className="hover:bg-gray-50 transition-all duration-300 group">
                      {/* Kullanıcı */}
                      <td className="px-6 py-4 whitespace-nowrap align-middle">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpanded(group.userId)}
                            className={`mr-3 p-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            aria-label={isOpen ? t('collapse') : t('expand')}
                          >
                            <ChevronDown size={16} />
                          </button>
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-white font-semibold text-sm">
                              {(group.username || '').substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-gray-900">{group.username}</div>
                            {group.fullName && (
                              <div className="text-xs text-gray-500">{group.fullName}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Departman */}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="text-sm font-semibold text-gray-700 truncate">{group.department || "—"}</div>
                      </td>

                      {/* Uygulama (özet) */}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="text-sm font-bold text-gray-900">{(group.items && group.items.length > 0)
                          ? group.items.map((item) => item.appName).filter(Boolean).join(', ')
                          : '—'}</div>
                      </td>

                      {/* Proje (özet) */}
                      <td className="px-6 py-4 align-middle text-center">
                        <div className="text-sm font-semibold text-gray-700 truncate">{uniqProjects.length > 0 ? uniqProjects.join(', ') : '—'}</div>
                      </td>




                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={4} className="px-0 py-3 bg-gray-50">
                          <div className="w-full">
                            <ul className="space-y-0">
                              {group.items.map((item, idx) => (
                                <li key={`${group.userId}-${item.appId}-${idx}`} className="bg-white p-0 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-center justify-between p-4 mb-1">
                                    <div className="flex items-center ml-2">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <FileText className="text-blue-600" size={12} />
                                      </div>
                                      <h4 className="font-medium text-gray-700 text-sm">{item.appName || t('application')}</h4>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEdit({
                                          ...item,
                                          userId: group.userId,
                                          username: group.username,
                                        })}
                                        className="text-blue-600 hover:text-blue-700 px-2 py-1 text-xs rounded hover:bg-blue-50 transition-colors"
                                      >
                                        {t('edit')}
                                      </button>
                                      <button
                                        onClick={() => handleDelete(item.userRoleId)}
                                        className="text-red-600 hover:text-red-700 px-2 py-1 text-xs rounded hover:bg-red-50 transition-colors"
                                      >
                                        {t('delete')}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="w-full text-sm text-gray-700 ml-0">
                                    {(item.projects && item.projects.length > 0) ? (
                                      <div className="space-y-1">
                                        {item.projects.map((p, pIdx) => {
                                          const expiresAt = item.expiresAt ? new Date(item.expiresAt) : null;
                                          const isUnlimited = !expiresAt;
                                          const daysLeft = isUnlimited ? null : Math.ceil((expiresAt - new Date()) / 86400000);
                                          const badgeClass = isUnlimited
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : daysLeft <= 7
                                              ? "bg-red-100 text-red-800 border-red-200"
                                              : daysLeft <= 30
                                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                : "bg-blue-100 text-blue-800 border-blue-200";
                                          return (
                                            <div
                                              key={pIdx}
                                              className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-50 hover:bg-gray-50"
                                            >
                                              <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-900 truncate">{p.projectName}</div>
                                                {item.assignedAt && (
                                                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <CalendarDays size={12} />
                                                    <span>Atama Tarihi: {new Date(item.assignedAt).toLocaleDateString('tr-TR')}</span>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex-1">
                                                <div className="flex flex-wrap gap-2 justify-start">
                                                  {item.roles.map((r, rIdx) => (
                                                    <span key={rIdx} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                      {r}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                              <div className="flex-shrink-0">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${badgeClass}`}>
                                                  <Clock size={12} />
                                                  {isUnlimited ? 'Süresiz' : new Date(item.expiresAt).toLocaleDateString('tr-TR')}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="px-6 py-4 text-center text-gray-500">
                                        Veri yok
                                      </div>
                                    )}
                                  </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{t('new_access_request')}</h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Kullanıcı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('user_column')}</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">{t('select_user')}</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId} className="text-gray-900">
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* App */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('application')}</label>
                <select
                  value={selectedApp?.appId || ""}
                  onChange={(e) =>
                    setSelectedApp(apps.find((a) => a.appId === parseInt(e.target.value)))
                  }
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">{t('select_application')}</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg flex items-center gap-2 shadow-sm ${saving ? "bg-blue-400 text-white" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  <Save size={16} />
                  {t('save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg border ${
          toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Excel Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className="relative bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('export_to_excel')}</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('select_department')}
              </label>
              <select
                value={selectedDepartmentForExport}
                onChange={(e) => setSelectedDepartmentForExport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all" className="text-gray-900">{t('all_departments')}</option>
                {departmentOptions.map(dep => (
                  <option key={dep} value={dep} className="text-gray-900">{dep}</option>
                ))}
              </select>
              
              <p className="text-sm text-gray-500 mt-2">
                {selectedDepartmentForExport === 'all' 
                  ? `${t('total')} ${filteredRoles.length} ${t('total_access_rights')}`
                  : `${filteredRoles.filter(role => (role.department || '').trim() === selectedDepartmentForExport).length} ${t('total_access_rights')}`
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-200"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleExportToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center shadow-sm"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Yetki Düzenle</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Kullanıcı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı</label>
                <select
                  value={editRole?.userId || ""}
                  onChange={(e) => setEditRole({ ...editRole, userId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">{t('select_user')}</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId} className="text-gray-900">
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Uygulama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uygulama</label>
                <select
                  value={editRole?.appId || ""}
                  onChange={(e) => {
                    const app = apps.find(a => a.appId === parseInt(e.target.value));
                    setEditRole({ ...editRole, appId: app.appId });
                    fetchAppPermissions(app.appName);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-500">{t('select_application')}</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projeler</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol & İzin</label>
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
                      let msg = `Güncelleme başarısız (HTTP ${res.status})`;
                      try {
                        const text = await res.text();
                        msg = text || msg;
                      } catch {}
                      alert(msg);
                      return;
                    }

                    setShowEditModal(false);
                    fetchUserRoles();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm"
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

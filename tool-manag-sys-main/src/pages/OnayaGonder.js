import React, { useEffect, useMemo, useState } from 'react';
import { Search, FileText, Send, X } from 'lucide-react';

const OnayaGonder = () => {

  const API_BASE_URL = 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';
  const LOCAL_API_BASE = `${window.location.origin}/api`;

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    };
  };

  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterApp, setFilterApp] = useState('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Users`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/UserRole`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUserRoles(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/Applications`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchUserRoles(), fetchApplications()]);
      setLoading(false);
    };
    load();
  }, []);

  const appNameById = useMemo(() => {
    const map = new Map();
    applications.forEach(app => {
      map.set(app.appId, app.appName || app.name || app.applicationName);
    });
    return map;
  }, [applications]);

  const departmentOptions = useMemo(() => {
    return Array.from(new Set((users || []).map(u => (u.department || '').trim()).filter(Boolean))).sort();
  }, [users]);

  const locationOptions = useMemo(() => {
    return Array.from(new Set((users || []).map(u => (u.location || '').trim()).filter(Boolean))).sort();
  }, [users]);

  const grouped = useMemo(() => {
    const byUserApp = new Map();
    (userRoles || []).forEach(role => {
      const key = `${role.userId}-${role.appId}`;
      if (!byUserApp.has(key)) {
        const user = (users || []).find(u => u.userId === role.userId) || {};
        byUserApp.set(key, {
          userId: role.userId,
          fullName: user.fullName || user.username || '',
          username: user.username || '',
          email: user.email || '',
          department: user.department || '',
          location: user.location || '',
          status: user.status || '',
          createdAt: user.createdAt || '',
          appId: role.appId,
          appName: role.appName || role.applicationName || appNameById.get(role.appId) || '',
          roles: [],
          projects: [],
        });
      }
      const entry = byUserApp.get(key);
      if (role.roleName && !entry.roles.includes(role.roleName)) {
        entry.roles.push(role.roleName);
      }
      // Projeleri ekle (backend UserRoleController Projects -> { projectId, projectName })
      if (role.projects && Array.isArray(role.projects)) {
        role.projects.forEach(p => {
          const name = p.projectName || p.name || p.ProjectName;
          if (name && !entry.projects.includes(name)) {
            entry.projects.push(name);
          }
        });
      }
    });
    (users || []).forEach(user => {
      const hasEntries = Array.from(byUserApp.keys()).some(k => k.startsWith(`${user.userId}-`));
      if (!hasEntries) {
        const key = `${user.userId}-0`;
        byUserApp.set(key, {
          userId: user.userId,
          fullName: user.fullName || user.username || '',
          username: user.username || '',
          email: user.email || '',
          department: user.department || '',
          location: user.location || '',
          status: user.status || '',
          createdAt: user.createdAt || '',
          appId: 0,
          appName: '',
          roles: [],
          projects: [],
        });
      }
    });
    return Array.from(byUserApp.values());
  }, [userRoles, users, appNameById]);

  const appOptions = useMemo(() => {
    return Array.from(new Set((grouped || []).map(r => (r.appName || '').trim()).filter(Boolean))).sort();
  }, [grouped]);

  const filteredRows = useMemo(() => {
    let rows = [...grouped];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(r =>
        (r.fullName || '').toLowerCase().includes(q) ||
        (r.department || '').toLowerCase().includes(q) ||
        (r.location || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q) ||
        (r.appName || '').toLowerCase().includes(q) ||
        (r.roles.join(', ') || '').toLowerCase().includes(q)
      );
    }
    if (filterDepartment !== 'all') {
      rows = rows.filter(r => (r.department || '').trim() === filterDepartment);
    }
    if (filterLocation !== 'all') {
      rows = rows.filter(r => (r.location || '').trim() === filterLocation);
    }
    if (filterApp !== 'all') {
      rows = rows.filter(r => (r.appName || '').trim() === filterApp);
    }
    return rows;
  }, [grouped, searchTerm, filterDepartment, filterLocation, filterApp]);

  const pendingRows = useMemo(() => {
    return grouped.filter(r => (r.status || '').toLowerCase() === 'pending');
  }, [grouped]);

  const toggleSelect = (key) => {
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const allPendingKeys = useMemo(() => pendingRows.map(r => `${r.userId}-${r.appId}`), [pendingRows]);

  const toggleSelectAll = () => {
    setSelectedKeys(prev => prev.length === allPendingKeys.length ? [] : allPendingKeys);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const postNotify = async (payload) => {
    try {
      const resLocal = await fetch(`${LOCAL_API_BASE}/UserApproval/notify-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resLocal.ok) return resLocal;
    } catch (e) {}
    const resRemote = await fetch(`${API_BASE_URL}/UserApproval/notify-admin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return resRemote;
  };

  const postEmailSend = async (emailDto) => {
    try {
      const res = await fetch(`${API_BASE_URL}/Email/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(emailDto)
      });
      return res;
    } catch (e) {
      throw e;
    }
  };

  const handleSendApproval = async () => {
    setSendError(null);
    if (!isValidEmail(adminEmail)) {
      setSendError('Geçerli bir e-posta giriniz');
      return;
    }
    const selectedRows = pendingRows.filter(r => selectedKeys.includes(`${r.userId}-${r.appId}`));
    if (selectedRows.length === 0) {
      setSendError('Lütfen en az bir pending kullanıcı seçiniz');
      return;
    }
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
            ${selectedRows.map(r => `
              <tr>
                <td style="border:1px solid #ddd;padding:8px">${r.fullName || '-'}</td>
                <td style="border:1px solid #ddd;padding:8px">${r.department || '-'}</td>
                <td style="border:1px solid #ddd;padding:8px">${r.location || '-'}</td>
                <td style="border:1px solid #ddd;padding:8px">${r.appName || '-'}</td>
                <td style="border:1px solid #ddd;padding:8px">${(r.projects && r.projects.length ? r.projects.join(', ') : '-')}</td>
                <td style="border:1px solid #ddd;padding:8px">${(r.roles && r.roles.length ? r.roles.join(', ') : '-')}
                </td>
                <td style="border:1px solid #ddd;padding:8px">
                  <a href="${API_BASE_URL}/UserApproval/approve-simple?userId=${r.userId}&action=approve" style="background:#28a745;color:#fff;padding:6px 10px;text-decoration:none;border-radius:4px;margin-right:6px">Approve</a>
                  <a href="${API_BASE_URL}/UserApproval/approve-simple?userId=${r.userId}&action=reject" style="background:#dc3545;color:#fff;padding:6px 10px;text-decoration:none;border-radius:4px">Reject</a>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;

    const payload = {
      adminEmail,
      adminName: 'Manager',
      approvalBaseUrl: `${API_BASE_URL}/UserApproval`,
      emailSubject,
      emailBodyHtml,
      entries: selectedRows.map(r => ({
        userId: r.userId,
        fullName: r.fullName,
        username: r.username,
        email: r.email,
        department: r.department,
        location: r.location,
        status: r.status,
        createdAt: r.createdAt,
        appId: r.appId,
        appName: r.appName,
        roles: r.roles,
        projects: r.projects,
      }))
    };
    const selectedUsers = Array.from(new Map(selectedRows.map(r => [r.userId, r])).values());
    const multiPayload = {
      adminEmail,
      adminName: 'Manager',
      approvalBaseUrl: `${API_BASE_URL}/UserApproval`,
      users: selectedUsers.map(r => ({
        userId: r.userId,
        fullName: r.fullName || '',
        username: r.username || '',
        email: r.email || '',
        department: r.department || '',
        location: r.location || '',
      }))
    };
    try {
      setSending(true);
      let res = await postEmailSend({
        to: adminEmail,
        subject: emailSubject,
        body: emailBodyHtml,
        isHtml: true
      });
      if (!res.ok) {
        res = await fetch(`${API_BASE_URL}/UserApproval/send-multi-approval`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(multiPayload)
        });
      }
      if (!res.ok) {
        res = await postNotify(payload);
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setShowSendModal(false);
      setAdminEmail('');
      setSelectedKeys([]);
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Onaya Gönder</h1>
        <p className="text-sm text-gray-300">Kullanıcı, departman, lokasyon, uygulama ve erişim yetkisi listesi</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/70" />
            <input
              type="text"
              placeholder="Ara..."
              className="pl-9 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg w-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg w-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          >
            <option value="all" className="bg-gray-800">Tüm Departmanlar</option>
            {departmentOptions.map((dep) => (
              <option key={dep} value={dep} className="bg-gray-800">{dep}</option>
            ))}
          </select>
          <select
            value={filterApp}
            onChange={(e) => setFilterApp(e.target.value)}
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg w-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          >
            <option value="all" className="bg-gray-800">Tüm Uygulamalar</option>
            {appOptions.map((app) => (
              <option key={app} value={app} className="bg-gray-800">{app}</option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Onaya Gönder
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded">{error}</div>
      )}
      {loading ? (
        <div className="p-6 text-gray-300">Yükleniyor...</div>
      ) : (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left text-xs font-semibold text-white/90 uppercase tracking-wider px-4 py-3">Kullanıcı</th>
                <th className="text-left text-xs font-semibold text-white/90 uppercase tracking-wider px-4 py-3">Departman</th>
                <th className="text-left text-xs font-semibold text-white/90 uppercase tracking-wider px-4 py-3">Lokasyon</th>
                <th className="text-left text-xs font-semibold text-white/90 uppercase tracking-wider px-4 py-3">Durum</th>
                <th className="text-left text-xs font-semibold text-white/90 uppercase tracking-wider px-4 py-3">Uygulama</th>
                <th className="text-left text-xs font-semibold text-white/90 uppercase tracking-wider px-4 py-3">Erişim Yetkisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredRows.map((row, idx) => (
                <tr key={`${row.userId}-${row.appId}-${idx}`} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center justify-center w-full gap-1">
                      <div className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">{(row.fullName || '?').substring(0,1).toUpperCase()}</span>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{row.fullName || '-'}</div>
                        <div className="text-xs text-gray-300">ID: {row.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-200">{row.department || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{row.location || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{(row.status || '').toLowerCase() || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{row.appName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-200">{row.roles && row.roles.length > 0 ? row.roles.join(', ') : '-'}</td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-300">
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => { fetchUsers(); fetchUserRoles(); fetchApplications(); }}
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Yenile
        </button>
      </div>

      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-blue-900/20 relative">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-lg font-semibold text-white">Onaya Gönder</h2>
              <button onClick={() => setShowSendModal(false)} className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Yönetici E-posta</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
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
                    {pendingRows.map((r) => {
                      const key = `${r.userId}-${r.appId}`;
                      const checked = selectedKeys.includes(key);
                      return (
                        <tr key={key} className="hover:bg-white/5">
                          <td className="px-3 py-2"><input type="checkbox" checked={checked} onChange={() => toggleSelect(key)} /></td>
                          <td className="px-3 py-2 text-sm text-gray-200">{r.fullName || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-200">{r.department || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-200">{r.location || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-200">{(r.status || '').toLowerCase() || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-200">{r.appName || '-'}</td>
                          <td className="px-3 py-2 text-sm text-gray-200">{r.roles && r.roles.length > 0 ? r.roles.join(', ') : '-'}</td>
                        </tr>
                      );
                    })}
                    {pendingRows.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-3 py-4 text-center text-gray-300">Pending kullanıcı yok</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {sendError && <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-200 rounded">{sendError}</div>}
            </div>
            <div className="p-6 border-t border-white/20 bg-white/5 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSendModal(false)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20">Kapat</button>
              <button type="button" onClick={handleSendApproval} disabled={sending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{sending ? 'Gönderiliyor...' : 'E-posta Gönder'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnayaGonder;
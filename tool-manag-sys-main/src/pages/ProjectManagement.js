import React, { useMemo, useState, useEffect } from "react";
import { FileText, X, Save, ChevronDown, Check, Mail } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

// Basit Çoklu Seçim Bileşeni (AccessManagement'takiyle aynı stil)
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
        className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white hover:bg-gray-50 text-gray-900 flex justify-between items-center"
      >
        <span className="truncate">
          {selectedLabels.length > 0 ? selectedLabels.join(", ") : placeholder}
        </span>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">{t("no_options")}</div>
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
                  <span className="text-sm text-gray-900">{opt.label}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectManagement() {
  const { t } = useLanguage();
  const API_BASE_URL =
    "https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api";

  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [assetPermissions, setAssetPermissions] = useState([]);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedRolePermIds, setSelectedRolePermIds] = useState([]);

  // Onaya gönder kutusu
  const [pmEmail, setPmEmail] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);

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

  useEffect(() => {
    fetchUsers();
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp?.appId) {
      const fetchProjects = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(
            `${API_BASE_URL}/Projects/by-app/${selectedApp.appId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
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
      fetchAppPermissions(selectedApp.appName);
    } else {
      setProjects([]);
      setAssetPermissions([]);
      setSelectedProjectIds([]);
      setSelectedRolePermIds([]);
    }
  }, [selectedApp]);

  const handleSaveRequest = async () => {
    if (!selectedUser || !selectedApp || selectedRolePermIds.length === 0) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      for (const rpId of selectedRolePermIds) {
        const rp = assetPermissions.find(
          (p) => p.rolePermissionId.toString() === rpId
        );
        if (!rp) continue;

        const payload = {
          userId: parseInt(selectedUser),
          roleId: rp.roleId,
          appId: selectedApp.appId,
          projectIds: selectedProjectIds.map((id) => parseInt(id)),
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

        if (!res.ok) throw new Error("UserRole kaydı başarısız");
      }

      alert("Yetki başarıyla kaydedildi!");
      setShowRequestModal(false);
      setSelectedUser("");
      setSelectedApp(null);
      setSelectedProjectIds([]);
      setSelectedRolePermIds([]);
    } catch (err) {
      console.error(err);
      alert("Hata oluştu: " + err.message);
    }
  };

  const sendProjectApprovalNotification = async () => {
    try {
      if (!pmEmail.trim()) {
        alert(t("admin_email_required"));
        return;
      }

      setApprovalLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        adminEmail: pmEmail,
        adminName: "Project Manager",
        approvalBaseUrl: `${window.location.origin}/api/UserApproval`,
        // Bilgi amaçlı içerik
        context: {
          userId: selectedUser ? parseInt(selectedUser) : null,
          appId: selectedApp?.appId || null,
          projectIds: selectedProjectIds.map((id) => parseInt(id)),
          rolePermissionIds: selectedRolePermIds.map((id) => parseInt(id)),
        },
      };

      const res = await fetch(`${API_BASE_URL}/UserApproval/notify-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Onay maili gönderilemedi");
      alert("Onay maili gönderildi!");
      setPmEmail("");
    } catch (err) {
      console.error(err);
      alert("Hata oluştu: " + err.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  const selectedUserObj = users.find((u) => u.userId?.toString() === selectedUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      <div className="px-6 pt-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("project_management_title") || "Proje Yönetimi"}</h1>
        </div>
      </div>

      {/* Onaya Gönder Kutusu */}
      <div className="mx-6 my-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{t("send_to_project_manager") || "Proje yöneticisine onaya gönder"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Kullanıcı */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">{t("select_user")}</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" className="text-gray-900">{t("select_user")}</option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId} className="text-gray-900">
                  {u.fullName || u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Uygulama */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">{t("select_application")}</label>
            <select
              value={selectedApp?.appId || ""}
              onChange={(e) =>
                setSelectedApp(
                  apps.find((a) => a.appId === parseInt(e.target.value)) || null
                )
              }
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" className="text-gray-900">{t("select_application")}</option>
              {apps.map((a) => (
                <option key={a.appId} value={a.appId} className="text-gray-900">
                  {a.appName}
                </option>
              ))}
            </select>
          </div>

          {/* Projeler */}
          {selectedApp && projects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {selectedApp.appName} {t("projects")}
              </label>
              <MultiSelect
                options={projects}
                selected={selectedProjectIds}
                onChange={setSelectedProjectIds}
                placeholder={t("select_items")}
              />
            </div>
          )}

          {/* Roller & İzinler */}
          {selectedApp && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                {selectedApp.appName} {t("permissions") || "Roller & İzinler"}
              </label>
              <MultiSelect
                options={assetPermissions.map((p) => ({
                  label: `${p.roleName} → ${p.permissionName} (${p.permissionType})`,
                  value: p.rolePermissionId.toString(),
                }))}
                selected={selectedRolePermIds}
                onChange={setSelectedRolePermIds}
                placeholder={t("select_role_permission")}
              />
            </div>
          )}
        </div>

        {/* PM Email ve Gönder */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">{t("project_manager_email") || "Proje Yöneticisi E-posta"}</label>
            <input
              type="email"
              value={pmEmail}
              onChange={(e) => setPmEmail(e.target.value)}
              placeholder="manager@company.com"
              className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={sendProjectApprovalNotification}
              disabled={approvalLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
            >
              {approvalLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>
                  {t("send_email")}
                </>
              ) : (
                <>
                  <Mail size={16} /> {t("send_email")}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Özet */}
        <div className="mt-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{t("send_approval_title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-white/70">{t("user_column")}: </span>
                <span className="font-semibold">{selectedUserObj?.fullName || selectedUserObj?.username || t("not_specified")}</span>
              </div>
              <div>
                <span className="text-white/70">{t("application")}: </span>
                <span className="font-semibold">{selectedApp?.appName || t("not_specified")}</span>
              </div>
              <div>
                <span className="text-white/70">{t("projects")}: </span>
                <span className="font-semibold">
                  {selectedProjectIds.length > 0
                    ? selectedProjectIds
                        .map((id) => projects.find((p) => p.value === id)?.label || id)
                        .join(", ")
                    : t("not_specified")}
                </span>
              </div>
              <div>
                <span className="text-white/70">{t("permissions")}: </span>
                <span className="font-semibold">
                  {selectedRolePermIds.length > 0
                    ? selectedRolePermIds
                        .map((id) => assetPermissions.find((p) => p.rolePermissionId.toString() === id))
                        .filter(Boolean)
                        .map((p) => `${p.roleName} → ${p.permissionName}`)
                        .join(", ")
                    : t("not_specified")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yeni Yetki Talep Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border border-blue-900/20 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">{t("new_access_request")}</h3>

            <div className="space-y-4">
              {/* Kullanıcı */}
              <div>
              <label className="block text-sm font-medium text-white mb-2">{t("select_user")}</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-900">{t("select_user")}</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId} className="text-gray-900">
                      {u.fullName || u.username}
                    </option>
                  ))}
                </select>
              </div>

              {/* Uygulama */}
              <div>
              <label className="block text-sm font-medium text-white mb-2">{t("select_application")}</label>
                <select
                  value={selectedApp?.appId || ""}
                  onChange={(e) =>
                    setSelectedApp(
                      apps.find((a) => a.appId === parseInt(e.target.value)) || null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" className="text-gray-900">{t("select_application")}</option>
                  {apps.map((a) => (
                    <option key={a.appId} value={a.appId} className="text-gray-900">
                      {a.appName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Projeler */}
              {selectedApp && projects.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {selectedApp.appName} {t("projects")}
                  </label>
                  <MultiSelect
                    options={projects}
                    selected={selectedProjectIds}
                    onChange={setSelectedProjectIds}
                    placeholder={t("select_items")}
                  />
                </div>
              )}

              {/* Roller & İzinler */}
              {selectedApp && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    {selectedApp.appName} {t("permissions") || "Roller & İzinler"}
                  </label>
                  <MultiSelect
                    options={assetPermissions.map((p) => ({
                      label: `${p.roleName} → ${p.permissionName} (${p.permissionType})`,
                      value: p.rolePermissionId.toString(),
                    }))}
                    selected={selectedRolePermIds}
                    onChange={setSelectedRolePermIds}
                    placeholder={t("select_role_permission")}
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSaveRequest}
                  disabled={!selectedUser || !selectedApp || selectedRolePermIds.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                  <Save size={16} />
                  {t("save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
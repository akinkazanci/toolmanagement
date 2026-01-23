import React, { useState, useEffect } from "react";
import { Save, User, Building, FileText, Settings } from "lucide-react";

export default function YetkiTalep() {
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [projects, setProjects] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const [kisi, setKisi] = useState("");
  const [appId, setAppId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [permissionId, setPermissionId] = useState("");
  const [note, setNote] = useState("");

  // Kullanıcıları çek
  useEffect(() => {
    fetch("https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/Users")
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => console.error("Kullanıcılar alınamadı:", err));
  }, []);

  // Uygulamaları çek
  useEffect(() => {
    fetch("https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/Applications")
      .then((res) => res.json())
      .then(setApps)
      .catch((err) => console.error("Uygulamalar alınamadı:", err));
  }, []);

  // App seçildiğinde projeleri ve izinleri çek
  useEffect(() => {
    if (appId) {
      fetch(`https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/Projects/by-app/${appId}`)
        .then((res) => res.json())
        .then(setProjects)
        .catch((err) => console.error("Projeler alınamadı:", err));

      fetch(`https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/Permission/by-app/${appId}`)
        .then((res) => res.json())
        .then(setPermissions)
        .catch((err) => console.error("İzinler alınamadı:", err));
    } else {
      setProjects([]);
      setPermissions([]);
      setProjectId("");
      setPermissionId("");
    }
  }, [appId]);

  // Kaydet
  const handleSave = () => {
    const payload = {
      userId: parseInt(kisi),
      projectId: parseInt(projectId),
      permissionId: parseInt(permissionId),
      expiresAt: "2025-12-31T23:59:59Z",
    };

    fetch("https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api/UserProjectPermissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Yetki kaydedildi:", data);
        alert("Yetki başarıyla kaydedildi!");
      })
      .catch((err) => {
        console.error("Hata:", err);
        alert("Kayıt sırasında hata oluştu!");
      });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-6 flex items-center">
          <FileText className="mr-2 text-blue-600" /> Yetki Talep Formu
        </h1>

        {/* Kullanıcı Seç */}
        <div className="mb-4">
          <label className="block font-medium">Kullanıcı</label>
          <select
            value={kisi}
            onChange={(e) => setKisi(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Kullanıcı seçiniz</option>
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.fullName} ({u.username})
              </option>
            ))}
          </select>
        </div>

        {/* App Seç */}
        <div className="mb-4">
          <label className="block font-medium">Uygulama</label>
          <select
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Uygulama seçiniz</option>
            {apps.map((a) => (
              <option key={a.appId} value={a.appId}>
                {a.appName}
              </option>
            ))}
          </select>
        </div>

        {/* Proje Seç */}
        {projects.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium">Proje</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Proje seçiniz</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Permission Seç */}
        {permissions.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium">İzin</label>
            <select
              value={permissionId}
              onChange={(e) => setPermissionId(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">İzin seçiniz</option>
              {permissions.map((p) => (
                <option key={p.permissionId} value={p.permissionId}>
                  {p.permissionName} ({p.permissionType})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Açıklama */}
        <div className="mb-4">
          <label className="block font-medium">Açıklama</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        {/* Kaydet */}
        <button
          onClick={handleSave}
          disabled={!kisi || !appId || !projectId || !permissionId}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          <Save className="inline mr-1" size={16} /> Kaydet
        </button>
      </div>
    </div>
  );
}

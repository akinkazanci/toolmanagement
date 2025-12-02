import React, { createContext, useContext, useState, useEffect } from 'react';

// Çeviri dosyaları
const translations = {
  tr: {
    // Navbar
    
    'notifications': 'Bildirimler',
    'view_all_notifications': 'Tüm bildirimleri görüntüle',
    'profile': 'Profil',
    'settings': 'Ayarlar',
    'sign_out': 'Çıkış Yap',
    'administrator': 'Yönetici',
    'user': 'Kullanıcı',
    
    // Sidebar
    'dashboard': 'Ana Panel',
    'user_management': 'Kullanıcı Yönetimi',
    'access_management': 'Erişim Yönetimi',
    'project_management': 'Proje Yönetimi',
    'organization_management': 'Organizasyon Yönetimi',
    'applications': 'Uygulamalar',
    'certificates': 'Sertifikalar',
    'authentications': 'Kimlik Doğrulama',
    'monitoring': 'İzleme',
    'activity': 'Aktivite',
    
    // User Management
    'users': 'Kullanıcılar',
    'add_user': 'Kullanıcı Ekle',
    'search_users': 'Kullanıcı Ara...',
    'all_statuses': 'Tüm Durumlar',
    'active': 'Aktif',
    'inactive': 'İnaktif',
    'pending': 'Beklemede',
    'all_departments': 'Tüm Departmanlar',
    'name': 'İsim',
    'email': 'E-posta',
    'department': 'Departman',
    'status': 'Durum',
    'actions': 'İşlemler',
    'edit': 'Düzenle',
    'delete': 'Sil',
    'view_profile': 'Profili Görüntüle',
    
    // Access Management
    'access_requests': 'Erişim Talepleri',
    'new_request': 'Yeni Talep',
    'application': 'Uygulama',
    'role': 'Rol',
    'requested_by': 'Talep Eden',
    'request_date': 'Talep Tarihi',
    'approve': 'Onayla',
    'reject': 'Reddet',
    
    // Common
    'save': 'Kaydet',
    'cancel': 'İptal',
    'close': 'Kapat',
    'loading': 'Yükleniyor...',
    'no_data': 'Veri bulunamadı',
    'search': 'Ara',
    'filter': 'Filtrele',
    'export': 'Dışa Aktar',
    'import': 'İçe Aktar',
    'refresh': 'Yenile',
    
    // Additional translations
    'user_management_description': 'Sistem kullanıcılarını ve yetkilerini yönetin',
    'pending_approvals': 'Onay Bekleyenler',
    'total': 'Toplam',
    'search_placeholder': 'İsim, e-posta, kullanıcı adı ile arayın...',
    'all_roles': 'Erişim Yetkisi',
    'allStatuses': 'Tüm Durumlar',
    'allDepartments': 'Tüm Departmanlar',
    'allLocations': 'Tüm Lokasyonlar',
    'all_locations': 'Tüm Lokasyonlar',
    'user_column': 'Kullanıcı',
    'access_permission': 'Erişim Yetkisi',
    'location': 'Lokasyon',
    'creation_date': 'Oluşturma Tarihi',
    'no_users_found': 'Kullanıcı bulunamadı',
    'clear_filters': 'Filtreleri Temizle',
    'previous': 'Önceki',
    'next': 'Sonraki',
    'of': 'arası, toplam',
    'results': 'sonuç',
    'no_role_assigned': 'Rol atanmamış',
    'not_specified': 'Belirtilmemiş',
    'edit_user': 'Kullanıcıyı düzenle',
    'delete_user': 'Kullanıcıyı sil',
    'no_users_created': 'Henüz hiç kullanıcı oluşturulmamış. İlk kullanıcınızı oluşturmak için \'Kullanıcı Ekle\' butonuna tıklayın.',
    'adjust_search_criteria': 'Aradığınızı bulmak için arama veya filtre kriterlerinizi ayarlamayı deneyin.',
    'searchPlaceholder': 'İsim, e-posta, kullanıcı adı ile arayın...',
     'accessPermission': 'Erişim Yetkisi',
     'notSpecified': 'Belirtilmemiş',
     'username': 'Kullanıcı Adı',
     'enterUsername': 'Kullanıcı adını girin',
     'selectDepartment': 'Departman Seçin',
     'selectLocation': 'Lokasyon Seçin',
     'total': 'Toplam',
     'usersWillBeExported': 'kullanıcı aktarılacak',
     'userProfile': 'Kullanıcı Profili',
     'creationDate': 'Oluşturma Tarihi',
     'noRoleAssigned': 'Bu kullanıcıya henüz rol atanmamış',
     
     // Access Management Page
    'access_management_title': 'Erişim Yönetimi',
    'project_management_title': 'Proje Yönetimi',
    'new_access_request': 'Yeni Yetki Talep',
    'search_access_placeholder': 'İsim, e-posta, kullanıcı adı, departman, lokasyon ile arayın...',
    'all_departments': 'Tüm Departmanlar',
    'all_locations': 'Tüm Lokasyonlar',
    'roles': 'Roller',
    'assignment_date': 'Atama Tarihi',
    'validity': 'Geçerlilik',
    'unlimited': 'Süresiz',
    'select_user': 'Kullanıcı Seçiniz',
    'select_application': 'Bilgi Varlığı (App) Seçiniz',
    'select_items': 'Öğe seçiniz',
    'select_role_permission': 'Rol & izin seçiniz',
    'export_to_excel': 'Excel\'e Aktar',
    'export_access_rights': 'Erişim Yetkilerini Dışa Aktar',
    'select_department': 'Departman Seçin',
    'total_access_rights': 'erişim yetkisi aktarılacak',
    'no_options': 'Seçenek yok',
    'send_to_project_manager': 'Proje yöneticisine onaya gönder',
    'project_manager_email': 'Proje Yöneticisi E-posta',
    
    // Settings Page
    'settings_title': 'Ayarlar',
    'settings_description': 'Hesabınızı ve sistem ayarlarınızı organizasyonunuz genelinde yönetin',
    'overview': 'Genel Bakış',
    'profile_settings': 'Profil Ayarları',
    'profile_settings_desc': 'Kişisel bilgilerinizi güncelleyin',
    'edit_profile': 'Profili Düzenle →',
    'notifications_settings': 'Bildirimler',
    'notifications_desc': 'Bildirim tercihlerini yapılandırın',
    'manage_notifications': 'Yönet →',
    'application_management': 'Uygulama Yönetimi',
    'application_management_desc': 'Sistem uygulamalarını yönetin',
    'manage_applications': 'Uygulamaları Yönet →',
    'role_management': 'Rol Yönetimi',
    'role_management_desc': 'Kullanıcı rollerini ve atamalarını yönetin',
    'manage_roles': 'Rolleri Yönet →',
    'permission_management': 'İzin Yönetimi',
    'permission_management_desc': 'Sistem izinlerini yapılandırın',
    'manage_permissions': 'İzinleri Yönet →',
    'add_application': 'Uygulama Ekle',
    'add_role': 'Rol Ekle',
    'add_permission': 'İzin Ekle',
    'search_applications': 'Uygulamaları ara...',
    'search_roles': 'Rolleri ara...',
    'search_permissions': 'İzinleri ara...',
    'application_name': 'Uygulama Adı',
    'application_type': 'Tür',
    'description': 'Açıklama',
    'users_count': 'Kullanıcılar',
    'created': 'Oluşturuldu',
    'role_name': 'Rol Adı',
    'permissions': 'İzinler',
    'permission_name': 'İzin Adı',
    'permission_type': 'İzin Türü',
    'edit_application': 'Uygulamayı Düzenle',
    'add_new_application': 'Yeni Uygulama Ekle',
    'edit_role': 'Rolü Düzenle',
    'add_new_role': 'Yeni Rol Ekle',
    'edit_permission': 'İzni Düzenle',
    'add_new_permission': 'Yeni İzin Ekle',
    'save_application': 'Uygulamayı Kaydet',
    'save_role': 'Rolü Kaydet',
    'save_permission': 'İzni Kaydet',
    'enter_application_name': 'Uygulama adını girin',
    'enter_application_description': 'Uygulama açıklamasını girin',
    'enter_permission_description': 'İzin açıklamasını girin',
    'edit_application': 'Uygulamayı Düzenle',
     'delete_application': 'Uygulamayı Sil',
     'edit_role': 'Rolü Düzenle',
     'delete_role': 'Rolü Sil',
     'permission': 'İzin',
     'type': 'Tür',
     'edit_permission': 'İzni Düzenle',
     'delete_permission': 'İzni Sil',

    // Approval / Email
    'send_approval': 'Onaya Gönder',
    'send_approval_title': 'Onaya Gönder',
    'select_users_for_approval': 'Onay için kullanıcı seçin',
    'email_notification_info': 'Yöneticiye e-posta bildirimi gönder',
    'projects': 'Projeler',
     'send_email': 'E-posta Gönder',
      'select_user_type': 'Kullanıcı Tipi Seçimi',
      'select_user_type_desc': 'Yeni kullanıcı eklemek için bir tip seçin.',
      'admin_user': 'Admin Kullanıcı',
      'normal_user': 'Normal Kullanıcı',
       'send_email_notification': 'E-posta Bildirimi Gönder',
       'admin_email_address': 'Yönetici E-posta Adresi',
        'admin_email_required': 'Yönetici e-posta gereklidir',
         'select_at_least_one_user': 'En az bir kullanıcı seçmelisiniz',
         'notification_details': 'Bildirim Detayları',
         'loading_pending_users': 'Onay bekleyen kullanıcılar yükleniyor...',
         'welcome': 'Hoş Geldiniz',
         'please_enter_credentials': 'Lütfen giriş bilgilerinizi giriniz',
         'system_login': 'Sistem Girişi',
         'secure_login_info': 'Hesabınıza güvenli giriş yapın',
         'authorization_management_system': 'Yetkilendirme Yönetim Sistemi',
         'manage_access_rights': 'Erişim Haklarını ve Yetkilendirmeleri Tek Bir Yerden Yönetin',
         'enter_username': 'Kullanıcı adınızı giriniz',
         'password': 'Şifre',
         'enter_password': 'Şifrenizi giriniz',
         'remember_me': 'Beni Hatırla',
         'forgot_password': 'Şifremi Unuttum',
         'login': 'Giriş Yap',
         'logging_in': 'Giriş Yapılıyor...',
         'connection_error': 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
         'login_failed': 'Giriş başarısız. Bilgilerinizi kontrol edin.',
         'token_validation_failed': 'Token doğrulama başarısız. Lütfen tekrar deneyin.'
       },
         
         en: {
    // Navbar
   
    'notifications': 'Notifications',
    'view_all_notifications': 'View all notifications',
    'profile': 'Profile',
    'settings': 'Settings',
    'sign_out': 'Sign out',
    'administrator': 'Administrator',
    'user': 'User',
    
    // Sidebar
    'dashboard': 'Dashboard',
    'user_management': 'User Management',
    'access_management': 'Access Management',
    'project_management': 'Project Management',
    'organization_management': 'Organization Management',
    'applications': 'Applications',
    'certificates': 'Certificates',
    'authentications': 'Authentications',
    'monitoring': 'Monitoring',
    'activity': 'Activity',
    
    // User Management
    'users': 'Users',
    'add_user': 'Add User',
    'search_users': 'Search users...',
    'all_statuses': 'All Statuses',
    'active': 'Active',
    'inactive': 'Inactive',
    'pending': 'Pending',
    'all_departments': 'All Departments',
    'name': 'Name',
    'email': 'Email',
    'department': 'Department',
    'status': 'Status',
    'actions': 'Actions',
    'edit': 'Edit',
    'delete': 'Delete',
    'view_profile': 'View Profile',
    
    // Access Management
    'access_requests': 'Access Requests',
    'new_request': 'New Request',
    'application': 'Application',
    'role': 'Role',
    'requested_by': 'Requested By',
    'request_date': 'Request Date',
    'approve': 'Approve',
    'reject': 'Reject',
    
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'close': 'Close',
    'loading': 'Loading...',
    'no_data': 'No data found',
    'search': 'Search',
    'filter': 'Filter',
    'export': 'Export',
    'import': 'Import',
    'refresh': 'Refresh',
    
    // Additional translations
    'user_management_description': 'Manage system users and their permissions',
    'pending_approvals': 'Pending Approvals',
    'total': 'Total',
    'search_placeholder': 'Search by name, email, username...',
    'all_roles': 'All Roles',
    'allStatuses': 'All Statuses',
    'allDepartments': 'All Departments',
    'allLocations': 'All Locations',
    'all_locations': 'All Locations',
    'user_column': 'User',
    'access_permission': 'Access Permission',
    'location': 'Location',
    'creation_date': 'Creation Date',
    'no_users_found': 'No users found',
    'clear_filters': 'Clear Filters',
    'previous': 'Previous',
    'next': 'Next',
    'of': 'of',
    'results': 'results',
    'no_role_assigned': 'No role assigned',
    'not_specified': 'Not specified',
    'edit_user': 'Edit user',
    'delete_user': 'Delete user',
    'no_users_created': 'No users have been created yet. Click the \'Add User\' button to create your first user.',
    'adjust_search_criteria': 'Try adjusting your search or filter criteria to find what you\'re looking for.',
    'searchPlaceholder': 'Search by name, email, username...',
     'accessPermission': 'Access Permission',
     'notSpecified': 'Not specified',
     'username': 'Username',
     'enterUsername': 'Enter username',
     'selectDepartment': 'Select Department',
     'selectLocation': 'Select Location',
     'total': 'Total',
     'usersWillBeExported': 'users will be exported',
     'userProfile': 'User Profile',
     'creationDate': 'Creation Date',
     'noRoleAssigned': 'No role assigned to this user yet',
     
     // Access Management Page
    'access_management_title': 'Access Management',
    'project_management_title': 'Project Management',
    'new_access_request': 'New Access Request',
    'search_access_placeholder': 'Search by name, email, username, department, location...',
    'all_departments': 'All Departments',
    'all_locations': 'All Locations',
    'roles': 'Roles',
    'assignment_date': 'Assignment Date',
    'validity': 'Validity',
    'unlimited': 'Unlimited',
    'select_user': 'Select User',
    'select_application': 'Select Information Asset (App)',
    'select_items': 'Select items',
    'select_role_permission': 'Select role & permission',
    'export_to_excel': 'Export to Excel',
    'export_access_rights': 'Export Access Rights',
    'select_department': 'Select Department',
    'total_access_rights': 'access rights will be exported',
    'no_options': 'No options',
    'send_to_project_manager': 'Send to Project Manager for Approval',
    'project_manager_email': 'Project Manager Email',
    
    // Settings Page
    'settings_title': 'Settings',
    'settings_description': 'Manage your account and system settings across your organization',
    'overview': 'Overview',
    'profile_settings': 'Profile Settings',
    'profile_settings_desc': 'Update your personal information',
    'edit_profile': 'Edit Profile →',
    'notifications_settings': 'Notifications',
    'notifications_desc': 'Configure notification preferences',
    'manage_notifications': 'Manage →',
    'application_management': 'Application Management',
    'application_management_desc': 'Manage system applications',
    'manage_applications': 'Manage Applications →',
    'role_management': 'Role Management',
    'role_management_desc': 'Manage user roles and assignments',
    'manage_roles': 'Manage Roles →',
    'permission_management': 'Permission Management',
    'permission_management_desc': 'Configure system permissions',
    'manage_permissions': 'Manage Permissions →',
    'add_application': 'Add Application',
    'add_role': 'Add Role',
    'add_permission': 'Add Permission',
    'search_applications': 'Search applications...',
    'search_roles': 'Search roles...',
    'search_permissions': 'Search permissions...',
    'application_name': 'Application Name',
    'application_type': 'Type',
    'description': 'Description',
    'users_count': 'Users',
    'created': 'Created',
    'role_name': 'Role Name',
    'permissions': 'Permissions',
    'permission_name': 'Permission Name',
    'permission_type': 'Permission Type',
    'edit_application': 'Edit Application',
    'add_new_application': 'Add New Application',
    'edit_role': 'Edit Role',
    'add_new_role': 'Add New Role',
    'edit_permission': 'Edit Permission',
    'add_new_permission': 'Add New Permission',
    'save_application': 'Save Application',
    'save_role': 'Save Role',
    'save_permission': 'Save Permission',
    'enter_application_name': 'Enter application name',
    'enter_application_description': 'Enter application description',
    'enter_permission_description': 'Enter permission description',
    'edit_application': 'Edit Application',
     'delete_application': 'Delete Application',
     'edit_role': 'Edit Role',
     'delete_role': 'Delete Role',
     'permission': 'Permission',
     'type': 'Type',
     'edit_permission': 'Edit Permission',
     'delete_permission': 'Delete Permission',

    // Approval / Email
    'send_approval': 'Send Approval',
    'send_approval_title': 'Send Approval',
    'select_users_for_approval': 'Select users for approval',
    'email_notification_info': 'Send email notification to administrator',
    'projects': 'Projects',
     'send_email': 'Send Email',
      'select_user_type': 'Select User Type',
      'select_user_type_desc': 'Choose a type to add a new user.',
      'admin_user': 'Admin User',
      'normal_user': 'Normal User',
      'send_email_notification': 'Send Email Notification',
      'admin_email_address': 'Admin Email Address',
      'admin_email_required': 'Admin email required',
      'select_at_least_one_user': 'You must select at least one user',
      'notification_details': 'Notification Details',
      'loading_pending_users': 'Loading pending users...',
       'welcome': 'Welcome',
       'please_enter_credentials': 'Please enter your login credentials',
       'system_login': 'System Login',
       'secure_login_info': 'Securely login to your account',
       'authorization_management_system': 'Authorization Management System',
       'manage_access_rights': 'Manage Access Rights and Permissions from a Single Location',
       'enter_username': 'Enter your username',
       'password': 'Password',
       'enter_password': 'Enter your password',
       'remember_me': 'Remember Me',
       'forgot_password': 'Forgot Password',
       'login': 'Login',
       'logging_in': 'Logging in...',
       'connection_error': 'Connection error. Please check your internet connection.',
       'login_failed': 'Login failed. Please check your credentials.',
       'token_validation_failed': 'Token validation failed. Please try again.'
       }
     }
 
 // Language Context oluştur
 const LanguageContext = createContext();

// Language Provider bileşeni
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('tr'); // Varsayılan Türkçe

  // LocalStorage'dan dil tercihini yükle
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Dil değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  // Dil değiştirme fonksiyonu
  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  // Çeviri fonksiyonu
  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const value = {
    currentLanguage,
    toggleLanguage,
    t,
    isTurkish: currentLanguage === 'tr',
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;

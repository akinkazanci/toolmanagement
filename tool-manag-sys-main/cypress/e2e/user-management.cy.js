

// --- BAŞTAN ENTEGRE, ÇALIŞAN SÜRÜM ---
const API =
  Cypress.env('apiUrl') ||
  'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

// App bazen tam URL, bazen göreli /api çağırabiliyor; ikisini de yakalamak için yardımcılar:
const rx = (path) => new RegExp(`${API.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}${path}`, 'i');
const rel = (path) => new RegExp(`/api${path}`, 'i');

// Test için admin kullanıcı (guard için güvenli)
const ADMIN_USER = {
  userId: 999,
  username: 'sudenaz',
  email: 'sudenaz@daiichi.com',
  roles: ['Admin', 'UserManagement.Read', 'UserManagement.Write'],
  permissions: ['*'],
  hasAdminRole: true,
  hasUserRole: true,
  organizationId: 10,
  organizationName: 'DAIICHI',
  detailedRoles: [],
};

const forceAuthHeader = () => {
  cy.intercept({ url: /azurewebsites\.net\/api\/.*/i }, (req) => {
    if (!req.headers['authorization']) {
      req.headers['authorization'] = 'Bearer test-admin-token';
    }
    req.continue();
  }).as('allApi');
};

// ---- ANA DESCRIBE ----
describe('Kullanıcı Yönetimi Sayfası', () => {
  beforeEach(() => {
    Cypress.on('uncaught:exception', () => false);
    forceAuthHeader();

    // 1) validate-token: hem tam URL hem göreli path varyasyonları
    [rx('/Auth/validate-token$'), rel('/Auth/validate-token$')].forEach((matcher, i) => {
      cy.intercept('POST', matcher, {
        statusCode: 200,
        body: { success: true, data: ADMIN_USER },
      }).as(`validateOk_${i}`);
    });

    // 2) Liste endpointleri (Users / Role / UserApproval/pending)
    const USERS_FIXTURE = [
      {
        userId: 1,
        username: 'akin.kazanci',
        email: 'akin.kazanci@daitchi.com',
        fullName: 'Akın Kazancı',
        status: 'Active',
        department: 'HUKUK',
        location: 'Gebze',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:45:00Z',
        roles: [{ userRoleId: 1, roleId: 1, roleName: 'Admin' }],
      },
      {
        userId: 2,
        username: 'haydar.doganyilmaz',
        email: 'haydar.doganyilmaz@daitchi.com',
        fullName: 'Ali Haydar Doganyılmaz',
        status: 'Active',
        department: 'PROJE',
        location: 'Ataşehir',
        createdAt: '2024-01-10T09:20:00Z',
        updatedAt: '2024-01-25T16:30:00Z',
        roles: [{ userRoleId: 2, roleId: 2, roleName: 'Administrator' }],
      },
    ];

    [rx('/Users(\\?.*)?$'), rel('/Users(\\?.*)?$')].forEach((m) =>
      cy
        .intercept('GET', m, { statusCode: 200, body: USERS_FIXTURE })
        .as('getUsers'),
    );

    const ROLES_FIXTURE = [
      { roleId: 1, roleName: 'Admin', description: 'System Administrator' },
      { roleId: 2, roleName: 'Administrator', description: 'Application Administrator' },
      { roleId: 3, roleName: 'Manager', description: 'Department Manager' },
      { roleId: 4, roleName: 'User', description: 'Regular User' },
    ];

    [rx('/Role(\\?.*)?$'), rel('/Role(\\?.*)?$')].forEach((m) =>
      cy
        .intercept('GET', m, { statusCode: 200, body: ROLES_FIXTURE })
        .as('getRoles'),
    );

    [rx('/UserApproval/pending(\\?.*)?$'), rel('/UserApproval/pending(\\?.*)?$')].forEach((m) =>
      cy
        .intercept('GET', m, { statusCode: 200, body: [] })
        .as('getPendingUsers'),
    );

    // 3) Sayfaya gitmeden ÖNCE auth seed et
    cy.visit('/user-management', {
      onBeforeLoad(win) {
        const token = 'test-admin-token';
        win.sessionStorage.setItem('authToken', token);
        win.sessionStorage.setItem('userInfo', JSON.stringify(ADMIN_USER));
        win.localStorage.setItem('authToken', token);
        win.localStorage.setItem('userInfo', JSON.stringify(ADMIN_USER));
      },
    });

    cy.wait(['@getUsers', '@getRoles', '@getPendingUsers']);
  });

  // --- Sayfa Yükleme ve Temel Görünüm ---
  describe('Sayfa Yükleme ve Temel Görünüm', () => {
    it('sayfa başlığı ve açıklaması görüntülenir', () => {
      cy.contains(/Kullanıcı Yönetimi|User Management/i).should('be.visible');
      cy.contains(/Sistem kullanıcılarını ve yetkilerini yönetin/i).should('be.visible');
    });

    it('ana butonlar görüntülenir', () => {
      cy.contains('button', 'Dışa Aktar').should('be.visible');
      cy.contains('button', 'Onay Bekleyenler').should('be.visible');
      cy.contains('button', 'Kullanıcı Ekle').should('be.visible');
    });

    it('istatistik kartları doğru verileri gösterir', () => {
      cy.contains('Toplam').parent().should('contain', '2');
      cy.contains('Aktif').parent().should('contain', '2');
      cy.contains('İnaktif').parent().should('contain', '0');
    });
  });

  // --- Kullanıcı Listesi ve Tablo ---
  describe('Kullanıcı Listesi ve Tablo', () => {
    it('kullanıcı tablosu yüklenir ve veriler görüntülenir', () => {
      cy.get('table').should('be.visible');
      cy.get('tbody tr').should('have.length', 2);

      cy.get('tbody tr').first().within(() => {
        cy.contains('Akın Kazancı').should('be.visible');
        cy.contains('akin.kazanci@daitchi.com').should('be.visible');
        cy.contains('@akin.kazanci').should('be.visible');
        cy.contains(/Admin/i).should('be.visible');
        cy.contains('HUKUK').should('be.visible');
        cy.contains('Gebze').should('be.visible');
      });
    });

    it('kullanıcı profili modal açılır', () => {
      cy.get('[title="Profili Görüntüle"]').first().click();
      cy.contains(/Kullanıcı Profili|User Profile/i).should('be.visible');
      cy.contains('Akın Kazancı').should('be.visible');
    });

    it('durum rozetleri doğru renklerde gösterilir', () => {
      cy.get('.bg-emerald-100').should('contain', 'Active');
    });
  });

  // --- Arama ve Filtreleme ---
  describe('Arama ve Filtreleme', () => {
    it('kullanıcı arama işlevi çalışır', () => {
      cy.get('input[placeholder*="İsim"], input[placeholder*="e-posta"]').type('Akın');
      cy.get('tbody tr').should('have.length', 1).and('contain', 'Akın Kazancı');
    });

    it('rol filtresi çalışır', () => {
      cy.get('select').contains('Erişim Yetkisi').parent().select('Admin');
      cy.get('tbody tr').should('have.length', 1).and('contain', 'Admin');
    });

    it('departman filtresi çalışır', () => {
      cy.get('select').contains('Tüm Departmanlar').parent().select('HUKUK');
      cy.get('tbody tr').should('have.length', 1).and('contain', 'HUKUK');
    });

    it('lokasyon filtresi çalışır', () => {
      cy.get('select').contains('Tüm Lokasyonlar').parent().select('Gebze');
      cy.get('tbody tr').should('have.length', 1).and('contain', 'Gebze');
    });

    it('filtreleri temizleme çalışır', () => {
      cy.get('input[placeholder*="İsim"], input[placeholder*="e-posta"]').type('test');
      cy.get('tbody tr').should('have.length', 0);
      cy.contains('button', 'Filtreleri Temizle').click();
      cy.get('tbody tr').should('have.length', 2);
    });
  });

  // --- Kullanıcı Ekleme ---
  describe('Kullanıcı Ekleme', () => {
    beforeEach(() => {
      [rx('/Users$'), rel('/Users$')].forEach((m) =>
        cy
          .intercept('POST', m, { statusCode: 201, body: { message: 'User created successfully' } })
          .as('createUser'),
      );
    });

    it('kullanıcı ekleme modal açılır ve kapatılır', () => {
      cy.contains('button', 'Kullanıcı Ekle').click();
      cy.contains(/Yeni Kullanıcı Ekle|Add New User/i).should('be.visible');
      cy.get('[data-testid="close-modal"], button').contains(/İptal|Cancel/i).click();
      cy.contains(/Yeni Kullanıcı Ekle|Add New User/i).should('not.exist');
    });

    it('yeni kullanıcı formu doldurulur ve kaydedilir', () => {
      cy.contains('button', 'Kullanıcı Ekle').click();
      cy.get('input[placeholder*="Kullanıcı adınızı"]').type('yeni.kullanici');
      cy.get('input[placeholder*="Tam adınızı"]').type('Yeni Kullanıcı');
      cy.get('input[placeholder*="E-posta"]').type('yeni.kullanici@daitchi.com');
      cy.get('input[placeholder*="Şifre"]').type('123456');
      cy.get('select').contains('Departman Seçin').parent().select('İDARİ İŞLER');
      cy.get('select').contains('Lokasyon Seçin').parent().select('Ataşehir');
      cy.get('input[type="checkbox"]').first().check();
      cy.contains('button', /Oluştur|Kaydet|Ekle/i).click();
      cy.wait('@createUser');
      cy.contains(/Yeni Kullanıcı Ekle|Add New User/i).should('not.exist');
    });

    it('zorunlu alanlar boşken hata gösterilir', () => {
      cy.contains('button', 'Kullanıcı Ekle').click();
      cy.contains('button', /Oluştur|Kaydet|Ekle/i).click();
      cy.contains(/Username is required|Kullanıcı adı zorunlu/i).should('be.visible');
    });
  });

  // --- Kullanıcı Düzenleme ---
  describe('Kullanıcı Düzenleme', () => {
    beforeEach(() => {
      [rx('/Users/\\d+$'), rel('/Users/\\d+$')].forEach((m) =>
        cy
          .intercept('PUT', m, { statusCode: 200, body: { message: 'User updated successfully' } })
          .as('updateUser'),
      );
    });

    it('kullanıcı düzenleme modal açılır', () => {
      cy.get('[title="Kullanıcıyı Düzenle"]').first().click();
      cy.contains(/Kullanıcı Düzenle|Edit User/i).should('be.visible');
      cy.get('input[value="akin.kazanci"]').should('exist');
      cy.get('input[value="Akın Kazancı"]').should('exist');
    });

    it('kullanıcı bilgileri güncellenir', () => {
      cy.get('[title="Kullanıcıyı Düzenle"]').first().click();
      cy.get('input[value="Akın Kazancı"]').clear().type('Akın Kazancı Güncellenmiş');
      cy.get('select').contains('HUKUK').parent().select('İDARİ İŞLER');
      cy.contains('button', /Güncelle|Kaydet|Update/i).click();
      cy.wait('@updateUser');
      cy.contains(/Kullanıcı Düzenle|Edit User/i).should('not.exist');
    });
  });

  // --- Kullanıcı Silme ---
  describe('Kullanıcı Silme', () => {
    beforeEach(() => {
      [rx('/Users/\\d+$'), rel('/Users/\\d+$')].forEach((m) =>
        cy
          .intercept('DELETE', m, { statusCode: 200, body: { message: 'User deleted successfully' } })
          .as('deleteUser'),
      );
    });

    it('kullanıcı silme onayı istenir', () => {
      cy.window().then((win) => cy.stub(win, 'confirm').returns(true).as('confirmDelete'));
      cy.get('[title="Kullanıcıyı Sil"]').first().click();
      cy.get('@confirmDelete').should('have.been.called');
      cy.wait('@deleteUser');
    });

    it('silme iptal edilebilir', () => {
      cy.window().then((win) => cy.stub(win, 'confirm').returns(false).as('cancelDelete'));
      cy.get('[title="Kullanıcıyı Sil"]').first().click();
      cy.get('@cancelDelete').should('have.been.called');
      cy.get('@deleteUser').should('not.have.been.called');
    });
  });

  // --- Onay Bekleyen Kullanıcılar ---
  describe('Onay Bekleyen Kullanıcılar', () => {
    beforeEach(() => {
      [rx('/UserApproval/pending(\\?.*)?$'), rel('/UserApproval/pending(\\?.*)?$')].forEach((m) =>
        cy
          .intercept('GET', m, {
            statusCode: 200,
            body: [
              {
                userId: 3,
                username: 'bekleyen.kullanici',
                fullName: 'Bekleyen Kullanıcı',
                email: 'bekleyen@daitchi.com',
                createdAt: '2024-01-25T12:00:00Z',
                approvalToken: 'mock-approval-token',
              },
            ],
          })
          .as('getPendingUsersWithData'),
      );
    });

    it('onay bekleyen kullanıcılar modal açılır', () => {
      cy.wait('@getPendingUsersWithData');
      cy.contains('button', 'Onay Bekleyenler').click();
      cy.contains(/Pending User Approvals|Onay Bekleyen Kullanıcılar/i).should('be.visible');
    });

    it('kullanıcı onaylama işlemi yapılır', () => {
      [rx('/UserApproval/approve.*$'), rel('/UserApproval/approve.*$')].forEach((m) =>
        cy
          .intercept('GET', m, { statusCode: 200, body: { message: 'User approved successfully' } })
          .as('approveUser'),
      );

      cy.wait('@getPendingUsersWithData');
      cy.contains('button', 'Onay Bekleyenler').click();
      cy.window().then((win) => cy.stub(win, 'confirm').returns(true));
      cy.contains('button', /Approve|Onayla/i).click();
      cy.wait('@approveUser');
    });

    it('kullanıcı reddetme işlemi yapılır', () => {
      [rx('/UserApproval/approve.*$'), rel('/UserApproval/approve.*$')].forEach((m) =>
        cy
          .intercept('GET', m, { statusCode: 200, body: { message: 'User rejected successfully' } })
          .as('rejectUser'),
      );

      cy.wait('@getPendingUsersWithData');
      cy.contains('button', 'Onay Bekleyenler').click();
      cy.window().then((win) => {
        cy.stub(win, 'prompt').returns('Test reddetme sebebi');
        cy.stub(win, 'confirm').returns(true);
      });
      cy.contains('button', /Reject|Reddet/i).click();
      cy.wait('@rejectUser');
    });
  });

  // --- Excel Export ---
  describe('Excel Export', () => {
    it('export modal açılır ve kapatılır', () => {
      cy.contains('button', 'Dışa Aktar').click();
      cy.contains(/Excel'e Aktar|Export to Excel/i).should('be.visible');
      cy.get('button').contains(/İptal|Cancel/i).click();
      cy.contains(/Excel'e Aktar|Export to Excel/i).should('not.exist');
    });

    it('departman seçimi ile export yapılır', () => {
      cy.contains('button', 'Dışa Aktar').click();
      cy.get('select').contains('Tüm Departmanlar').parent().select('HUKUK');
      cy.contains('button', /Aktar|Export/i).click();
      cy.contains(/Excel'e Aktar|Export to Excel/i).should('not.exist');
    });
  });

  // --- Email Bildirim ---
  describe('Email Bildirim', () => {
    beforeEach(() => {
      [rx('/UserApproval/notify-admin$'), rel('/UserApproval/notify-admin$')].forEach((m) =>
        cy
          .intercept('POST', m, { statusCode: 200, body: { message: 'Notification sent successfully' } })
          .as('sendNotification'),
      );
    });

    it('email bildirim modal açılır', () => {
      cy.contains('button', 'Onay Bekleyenler').click();
      cy.contains('button', /Send Email|E-posta Gönder/i).click();
      cy.contains(/Send Email Notification|E-posta Bildirimi Gönder/i).should('be.visible');
    });

    it('email gönderimi başarılı olur', () => {
      cy.contains('button', 'Onay Bekleyenler').click();
      cy.contains('button', /Send Email|E-posta Gönder/i).click();
      cy.get('input[type="email"]').type('admin@daitchi.com');
      cy.get('input[placeholder="Administrator"]').clear().type('Test Admin');
      cy.contains('button', /Send Notification|Bildirimi Gönder/i).click();
      cy.wait('@sendNotification');
    });
  });

  // --- Sayfalama (Pagination) ---
  describe('Sayfalama (Pagination)', () => {
    beforeEach(() => {
      const users = Array.from({ length: 15 }, (_, i) => ({
        userId: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@daitchi.com`,
        fullName: `User ${i + 1}`,
        status: 'Active',
        department: 'TEST',
        location: 'Ataşehir',
        createdAt: '2024-01-15T10:30:00Z',
        roles: [{ userRoleId: i + 1, roleId: 1, roleName: 'User' }],
      }));

      [rx('/Users(\\?.*)?$'), rel('/Users(\\?.*)?$')].forEach((m) =>
        cy.intercept('GET', m, { statusCode: 200, body: users }).as('getUsersWithPagination'),
      );
    });

    it('sayfalama kontrolleri görünür', () => {
      cy.wait('@getUsersWithPagination');
      cy.visit('/user-management');
      cy.get('nav').should('contain', 'Previous');
      cy.get('nav').should('contain', 'Next');
      cy.get('nav').should('contain', '1');
      cy.get('nav').should('contain', '2');
    });

    it('sonraki sayfaya geçiş çalışır', () => {
      cy.wait('@getUsersWithPagination');
      cy.visit('/user-management');
      cy.contains('button', 'Next').click();
      cy.get('tbody tr').should('have.length', 5); // sayfa boyutu 5 varsayıldı
    });
  });

  // --- Responsive ---
  describe('Responsive Tasarım', () => {
    it('mobil görünümde düzenli görüntülenir', () => {
      cy.viewport(375, 667);
      cy.get('.overflow-x-auto, table').should('exist');
      cy.get('h1').should('be.visible');
    });

    it('tablet görünümde düzenli görüntülenir', () => {
      cy.viewport(768, 1024);
      cy.get('table').should('be.visible');
      cy.get('.grid').should('exist');
    });
  });

  // --- Hata / Loading / Empty ---
  describe('Hata Durumları', () => {
    it('API hatası durumunda error mesajı gösterilir', () => {
      [rx('/Users(\\?.*)?$'), rel('/Users(\\?.*)?$')].forEach((m) =>
        cy.intercept('GET', m, { statusCode: 500, body: { message: 'Server Error' } }).as('getUsersError'),
      );
      cy.visit('/user-management');
      cy.wait('@getUsersError');
      cy.contains(/Hata|Error/i).should('be.visible');
      cy.contains('Server Error').should('be.visible');
    });

    it('loading durumu gösterilir', () => {
      [rx('/Users(\\?.*)?$'), rel('/Users(\\?.*)?$')].forEach((m) =>
        cy
          .intercept('GET', m, (req) => {
            req.reply((res) => setTimeout(() => res.send([]), 1500));
          })
          .as('getUsersDelay'),
      );
      cy.visit('/user-management');
      cy.contains(/Loading users/i).should('be.visible');
    });

    it('boş veri durumunda uygun mesaj gösterilir', () => {
      [rx('/Users(\\?.*)?$'), rel('/Users(\\?.*)?$')].forEach((m) =>
        cy.intercept('GET', m, { statusCode: 200, body: [] }).as('getUsersEmpty'),
      );
      cy.visit('/user-management');
      cy.wait('@getUsersEmpty');
      cy.contains(/No users found|Kullanıcı bulunamadı/i).should('be.visible');
    });
  });
});

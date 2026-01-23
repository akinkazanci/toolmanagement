describe('Erişim Yönetimi Sayfası', () => {
  beforeEach(() => {

    
    // Hataları görmezden gel
    Cypress.on('uncaught:exception', () => false);
    
    // Mock API responses
    cy.intercept('GET', '**/Users**', {
      statusCode: 200,
      body: [
        {
          "userId": 1,
          "username": "haydar.doganyilmaz",
          "email": "haydar.doganyilmaz@daitchi.com",
          "fullName": "Haydar Doğanyılmaz",
          "department": "PROJE",
          "location": "Ataşehir"
        },
        {
          "userId": 2,
          "username": "unal.aydin",
          "email": "unal.aydin@daitchi.com", 
          "fullName": "Ünal Aydın",
          "department": "KALİTE GÜVENCE",
          "location": "Gebze"
        },
        {
          "userId": 3,
          "username": "eyup.karakus",
          "email": "eyup.karakus@daitchi.com",
          "fullName": "Eyüp Karakuş", 
          "department": "İŞ GELİŞTİRME",
          "location": "Bursa"
        }
      ]
    }).as('getUsers');

    cy.intercept('GET', '**/Applications**', {
      statusCode: 200,
      body: [
        {
          "appId": 1,
          "appName": "Jira",
          "description": "Project Management Tool"
        },
        {
          "appId": 2, 
          "appName": "Sharepoint",
          "description": "Document Management System"
        }
      ]
    }).as('getApps');

    cy.intercept('GET', '**/UserRole**', {
      statusCode: 200,
      body: [
        {
          "userRoleId": 1,
          "userId": 1,
          "roleId": 1,
          "appId": 1,
          "username": "haydar.doganyilmaz",
          "roleName": "Administrator", 
          "appName": "Jira",
          "assignedAt": "2025-09-05T10:30:00Z"
        },
        {
          "userRoleId": 2,
          "userId": 2,
          "roleId": 1, 
          "appId": 1,
          "username": "unal.aydin",
          "roleName": "Administrator",
          "appName": "Jira",
          "assignedAt": "2025-09-05T10:30:00Z"
        },
        {
          "userRoleId": 3,
          "userId": 3,
          "roleId": 2,
          "appId": 2,
          "username": "eyup.karakus", 
          "roleName": "Read",
          "appName": "Sharepoint",
          "assignedAt": "2025-09-11T10:30:00Z"
        },
        {
          "userRoleId": 4,
          "userId": 3,
          "roleId": 3,
          "appId": 2, 
          "username": "eyup.karakus",
          "roleName": "Write",
          "appName": "Sharepoint",
          "assignedAt": "2025-09-11T10:30:00Z"
        }
      ]
    }).as('getUserRoles');

    cy.intercept('GET', '**/RolePermission/by-app-name/**', {
      statusCode: 200,
      body: [
        {
          "rolePermissionId": 1,
          "roleId": 1,
          "roleName": "Administrator",
          "permissionName": "Full Access",
          "permissionType": "READ_WRITE"
        }
      ]
    }).as('getRolePermissions');

    // Token ekle
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'test-token');
    });

    cy.visit('/access-management');
  });

  describe('Sayfa Yükleme ve Temel Görünüm', () => {
    it('sayfa başlığı görüntülenir', () => {
      cy.contains('Erişim Yönetimi', { timeout: 10000 }).should('be.visible');
    });

    it('ana butonlar görüntülenir', () => {
      cy.contains('button', 'Excel\'e Aktar').should('be.visible');
      cy.contains('button', 'Yeni Yetki Talep').should('be.visible');
    });

    it('filtreleme bölümü görüntülenir', () => {
      cy.get('input[placeholder*="İsim, e-posta"]').should('be.visible');
      cy.contains('Tüm Departmanlar').should('be.visible');
      cy.contains('Tüm Lokasyonlar').should('be.visible');
    });
  });

  describe('Erişim Tablosu', () => {
    it('tablo yüklenir ve veriler görüntülenir', () => {
      cy.get('table').should('be.visible');
      cy.get('tbody tr').should('have.length.at.least', 3);
      
      // İlk kullanıcı verilerini kontrol et
      cy.contains('haydar.doganyilmaz').should('be.visible');
      cy.contains('PROJE').should('be.visible');
      cy.contains('Jira').should('be.visible');
      cy.contains('Administrator').should('be.visible');
    });

    it('tablo kolonları doğru başlıklara sahip', () => {
      cy.get('thead th').should('contain', 'KULLANICI');
      cy.get('thead th').should('contain', 'DEPARTMAN');
      cy.get('thead th').should('contain', 'UYGULAMA');
      cy.get('thead th').should('contain', 'ROLLER');
      cy.get('thead th').should('contain', 'ATAMA TARİHİ');
    });

    it('kullanıcı avatarları görünür', () => {
      cy.get('.bg-gradient-to-br').should('have.length.at.least', 3);
      cy.contains('HA').should('be.visible'); // Haydar Doğanyılmaz
      cy.contains('UN').should('be.visible'); // Ünal Aydın
      cy.contains('EY').should('be.visible'); // Eyüp Karakuş
    });

    it('rol badge\'leri doğru görünür', () => {
      cy.get('.bg-purple-100\\/10').should('contain', 'Administrator');
      cy.get('.bg-purple-100\\/10').should('contain', 'Read');
      cy.get('.bg-purple-100\\/10').should('contain', 'Write');
    });
  });

  describe('Filtreleme İşlevleri', () => {
    it('kullanıcı arama çalışır', () => {
      cy.get('input[placeholder*="İsim, e-posta"]').type('haydar');
      cy.get('tbody tr').should('have.length', 1);
      cy.contains('haydar.doganyilmaz').should('be.visible');
    });

    it('departman filtresi çalışır', () => {
      cy.get('select').contains('Tüm Departmanlar').parent().select('PROJE');
      cy.get('tbody tr').should('have.length', 1);
      cy.contains('PROJE').should('be.visible');
    });

    it('lokasyon filtresi çalışır', () => {
      cy.get('select').contains('Tüm Lokasyonlar').parent().select('Gebze');
      cy.get('tbody tr').should('have.length', 1);
      cy.contains('unal.aydin').should('be.visible');
    });

    it('çoklu filtre birlikte çalışır', () => {
      cy.get('input[placeholder*="İsim, e-posta"]').type('eyup');
      cy.get('select').contains('Tüm Departmanlar').parent().select('İŞ GELİŞTİRME');
      cy.get('tbody tr').should('have.length', 2); // Eyüp'ün 2 farklı uygulamada yetkisi var
    });
  });

  describe('Yeni Yetki Talep Modal', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/UserRole**', {
        statusCode: 201,
        body: { message: 'Access granted successfully' }
      }).as('createUserRole');
    });

    it('modal açılır ve kapanır', () => {
      cy.contains('button', 'Yeni Yetki Talep').click();
      cy.contains('Yeni Yetki Talebi').should('be.visible');
      
      // X butonuyla kapat
      cy.get('button').contains('X').click();
      cy.contains('Yeni Yetki Talebi').should('not.exist');
    });

    it('form elemanları görünür', () => {
      cy.contains('button', 'Yeni Yetki Talep').click();
      
      cy.contains('Kullanıcı').should('be.visible');
      cy.contains('Uygulama').should('be.visible');
      cy.get('select').should('have.length.at.least', 2);
    });

    it('kullanıcı seçimi çalışır', () => {
      cy.contains('button', 'Yeni Yetki Talep').click();
      
      cy.get('select').first().select('Haydar Doğanyılmaz');
      cy.get('select').first().should('have.value', '1');
    });

    it('uygulama seçimi çalışır', () => {
      cy.contains('button', 'Yeni Yetki Talep').click();
      
      cy.get('select').eq(1).select('Jira');
      cy.contains('Jira Roller & İzinler').should('be.visible');
    });
  });

  describe('İşlem Butonları', () => {
    it('düzenle butonu çalışır', () => {
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('editAlert');
      });
      
      cy.contains('button', 'Düzenle').first().click();
      cy.get('@editAlert').should('have.been.called');
    });

    it('sil butonu onay ister', () => {
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true).as('confirmDelete');
      });
      
      cy.intercept('DELETE', '**/UserRole/**', {
        statusCode: 200,
        body: { message: 'Deleted successfully' }
      }).as('deleteUserRole');
      
      cy.contains('button', 'Sil').first().click();
      cy.get('@confirmDelete').should('have.been.called');
    });
  });

  describe('Excel Export İşlevi', () => {
    it('export modal açılır', () => {
      cy.contains('button', 'Excel\'e Aktar').click();
      cy.contains('Excel\'e Aktar').should('be.visible');
    });

    it('departman seçimi ile export', () => {
      cy.contains('button', 'Excel\'e Aktar').click();
      
      cy.get('select').select('PROJE');
      cy.contains('1 toplam erişim hakkı').should('be.visible');
      
      cy.contains('button', 'Aktar').click();
      cy.contains('Excel\'e Aktar').should('not.exist');
    });

    it('tüm departmanlar export', () => {
      cy.contains('button', 'Excel\'e Aktar').click();
      
      cy.contains('button', 'Aktar').click();
      cy.contains('Excel\'e Aktar').should('not.exist');
    });
  });

  describe('MultiSelect Bileşeni', () => {
    beforeEach(() => {
      cy.contains('button', 'Yeni Yetki Talep').click();
      cy.get('select').eq(1).select('Jira'); // Uygulama seç
    });

    it('çoklu seçim dropdown açılır', () => {
      cy.get('.relative button').contains('Seçiniz').click();
      cy.get('.absolute').should('be.visible');
    });

    it('seçim yapılabilir', () => {
      cy.get('.relative button').contains('Seçiniz').click();
      cy.get('.cursor-pointer').first().click();
      cy.get('.relative button').should('not.contain', 'Seçiniz');
    });
  });

  describe('Responsive Tasarım', () => {
    it('mobil görünümde çalışır', () => {
      cy.viewport(375, 667);
      cy.get('.overflow-x-auto').should('exist');
      cy.contains('Erişim Yönetimi').should('be.visible');
    });

    it('tablet görünümde çalışır', () => {
      cy.viewport(768, 1024);
      cy.get('table').should('be.visible');
      cy.get('.flex-wrap').should('exist');
    });
  });

  describe('Hata Durumları', () => {
    it('API hatası durumunda sayfa çalışır', () => {
      cy.intercept('GET', '**/UserRole**', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getUserRolesError');
      
      cy.visit('/access-management');
      cy.get('body').should('be.visible');
    });

    it('boş veri durumu', () => {
      cy.intercept('GET', '**/UserRole**', {
        statusCode: 200,
        body: []
      }).as('getEmptyUserRoles');
      
      cy.visit('/access-management');
      cy.get('table').should('be.visible');
      cy.get('tbody tr').should('have.length', 0);
    });
  });

  describe('Loading ve Performance', () => {
    it('sayfa hızlı yüklenir', () => {
      const start = Date.now();
      cy.visit('/access-management');
      cy.contains('Erişim Yönetimi').should('be.visible');
      cy.then(() => {
        const loadTime = Date.now() - start;
        expect(loadTime).to.be.lessThan(5000); // 5 saniyeden az
      });
    });

    it('büyük veri seti ile çalışır', () => {
      // 100 kullanıcı ile test
      const largeUserRoles = Array.from({length: 100}, (_, i) => ({
        userRoleId: i + 1,
        userId: (i % 10) + 1,
        roleId: 1,
        appId: 1,
        username: `user${i + 1}`,
        roleName: 'Administrator',
        appName: 'Jira',
        assignedAt: '2025-09-05T10:30:00Z'
      }));
      
      cy.intercept('GET', '**/UserRole**', {
        statusCode: 200,
        body: largeUserRoles
      }).as('getLargeUserRoles');
      
      cy.visit('/access-management');
      cy.get('tbody tr').should('have.length', 100);
    });
  });
});
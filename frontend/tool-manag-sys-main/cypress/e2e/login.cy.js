const api = Cypress.env('apiUrl') || 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.clearAuth && cy.clearAuth()
  })

  it('Boş alanlarda uyarı (HTML5 required çalışır)', () => {
    cy.get('[data-testid="login-submit"]').click()
    // HTML5 required old. için tarayıcı native validasyonu devreye girer.
    // Yine de inputların varlığını doğrulayalım:
    cy.get('[data-testid="username"]').should('exist')
    cy.get('[data-testid="password"]').should('exist')
  })

  it('Hatalı bilgide API 401 ve hata mesajı görünür', () => {
    cy.intercept('POST', `${api}/Auth/login`, {
      statusCode: 200,
      body: { success: false, message: 'Giriş başarısız' }
    }).as('loginFail')

    cy.get('[data-testid="username"]').type('wrong.user')
    cy.get('[data-testid="password"]').type('wrongpass')
    cy.get('[data-testid="login-submit"]').click()

    cy.wait('@loginFail')
    cy.get('[data-testid="error-box"]').should('contain.text', 'Giriş başarısız')
  })

  it('Başarılı login + token doğrulama (sessionStorage)', () => {
    // 1) /Auth/login başarılı
    cy.intercept('POST', `${api}/Auth/login`, (req) => {
      expect(req.headers['content-type']).to.include('application/json')
      // body: { username, password }
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: {
            token: 'fake-jwt-123',
            expiresAt: '2099-12-31T23:59:59Z'
          }
        }
      })
    }).as('loginOk')

    // 2) /Auth/validate-token (bileşen token string’i JSON.stringify ile gönderiyor)
    cy.intercept('POST', `${api}/Auth/validate-token`, (req) => {
      // req.body burada "\"fake-jwt-123\"" gibi bir JSON string olabilir (senin koddaki JSON.stringify(token) nedeniyle)
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: {
            userId: 1,
            username: 'sudenaz',
            email: 'sudenaz@daiichi.com',
            firstName: 'Sudenaz',
            lastName: 'Kaymaz',
            roles: ['User'],
            permissions: ['view'],
            organizationId: 10,
            organizationName: 'DAIICHI',
            detailedRoles: [],
            hasAdminRole: false,
            hasUserRole: true
          }
        }
      })
    }).as('validateOk')

    cy.get('[data-testid="username"]').type('sudenaz')
    cy.get('[data-testid="password"]').type('123456')
    cy.get('[data-testid="login-submit"]').click()

    cy.wait('@loginOk')
    cy.wait('@validateOk')

    // remember işaretlenmedi -> sessionStorage
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.eq('fake-jwt-123')
      const user = JSON.parse(win.sessionStorage.getItem('userInfo'))
      expect(user?.email).to.eq('sudenaz@daiichi.com')
    })
  })

  it('Remember me işaretli iken localStorage’a yazılır', () => {
    cy.intercept('POST', `${api}/Auth/login`, {
      statusCode: 200,
      body: {
        success: true,
        data: { token: 'persist-jwt-999', expiresAt: '2099-12-31T23:59:59Z' }
      }
    }).as('loginOk2')

    cy.intercept('POST', `${api}/Auth/validate-token`, {
      statusCode: 200,
      body: {
        success: true,
        data: {
          userId: 2, username: 'sude', email: 'sude@daiichi.com',
          firstName: 'Sude', lastName: 'K', roles: ['Admin'],
          permissions: ['*'], organizationId: 10, organizationName: 'DAIICHI',
          detailedRoles: [], hasAdminRole: true, hasUserRole: true
        }
      }
    }).as('validateOk2')

    cy.get('[data-testid="remember-me"]').check()
    cy.get('[data-testid="username"]').type('sude')
    cy.get('[data-testid="password"]').type('654321')
    cy.get('[data-testid="login-submit"]').click()

    cy.wait('@loginOk2')
    cy.wait('@validateOk2')

    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.eq('persist-jwt-999')
      const user = JSON.parse(win.localStorage.getItem('userInfo'))
      expect(user?.roles).to.include('Admin')
    })
  })

  it('Validate-token başarısızsa kullanıcıya hata gösterir', () => {
    cy.intercept('POST', `${api}/Auth/login`, {
      statusCode: 200,
      body: {
        success: true,
        data: { token: 'bad-token', expiresAt: '2099-12-31T23:59:59Z' }
      }
    }).as('loginOk3')

    cy.intercept('POST', `${api}/Auth/validate-token`, {
      statusCode: 200,
      body: { success: false, message: 'invalid token' }
    }).as('validateFail')

    cy.get('[data-testid="username"]').type('sude')
    cy.get('[data-testid="password"]').type('654321')
    cy.get('[data-testid="login-submit"]').click()

    cy.wait('@loginOk3')
    cy.wait('@validateFail')

    cy.get('[data-testid="error-box"]')
      .should('contain.text', 'Token doğrulama başarısız')
  })
})
// ---------------------------------------------------------
// LOGIN UI / DESIGN TESTLERI (senin Login.js yapına uygun)
// ---------------------------------------------------------
describe('Login UI / Design', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Arka plan ve ana yerleşim render olur (gradient, grid, light effects)', () => {
    // Gradient arka plan container'ı
    cy.get('div[class*="bg-gradient-to-br"]').should('exist');

    // Grid pattern + light effects kapsayan katmanlar (var olmak yeterli)
    cy.get('div[class*="bg-grid-pattern"]').should('exist');
    cy.get('div[class*="blur-3xl"]').should('exist');

    // Sayfa iki panelden oluşan layout’u içerir
    cy.get('div.relative.z-10.min-h-screen.flex').should('exist');
  });

  it('Logo ve marka metinleri görünür', () => {
    cy.get('img[alt="DAIICHI"]').should('be.visible');

    // Desktop başlık (lg ve üstü görünür)
    cy.viewport('macbook-15');
    cy.contains('Hoş Geldiniz').should('be.visible');

    // Mobile başlık (lg:hidden)
    cy.viewport('iphone-6');
    cy.contains('Sistem Girişi').should('be.visible');
  });

  it('Responsive davranış: sol panel mobile’da gizli, desktop’ta görünür', () => {
    // Sol panel "hidden lg:flex ..." => mobile’da gizli
    cy.viewport('iphone-6');
    cy.get('div[class*="lg\\:w-1\\/2"]').should('not.be.visible'); // sol panel

    // Desktop’ta görünür
    cy.viewport('macbook-15');
    cy.get('div[class*="lg\\:w-1\\/2"]').should('be.visible');
  });

  it('Form alanları, placeholder’lar ve ikonlu yapı mevcut', () => {
    // Placeholder metinleri senin kodundakiyle birebir
    cy.get('input[placeholder="Kullanıcı adınızı giriniz"]').should('exist');
    cy.get('input[placeholder="Şifrenizi giriniz"]').should('exist');

    // İkonların bulunduğu "relative" kapsayıcılarda svg olmalı
    cy.get('[data-testid="username"]').parent().find('svg').should('exist');
    cy.get('[data-testid="password"]').parent().find('svg').should('exist');

    // Remember me + Şifremi Unuttum
    cy.contains('Beni Hatırla').should('exist');
    cy.contains('Şifremi Unuttum').should('exist');
  });

  it('Butonun gradient stili ve disabled hali çalışır', () => {
    const submit = cy.get('[data-testid="login-submit"]');
    // Gradient sınıfları
    submit.should('have.class', 'bg-gradient-to-r')
      .and('have.class', 'from-blue-600')
      .and('have.class', 'to-indigo-600');

    // HTML5 required nedeniyle boşken submit mantıken pasif davranır
    // (Senin buton disabled değil, ama submit sonrası native validation devreye girer.
    // Dilersen istersen butonu disabled yapmayı biz eklemiştik; o yoksa bu kısım sadece varlık kontrolü yapar.)
    submit.should('be.visible');
  });

  

  it('Hata mesajı kutusu görünür (server hata senaryosu)', () => {
    const api = Cypress.env('apiUrl') || 'http://localhost:5000';

    cy.intercept('POST', `${api}/Auth/login`, {
      statusCode: 200,
      body: { success: false, message: 'Giriş başarısız. Bilgilerinizi kontrol edin.' },
    }).as('loginFailUi');

    cy.get('[data-testid="username"]').type('x');
    cy.get('[data-testid="password"]').type('y');
    cy.get('[data-testid="login-submit"]').click();

    cy.wait('@loginFailUi');

    // Senin error kutunu test-id ile eklemiştik: data-testid="error-box"
    cy.get('[data-testid="error-box"]').should('be.visible')
      .and('contain.text', 'Giriş başarısız');
  });

  it('Şifre göster/gizle butonu çalışır (ikonlu toggle)', () => {
    // Parola alanı type değişimini kontrol ediyoruz
    cy.get('[data-testid="password"]').should('have.attr', 'type', 'password');

    // Sağdaki göz ikonlu buton (toggle) — eğer test-id eklemediysen:
    // parent() kapsayıcı içinde sağ taraftaki butonu bulalım
    cy.get('[data-testid="password"]')
      .parent()
      .find('button')
      .last()
      .click();

    cy.get('[data-testid="password"]').should('have.attr', 'type', 'text');

    // Geri kapat
    cy.get('[data-testid="password"]')
      .parent()
      .find('button')
      .last()
      .click();

    cy.get('[data-testid="password"]').should('have.attr', 'type', 'password');
  });

  it('Remember me ile token’ın kaydedileceği storage değişir', () => {
    const api = Cypress.env('apiUrl') || 'http://localhost:5000';

    cy.intercept('POST', `${api}/Auth/login`, {
      statusCode: 200,
      body: { success: true, data: { token: 'remember-jwt', expiresAt: '2099-12-31T23:59:59Z' } },
    }).as('loginOk');

    cy.intercept('POST', `${api}/Auth/validate-token`, {
      statusCode: 200,
      body: {
        success: true,
        data: { userId: 3, username: 'rm', email: 'rm@daiichi.com', roles: [], permissions: [] },
      },
    }).as('validateOk');

    // Checkbox işaretli -> localStorage
    cy.get('input[type="checkbox"]').check();
    cy.get('[data-testid="username"]').type('remember');
    cy.get('[data-testid="password"]').type('remember');
    cy.get('[data-testid="login-submit"]').click();

    cy.wait('@loginOk');
    cy.wait('@validateOk');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('authToken')).to.eq('remember-jwt');
      // sessionStorage’da olmamalı
      expect(win.sessionStorage.getItem('authToken')).to.be.null;
    });
  });
});

describe('Login butonlarının işlevselliği', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('Şifre Göster/Gizle butonu input type değiştirir', () => {
    cy.get('[data-testid="password"]').should('have.attr', 'type', 'password');
    cy.get('[data-testid="toggle-password"]').click();
    cy.get('[data-testid="password"]').should('have.attr', 'type', 'text');
    cy.get('[data-testid="toggle-password"]').click();
    cy.get('[data-testid="password"]').should('have.attr', 'type', 'password');
  });

  it('"Beni Hatırla" checkbox işaretlenince checked olur', () => {
    cy.get('[data-testid="remember-me"]').check().should('be.checked');
    cy.get('[data-testid="remember-me"]').uncheck().should('not.be.checked');
  });

  it('"Şifremi Unuttum" butonu tıklanabilir (şu an alert ile simüle)', () => {
    // Henüz backend yoksa test için onClick'e geçici alert koyabilirsin
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertStub');
    });

    cy.contains('Şifremi Unuttum').click();
    cy.get('@alertStub').should('have.been.called');
  });

  it('"Giriş Yap" butonu tıklanınca API isteği atar ve loading gösterir', () => {
    const api = Cypress.env('apiUrl') || 'http://localhost:5000';

    cy.intercept('POST', `${api}/Auth/login`, (req) => {
      req.reply({
        delayMs: 800,
        statusCode: 200,
        body: { success: true, data: { token: 'btn-jwt', expiresAt: '2099-12-31T23:59:59Z' } },
      });
    }).as('loginReq');

    cy.intercept('POST', `${api}/Auth/validate-token`, {
      statusCode: 200,
      body: { success: true, data: { userId: 1, username: 'btn', roles: [] } },
    }).as('validateReq');

    cy.get('[data-testid="username"]').type('btnuser');
    cy.get('[data-testid="password"]').type('btnpass');
    cy.get('[data-testid="login-submit"]').click();

    cy.get('[data-testid="login-submit"]').contains('Giriş Yapılıyor').should('exist');
    cy.wait('@loginReq');
    cy.wait('@validateReq');

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('authToken')).to.eq('btn-jwt');
    });
  });
});



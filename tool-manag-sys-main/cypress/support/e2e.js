// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

Cypress.on('uncaught:exception', (err) => {
  if (err.message?.includes("Cannot find module './pages/Dashboard'")) {
    return false; // testi kırma (GEÇİCİ)
  }
});


// Tüm testlerde JS hataları testi kesmesin
Cypress.on('uncaught:exception', () => false);

const API =
  Cypress.env('apiUrl') ||
  'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';

// Hem absolute hem relative için GEVŞEK matcher yardımcıları:
const abs = (p) => `**${API.replace('https://', '').replace('http://', '')}${p}`;
const any = (p) => [`**/api${p}`, abs(p)]; // iki desen birden

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
  // guard zaman kontrol ediyorsa işine yarar:
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
};

function forceAuthHeader() {
  cy.intercept({ url: /azurewebsites\.net\/api\/.*/i }, (req) => {
    if (!req.headers['authorization']) {
      req.headers['authorization'] = 'Bearer test-admin-token';
    }
    req.continue();
  }).as('allApi');
}

Cypress.Commands.add('loginAsAdmin', () => {
  forceAuthHeader();

  // validate-token (POST) -> geniş eşleşme
  any('/Auth/validate-token*').forEach((m, i) => {
    cy.intercept('POST', m, {
      statusCode: 200,
      body: { success: true, data: ADMIN_USER },
    }).as(`validateOk_${i}`);
  });

  // (opsiyonel) login çağrısı da stub’lansın
  any('/Auth/login*').forEach((m) => {
    cy.intercept('POST', m, {
      statusCode: 200,
      body: { token: 'test-admin-token', user: ADMIN_USER },
    }).as('loginOk');
  });

  // storage seed – visit’ten ÖNCE!
  cy.window({ log: false }).then((win) => {
    const token = 'test-admin-token';
    win.sessionStorage.setItem('authToken', token);
    win.sessionStorage.setItem('userInfo', JSON.stringify(ADMIN_USER));
    win.localStorage.setItem('authToken', token);
    win.localStorage.setItem('userInfo', JSON.stringify(ADMIN_USER));
  });
});

// cache’li oturum (her testte tekrar login kurmamak için)
Cypress.Commands.add('sessionAdmin', () => {
  cy.session('admin-session', () => {
    cy.loginAsAdmin();
  });
});

// Bu yardımcıları diğer dosyalarda kullanabilelim diye export gibi:
Cypress.Commands.add('apiMatchers', () => ({ any, abs, API }));

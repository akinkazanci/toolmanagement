// API ÜZERİNDEN HIZLI LOGIN (UI'ye girmeden)
Cypress.Commands.add('loginByApi', ({ email, password }) => {
  const apiUrl = Cypress.env('apiUrl')
  const tokenKey = Cypress.env('tokenKey')
  const userKey = Cypress.env('userKey')
  const storage = Cypress.env('tokenStorage') === 'sessionStorage' ? 'sessionStorage' : 'localStorage'

  return cy.request('POST', `${apiUrl}/auth/login`, { email, password }).then((res) => {
    const { token, user } = res.body
    cy.window().then((win) => {
      win[storage].setItem(tokenKey, token)
      if (user) win[storage].setItem(userKey, JSON.stringify(user))
    })
  })
})

// UI ÜZERİNDEN LOGIN (form doldurup butona basar)
Cypress.Commands.add('loginByUI', ({ email, password }) => {
  cy.visit('/login')
  cy.get('[data-testid="email"]').clear().type(email)
  cy.get('[data-testid="password"]').clear().type(password)
  cy.get('[data-testid="login-submit"]').click()
})

// ÇIKIŞ (token temizler)
Cypress.Commands.add('logout', () => {
  const tokenKey = Cypress.env('tokenKey')
  const userKey = Cypress.env('userKey')
  const storage = Cypress.env('tokenStorage') === 'sessionStorage' ? 'sessionStorage' : 'localStorage'
  cy.window().then((win) => {
    win[storage].removeItem(tokenKey)
    win[storage].removeItem(userKey)
  })


Cypress.Commands.add('setAuth', ({ token, user, remember }) => {
  const tokenKey = Cypress.env('tokenKey')
  const userKey = Cypress.env('userKey')

  cy.window().then((win) => {
    const storage = remember ? win.localStorage : win.sessionStorage
    storage.setItem(tokenKey, token)
    if (user) storage.setItem(userKey, JSON.stringify(user))
  })
})

Cypress.Commands.add('clearAuth', () => {
  const tokenKey = Cypress.env('tokenKey')
  const userKey = Cypress.env('userKey')

  cy.window().then((win) => {
    win.localStorage.removeItem(tokenKey)
    win.localStorage.removeItem(userKey)
    win.sessionStorage.removeItem(tokenKey)
    win.sessionStorage.removeItem(userKey)
  })
})

})

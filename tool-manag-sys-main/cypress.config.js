const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // React dev URL’in
    video: false,
    setupNodeEvents(on, config) {
      // event/plug-in gerekirse
    },
  },
  env: {

    apiUrl: 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api', // örnek
    tokenKey: 'authToken',
    userKey: 'userInfo'
  },
})

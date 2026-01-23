// src/config.js
const getApiUrl = () => {
  // 1. Environment variable varsa onu kullan
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // 2. Production'da aynı domain'i kullan (Azure App Service)
  if (process.env.NODE_ENV === 'production') {
    return `${window.location.origin}/api`;
  }
  
  // 3. Fallback (development)
  return 'https://supplierportalapi-f7g7dya7cjd9hnfm.germanywestcentral-01.azurewebsites.net/api';
};

export const API_BASE_URL = getApiUrl();

// Debug için (sadece development'ta)
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL:', API_BASE_URL);
}

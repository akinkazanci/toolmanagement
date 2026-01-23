import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import daiichiFavicon from './assets/daiichi-favicon.png';

const root = ReactDOM.createRoot(document.getElementById('root'));

const faviconLink = document.querySelector("link[rel='icon']");
if (faviconLink) {
  faviconLink.href = daiichiFavicon;
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

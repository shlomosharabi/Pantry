import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// vite-plugin-pwa injects the SW registration automatically
// via registerType: 'autoUpdate' in vite.config.js

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

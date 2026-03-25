import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 👈 THÊM
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>   {/* 👈 QUAN TRỌNG */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)
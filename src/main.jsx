import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
// Font Samudra (Plus Jakarta Sans) dibundel bersama aplikasi, jadi ikut
// tersimpan oleh service worker dan tetap tampil saat offline.
import '@fontsource-variable/plus-jakarta-sans'
import './styles/tokens.css'
import './styles/app.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast.jsx'
import { mulaiPWA } from './hooks/usePWA.js'
import { queryClient } from './lib/queryClient.js'

// Daftarkan service worker & tangkap event install sedini mungkin.
mulaiPWA()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
)

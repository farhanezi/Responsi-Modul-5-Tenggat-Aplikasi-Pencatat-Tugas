import { useEffect, useState } from 'react'

// Tema tampilan: 'sistem' (ikut pengaturan HP/laptop), 'light', atau 'dark'.
// Nilai yang sama dibaca skrip kecil di index.html agar tidak berkedip saat dibuka.
const KEY = 'tenggat:tema'

const bacaTema = () => {
  try {
    const t = localStorage.getItem(KEY)
    return t === 'light' || t === 'dark' ? t : 'sistem'
  } catch {
    return 'sistem'
  }
}

export function useTema() {
  const [tema, setTema] = useState(bacaTema)

  useEffect(() => {
    const root = document.documentElement
    if (tema === 'sistem') delete root.dataset.theme
    else root.dataset.theme = tema
    try {
      if (tema === 'sistem') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, tema)
    } catch {
      /* penyimpanan diblokir: tema tetap berlaku sampai tab ditutup */
    }
  }, [tema])

  return [tema, setTema]
}

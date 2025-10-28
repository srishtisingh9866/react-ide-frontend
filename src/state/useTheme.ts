import { useEffect, useState, useCallback } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'cipherstudio:theme'

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) as Theme | null : null
    if (saved === 'light' || saved === 'dark') return saved
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggle }
}



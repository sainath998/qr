import { useEffect, useCallback, useState } from 'react'

export type DarkModePreference = 'light' | 'dark' | 'system'
const colorSchemeMediaQuery = '(prefers-color-scheme: dark)'

// Safely check localStorage availability
const getLocalStoragePreference = (): DarkModePreference | null => {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage?.getItem('dark-mode-preference')
  return stored as DarkModePreference || null
}

const getMediaPreference = (): DarkModePreference => {
  if (typeof window === 'undefined') return 'light'
  
  const hasDarkPreference = window.matchMedia(colorSchemeMediaQuery).matches
  return hasDarkPreference ? 'dark' : 'light'
}

const getDarkModePreference = (): DarkModePreference => {
  const localStoragePref = getLocalStoragePreference()
  return localStoragePref ?? 'system'
}

const getIsDarkMode = (): boolean => {
  const darkModePreference = getDarkModePreference()
  return (
    darkModePreference === 'dark' ||
    (darkModePreference === 'system' && getMediaPreference() === 'dark')
  )
}

export const useDarkModePreference = () => {
  // Initialize state with null to handle SSR
  const [darkModePreference, setDarkModePreference] = useState<DarkModePreference>(null)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Computed values
  const isDarkModePreferenceSetBySystem = darkModePreference === 'system'

  // Update UI based on dark mode state
  const updateUiBasedOnDarkMode = useCallback(() => {
    const isDark = getIsDarkMode()
    setIsDarkMode(isDark)
    
    if (isDark && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark')
    } else if (!isDark && document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  // Set preference handler
  const setDarkModePreferenceHandler = (theme: DarkModePreference) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dark-mode-preference', theme)
    }
    setDarkModePreference(theme)
  }

  // Toggle preference handler
  const toggleDarkModePreference = () => {
    const preferences: DarkModePreference[] = ['light', 'dark', 'system']
    const currentIndex = preferences.indexOf(darkModePreference!)
    const nextIndex = (currentIndex + 1) % preferences.length
    setDarkModePreferenceHandler(preferences[nextIndex])
  }

  // System preference change handler
  const updateDarkModePreferenceIfSystemPreferenceChanges = useCallback(() => {
    if (isDarkModePreferenceSetBySystem) {
      updateUiBasedOnDarkMode()
    }
  }, [isDarkModePreferenceSetBySystem, updateUiBasedOnDarkMode])

  // Effect hooks
  useEffect(() => {
    // Initialize preferences after client-side hydration
    const initializePreferences = () => {
      const localStoragePref = getLocalStoragePreference()
      setDarkModePreference(localStoragePref ?? 'system')
      setIsDarkMode(getIsDarkMode())
    }

    initializePreferences()

    // Handle system preference changes
    const mediaQueryList = window.matchMedia(colorSchemeMediaQuery)
    mediaQueryList.addEventListener('change', updateDarkModePreferenceIfSystemPreferenceChanges)

    return () => {
      mediaQueryList.removeEventListener('change', updateDarkModePreferenceIfSystemPreferenceChanges)
    }
  }, [updateDarkModePreferenceIfSystemPreferenceChanges, updateUiBasedOnDarkMode])

  return {
    isDarkMode,
    darkModePreference,
    isDarkModePreferenceSetBySystem,
    setDarkModePreference: setDarkModePreferenceHandler,
    toggleDarkModePreference
  }
}

export default useDarkModePreference
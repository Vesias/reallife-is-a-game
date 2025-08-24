// Simple i18n implementation for Next.js 15 compatibility
import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo, useState, useEffect } from 'react'

// Translation dictionaries
import deCommon from '../locales/de/common.json'
import enCommon from '../locales/en/common.json'
import deQuests from '../locales/de/quests.json'
import enQuests from '../locales/en/quests.json'
import deGamification from '../locales/de/gamification.json'
import enGamification from '../locales/en/gamification.json'
import deLanding from '../locales/de/landing.json'
import enLanding from '../locales/en/landing.json'

export type Locale = 'de' | 'en'

// Combine all translations
const translations = {
  de: {
    common: deCommon,
    quests: deQuests,
    gamification: deGamification,
    landing: deLanding,
  },
  en: {
    common: enCommon,
    quests: enQuests,
    gamification: enGamification,
    landing: enLanding,
  },
} as const

// Helper function to get nested object value by path
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path
}

// Simple translation function
export function translate(
  locale: Locale,
  namespace: keyof typeof translations.de = 'common',
  key: string,
  interpolation?: Record<string, any>
): string {
  const value = getNestedValue(translations[locale]?.[namespace], key)
  
  if (!interpolation) return value
  
  // Simple interpolation
  return Object.entries(interpolation).reduce(
    (text, [key, value]) => text.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    value
  )
}

// Main translation hook
export function useTranslation(namespace: keyof typeof translations.de = 'common') {
  const [locale, setLocale] = useState<Locale>('de')
  
  useEffect(() => {
    // Get locale from localStorage or default to 'de'
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'de' || savedLocale === 'en')) {
      setLocale(savedLocale)
    }
  }, [])

  const t = useCallback(
    (key: string, interpolation?: Record<string, any>) => {
      return translate(locale, namespace, key, interpolation)
    },
    [locale, namespace]
  )

  const formatters = useMemo(
    () => ({
      number: (value: number) => {
        return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(value)
      },
      date: (
        value: Date | string,
        options?: Intl.DateTimeFormatOptions
      ) => {
        const dateObj = typeof value === 'string' ? new Date(value) : value
        const localeStr = locale === 'de' ? 'de-DE' : 'en-US'
        
        const defaultOptions: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
        
        return dateObj.toLocaleDateString(localeStr, { ...defaultOptions, ...options })
      },
      currency: (value: number, currency = 'EUR') => {
        const localeStr = locale === 'de' ? 'de-DE' : 'en-US'
        return new Intl.NumberFormat(localeStr, {
          style: 'currency',
          currency
        }).format(value)
      },
      time: (value: Date | string) => {
        const dateObj = typeof value === 'string' ? new Date(value) : value
        const localeStr = locale === 'de' ? 'de-DE' : 'en-US'
        return dateObj.toLocaleTimeString(localeStr, {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }),
    [locale]
  )

  return {
    t,
    locale,
    formatters,
    isGerman: locale === 'de',
    isEnglish: locale === 'en',
  }
}

// Specialized hooks
export function useQuestTranslation() {
  return useTranslation('quests')
}

export function useGamificationTranslation() {
  return useTranslation('gamification')
}

export function useLandingTranslation() {
  return useTranslation('landing')
}

// Language switcher hook
export function useLanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('de')
  
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && (savedLocale === 'de' || savedLocale === 'en')) {
      setCurrentLocale(savedLocale)
    }
  }, [])
  
  const switchLanguage = useCallback(async (locale: Locale) => {
    setCurrentLocale(locale)
    localStorage.setItem('locale', locale)
    // Trigger re-render of components
    window.dispatchEvent(new CustomEvent('localeChange', { detail: locale }))
  }, [])
  
  return {
    switchLanguage,
    currentLocale
  }
}

// Language names
export const languageNames: Record<Locale, Record<Locale, string>> = {
  de: {
    de: 'Deutsch',
    en: 'English'
  },
  en: {
    de: 'German',
    en: 'English'
  }
}

// Static translation function for use in getStaticProps/getServerSideProps
export function getStaticTranslations(locale: string = 'de', namespaces: string[] = ['common']) {
  const currentLocale = locale as Locale
  const props: any = {}
  
  namespaces.forEach(namespace => {
    if (translations[currentLocale]?.[namespace as keyof typeof translations.de]) {
      props[`_translations_${namespace}`] = translations[currentLocale][namespace as keyof typeof translations.de]
    }
  })
  
  return props
}
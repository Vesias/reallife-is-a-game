// Simplified i18n implementation compatible with App Router
import React from 'react'
import { useRouter } from 'next/navigation'

// Available locales
export const locales = ['de', 'en'] as const
export type Locale = typeof locales[number]

// Default namespace
export const defaultNS = 'common'

// Simple translation hook (placeholder implementation)
export const useTranslation = (ns: string | string[] = defaultNS) => {
  return {
    t: (key: string, options?: any) => key, // Return the key as fallback
    i18n: {
      language: 'en',
      changeLanguage: (lng: string) => {},
    }
  }
}

// Simple Trans component
export const Trans = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Placeholder for server-side translations
export const serverSideTranslations = async (
  locale: string,
  namespaces: string[] = [defaultNS]
) => {
  return {
    props: {
      _nextI18Next: {
        initialI18nStore: {},
        initialLocale: locale,
        ns: namespaces,
        userConfig: null
      }
    }
  }
}

// Helper to get server-side translations
export const getServerSideTranslations = async (
  locale: string,
  namespaces: string[] = [defaultNS]
) => {
  return await serverSideTranslations(locale, namespaces)
}

// Helper to switch language (simplified)
export const useLanguageSwitcher = () => {
  const switchLanguage = async (locale: Locale) => {
    // Simple implementation - could be enhanced with proper routing
    console.log(`Switching to locale: ${locale}`)
  }
  
  return { switchLanguage, currentLocale: 'en' as Locale }
}

// Helper to get localized path
export const getLocalizedPath = (path: string, locale: Locale) => {
  if (locale === 'en') {
    return path
  }
  return `/${locale}${path}`
}

// Type-safe translation key helpers
export type TranslationKey = string
export type TranslationValue = string | number | boolean | null | undefined
export type TranslationOptions = Record<string, TranslationValue>

// Helper for formatting numbers based on locale
export const formatNumber = (number: number, locale: Locale = 'de') => {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US').format(number)
}

// Helper for formatting dates based on locale
export const formatDate = (
  date: Date | string,
  locale: Locale = 'de',
  options?: Intl.DateTimeFormatOptions
) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const localeStr = locale === 'de' ? 'de-DE' : 'en-US'
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return dateObj.toLocaleDateString(localeStr, { ...defaultOptions, ...options })
}

// Language display names
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

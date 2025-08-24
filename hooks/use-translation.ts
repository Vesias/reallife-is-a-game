'use client'

import { 
  useTranslation as useSimpleTranslation, 
  useQuestTranslation as useSimpleQuestTranslation,
  useGamificationTranslation as useSimpleGamificationTranslation,
  type Locale 
} from '@/lib/i18n-simple'

// Main translation hook
export function useTranslation(namespace: string = 'common') {
  return useSimpleTranslation(namespace as any)
}

// Specialized hooks for different domains
export function useQuestTranslation() {
  return useSimpleQuestTranslation()
}

export function useGamificationTranslation() {
  return useSimpleGamificationTranslation()
}

export function useAuthTranslation() {
  return useTranslation('common')
}

// Re-export types
export type { Locale }
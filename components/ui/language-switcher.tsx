'use client'

import * as React from 'react'
import { useTranslation, useLanguageSwitcher, languageNames, type Locale } from '@/lib/i18n-simple'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'button' | 'dropdown' | 'compact'
  showLabel?: boolean
}

export function LanguageSwitcher({ 
  className, 
  variant = 'dropdown',
  showLabel = true
}: LanguageSwitcherProps) {
  const { switchLanguage, currentLocale } = useLanguageSwitcher()
  const { t } = useTranslation('common')

  const handleLanguageChange = async (locale: Locale) => {
    if (locale !== currentLocale) {
      try {
        await switchLanguage(locale)
        // Optional: Show success message or trigger any side effects
      } catch (error) {
        console.error('Failed to switch language:', error)
        // Optional: Show error message
      }
    }
  }

  // Compact toggle for just two languages
  if (variant === 'compact') {
    const otherLocale = currentLocale === 'de' ? 'en' : 'de'
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLanguageChange(otherLocale)}
        className={cn("h-8 px-2", className)}
        aria-label={`Switch to ${languageNames[currentLocale][otherLocale]}`}
      >
        <Globe className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">
          {otherLocale.toUpperCase()}
        </span>
      </Button>
    )
  }

  // Simple button variant
  if (variant === 'button') {
    return (
      <div className={cn("flex gap-1", className)}>
        {(['de', 'en'] as const).map((locale) => (
          <Button
            key={locale}
            variant={currentLocale === locale ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleLanguageChange(locale)}
            className="h-8 px-3"
            aria-label={`Switch to ${languageNames[currentLocale][locale]}`}
          >
            <span className="text-sm font-medium">
              {languageNames[currentLocale][locale]}
            </span>
          </Button>
        ))}
      </div>
    )
  }

  // Default dropdown variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn("h-8 px-2", className)}
          aria-label="Change language"
        >
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="ml-2 text-sm font-medium">
              {languageNames[currentLocale][currentLocale]}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {(['de', 'en'] as const).map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>{languageNames[currentLocale][locale]}</span>
              {currentLocale === locale && (
                <Check className="h-4 w-4" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Hook for accessing language switching functionality in other components
export function useLanguageSwitch() {
  const { switchLanguage, currentLocale } = useLanguageSwitcher()
  const { t } = useTranslation('common')

  return {
    switchLanguage,
    currentLocale,
    isGerman: currentLocale === 'de',
    isEnglish: currentLocale === 'en',
    languageNames: languageNames[currentLocale],
    t
  }
}

// Simple language indicator component
export function LanguageIndicator({ className }: { className?: string }) {
  const { currentLocale } = useLanguageSwitcher()
  
  return (
    <div className={cn("flex items-center text-sm text-muted-foreground", className)}>
      <Globe className="h-3 w-3 mr-1" />
      <span>{currentLocale.toUpperCase()}</span>
    </div>
  )
}
# LifeQuest Internationalization (i18n) Implementation

## Overview
Complete internationalization system for LifeQuest with German as the default language and English support. The system uses next-i18next for Next.js 15 integration.

## Configuration

### Core Configuration
- **Default Language**: German (`de`)
- **Supported Languages**: German (`de`), English (`en`)
- **Framework**: next-i18next with i18next
- **Fallback Language**: German

### Files Created

#### Configuration Files
- `/next-i18next.config.js` - Main i18n configuration
- `/pages/_app.tsx` - App wrapper with i18n integration
- `/lib/i18n.ts` - Core i18n utilities and helpers

#### Translation Files
- `/locales/de/common.json` - German common translations
- `/locales/en/common.json` - English common translations  
- `/locales/de/quests.json` - German quest-specific translations
- `/locales/en/quests.json` - English quest-specific translations
- `/locales/de/gamification.json` - German gamification terms
- `/locales/en/gamification.json` - English gamification terms

#### Components
- `/components/ui/language-switcher.tsx` - Language switching component
- `/components/auth/auth-form-i18n.tsx` - Internationalized auth form
- `/hooks/use-translation.ts` - Custom translation hooks

#### Pages
- `/pages/demo.tsx` - i18n demonstration page
- `/pages/index.tsx` - Localized homepage

## Key Features

### 1. Language Switching
```typescript
// Language switcher variants
<LanguageSwitcher variant="dropdown" />   // Full dropdown
<LanguageSwitcher variant="compact" />    // DE/EN toggle
<LanguageSwitcher variant="button" />     // Side-by-side buttons
```

### 2. Translation Hooks
```typescript
// Basic translation
const { t } = useTranslation()

// Domain-specific translations
const quest = useQuestTranslation()
const gamification = useGamificationTranslation()

// With formatting
const { formatters } = useTranslation()
formatters.number(1250) // "1.250" (DE) or "1,250" (EN)
formatters.date(new Date()) // Localized date format
```

### 3. Context-Aware Translations
- Validation messages
- Error messages
- Success notifications
- Form labels and placeholders

### 4. Formatting Utilities
- Number formatting (German: 1.250, English: 1,250)
- Date formatting (German: 24.08.2025, English: 08/24/2025)
- Currency formatting
- Relative time formatting

## German Translations Implemented

### Navigation
- "Crew erstellen" (Create Crew)
- "Nebenquest starten" (Start Side Quest) 
- "Fähigkeiten & Eigenschaften" (Skills & Traits)
- "Dashboard", "Profil", "Einstellungen"

### Onboarding
- "Willkommen zu LifeQuest" (Welcome to LifeQuest)
- "Verwandle dein Leben in ein episches Abenteuer"
- "Lass uns deinen digitalen Agenten erstellen"

### Quests
- "Hauptquest" (Main Quest)
- "Nebenquest" (Side Quest) 
- "Tägliche Mission" (Daily Mission)
- Quest statuses, difficulties, categories

### Gamification
- "Erfahrungspunkte" (Experience Points)
- "Stufe" (Level)
- "Abzeichen" (Badge)
- "Erfolg" (Achievement)
- "Serie" (Streak)

### Authentication
- Complete German auth flow
- Validation messages in German
- Form labels and placeholders

## Usage Examples

### Page-level Translation
```typescript
// pages/example.tsx
import { GetStaticProps } from 'next'
import { getServerSideTranslations } from '@/lib/i18n'

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await getServerSideTranslations(locale || 'de', ['common', 'quests']))
    }
  }
}
```

### Component Translation
```typescript
// components/example.tsx
import { useTranslation } from '@/hooks/use-translation'

function ExampleComponent() {
  const { t, formatters } = useTranslation()
  
  return (
    <div>
      <h1>{t('onboarding.welcome')}</h1>
      <p>{formatters.number(2450)} EP</p>
    </div>
  )
}
```

### Dynamic Validation
```typescript
const createValidationSchema = (t: any) => {
  return z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(8, t('validation.password'))
  })
}
```

## File Organization

```
/locales/
  /de/
    common.json         # Basic UI, navigation, auth
    quests.json        # Quest-related terms
    gamification.json  # XP, levels, badges, etc.
  /en/
    common.json        # English equivalents
    quests.json
    gamification.json

/lib/
  i18n.ts            # Core utilities

/components/ui/
  language-switcher.tsx

/hooks/
  use-translation.ts  # Custom hooks
```

## Language Switching Logic

1. **URL-based**: `/de/page` vs `/en/page`
2. **Automatic Detection**: Disabled (always starts with German)
3. **Persistence**: Language choice persists in browser
4. **Fallback**: Always falls back to German

## Advanced Features

### 1. Pluralization
```typescript
// Automatic plural handling
t('quests.completed', { count: 1 })  // "1 Quest abgeschlossen"
t('quests.completed', { count: 5 })  // "5 Quests abgeschlossen"
```

### 2. Context Switching
```typescript
// Different contexts for same key
t('button.save')           // "Speichern"
t('button.save_context')   // Context-specific variant
```

### 3. Dynamic Loading
```typescript
// Load additional namespaces on demand
const { loadNamespace } = useDynamicTranslation()
await loadNamespace('admin')
```

## Testing

### Demo Pages
- `/demo` - Full i18n showcase with all features
- Homepage demonstrates real-world usage
- Auth forms show validation translations

### Testing Commands
```bash
# Start development server
npm run dev

# Build with all locales
npm run build

# Check for translation keys
grep -r "t('" src/
```

## Production Considerations

1. **Performance**: Translations are statically generated
2. **SEO**: Each language has its own URL structure  
3. **Caching**: Translation files are cached by Next.js
4. **Bundle Size**: Only used translations are included

## Future Enhancements

1. **Additional Languages**: Easy to add more locales
2. **Rich Text**: Support for markdown in translations
3. **Lazy Loading**: Load translations on demand
4. **Translation Management**: Integration with translation services
5. **RTL Support**: Right-to-left language support

## Dependencies Added

```json
{
  "next-i18next": "^15.4.2",
  "i18next": "^25.4.2", 
  "react-i18next": "^15.7.2"
}
```

## German as Default

The system is configured with German as the default language:
- New users see German interface immediately
- All fallbacks resolve to German
- URL structure defaults to German paths
- Validation and error messages in German first

This implementation provides a comprehensive, production-ready internationalization system specifically optimized for German users while maintaining excellent English support.
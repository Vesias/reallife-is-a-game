/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    localePath: './locales',
    localeDetection: false,
  },
  fallbackLng: {
    default: ['de']
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  keySeparator: '.',
  namespaceSeparator: ':',
  pluralSeparator: '_',
  contextSeparator: '_',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
}
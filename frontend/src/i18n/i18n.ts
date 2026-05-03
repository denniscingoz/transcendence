import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import fr from './fr.json'
import es from './es.json'

const STORAGE_KEY = 'the-social.lang'

export function getInitialLanguage(): string {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return stored
  const browser = navigator.language?.slice(0, 2)
  return ['en', 'fr', 'es'].includes(browser) ? browser : 'en'
}

export function setLanguage(lang: 'en' | 'fr' | 'es') {
  localStorage.setItem(STORAGE_KEY, lang)
  void i18n.changeLanguage(lang)
}

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n

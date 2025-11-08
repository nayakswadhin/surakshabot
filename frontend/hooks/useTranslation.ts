import { useState, useEffect, useCallback } from 'react'
import { translate as staticTranslate, translateBatch as staticTranslateBatch } from '@/lib/translations'

interface TranslationHook {
  t: (text: string) => string
  currentLanguage: string
  setLanguage: (lang: string) => void
  isTranslating: boolean
  supportedLanguages: { code: string; name: string; nativeName: string }[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const USE_STATIC_TRANSLATIONS = true // Use static translations instead of API

// Cache for translations to avoid redundant API calls
const translationCache = new Map<string, Map<string, string>>()

export function useTranslation(): TranslationHook {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [isTranslating, setIsTranslating] = useState(false)

  const supportedLanguages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  ]

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('preferredLanguage')
    if (savedLang && supportedLanguages.find(l => l.code === savedLang)) {
      setCurrentLanguage(savedLang)
    }
  }, [])

  const setLanguage = useCallback((lang: string) => {
    if (supportedLanguages.find(l => l.code === lang)) {
      setCurrentLanguage(lang)
      localStorage.setItem('preferredLanguage', lang)
    }
  }, [])

  const t = useCallback(
    (text: string): string => {
      // If language is English or text is empty, return as is
      if (currentLanguage === 'en' || !text || text.trim() === '') {
        return text
      }

      // Always use static translations for client components
      // This is synchronous and works perfectly in React client components
      return staticTranslate(text, currentLanguage)
    },
    [currentLanguage]
  )

  return {
    t,
    currentLanguage,
    setLanguage,
    isTranslating,
    supportedLanguages,
  }
}

// Helper function for static translations (doesn't require API call for English)
export function useStaticTranslation() {
  const { t, currentLanguage } = useTranslation()

  const ts = useCallback(
    (text: string): string => {
      if (currentLanguage === 'en') {
        return text
      }
      // For static translations, return original text immediately
      // You can add manual translations here if needed
      return text
    },
    [currentLanguage]
  )

  return { ts, currentLanguage }
}

// Batch translation hook
export function useBatchTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage')
    if (savedLang) {
      setCurrentLanguage(savedLang)
    }
  }, [])

  const translateBatch = useCallback(
    async (texts: string[]): Promise<string[]> => {
      if (currentLanguage === 'en' || texts.length === 0) {
        return texts
      }

      // Use static translations if enabled
      if (USE_STATIC_TRANSLATIONS) {
        return staticTranslateBatch(texts, currentLanguage)
      }

      try {
        const response = await fetch(`${API_BASE}/translation/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            texts,
            targetLang: currentLanguage,
          }),
        })

        if (!response.ok) {
          return staticTranslateBatch(texts, currentLanguage)
        }

        const data = await response.json()
        return data.data?.translations || texts
      } catch (error) {
        console.error('Batch translation error:', error)
        return staticTranslateBatch(texts, currentLanguage)
      }
    },
    [currentLanguage]
  )

  return { translateBatch, currentLanguage }
}

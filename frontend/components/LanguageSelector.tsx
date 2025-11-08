'use client'

import { useState, useEffect } from 'react'
import { FaGlobe, FaCheck } from 'react-icons/fa'

interface LanguageSelectorProps {
  onLanguageChange?: (language: string) => void
  currentLanguage?: string
}

export default function LanguageSelector({ 
  onLanguageChange, 
  currentLanguage = 'en' 
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage)
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  ]

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem('preferredLanguage')
    if (savedLang && languages.find(l => l.code === savedLang)) {
      setSelectedLanguage(savedLang)
      onLanguageChange?.(savedLang)
    }
  }, [])

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode)
    localStorage.setItem('preferredLanguage', langCode)
    setIsOpen(false)
    onLanguageChange?.(langCode)
    
    // Show notification
    const langName = languages.find(l => l.code === langCode)?.nativeName
    console.log(`Language changed to ${langName}`)
  }

  const currentLang = languages.find(l => l.code === selectedLanguage)

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <FaGlobe className="text-primary" />
        <span>{currentLang?.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    selectedLanguage === language.code
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  role="menuitem"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{language.nativeName}</span>
                    <span className={`text-xs ${
                      selectedLanguage === language.code ? 'text-white opacity-80' : 'text-gray-500'
                    }`}>
                      {language.name}
                    </span>
                  </div>
                  {selectedLanguage === language.code && (
                    <FaCheck className="text-white" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
              Translation powered by Google Gemini
            </div>
          </div>
        </>
      )}
    </div>
  )
}

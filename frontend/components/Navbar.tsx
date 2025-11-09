'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FaChartBar,
    FaChartLine,
    FaExclamationTriangle,
    FaHome,
    FaRobot,
    FaUnlock,
    FaUsers,
    FaBell,
} from 'react-icons/fa'
import LanguageSelector from './LanguageSelector'
import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/', label: 'Dashboard', icon: FaHome },
  { href: '/complaints', label: 'Complaints', icon: FaExclamationTriangle },
  { href: '/analytics', label: 'Analytics & Reports', icon: FaChartLine },
  { href: '/users', label: 'Users', icon: FaUsers },
  { href: '/unfreeze', label: 'Unfreeze Complaints', icon: FaUnlock },
  { href: '/assistant', label: 'Assistant', icon: FaRobot },
]

export default function Navbar() {
  const pathname = usePathname()
  const { t, currentLanguage, setLanguage } = useTranslation()
  const [translatedLabels, setTranslatedLabels] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Translate nav labels when language changes
  useEffect(() => {
    const translations: Record<string, string> = {}
    for (const item of navItems) {
      translations[item.href] = t(item.label)
    }
    setTranslatedLabels(translations)
  }, [currentLanguage, t])

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    // Reset translations to trigger re-translation
    setTranslatedLabels({})
  }

  const sendAlert = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/alert/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success(t('Alert sent successfully!'), {
          duration: 3000,
          position: 'top-right',
        })
      } else {
        throw new Error('Failed to send alert')
      }
    } catch (error) {
      toast.error(t('Failed to send alert'), {
        duration: 3000,
        position: 'top-right',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav className="bg-white shadow-md sticky top-[84px] z-40">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between">
          <ul className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const displayLabel = translatedLabels[item.href] || item.label

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-6 py-4 border-b-3 transition-all font-medium ${
                      isActive
                        ? 'text-primary border-primary bg-primary/5'
                        : 'text-gray-700 border-transparent hover:text-primary hover:bg-primary/5'
                    }`}
                  >
                    <Icon />
                    <span>{displayLabel}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="flex items-center gap-4 py-2">
            <button
              onClick={sendAlert}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-sm font-medium transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 active:scale-95'
              }`}
              title={t('Send Alert')}
            >
              <FaBell className={`text-xs ${isLoading ? 'animate-pulse' : ''}`} />
              <span className="text-xs">{isLoading ? t('Sending...') : t('Send Alert')}</span>
            </button>
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

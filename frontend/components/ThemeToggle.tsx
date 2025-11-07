"use client"

import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDark(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
        {isDark ? 'Night' : 'Day'} Mode
      </span>
      
      {/* Government-styled Toggle Switch */}
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-300 dark:bg-blue-900"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
      >
        {/* Toggle Circle */}
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            isDark ? 'translate-x-9' : 'translate-x-1'
          }`}
        >
          {/* Icon inside circle */}
          <span className="flex h-full w-full items-center justify-center">
            {isDark ? (
              // Moon icon
              <svg className="h-4 w-4 text-blue-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              // Sun icon
              <svg className="h-4 w-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </span>

        {/* Background icons/text */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold pointer-events-none">
          <span className={`text-orange-600 transition-opacity ${isDark ? 'opacity-0' : 'opacity-100'}`}>
            ☀
          </span>
          <span className={`text-blue-200 transition-opacity ${isDark ? 'opacity-100' : 'opacity-0'}`}>
            ☾
          </span>
        </div>
      </button>
    </div>
  )
}

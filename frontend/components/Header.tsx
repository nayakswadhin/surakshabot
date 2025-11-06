'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog } from 'react-icons/fa'
import { isAuthenticated, clearAuth } from '@/lib/auth'

export default function Header() {
  const [auth, setAuth] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setAuth(isAuthenticated())
  }, [])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const handleLogout = () => {
    clearAuth()
    setAuth(false)
    setOpen(false)
    router.push('/login')
  }

  // Don't show header on login page - check at the end after all hooks
  if (pathname === '/login') {
    return null
  }

  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">SB</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">SurakshaBot</h1>
              <p className="text-sm opacity-90">1930 Cyber Helpline, Odisha</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Notification */}
            <div className="relative cursor-pointer hover:scale-110 transition-transform">
              <FaBell className="text-2xl" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                0
              </span>
            </div>

            {/* Admin Dropdown */}
            {auth && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((s) => !s)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-all"
                >
                  <FaUserCircle className="text-3xl" />
                  <span className="font-medium">Admin</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-b border-gray-200"
                    >
                      <FaCog className="text-lg" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-red-600"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

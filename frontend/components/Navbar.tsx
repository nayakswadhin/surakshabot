'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FaChartBar,
    FaChartLine,
    FaExclamationTriangle,
    FaHome,
    FaRobot,
    FaUsers,
} from 'react-icons/fa'

const navItems = [
  { href: '/', label: 'Dashboard', icon: FaHome },
  { href: '/complaints', label: 'Complaints', icon: FaExclamationTriangle },
  { href: '/analytics', label: 'Analytics & Reports', icon: FaChartLine },
  { href: '/users', label: 'Users', icon: FaUsers },
  { href: '/assistant', label: 'Assistant', icon: FaRobot },
]

export default function Navbar() {
  const pathname = usePathname()

  // Don't show navbar on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="bg-white shadow-md sticky top-[92px] z-40">
      <div className="max-w-[1400px] mx-auto px-4">
        <ul className="flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

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
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

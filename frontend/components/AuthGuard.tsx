'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Allow login page without auth
    if (pathname === '/login') {
      setChecking(false)
      return
    }

    // Check if authenticated
    const auth = isAuthenticated()
    if (!auth) {
      router.push('/login')
    } else {
      setChecking(false)
    }
  }, [pathname, router])

  // Show nothing while checking (prevents flash of protected content)
  if (checking && pathname !== '/login') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}

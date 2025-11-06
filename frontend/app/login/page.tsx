"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setAuth, isAuthenticated } from '@/lib/auth'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // simple client-side check
    setTimeout(() => {
      setLoading(false)
      if (password === '123456') {
        setAuth()
        router.push('/')
      } else {
        setError('Invalid password')
      }
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Admin Login</h2>
        <p className="text-sm text-gray-600 mb-6">Enter the admin password to access the dashboard.</p>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-primary"
            placeholder="Enter password"
          />

          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-white rounded hover:bg-primary-dark font-medium"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-xs text-gray-500">Tip: For this demo the password is <strong>123456</strong>.</div>
      </div>
    </div>
  )
}

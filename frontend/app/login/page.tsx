"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { setAuth, isAuthenticated } from '@/lib/auth'
import Image from 'next/image'

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Indian Flag Inspired Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-orange-500"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-green-600"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Government Header */}
        <div className="bg-white border-t-4 border-orange-600 rounded-t-xl">
          <div className="bg-white px-8 py-6 rounded-t-xl border-b-2 border-blue-900">
            <div className="flex items-center justify-center mb-4">
              {/* India Emblem */}
              <div className="mb-2">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png" 
                  alt="Emblem of India"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
            </div>
            <h1 className="text-center text-xl font-bold text-gray-800 mb-1">
              Government of Odisha
            </h1>
            <p className="text-center text-sm text-gray-600 mb-2">
              Cyber Crime Police Station
            </p>
            <div className="text-center text-lg font-semibold text-blue-900 border-t-2 border-b-2 border-orange-500 py-2">
              1930 Cyber Helpline
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white shadow-2xl rounded-b-xl p-8 border-4 border-blue-900">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">Admin Access</h2>
            <p className="text-sm text-gray-600 text-center">
              Authorized Personnel Only
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Security Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
              placeholder="Enter admin password"
              required
            />

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying Access...
                </span>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500 bg-yellow-50 border border-yellow-200 p-2 rounded">
              <span className="font-semibold">Demo Access:</span> Password is <code className="bg-yellow-100 px-2 py-1 rounded font-mono">123456</code>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              <span className="font-semibold">SurakshaBot</span> • Powered by Digital India Initiative
            </p>
            <p className="text-xs text-gray-400 mt-1">
              For support: <span className="text-blue-600 font-medium">1930</span> (Toll Free)
            </p>
          </div>
        </div>

        {/* Bottom Security Notice */}
        <div className="mt-4 text-center text-xs text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
          <span className="font-semibold text-red-600">Security Notice:</span> This system is for authorized use only. 
          Unauthorized access attempts will be logged and reported.
        </div>
      </div>
    </div>
  )
}

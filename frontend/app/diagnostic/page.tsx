'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

export default function DiagnosticPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    const results = []

    // Test 1: Backend Health
    try {
      const response = await axios.get('http://localhost:3000/api/health')
      results.push({
        name: 'Backend Health Check',
        status: 'success',
        data: response.data,
        url: 'http://localhost:3000/api/health'
      })
    } catch (error: any) {
      results.push({
        name: 'Backend Health Check',
        status: 'error',
        error: error.message,
        url: 'http://localhost:3000/api/health'
      })
    }

    // Test 2: Fetch Cases
    try {
      const response = await axios.get('http://localhost:3000/api/whatsapp/cases/all')
      results.push({
        name: 'Fetch Cases',
        status: 'success',
        data: `Found ${response.data.data?.length || 0} cases`,
        url: 'http://localhost:3000/api/whatsapp/cases/all',
        sampleData: response.data.data?.[0]
      })
    } catch (error: any) {
      results.push({
        name: 'Fetch Cases',
        status: 'error',
        error: error.message,
        url: 'http://localhost:3000/api/whatsapp/cases/all'
      })
    }

    // Test 3: Fetch Users
    try {
      const response = await axios.get('http://localhost:3000/api/whatsapp/users/all')
      results.push({
        name: 'Fetch Users',
        status: 'success',
        data: `Found ${response.data.data?.length || 0} users`,
        url: 'http://localhost:3000/api/whatsapp/users/all',
        sampleData: response.data.data?.[0]
      })
    } catch (error: any) {
      results.push({
        name: 'Fetch Users',
        status: 'error',
        error: error.message,
        url: 'http://localhost:3000/api/whatsapp/users/all'
      })
    }

    setTests(results)
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          🔍 Connection Diagnostic
        </h1>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Purpose:</strong> This page tests the connection between frontend and backend.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Running diagnostics...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`card ${
                  test.status === 'success' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      {test.status === 'success' ? '✅' : '❌'} {test.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>URL:</strong> {test.url}
                    </p>
                    {test.status === 'success' ? (
                      <>
                        <p className="text-green-700 font-medium">{test.data}</p>
                        {test.sampleData && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-gray-600">
                              View Sample Data
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                              {JSON.stringify(test.sampleData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </>
                    ) : (
                      <p className="text-red-700">
                        <strong>Error:</strong> {test.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 card bg-gray-50">
          <h3 className="font-semibold text-lg mb-4">📝 Troubleshooting</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Backend should be running on port 3000</li>
            <li>✓ Frontend should be running on port 3001</li>
            <li>✓ MongoDB should be connected</li>
            <li>✓ Check browser console for CORS errors (F12)</li>
            <li>✓ Verify .env.local file has correct API URL</li>
          </ul>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={runTests}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            🔄 Run Tests Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

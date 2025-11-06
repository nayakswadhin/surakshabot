'use client'

import { useEffect, useState } from 'react'
import StatsCard from '@/components/StatsCard'
import RecentComplaints from '@/components/RecentComplaints'
import FraudTypeChart from '@/components/FraudTypeChart'
import RecentActivity from '@/components/RecentActivity'
import { fetchDashboardStats } from '@/lib/api'
import { FaFileAlt, FaCheckCircle, FaClock, FaUserShield } from 'react-icons/fa'

export default function Home() {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalSolved: 0,
    totalPending: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching dashboard data...')
      const data = await fetchDashboardStats()
      console.log('Dashboard data received:', data)
      setStats(data)
    } catch (error: any) {
      console.error('Error loading dashboard:', error)
      setError(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Connection Error:</strong> {error}
              </p>
              <p className="text-xs text-red-600 mt-1">
                Make sure the backend server is running on port 3000
              </p>
              <button 
                onClick={loadDashboardData}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                Try Again
              </button>
              {' | '}
              <a 
                href="/diagnostic"
                className="text-sm text-red-700 underline hover:text-red-900"
              >
                Run Diagnostic
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Complaints"
          value={stats.totalComplaints}
          icon={<FaFileAlt />}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Total Solved"
          value={stats.totalSolved}
          icon={<FaCheckCircle />}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Total Pending"
          value={stats.totalPending}
          icon={<FaClock />}
          color="orange"
          loading={loading}
        />
        <StatsCard
          title="Registered Users"
          value={stats.totalUsers}
          icon={<FaUserShield />}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FraudTypeChart />
        <RecentActivity />
      </div>

      {/* Recent Complaints */}
      <RecentComplaints />
    </div>
  )
}

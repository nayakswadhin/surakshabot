'use client'

import { useEffect, useState } from 'react'
import StatsCard from '@/components/StatsCard'
import RecentComplaints from '@/components/RecentComplaints'
import FraudTypeChart from '@/components/FraudTypeChart'
import RecentActivity from '@/components/RecentActivity'
import HeatmapWidget from '@/components/HeatmapWidget'
import { fetchDashboardStats } from '@/lib/api'
import { FaFileAlt, FaCheckCircle, FaClock, FaUserShield } from 'react-icons/fa'
import { useTranslation } from '@/hooks/useTranslation'

export default function Home() {
  const { t, currentLanguage } = useTranslation()
  const [stats, setStats] = useState({
    totalComplaints: 0,
    totalSolved: 0,
    totalPending: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [translations, setTranslations] = useState({
    dashboardOverview: 'Dashboard Overview',
    totalComplaints: 'Total Complaints',
    totalSolved: 'Total Solved',
    totalPending: 'Total Pending',
    registeredUsers: 'Registered Users',
    allTimeTotal: 'All time total complaints',
    allTimeSolved: 'All time total solved',
    allTimePending: 'All time total pending',
    allTimeUsers: 'All time registered users',
    connectionError: 'Connection Error',
    makeServerRunning: 'Make sure the backend server is running on port 3000',
    tryAgain: 'Try Again',
    runDiagnostic: 'Run Diagnostic',
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  useEffect(() => {
    // Translate all text when language changes
    const translateTexts = async () => {
      const texts = [
        'Dashboard Overview',
        'Total Complaints',
        'Total Solved',
        'Total Pending',
        'Registered Users',
        'All time total complaints',
        'All time total solved',
        'All time total pending',
        'All time registered users',
        'Connection Error',
        'Make sure the backend server is running on port 3000',
        'Try Again',
        'Run Diagnostic',
      ]
      
      const translated = await Promise.all(texts.map(text => t(text)))
      
      setTranslations({
        dashboardOverview: translated[0],
        totalComplaints: translated[1],
        totalSolved: translated[2],
        totalPending: translated[3],
        registeredUsers: translated[4],
        allTimeTotal: translated[5],
        allTimeSolved: translated[6],
        allTimePending: translated[7],
        allTimeUsers: translated[8],
        connectionError: translated[9],
        makeServerRunning: translated[10],
        tryAgain: translated[11],
        runDiagnostic: translated[12],
      })
    }
    
    translateTexts()
  }, [currentLanguage, t])

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
        <h1 className="text-3xl font-bold text-primary">{translations.dashboardOverview}</h1>
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
                <strong>{translations.connectionError}:</strong> {error}
              </p>
              <p className="text-xs text-red-600 mt-1">
                {translations.makeServerRunning}
              </p>
              <button 
                onClick={loadDashboardData}
                className="mt-2 text-sm text-red-700 underline hover:text-red-900"
              >
                {translations.tryAgain}
              </button>
              {' | '}
              <a 
                href="/diagnostic"
                className="text-sm text-red-700 underline hover:text-red-900"
              >
                {translations.runDiagnostic}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={translations.totalComplaints}
          value={stats.totalComplaints}
          icon={<FaFileAlt />}
          color="blue"
          loading={loading}
          subtitle={translations.allTimeTotal}
        />
        <StatsCard
          title={translations.totalSolved}
          value={stats.totalSolved}
          icon={<FaCheckCircle />}
          color="green"
          loading={loading}
          subtitle={translations.allTimeSolved}
        />
        <StatsCard
          title={translations.totalPending}
          value={stats.totalPending}
          icon={<FaClock />}
          color="orange"
          loading={loading}
          subtitle={translations.allTimePending}
        />
        <StatsCard
          title={translations.registeredUsers}
          value={stats.totalUsers}
          icon={<FaUserShield />}
          color="purple"
          loading={loading}
          subtitle={translations.allTimeUsers}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FraudTypeChart />
        <RecentActivity />
      </div>

      {/* Heatmap Widget */}
      <HeatmapWidget />

      {/* Recent Complaints */}
      <RecentComplaints />
    </div>
  )
}

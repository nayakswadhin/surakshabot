'use client'

import { useEffect, useState } from 'react'
import { fetchFraudTypeDistribution, fetchComplaints } from '@/lib/api'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { FaCalendarAlt } from 'react-icons/fa'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AnalyticsPage() {
  const [fraudDistribution, setFraudDistribution] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredData, setFilteredData] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyDateFilter()
  }, [startDate, endDate, complaints])

  const loadData = async () => {
    try {
      setLoading(true)
      const [distribution, complaintsData] = await Promise.all([
        fetchFraudTypeDistribution(),
        fetchComplaints(),
      ])
      setFraudDistribution(distribution)
      setComplaints(complaintsData)
      setFilteredData(distribution)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      setFilteredData(fraudDistribution)
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59)

    const filtered = complaints.filter((c) => {
      const date = new Date(c.createdAt)
      return date >= start && date <= end
    })

    // Recalculate distribution for filtered data
    const distribution: Record<string, number> = {}
    filtered.forEach((complaint) => {
      const type = complaint.typeOfFraud || 'Unknown'
      distribution[type] = (distribution[type] || 0) + 1
    })

    const newDistribution = Object.entries(distribution)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    setFilteredData(newDistribution)
  }

  const chartData = {
    labels: filteredData.map((item) => item.type),
    datasets: [
      {
        label: 'Number of Cases',
        data: filteredData.map((item) => item.count),
        backgroundColor: [
          '#1a237e', '#0d47a1', '#2e7d32', '#f57c00', '#c62828',
          '#0288d1', '#7b1fa2', '#455a64', '#00695c', '#5d4037',
          '#1565c0', '#558b2f', '#e65100', '#ad1457', '#4527a0',
        ],
      },
    ],
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Advanced Analytics</h1>
        
        {/* Date Range Picker */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-md">
          <FaCalendarAlt className="text-primary text-xl" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <span className="text-gray-600">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={() => {
              setStartDate('')
              setEndDate('')
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90 mb-2">Total Cases (Filtered)</div>
          <div className="text-4xl font-bold">
            {filteredData.reduce((sum, item) => sum + item.count, 0)}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="text-sm opacity-90 mb-2">Most Common Fraud</div>
          <div className="text-2xl font-bold truncate">
            {filteredData[0]?.type || 'N/A'}
          </div>
          <div className="text-sm opacity-90">
            ({filteredData[0]?.count || 0} cases)
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm opacity-90 mb-2">Fraud Types Detected</div>
          <div className="text-4xl font-bold">{filteredData.length}</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card">
        <h3 className="text-2xl font-semibold text-primary mb-6">
          Fraud Type Distribution (Top 15)
        </h3>
        <div className="h-[600px]">
          {filteredData.length > 0 ? (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `Cases: ${context.parsed.x}`
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available for the selected date range
            </div>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h3 className="text-xl font-semibold text-primary mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Fraud Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Number of Cases</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => {
                const total = filteredData.reduce((sum, i) => sum + i.count, 0)
                const percentage = ((item.count / total) * 100).toFixed(1)
                return (
                  <tr key={item.type} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">#{index + 1}</td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4 font-semibold">{item.count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { fetchFraudTypeDistribution, fetchComplaints, fetchUsers } from '@/lib/api'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { FaCalendarAlt, FaDownload, FaFileCsv, FaFilePdf, FaChevronDown } from 'react-icons/fa'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useTranslation } from '@/hooks/useTranslation'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement)

export default function AnalyticsPage() {
  const { t, currentLanguage } = useTranslation()
  const [fraudDistribution, setFraudDistribution] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<any[]>([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)
  
  // Translations
  const [translations, setTranslations] = useState({
    analyticsReports: 'Analytics & Reports',
    export: 'Export',
    clear: 'Clear',
    totalComplaints: 'Total Complaints',
    solved: 'Solved',
    pending: 'Pending',
    resolutionRate: 'Resolution Rate',
    fraudTypes: 'Fraud Types',
    complaintsCategory: 'Complaints by Category',
    statusDistribution: 'Status Distribution',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setTranslations({
      analyticsReports: t('Analytics & Reports'),
      export: t('Export'),
      clear: t('Clear'),
      totalComplaints: t('Total Complaints'),
      solved: t('Solved'),
      pending: t('Pending'),
      resolutionRate: t('Resolution Rate'),
      fraudTypes: t('Fraud Types'),
      complaintsCategory: t('Complaints by Category'),
      statusDistribution: t('Status Distribution'),
    })
  }, [currentLanguage, t])

  useEffect(() => {
    applyDateFilter()
  }, [startDate, endDate, complaints])

  // Handle click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const loadData = async () => {
    try {
      setLoading(true)
      const [distribution, complaintsData, usersData] = await Promise.all([
        fetchFraudTypeDistribution(),
        fetchComplaints(),
        fetchUsers(),
      ])
      setFraudDistribution(distribution)
      setComplaints(complaintsData)
      setUsers(usersData)
      setFilteredData(distribution)
      setFilteredComplaints(complaintsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyDateFilter = () => {
    if (!startDate || !endDate) {
      setFilteredData(fraudDistribution)
      setFilteredComplaints(complaints)
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59)

    const filtered = complaints.filter((c) => {
      const date = new Date(c.createdAt)
      return date >= start && date <= end
    })

    setFilteredComplaints(filtered)

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

  // Category Chart Data
  const categoryData = {
    labels: ['Financial Fraud', 'Social Media Fraud'],
    datasets: [
      {
        label: 'Number of Cases',
        data: [
          filteredComplaints.filter((c) => c.caseCategory === 'Financial').length,
          filteredComplaints.filter((c) => c.caseCategory === 'Social').length,
        ],
        backgroundColor: ['#1a237e', '#0d47a1'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  // Status Distribution
  const statusData = {
    labels: ['Pending', 'Solved', 'Under Review', 'Investigating', 'Rejected'],
    datasets: [
      {
        data: [
          filteredComplaints.filter((c) => c.status === 'pending').length,
          filteredComplaints.filter((c) => c.status === 'solved').length,
          filteredComplaints.filter((c) => c.status === 'under_review').length,
          filteredComplaints.filter((c) => c.status === 'investigating').length,
          filteredComplaints.filter((c) => c.status === 'rejected').length,
        ],
        backgroundColor: ['#f57c00', '#2e7d32', '#0288d1', '#7b1fa2', '#c62828'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  // Monthly Trend
  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyCounts = new Array(12).fill(0)

    filteredComplaints.forEach((complaint) => {
      const month = new Date(complaint.createdAt).getMonth()
      monthlyCounts[month]++
    })

    return {
      labels: months,
      datasets: [
        {
          label: 'Complaints per Month',
          data: monthlyCounts,
          borderColor: '#1a237e',
          backgroundColor: 'rgba(26, 35, 126, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    }
  }

  // District-wise Analysis
  const getDistrictData = () => {
    const districtCounts: Record<string, number> = {}
    
    filteredComplaints.forEach((complaint) => {
      users.forEach((user) => {
        if (user.aadharNumber === complaint.aadharNumber) {
          const district = user.address?.district || 'Unknown'
          districtCounts[district] = (districtCounts[district] || 0) + 1
        }
      })
    })

    const sortedDistricts = Object.entries(districtCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return {
      labels: sortedDistricts.map(([district]) => district),
      datasets: [
        {
          label: 'Cases by District',
          data: sortedDistricts.map(([, count]) => count),
          backgroundColor: [
            '#1a237e', '#0d47a1', '#2e7d32', '#f57c00', '#c62828',
            '#0288d1', '#7b1fa2', '#455a64', '#00695c', '#5d4037',
          ],
        },
      ],
    }
  }

  const exportToCSV = () => {
    // Prepare CSV data
    const csvData = []
    
    // Add header
    csvData.push([
      'Case ID',
      'Aadhar Number',
      'Case Category',
      'Type of Fraud',
      'Status',
      'Priority',
      'Created Date',
      'Pin Code',
      'District'
    ])

    // Add complaint rows
    filteredComplaints.forEach((complaint) => {
      const user = users.find(u => u.aadharNumber === complaint.aadharNumber)
      csvData.push([
        complaint.caseId || complaint._id || '',
        complaint.aadharNumber || '',
        complaint.caseCategory || '',
        complaint.typeOfFraud || '',
        complaint.status || '',
        complaint.priority || '',
        complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : '',
        complaint.fraudLocation?.pincode || '',
        user?.address?.district || ''
      ])
    })

    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.setTextColor(26, 35, 126)
    doc.text('SurakshaBot - Analytics & Reports', 14, 20)
    
    // Add generation date
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
    if (startDate && endDate) {
      doc.text(`Date Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 14, 33)
    }
    
    // Add summary statistics
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Summary Statistics', 14, 43)
    
    const stats = [
      ['Total Complaints', filteredComplaints.length.toString()],
      ['Solved', filteredComplaints.filter((c) => c.status === 'solved').length.toString()],
      ['Pending', filteredComplaints.filter((c) => c.status === 'pending').length.toString()],
      ['Under Review', filteredComplaints.filter((c) => c.status === 'under_review').length.toString()],
      ['Investigating', filteredComplaints.filter((c) => c.status === 'investigating').length.toString()],
      ['Financial Fraud', filteredComplaints.filter((c) => c.caseCategory === 'Financial').length.toString()],
      ['Social Fraud', filteredComplaints.filter((c) => c.caseCategory === 'Social').length.toString()],
      ['Total Users', users.length.toString()],
      ['Resolution Rate', filteredComplaints.length > 0 
        ? `${Math.round((filteredComplaints.filter((c) => c.status === 'solved').length / filteredComplaints.length) * 100)}%` 
        : '0%']
    ]
    
    autoTable(doc, {
      startY: 47,
      head: [['Metric', 'Value']],
      body: stats,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] },
      margin: { left: 14 }
    })
    
    // Add complaints table
    doc.setFontSize(12)
    const finalY = (doc as any).lastAutoTable.finalY || 47
    doc.text('Detailed Complaints', 14, finalY + 10)
    
    const tableData = filteredComplaints.slice(0, 50).map((complaint) => [
      (complaint.caseId || complaint._id)?.substring(0, 10) || '',
      complaint.aadharNumber?.substring(0, 8) + '****' || '',
      complaint.caseCategory || '',
      (complaint.typeOfFraud || '').substring(0, 25),
      complaint.status || '',
      complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : ''
    ])
    
    autoTable(doc, {
      startY: finalY + 14,
      head: [['Case ID', 'Aadhar', 'Category', 'Fraud Type', 'Status', 'Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [26, 35, 126] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    })
    
    // Save PDF
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`)
    setShowExportMenu(false)
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">{translations.analyticsReports}</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Date Range Picker */}
          <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-md flex-wrap">
            <FaCalendarAlt className="text-primary text-lg" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              {translations.clear}
            </button>
          </div>

          {/* Export Menu */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium w-full sm:w-auto justify-center"
            >
              <FaDownload /> {translations.export} <FaChevronDown className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700 transition-colors"
                >
                  <FaFileCsv className="text-green-600" /> Export as CSV
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-700 transition-colors"
                >
                  <FaFilePdf className="text-red-600" /> Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card border-l-4 border-blue-500 p-6">
          <div className="text-sm text-gray-600 mb-1">{translations.totalComplaints}</div>
          <div className="text-4xl font-bold text-gray-900">{filteredComplaints.length}</div>
        </div>
        <div className="card border-l-4 border-green-500 p-6">
          <div className="text-sm text-gray-600 mb-1">{translations.solved}</div>
          <div className="text-4xl font-bold text-gray-900">
            {filteredComplaints.filter((c) => c.status === 'solved').length}
          </div>
        </div>
        <div className="card border-l-4 border-orange-500 p-6">
          <div className="text-sm text-gray-600 mb-1">{translations.pending}</div>
          <div className="text-4xl font-bold text-gray-900">
            {filteredComplaints.filter((c) => c.status === 'pending').length}
          </div>
        </div>
        <div className="card border-l-4 border-purple-500 p-6">
          <div className="text-sm text-gray-600 mb-1">{translations.resolutionRate}</div>
          <div className="text-4xl font-bold text-gray-900">
            {filteredComplaints.length > 0
              ? Math.round((filteredComplaints.filter((c) => c.status === 'solved').length / filteredComplaints.length) * 100)
              : 0}
            %
          </div>
        </div>
        <div className="card border-l-4 border-indigo-500 p-6">
          <div className="text-sm text-gray-600 mb-1">{translations.fraudTypes}</div>
          <div className="text-4xl font-bold text-gray-900">{filteredData.length}</div>
        </div>
      </div>

      {/* Charts Grid - Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-primary mb-6">{translations.complaintsCategory}</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 14
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-primary mb-6">{translations.statusDistribution}</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 12
                      }
                    }
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card xl:col-span-2 p-6">
          <h3 className="text-xl font-semibold text-primary mb-6">Monthly Trend</h3>
          <div className="h-80">
            <Line
              data={getMonthlyTrend()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* District-wise Analysis */}
        <div className="card xl:col-span-2 p-6">
          <h3 className="text-xl font-semibold text-primary mb-6">District-wise Analysis (Top 10)</h3>
          <div className="h-80">
            <Bar
              data={getDistrictData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Fraud Type Distribution Chart */}
      <div className="card p-6">
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

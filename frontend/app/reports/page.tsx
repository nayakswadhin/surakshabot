'use client'

import { useEffect, useState, useRef } from 'react'
import { fetchComplaints, fetchUsers } from '@/lib/api'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { FaDownload, FaFileExport, FaFileCsv, FaFilePdf, FaChevronDown } from 'react-icons/fa'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement)

export default function ReportsPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

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
      const [complaintsData, usersData] = await Promise.all([
        fetchComplaints(),
        fetchUsers(),
      ])
      setComplaints(complaintsData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Category Chart Data
  const categoryData = {
    labels: ['Financial Fraud', 'Social Media Fraud'],
    datasets: [
      {
        label: 'Number of Cases',
        data: [
          complaints.filter((c) => c.caseCategory === 'Financial').length,
          complaints.filter((c) => c.caseCategory === 'Social').length,
        ],
        backgroundColor: ['#1a237e', '#0d47a1'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  // Status Distribution
  const statusData = {
    labels: ['Pending', 'Solved'],
    datasets: [
      {
        data: [
          complaints.filter((c) => c.status === 'pending').length,
          complaints.filter((c) => c.status === 'solved').length,
        ],
        backgroundColor: ['#f57c00', '#2e7d32'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  }

  // Monthly Trend
  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyCounts = new Array(12).fill(0)

    complaints.forEach((complaint) => {
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
    
    complaints.forEach((complaint) => {
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
      'Complaint ID',
      'Name',
      'Aadhar Number',
      'Mobile',
      'Case Category',
      'Status',
      'Incident Date',
      'Pin Code'
    ])

    // Add complaint rows
    complaints.forEach((complaint) => {
      csvData.push([
        complaint._id || '',
        complaint.name || '',
        complaint.aadharNumber || '',
        complaint.mobileNumber || '',
        complaint.caseCategory || '',
        complaint.status || '',
        complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleDateString() : '',
        complaint.pinCode || ''
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
    link.download = `complaints-report-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setShowExportMenu(false)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.setTextColor(26, 35, 126) // Primary color
    doc.text('SurakshaBot - Complaints Report', 14, 20)
    
    // Add generation date
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
    
    // Add summary statistics
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Summary Statistics', 14, 38)
    
    const stats = [
      ['Total Complaints', complaints.length.toString()],
      ['Solved', complaints.filter((c) => c.status === 'solved').length.toString()],
      ['Pending', complaints.filter((c) => c.status === 'pending').length.toString()],
      ['Financial Fraud', complaints.filter((c) => c.caseCategory === 'Financial').length.toString()],
      ['Social Fraud', complaints.filter((c) => c.caseCategory === 'Social').length.toString()],
      ['Total Users', users.length.toString()],
      ['Resolution Rate', complaints.length > 0 
        ? `${Math.round((complaints.filter((c) => c.status === 'solved').length / complaints.length) * 100)}%` 
        : '0%']
    ]
    
    autoTable(doc, {
      startY: 42,
      head: [['Metric', 'Value']],
      body: stats,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] },
      margin: { left: 14 }
    })
    
    // Add complaints table
    doc.setFontSize(12)
    const finalY = (doc as any).lastAutoTable.finalY || 42
    doc.text('Detailed Complaints', 14, finalY + 10)
    
    const tableData = complaints.map((complaint) => [
      complaint._id?.substring(0, 8) || '',
      complaint.name || '',
      complaint.aadharNumber || '',
      complaint.mobileNumber || '',
      complaint.caseCategory || '',
      complaint.status || '',
      complaint.incidentDate ? new Date(complaint.incidentDate).toLocaleDateString() : ''
    ])
    
    autoTable(doc, {
      startY: finalY + 14,
      head: [['ID', 'Name', 'Aadhar', 'Mobile', 'Category', 'Status', 'Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [26, 35, 126] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    })
    
    // Save PDF
    doc.save(`complaints-report-${new Date().toISOString().split('T')[0]}.pdf`)
    setShowExportMenu(false)
  }

  const exportReport = () => {
    const reportData = {
      totalComplaints: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      solved: complaints.filter((c) => c.status === 'solved').length,
      financial: complaints.filter((c) => c.caseCategory === 'Financial').length,
      social: complaints.filter((c) => c.caseCategory === 'Social').length,
      totalUsers: users.length,
      generatedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Reports & Statistics</h1>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            <FaDownload /> Export Report <FaChevronDown className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card border-l-4 border-blue-500">
          <div className="text-sm text-gray-600 mb-1">Total Complaints</div>
          <div className="text-3xl font-bold text-gray-900">{complaints.length}</div>
        </div>
        <div className="card border-l-4 border-green-500">
          <div className="text-sm text-gray-600 mb-1">Solved</div>
          <div className="text-3xl font-bold text-gray-900">
            {complaints.filter((c) => c.status === 'solved').length}
          </div>
        </div>
        <div className="card border-l-4 border-orange-500">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-gray-900">
            {complaints.filter((c) => c.status === 'pending').length}
          </div>
        </div>
        <div className="card border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Resolution Rate</div>
          <div className="text-3xl font-bold text-gray-900">
            {complaints.length > 0
              ? Math.round((complaints.filter((c) => c.status === 'solved').length / complaints.length) * 100)
              : 0}
            %
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Chart */}
        <div className="card">
          <h3 className="text-xl font-semibold text-primary mb-6">Complaints by Category</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3 className="text-xl font-semibold text-primary mb-6">Status Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card lg:col-span-2">
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
        <div className="card lg:col-span-2">
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
    </div>
  )
}

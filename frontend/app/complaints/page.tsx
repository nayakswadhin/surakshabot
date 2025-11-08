'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchComplaints, updateComplaintStatus, fetchUsers } from '@/lib/api'
import { format } from 'date-fns'
import { FaEye, FaEdit, FaSearch, FaFilter } from 'react-icons/fa'

interface Complaint {
  _id: string
  caseId: string
  aadharNumber: string
  incidentDescription: string
  caseCategory: string
  typeOfFraud: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function ComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [complaints, searchTerm, statusFilter, categoryFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [complaintsData, usersData] = await Promise.all([
        fetchComplaints(),
        fetchUsers(),
      ])

      // Create users map
      const map: Record<string, any> = {}
      usersData.forEach((user: any) => {
        map[user.aadharNumber] = user
      })
      setUsersMap(map)
      setComplaints(complaintsData)
      setFilteredComplaints(complaintsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...complaints]

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.caseId?.toLowerCase().includes(search) ||
          c.typeOfFraud?.toLowerCase().includes(search) ||
          c.aadharNumber?.includes(search) ||
          usersMap[c.aadharNumber]?.name?.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((c) => c.caseCategory === categoryFilter)
    }

    setFilteredComplaints(filtered)
    setCurrentPage(1)
  }

  const handleViewDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setShowModal(true)
  }

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedComplaint) return

    try {
      await updateComplaintStatus(selectedComplaint._id, { status: newStatus })
      await loadData()
      setShowModal(false)
      alert('Status updated successfully!')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentComplaints = filteredComplaints.slice(startIndex, endIndex)

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
        <h1 className="text-3xl font-bold text-primary">All Complaints</h1>
        <div className="text-sm text-gray-600">
          Total: {filteredComplaints.length} complaints
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Case ID, Name, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="solved">Solved</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Categories</option>
              <option value="Financial">Financial</option>
              <option value="Social">Social Media</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Case ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">User Details</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Fraud Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No complaints found matching your filters
                  </td>
                </tr>
              ) : (
                currentComplaints.map((complaint) => {
                  const user = usersMap[complaint.aadharNumber]
                  return (
                    <tr key={complaint._id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/complaints/${complaint.caseId}`)}
                          className="font-medium text-primary hover:text-primary-dark hover:underline"
                        >
                          {complaint.caseId}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{user?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user?.phoneNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{complaint.typeOfFraud}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {complaint.caseCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            complaint.status === 'solved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {complaint.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/complaints/${complaint.caseId}`)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-4 border-t">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 border rounded-lg ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-primary">Complaint Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Case Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-600">Case ID</div>
                  <div className="text-lg font-medium">{selectedComplaint.caseId}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Status</div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedComplaint.status === 'solved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {selectedComplaint.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-600">Category</div>
                  <div className="text-lg">{selectedComplaint.caseCategory}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Fraud Type</div>
                  <div className="text-lg">{selectedComplaint.typeOfFraud}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600">User Details</div>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Name: {usersMap[selectedComplaint.aadharNumber]?.name || 'N/A'}</div>
                    <div>Phone: {usersMap[selectedComplaint.aadharNumber]?.phoneNumber || 'N/A'}</div>
                    <div>Email: {usersMap[selectedComplaint.aadharNumber]?.emailid || 'N/A'}</div>
                    <div>District: {usersMap[selectedComplaint.aadharNumber]?.address?.district || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-gray-600">Incident Description</div>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  {selectedComplaint.incidentDescription}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-600">Created On</div>
                  <div>{format(new Date(selectedComplaint.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-600">Last Updated</div>
                  <div>{format(new Date(selectedComplaint.updatedAt), 'dd/MM/yyyy HH:mm')}</div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
              >
                Close
              </button>
              {selectedComplaint.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus('solved')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Mark as Solved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

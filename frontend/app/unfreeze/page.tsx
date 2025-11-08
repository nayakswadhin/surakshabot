'use client'

import { useEffect, useState } from 'react'
import { fetchUnfreezeInquiries } from '@/lib/api'
import { format } from 'date-fns'
import { 
  FaSearch, 
  FaEye, 
  FaUniversity, 
  FaMapMarkerAlt, 
  FaCalendar,
  FaShieldAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaCreditCard,
  FaFilter
} from 'react-icons/fa'

interface UnfreezeInquiry {
  _id: string
  inquiryId: string
  userDetails: {
    name: string
    phone: string
    currentState: string
  }
  accountDetails: {
    bankName: string
    accountNumber: string
    accountHolderName: string
    freezeCity: string
    freezeState: string
    frozenByStatePolice: string
    freezeDate: Date
    reasonByBank: string
    transactionId: string
  }
  providedContacts: {
    state: string
    nodalOfficer: {
      name: string
      rank: string
      email: string
    }
    grievanceOfficer: {
      name: string
      rank: string
      contact: string
      email: string
    }
  }
  status: string
  createdAt: Date
}

export default function UnfreezePage() {
  const [inquiries, setInquiries] = useState<UnfreezeInquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<UnfreezeInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<UnfreezeInquiry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filterState, setFilterState] = useState('')
  const [filterBank, setFilterBank] = useState('')
  const [filterFrozenBy, setFilterFrozenBy] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 15

  // Get unique states and banks for filters
  const uniqueStates = Array.from(new Set(inquiries.map(i => i.accountDetails.freezeState))).sort()
  const uniqueBanks = Array.from(new Set(inquiries.map(i => i.accountDetails.bankName))).sort()
  const uniqueFrozenByStates = Array.from(new Set(inquiries.map(i => i.accountDetails.frozenByStatePolice))).sort()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [inquiries, searchTerm, filterState, filterBank, filterFrozenBy])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await fetchUnfreezeInquiries()
      setInquiries(data)
      setFilteredInquiries(data)
    } catch (error) {
      console.error('Error loading unfreeze inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = inquiries

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (inquiry) =>
          inquiry.inquiryId?.toLowerCase().includes(search) ||
          inquiry.userDetails?.name?.toLowerCase().includes(search) ||
          inquiry.accountDetails?.accountNumber?.includes(search) ||
          inquiry.userDetails?.phone?.includes(search) ||
          inquiry.accountDetails?.bankName?.toLowerCase().includes(search)
      )
    }

    // State filter
    if (filterState) {
      filtered = filtered.filter(i => i.accountDetails.freezeState === filterState)
    }

    // Bank filter
    if (filterBank) {
      filtered = filtered.filter(i => i.accountDetails.bankName === filterBank)
    }

    // Frozen by state filter
    if (filterFrozenBy) {
      filtered = filtered.filter(i => i.accountDetails.frozenByStatePolice === filterFrozenBy)
    }

    setFilteredInquiries(filtered)
    setCurrentPage(1)
  }

  const handleViewInquiry = (inquiry: UnfreezeInquiry) => {
    setSelectedInquiry(inquiry)
    setShowModal(true)
  }

  const clearFilters = () => {
    setFilterState('')
    setFilterBank('')
    setFilterFrozenBy('')
    setSearchTerm('')
  }

  // Pagination
  const totalPages = Math.ceil(filteredInquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentInquiries = filteredInquiries.slice(startIndex, endIndex)

  // Statistics
  const stats = {
    total: inquiries.length,
    filtered: filteredInquiries.length,
    uniqueStates: uniqueStates.length,
    uniqueBanks: uniqueBanks.length,
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
        <div>
          <h1 className="text-3xl font-bold text-primary">Account Unfreeze Inquiries</h1>
          <p className="text-gray-600 mt-1">Manage and track frozen account inquiries</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{stats.filtered}</div>
          <div className="text-sm text-gray-600">Total Inquiries</div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-blue-100 mt-1">Total Records</div>
            </div>
            <FaShieldAlt className="text-5xl opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.uniqueStates}</div>
              <div className="text-green-100 mt-1">States Covered</div>
            </div>
            <FaMapMarkerAlt className="text-5xl opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.uniqueBanks}</div>
              <div className="text-purple-100 mt-1">Banks Involved</div>
            </div>
            <FaUniversity className="text-5xl opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{stats.filtered}</div>
              <div className="text-orange-100 mt-1">Showing Results</div>
            </div>
            <FaFilter className="text-5xl opacity-20" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card space-y-4">
        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search by Inquiry ID, Name, Phone, Account Number, or Bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
              showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Registered State
              </label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name
              </label>
              <select
                value={filterBank}
                onChange={(e) => setFilterBank(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Banks</option>
                {uniqueBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frozen By State Police
              </label>
              <select
                value={filterFrozenBy}
                onChange={(e) => setFilterFrozenBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All States</option>
                {uniqueFrozenByStates.map((state) => (
                  <option key={state} value={state}>
                    {state} Police
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inquiries Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">Inquiry ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">User Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Account Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Bank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Account State</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Frozen By</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Freeze Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentInquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No inquiries found matching your filters
                  </td>
                </tr>
              ) : (
                currentInquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-medium text-blue-600">
                        {inquiry.inquiryId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{inquiry.userDetails.name}</div>
                      <div className="text-sm text-gray-500">{inquiry.userDetails.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm">
                        {inquiry.accountDetails.accountNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{inquiry.accountDetails.bankName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <FaMapMarkerAlt />
                        {inquiry.userDetails.currentState}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        <FaShieldAlt />
                        {inquiry.accountDetails.freezeState}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(inquiry.accountDetails.freezeDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewInquiry(inquiry)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
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

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page
              if (totalPages <= 5) {
                page = i + 1
              } else if (currentPage <= 3) {
                page = i + 1
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i
              } else {
                page = currentPage - 2 + i
              }
              return (
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
              )
            })}

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

      {/* Inquiry Details Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Account Unfreeze Inquiry Details</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Inquiry ID: {selectedInquiry.inquiryId}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded"></span>
                  User Information
                </h4>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-primary text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">Name</div>
                      <div className="font-medium">{selectedInquiry.userDetails.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-primary text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium">{selectedInquiry.userDetails.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-primary text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">User Lives In</div>
                      <div className="font-medium">{selectedInquiry.userDetails.currentState}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded"></span>
                  Account Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaUniversity className="text-blue-600 text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">Bank Name</div>
                      <div className="font-medium">{selectedInquiry.accountDetails.bankName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCreditCard className="text-blue-600 text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">Account Number</div>
                      <div className="font-mono font-medium">{selectedInquiry.accountDetails.accountNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUser className="text-blue-600 text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">Account Holder</div>
                      <div className="font-medium">{selectedInquiry.accountDetails.accountHolderName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-blue-600 text-xl" />
                    <div>
                      <div className="text-sm text-gray-600">Account Registered State</div>
                      <div className="font-medium">{selectedInquiry.accountDetails.freezeState}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Freeze Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-red-600 rounded"></span>
                  Freeze Information
                </h4>
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <FaShieldAlt className="text-red-600 text-xl mt-1" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">Account Frozen By</div>
                      <div className="font-bold text-red-700 text-lg">
                        {selectedInquiry.accountDetails.frozenByStatePolice} POLICE
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Freeze City</div>
                      <div className="font-medium">{selectedInquiry.accountDetails.freezeCity}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FaCalendar /> Freeze Date
                      </div>
                      <div className="font-medium">
                        {format(new Date(selectedInquiry.accountDetails.freezeDate), 'dd MMM yyyy')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Transaction ID</div>
                      <div className="font-mono text-sm">{selectedInquiry.accountDetails.transactionId}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Reason for Freeze</div>
                    <div className="font-medium text-red-800 bg-red-100 px-3 py-2 rounded mt-1">
                      {selectedInquiry.accountDetails.reasonByBank}
                    </div>
                  </div>
                </div>
              </div>

              {/* Police Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-green-600 rounded"></span>
                  Police Contact Information - {selectedInquiry.providedContacts.state}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {/* Nodal Officer */}
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-green-700 mb-3">
                      👨‍✈️ Nodal Cyber Cell Officer
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-600">Name & Rank</div>
                        <div className="font-medium text-sm">
                          {selectedInquiry.providedContacts.nodalOfficer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedInquiry.providedContacts.nodalOfficer.rank}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-green-600" />
                        <a
                          href={`mailto:${selectedInquiry.providedContacts.nodalOfficer.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedInquiry.providedContacts.nodalOfficer.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Grievance Officer */}
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                    <div className="text-sm font-semibold text-green-700 mb-3">
                      👨‍⚖️ Grievance Redressal Officer
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs text-gray-600">Name & Rank</div>
                        <div className="font-medium text-sm">
                          {selectedInquiry.providedContacts.grievanceOfficer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {selectedInquiry.providedContacts.grievanceOfficer.rank}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaPhone className="text-green-600" />
                        <a
                          href={`tel:${selectedInquiry.providedContacts.grievanceOfficer.contact}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedInquiry.providedContacts.grievanceOfficer.contact}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FaEnvelope className="text-green-600" />
                        <a
                          href={`mailto:${selectedInquiry.providedContacts.grievanceOfficer.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedInquiry.providedContacts.grievanceOfficer.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gray-600 rounded"></span>
                  Inquiry Metadata
                </h4>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                  <div>
                    <div className="text-xs text-gray-600">Status</div>
                    <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {selectedInquiry.status}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Created On</div>
                    <div className="font-medium mt-1">
                      {format(new Date(selectedInquiry.createdAt), 'dd MMM yyyy, HH:mm')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Inquiry ID</div>
                    <div className="font-mono font-medium mt-1 text-xs">
                      {selectedInquiry.inquiryId}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
              >
                Print Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

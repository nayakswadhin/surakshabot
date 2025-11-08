'use client'

import { useEffect, useState } from 'react'
import { fetchUsers, fetchComplaints } from '@/lib/api'
import { format } from 'date-fns'
import { FaSearch, FaEye, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { useTranslation } from '@/hooks/useTranslation'

export default function UsersPage() {
  const { t, currentLanguage } = useTranslation()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [casesMap, setCasesMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Translations
  const [translations, setTranslations] = useState({
    registeredUsers: 'Registered Users',
    total: 'Total',
    users: 'users',
    searchPlaceholder: 'Search by name, phone, email, Aadhar, or district...',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    district: 'District',
    totalCases: 'Total Cases',
    registeredOn: 'Registered On',
    actions: 'Actions',
    view: 'View',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setTranslations({
      registeredUsers: t('Registered Users'),
      total: t('Total'),
      users: t('users'),
      searchPlaceholder: t('Search by name, phone, email, Aadhar, or district...'),
      name: t('Name'),
      phone: t('Phone'),
      email: t('Email'),
      district: t('District'),
      totalCases: t('Total Cases'),
      registeredOn: t('Registered On'),
      actions: t('Actions'),
      view: t('View'),
    })
  }, [currentLanguage, t])

  useEffect(() => {
    applySearch()
  }, [users, searchTerm])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersData, complaintsData] = await Promise.all([
        fetchUsers(),
        fetchComplaints(),
      ])

      // Count cases per user
      const map: Record<string, number> = {}
      complaintsData.forEach((complaint: any) => {
        const aadhar = complaint.aadharNumber
        map[aadhar] = (map[aadhar] || 0) + 1
      })
      setCasesMap(map)

      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const applySearch = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const search = searchTerm.toLowerCase()
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(search) ||
        user.phoneNumber?.includes(search) ||
        user.emailid?.toLowerCase().includes(search) ||
        user.aadharNumber?.includes(search) ||
        user.address?.district?.toLowerCase().includes(search)
    )
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }

  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

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
        <h1 className="text-3xl font-bold text-primary">{translations.registeredUsers}</h1>
        <div className="text-sm text-gray-600">
          {translations.total}: {filteredUsers.length} {translations.users}
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            type="text"
            placeholder={translations.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.name}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.phone}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.email}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.district}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.totalCases}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.registeredOn}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">{translations.actions}</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your search
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => {
                  // Translate user name
                  const translatedName = t(user.name)
                  return (
                  <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{translatedName}</td>
                    <td className="px-6 py-4">{user.phoneNumber}</td>
                    <td className="px-6 py-4 text-sm">{user.emailid}</td>
                    <td className="px-6 py-4">{user.address?.district || t('N/A')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                        {casesMap[user.aadharNumber] || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                      >
                        <FaEye /> {translations.view}
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

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-primary">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded"></span>
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Full Name</div>
                    <div className="font-medium">{t(selectedUser.name)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Father/Spouse/Guardian</div>
                    <div className="font-medium">{selectedUser.fatherSpouseGuardianName ? t(selectedUser.fatherSpouseGuardianName) : t('N/A')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Gender</div>
                    <div className="font-medium">{selectedUser.gender}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Date of Birth</div>
                    <div className="font-medium">
                      {format(new Date(selectedUser.dob), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Aadhar Number</div>
                    <div className="font-medium">{selectedUser.aadharNumber}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded"></span>
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Phone</div>
                      <div className="font-medium">{selectedUser.phoneNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-primary" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="font-medium">{selectedUser.emailid}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded"></span>
                  Address Details
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-primary mt-1" />
                    <div className="flex-1">
                      <div className="font-medium">{selectedUser.address?.village}, {selectedUser.address?.area}</div>
                      <div className="text-sm text-gray-600">
                        {selectedUser.address?.district}, PIN: {selectedUser.address?.pincode}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Post Office: {selectedUser.address?.postOffice}
                      </div>
                      <div className="text-sm text-gray-600">
                        Police Station: {selectedUser.address?.policeStation}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded"></span>
                  User Statistics
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {casesMap[selectedUser.aadharNumber] || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Cases</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedUser.freeze ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Account Frozen</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">
                      {format(new Date(selectedUser.createdAt), 'dd/MM/yy')}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Registered On</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

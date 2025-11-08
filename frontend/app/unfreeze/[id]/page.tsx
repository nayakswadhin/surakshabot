'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchUnfreezeInquiryById } from '@/lib/api'
import { format } from 'date-fns'
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaUniversity,
  FaShieldAlt,
  FaCreditCard,
  FaInfoCircle,
  FaEnvelope,
} from 'react-icons/fa'

export default function UnfreezeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inquiryId = params.id as string

  const [loading, setLoading] = useState(true)
  const [inquiry, setInquiry] = useState<any>(null)

  useEffect(() => {
    loadInquiryDetails()
  }, [inquiryId])

  const loadInquiryDetails = async () => {
    try {
      setLoading(true)
      const data = await fetchUnfreezeInquiryById(inquiryId)
      setInquiry(data)
    } catch (error) {
      console.error('Error loading inquiry:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600 mb-4">Unfreeze inquiry not found</p>
        <button
          onClick={() => router.push('/unfreeze')}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Back to Unfreeze Complaints
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/unfreeze')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="text-xl text-primary" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-primary">Unfreeze Inquiry Details</h1>
          <p className="text-gray-600">Inquiry ID: {inquiry.inquiryId}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <FaUser /> User Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaUser className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-semibold">{inquiry.userDetails.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaPhone className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-semibold">{inquiry.userDetails.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaMapMarkerAlt className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Current State (User Location)</div>
                  <div className="font-semibold">{inquiry.userDetails.currentState}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <FaUniversity /> Account & Freeze Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaUniversity className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Bank Name</div>
                  <div className="font-semibold">{inquiry.accountDetails.bankName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaCreditCard className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Account Number</div>
                  <div className="font-semibold font-mono">{inquiry.accountDetails.accountNumber}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaUser className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Account Holder Name</div>
                  <div className="font-semibold">{inquiry.accountDetails.accountHolderName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <FaMapMarkerAlt className="text-blue-600 text-xl" />
                <div>
                  <div className="text-sm text-blue-600">Bank Branch State (Account Registered)</div>
                  <div className="font-semibold text-blue-900">{inquiry.accountDetails.freezeState}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <FaShieldAlt className="text-red-600 text-xl" />
                <div>
                  <div className="text-sm text-red-600">Frozen By State Police</div>
                  <div className="font-semibold text-red-900">{inquiry.accountDetails.frozenByStatePolice}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaCalendar className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Freeze Date</div>
                  <div className="font-semibold">
                    {format(new Date(inquiry.accountDetails.freezeDate), 'dd/MM/yyyy')}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <FaInfoCircle className="text-yellow-600 text-xl mt-1" />
                <div>
                  <div className="text-sm text-yellow-600 mb-1">Reason by Bank</div>
                  <div className="font-semibold text-gray-900">{inquiry.accountDetails.reasonByBank}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <FaInfoCircle className="text-primary text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Transaction ID</div>
                  <div className="font-semibold font-mono">{inquiry.accountDetails.transactionId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Provided Contacts */}
          {inquiry.providedContacts && (
            <div className="card bg-gradient-to-br from-primary to-secondary text-white">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <FaShieldAlt /> State Contacts Provided
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                  <div className="text-sm opacity-90 mb-1">State</div>
                  <div className="font-bold text-lg">{inquiry.providedContacts.state}</div>
                </div>

                {inquiry.providedContacts.nodalOfficer && (
                  <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <div className="text-sm opacity-90 mb-2">Nodal Officer</div>
                    <div className="space-y-1">
                      <div className="font-semibold">{inquiry.providedContacts.nodalOfficer.name}</div>
                      <div className="text-sm">{inquiry.providedContacts.nodalOfficer.rank}</div>
                      <div className="text-sm flex items-center gap-2 mt-2">
                        <FaEnvelope className="text-sm" />
                        {inquiry.providedContacts.nodalOfficer.email}
                      </div>
                    </div>
                  </div>
                )}

                {inquiry.providedContacts.grievanceOfficer && (
                  <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <div className="text-sm opacity-90 mb-2">Grievance Officer</div>
                    <div className="space-y-1">
                      <div className="font-semibold">{inquiry.providedContacts.grievanceOfficer.name}</div>
                      <div className="text-sm">{inquiry.providedContacts.grievanceOfficer.rank}</div>
                      <div className="text-sm flex items-center gap-2 mt-2">
                        <FaPhone className="text-sm" />
                        {inquiry.providedContacts.grievanceOfficer.contact}
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <FaEnvelope className="text-sm" />
                        {inquiry.providedContacts.grievanceOfficer.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Info */}
          <div className="card">
            <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
              <FaInfoCircle /> Inquiry Status
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Status</div>
                <div className="font-semibold capitalize">{inquiry.status || 'Pending'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Created At</div>
                <div className="font-semibold">
                  {format(new Date(inquiry.createdAt), 'dd/MM/yyyy HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

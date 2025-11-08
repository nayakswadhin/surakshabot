'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchComplaintById, updateComplaintStatus, sendWhatsAppMessage } from '@/lib/api'
import toast, { Toaster } from 'react-hot-toast'
import {
  FaArrowLeft,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaCalendar,
  FaFileAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaSave,
  FaTimes,
  FaImage,
  FaHistory,
} from 'react-icons/fa'

export default function ComplaintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const caseId = params.id as string

  const [loading, setLoading] = useState(true)
  const [complaint, setComplaint] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [remarks, setRemarks] = useState('')
  const [priority, setPriority] = useState('')
  const [updatedBy, setUpdatedBy] = useState('Admin')
  const [updating, setUpdating] = useState(false)
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    loadComplaintDetails()
  }, [caseId])

  const loadComplaintDetails = async () => {
    try {
      setLoading(true)
      const data = await fetchComplaintById(caseId)
      if (data) {
        setComplaint(data.complaint)
        setUser(data.user)
        setNewStatus(data.complaint.status)
        setPriority(data.complaint.priority || 'medium')
      }
    } catch (error) {
      console.error('Error loading complaint:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Please select a status')
      return
    }

    try {
      setUpdating(true)
      
      // Optimistically update UI
      const oldComplaint = { ...complaint }
      const newHistoryEntry = {
        status: newStatus,
        remarks,
        updatedBy,
        updatedAt: new Date().toISOString()
      }
      
      setComplaint({
        ...complaint,
        status: newStatus,
        priority,
        statusHistory: [...(complaint.statusHistory || []), newHistoryEntry]
      })
      
      // Show loading toast
      const loadingToast = toast.loading('Updating status...')
      
      // Make API call
      await updateComplaintStatus(caseId, {
        status: newStatus,
        remarks,
        updatedBy,
        priority,
      })
      
      // Reload fresh data from server
      await loadComplaintDetails()
      
      // Success
      toast.success('Status updated successfully!', { id: loadingToast })
      setIsEditingStatus(false)
      setRemarks('')
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
      // Reload to get correct state
      await loadComplaintDetails()
    } finally {
      setUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock },
      solved: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaExclamationCircle },
      investigating: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FaExclamationCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimes },
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${badge.bg} ${badge.text} font-semibold`}>
        <Icon /> {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      low: { bg: 'bg-gray-100', text: 'text-gray-800' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800' },
      urgent: { bg: 'bg-red-100', text: 'text-red-800' },
    }
    const badge = badges[priority] || badges.medium
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full ${badge.bg} ${badge.text} text-sm font-semibold`}>
        {priority.toUpperCase()}
      </span>
    )
  }

  // Quick Action Handlers
  const handleCallUser = () => {
    if (user?.phoneNumber) {
      window.location.href = `tel:${user.phoneNumber}`
    } else {
      toast.error('Phone number not available')
    }
  }

  const handleSendEmail = () => {
    if (user?.emailid) {
      const subject = encodeURIComponent(`Regarding Complaint ${complaint?.caseId}`)
      const body = encodeURIComponent(
        `Dear ${user.name},\n\nRegarding your cyber crime complaint (Case ID: ${complaint?.caseId}).\n\nStatus: ${complaint?.status}\nCategory: ${complaint?.caseCategory}\nType: ${complaint?.typeOfFraud}\n\n` +
        `We are writing to inform you about the progress of your complaint.\n\n` +
        `Best regards,\n1930 Cyber Helpline, India`
      )
      // Direct mailto link opens email client
      const mailtoLink = document.createElement('a')
      mailtoLink.href = `mailto:${user.emailid}?subject=${subject}&body=${body}`
      mailtoLink.click()
    } else {
      toast.error('Email address not available')
    }
  }

  const handleSendWhatsApp = async () => {
    if (!user?.phoneNumber) {
      toast.error('Phone number not available')
      return
    }

    const message = 
      `Hello ${user.name},\n\n` +
      `This is regarding your cyber crime complaint.\n\n` +
      `📋 Case ID: ${complaint?.caseId}\n` +
      `📊 Status: ${complaint?.status}\n` +
      `📁 Category: ${complaint?.caseCategory}\n` +
      `🔍 Type: ${complaint?.typeOfFraud}\n\n` +
      `We will keep you updated on the progress.\n\n` +
      `If you have any questions, please reply to this message.`

    try {
      setSendingWhatsApp(true)
      const loadingToast = toast.loading('Sending WhatsApp message...')

      // Send via WhatsApp Business API
      const result = await sendWhatsAppMessage(
        user.phoneNumber,
        message,
        complaint?.caseId
      )

      if (result.success) {
        toast.success('WhatsApp message sent successfully!', { id: loadingToast })
      } else {
        throw new Error(result.error || 'Failed to send message')
      }
    } catch (error: any) {
      console.error('Error sending WhatsApp:', error)
      toast.error(`Failed to send WhatsApp: ${error.message || 'Unknown error'}`)
    } finally {
      setSendingWhatsApp(false)
    }
  }

  const handlePrintReport = () => {
    window.print()
  }

  if (loading) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        </div>
      </>
    )
  }

  if (!complaint) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Complaint not found</p>
          <button
            onClick={() => router.push('/complaints')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Back to Complaints
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Print-only Header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold">SurakshaBot - 1930 Cyber Helpline, India</h1>
          <p className="text-sm text-gray-600">Cyber Crime Complaint Report</p>
          <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
        </div>

      {/* Header */}
      <div className="flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/complaints')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-xl text-primary" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-primary">Complaint Details</h1>
            <p className="text-gray-600">Case ID: {complaint.caseId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getPriorityBadge(complaint.priority || 'medium')}
          {getStatusBadge(complaint.status)}
        </div>
      </div>

      {/* Print-only Case ID */}
      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-bold">Case ID: {complaint.caseId}</h2>
        <p className="text-sm">Status: {complaint.status} | Priority: {complaint.priority || 'medium'}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Information */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                <FaFileAlt /> Complaint Information
              </h3>
              <button
                onClick={() => setIsEditingStatus(!isEditingStatus)}
                className="no-print inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FaEdit /> Update Status
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Category</div>
                <div className="font-semibold text-gray-900">{complaint.caseCategory}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Type of Fraud</div>
                <div className="font-semibold text-gray-900">{complaint.typeOfFraud}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Incident Description</div>
                <div className="font-semibold text-gray-900">{complaint.incidentDescription}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Created At</div>
                <div className="font-semibold text-gray-900">
                  {new Date(complaint.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                <div className="font-semibold text-gray-900">
                  {new Date(complaint.updatedAt).toLocaleString()}
                </div>
              </div>

              {complaint.remarks && (
                <div className="p-4 bg-yellow-50 rounded-lg md:col-span-2 border-l-4 border-yellow-500">
                  <div className="text-sm text-gray-600 mb-1">Latest Remarks</div>
                  <div className="font-semibold text-gray-900">{complaint.remarks}</div>
                </div>
              )}
            </div>
          </div>

          {/* Status Update Form */}
          {isEditingStatus && (
            <div className="card bg-blue-50 border-2 border-blue-200 no-print">
              <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                <FaEdit /> Update Status
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="investigating">Investigating</option>
                      <option value="solved">Solved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks / Notes
                  </label>
                  <textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Add any remarks or notes about this status change..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Updated By
                  </label>
                  <input
                    type="text"
                    value={updatedBy}
                    onChange={(e) => setUpdatedBy(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your name or officer ID"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setIsEditingStatus(false)
                      setRemarks('')
                      setNewStatus(complaint.status)
                      setPriority(complaint.priority || 'medium')
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    <FaTimes className="inline mr-2" /> Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
                  >
                    <FaSave className="inline mr-2" />
                    {updating ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status History */}
          {complaint.statusHistory && complaint.statusHistory.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <FaHistory /> Status History
              </h3>

              <div className="space-y-4">
                {[...complaint.statusHistory]
                  .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .map((history: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-primary">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(history.status)}
                        <span className="text-sm text-gray-600">
                          {new Date(history.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      {history.remarks && (
                        <p className="text-gray-700 mb-2">{history.remarks}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Updated by: <span className="font-semibold">{history.updatedBy || 'Admin'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence/Photos */}
          {complaint.caseDetailsId?.photos && complaint.caseDetailsId.photos.length > 0 && (
            <div className="card print:page-break-before">
              <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <FaImage className="no-print" /> Evidence & Attachments
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-2 print:gap-6">
                {complaint.caseDetailsId.photos.map((photo: any, index: number) => (
                  <div
                    key={index}
                    className="relative group print:static"
                  >
                    <img
                      src={photo.url}
                      alt={photo.fileName || `Evidence ${index + 1}`}
                      onClick={() => setSelectedImage(photo.url)}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 group-hover:border-primary transition-colors cursor-pointer print:cursor-default print:h-auto print:max-h-80 print:object-contain print:border-black print:rounded-none"
                      style={{ colorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' } as any}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-opacity flex items-center justify-center no-print">
                      <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">
                        Click to view
                      </span>
                    </div>
                    {photo.fileName && (
                      <p className="text-xs text-gray-600 mt-2 truncate print:text-sm print:text-black print:font-medium print:text-center">
                        {photo.fileName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Right Side (1 column) */}
        <div className="space-y-6">
          {/* User Information */}
          {user && (
            <div className="card">
              <h3 className="text-xl font-semibold text-primary mb-6 flex items-center gap-2">
                <FaUser /> User Information
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUser className="text-primary text-xl" />
                  <div>
                    <div className="text-sm text-gray-600">Name</div>
                    <div className="font-semibold">{user.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaUser className="text-primary text-xl" />
                  <div>
                    <div className="text-sm text-gray-600">Father/Guardian</div>
                    <div className="font-semibold">{user.fatherSpouseGuardianName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaPhone className="text-primary text-xl" />
                  <div>
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-semibold">{user.phoneNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaEnvelope className="text-primary text-xl" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-semibold text-sm">{user.emailid}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaIdCard className="text-primary text-xl" />
                  <div>
                    <div className="text-sm text-gray-600">Aadhar Number</div>
                    <div className="font-semibold">{user.aadharNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FaCalendar className="text-primary text-xl" />
                  <div>
                    <div className="text-sm text-gray-600">Date of Birth</div>
                    <div className="font-semibold">
                      {new Date(user.dob).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-primary text-xl">👤</div>
                  <div>
                    <div className="text-sm text-gray-600">Gender</div>
                    <div className="font-semibold">{user.gender}</div>
                  </div>
                </div>

                {user.address && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <FaMapMarkerAlt className="text-primary text-xl mt-1" />
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Address</div>
                      <div className="font-semibold text-sm space-y-1">
                        <div>{user.address.village}</div>
                        <div>{user.address.area}</div>
                        <div>{user.address.postOffice}</div>
                        <div>{user.address.policeStation}</div>
                        <div>{user.address.district}</div>
                        <div>PIN: {user.address.pincode}</div>
                      </div>
                    </div>
                  </div>
                )}

                {user.freeze && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <div className="text-red-800 font-semibold">⚠️ Account Frozen</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card bg-gradient-to-br from-primary to-secondary text-white no-print">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleCallUser}
                disabled={!user?.phoneNumber}
                className="w-full py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                📞 Call User
              </button>
              <button 
                onClick={handleSendEmail}
                disabled={!user?.emailid}
                className="w-full py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                📧 Send Email
              </button>
              <button 
                onClick={handleSendWhatsApp}
                disabled={!user?.phoneNumber || sendingWhatsApp}
                className="w-full py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingWhatsApp ? '⏳ Sending...' : '📱 Send WhatsApp'}
              </button>
              <button 
                onClick={handlePrintReport}
                className="w-full py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2"
              >
                📄 Print Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
            >
              <FaTimes />
            </button>
            <img
              src={selectedImage}
              alt="Evidence"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      </div>
    </>
  )
}

import axios from 'axios'

// API Base URL - can be configured via environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard Stats
export const fetchDashboardStats = async () => {
  try {
    const [complaintsRes, usersRes] = await Promise.all([
      apiClient.get('/whatsapp/cases/all'),
      apiClient.get('/whatsapp/users/all'),
    ])

    const complaints = complaintsRes.data.data || []
    const users = usersRes.data.data || []

    const totalSolved = complaints.filter((c: any) => c.status === 'solved').length
    const totalPending = complaints.filter((c: any) => c.status === 'pending').length

    return {
      totalComplaints: complaints.length,
      totalSolved,
      totalPending,
      totalUsers: users.length,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalComplaints: 0,
      totalSolved: 0,
      totalPending: 0,
      totalUsers: 0,
    }
  }
}

// Fetch all complaints
export const fetchComplaints = async (filters?: {
  status?: string
  category?: string
  search?: string
}) => {
  try {
    const response = await apiClient.get('/whatsapp/cases/all')
    let complaints = response.data.data || []

    // Apply filters
    if (filters?.status) {
      complaints = complaints.filter((c: any) => c.status === filters.status)
    }
    if (filters?.category) {
      complaints = complaints.filter((c: any) => c.caseCategory === filters.category)
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      complaints = complaints.filter((c: any) =>
        c.caseId?.toLowerCase().includes(searchLower) ||
        c.typeOfFraud?.toLowerCase().includes(searchLower) ||
        c.aadharNumber?.includes(searchLower)
      )
    }

    return complaints
  } catch (error) {
    console.error('Error fetching complaints:', error)
    return []
  }
}

// Fetch single complaint by ID
export const fetchComplaintById = async (caseId: string) => {
  try {
    const response = await apiClient.get(`/whatsapp/case/${caseId}`)
    const data = response.data.data
    
    // Check if API returns new format with complaint and user properties
    if (data.complaint && data.user !== undefined) {
      return data
    }
    
    // Otherwise, API returns old format (case data directly)
    // Convert it to expected format by fetching user from /users/all
    const usersResponse = await apiClient.get('/whatsapp/users/all')
    const users = usersResponse.data.data
    const user = users.find((u: any) => u.aadharNumber === data.aadharNumber)
    
    return {
      complaint: data,
      user: user || null
    }
  } catch (error) {
    console.error('Error fetching complaint:', error)
    return null
  }
}

// Update complaint status
export const updateComplaintStatus = async (
  caseId: string,
  data: {
    status: string
    remarks?: string
    updatedBy?: string
    priority?: string
  }
) => {
  try {
    const response = await apiClient.patch(`/whatsapp/cases/${caseId}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating complaint status:', error)
    throw error
  }
}

// Fetch all users
export const fetchUsers = async (search?: string) => {
  try {
    const response = await apiClient.get('/whatsapp/users/all')
    let users = response.data.data || []

    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter((u: any) =>
        u.name?.toLowerCase().includes(searchLower) ||
        u.phoneNumber?.includes(searchLower) ||
        u.aadharNumber?.includes(searchLower) ||
        u.emailid?.toLowerCase().includes(searchLower)
      )
    }

    return users
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Fetch user by ID
export const fetchUserById = async (userId: string) => {
  try {
    const response = await apiClient.get(`/whatsapp/users/${userId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Fetch fraud type distribution
export const fetchFraudTypeDistribution = async () => {
  try {
    const response = await apiClient.get('/whatsapp/cases/all')
    const complaints = response.data.data || []

    // Count fraud types
    const distribution: Record<string, number> = {}
    complaints.forEach((complaint: any) => {
      const type = complaint.typeOfFraud || 'Unknown'
      distribution[type] = (distribution[type] || 0) + 1
    })

    // Convert to array and sort
    return Object.entries(distribution)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10
  } catch (error) {
    console.error('Error fetching fraud type distribution:', error)
    return []
  }
}

// Test API connection
export const testApiConnection = async () => {
  try {
    const response = await apiClient.get('/health')
    return response.data
  } catch (error) {
    console.error('API connection test failed:', error)
    throw error
  }
}

// Send WhatsApp message to user via chatbot
export const sendWhatsAppMessage = async (
  phoneNumber: string,
  message: string,
  caseId?: string
) => {
  try {
    const response = await apiClient.post('/whatsapp/send-message', {
      phoneNumber,
      message,
      caseId,
    })
    return response.data
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    throw error
  }
}

// Fetch heatmap data
export const fetchHeatmapData = async () => {
  try {
    const response = await apiClient.get('/whatsapp/heatmap-data')
    return response.data.data || []
  } catch (error) {
    console.error('Error fetching heatmap data:', error)
    return []
  }
}

// Fetch all unfreeze inquiries
export const fetchUnfreezeInquiries = async (filters?: {
  state?: string
  bank?: string
  search?: string
  frozenByState?: string
}) => {
  try {
    const response = await apiClient.get('/unfreeze/inquiries')
    let inquiries = response.data.data || []

    // Apply filters
    if (filters?.state) {
      inquiries = inquiries.filter((i: any) => 
        i.accountDetails?.freezeState?.toLowerCase() === filters.state.toLowerCase()
      )
    }
    if (filters?.bank) {
      inquiries = inquiries.filter((i: any) => 
        i.accountDetails?.bankName?.toLowerCase().includes(filters.bank.toLowerCase())
      )
    }
    if (filters?.frozenByState) {
      inquiries = inquiries.filter((i: any) => 
        i.accountDetails?.frozenByStatePolice?.toLowerCase() === filters.frozenByState.toLowerCase()
      )
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      inquiries = inquiries.filter((i: any) =>
        i.inquiryId?.toLowerCase().includes(searchLower) ||
        i.userDetails?.name?.toLowerCase().includes(searchLower) ||
        i.accountDetails?.accountNumber?.includes(searchLower) ||
        i.userDetails?.phone?.includes(searchLower)
      )
    }

    return inquiries
  } catch (error) {
    console.error('Error fetching unfreeze inquiries:', error)
    return []
  }
}

// Fetch single unfreeze inquiry by ID
export const fetchUnfreezeInquiryById = async (inquiryId: string) => {
  try {
    const response = await apiClient.get(`/unfreeze/inquiry/${inquiryId}`)
    return response.data.data
  } catch (error) {
    console.error('Error fetching unfreeze inquiry:', error)
    return null
  }
}

export default apiClient

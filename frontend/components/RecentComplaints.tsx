'use client'

import { useEffect, useState } from 'react'
import { fetchComplaints, fetchUsers } from '@/lib/api'
import { format } from 'date-fns'

export default function RecentComplaints() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [complaintsData, usersData] = await Promise.all([
        fetchComplaints(),
        fetchUsers(),
      ])

      // Create users map for quick lookup
      const map: Record<string, any> = {}
      usersData.forEach((user: any) => {
        map[user.aadharNumber] = user
      })
      setUsersMap(map)

      // Get recent 5 complaints
      setComplaints(complaintsData.slice(0, 5))
    } catch (error) {
      console.error('Error loading complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold text-primary mb-4">Recent Complaints</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-primary">Recent Complaints</h3>
        <a href="/complaints" className="text-primary hover:underline font-medium">
          View All →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Case ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">User Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Fraud Type</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => {
                const user = usersMap[complaint.aadharNumber]
                return (
                  <tr key={complaint._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{complaint.caseId}</td>
                    <td className="px-4 py-3">{user?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{complaint.typeOfFraud}</td>
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

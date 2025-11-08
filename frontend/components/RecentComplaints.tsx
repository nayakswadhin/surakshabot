'use client'

import { useEffect, useState } from 'react'
import { fetchComplaints, fetchUsers } from '@/lib/api'
import { format } from 'date-fns'
import { useTranslation } from '@/hooks/useTranslation'

export default function RecentComplaints() {
  const { t, currentLanguage } = useTranslation()
  const [complaints, setComplaints] = useState<any[]>([])
  const [usersMap, setUsersMap] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [translations, setTranslations] = useState({
    recentComplaints: 'Recent Complaints',
    viewAll: 'View All',
    caseId: 'Case ID',
    userName: 'User Name',
    fraudType: 'Fraud Type',
    status: 'Status',
    date: 'Date',
    noComplaintsFound: 'No complaints found',
    solved: 'SOLVED',
    pending: 'PENDING',
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setTranslations({
      recentComplaints: t('Recent Complaints'),
      viewAll: t('View All'),
      caseId: t('Case ID'),
      userName: t('User Name'),
      fraudType: t('Fraud Type'),
      status: t('Status'),
      date: t('Date'),
      noComplaintsFound: t('No complaints found'),
      solved: t('SOLVED'),
      pending: t('PENDING'),
    })
  }, [currentLanguage, t])

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
        <h3 className="text-xl font-semibold text-primary mb-4">{translations.recentComplaints}</h3>
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
        <h3 className="text-xl font-semibold text-primary">{translations.recentComplaints}</h3>
        <a href="/complaints" className="text-primary hover:underline font-medium">
          {translations.viewAll} →
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">{translations.caseId}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{translations.userName}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{translations.fraudType}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{translations.status}</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">{translations.date}</th>
            </tr>
          </thead>
          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {translations.noComplaintsFound}
                </td>
              </tr>
            ) : (
              complaints.map((complaint) => {
                const user = usersMap[complaint.aadharNumber]
                const statusText = complaint.status === 'solved' ? translations.solved : translations.pending
                // Translate fraud type
                const translatedFraudType = t(complaint.typeOfFraud)
                // Translate user name
                const translatedUserName = user?.name ? t(user.name) : t('N/A')
                return (
                  <tr key={complaint._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{complaint.caseId}</td>
                    <td className="px-4 py-3">{translatedUserName}</td>
                    <td className="px-4 py-3 text-sm">{translatedFraudType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          complaint.status === 'solved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {statusText}
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

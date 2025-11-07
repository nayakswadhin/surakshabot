'use client'

import { useEffect, useState } from 'react'
import { fetchComplaints } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'

export default function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const complaints = await fetchComplaints()

      // Convert to activities
      const recentActivities = complaints
        .slice(0, 10)
        .map((complaint: any) => ({
          id: complaint._id,
          title: `New ${complaint.caseCategory} fraud complaint registered`,
          subtitle: complaint.typeOfFraud,
          time: complaint.createdAt,
          status: complaint.status,
        }))

      setActivities(recentActivities)
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-primary mb-4">Recent Activity</h3>
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No recent activities</div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="border-l-4 border-primary bg-gray-50 p-4 rounded-r hover:bg-gray-100 transition-colors"
              >
                <div className="font-semibold text-gray-900 mb-1">{activity.title}</div>
                <div className="text-sm text-gray-600 mb-2">{activity.subtitle}</div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

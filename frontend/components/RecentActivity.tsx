'use client'

import { useEffect, useState } from 'react'
import { fetchComplaints } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { useTranslation } from '@/hooks/useTranslation'

// Helper function to translate time text
function translateTimeText(timeText: string, t: (text: string) => string): string {
  // Extract number and time unit from text like "2 days ago" or "about 3 hours ago"
  const patterns = [
    { regex: /(\d+)\s+days?\s+ago/, key: 'days ago' },
    { regex: /(\d+)\s+hours?\s+ago/, key: 'hours ago' },
    { regex: /(\d+)\s+minutes?\s+ago/, key: 'minutes ago' },
    { regex: /about\s+(\d+)\s+hours?\s+ago/, key: 'hours ago' },
    { regex: /about\s+(\d+)\s+minutes?\s+ago/, key: 'minutes ago' },
  ]
  
  for (const pattern of patterns) {
    const match = timeText.match(pattern.regex)
    if (match) {
      const number = match[1]
      const translatedUnit = t(pattern.key)
      return `${number} ${translatedUnit}`
    }
  }
  
  // Handle special cases
  if (timeText.includes('just now')) {
    return t('just now')
  }
  
  return timeText
}

export default function RecentActivity() {
  const { t, currentLanguage } = useTranslation()
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Recent Activity')
  const [noActivityText, setNoActivityText] = useState('No recent activities')

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    setTitle(t('Recent Activity'))
    setNoActivityText(t('No recent activities'))
  }, [currentLanguage, t])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const complaints = await fetchComplaints()

      // Convert to activities with original English text
      // Translation will happen in render
      const recentActivities = complaints
        .slice(0, 10)
        .map((complaint: any) => ({
          id: complaint._id,
          category: complaint.caseCategory, // Store category for translation
          fraudType: complaint.typeOfFraud, // Store fraud type for translation
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
      <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>
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
            <div className="text-center py-8 text-gray-500">{noActivityText}</div>
          ) : (
            activities.map((activity) => {
              // Translate the activity title
              const titleTemplate = `New ${activity.category} fraud complaint registered`
              const translatedTitle = t(titleTemplate)
              
              // Translate fraud type
              const translatedFraudType = t(activity.fraudType)
              
              // Translate time
              const timeText = formatDistanceToNow(new Date(activity.time), { addSuffix: true })
              const translatedTime = translateTimeText(timeText, t)
              
              return (
                <div
                  key={activity.id}
                  className="border-l-4 border-primary bg-gray-50 p-4 rounded-r hover:bg-gray-100 transition-colors"
                >
                  <div className="font-semibold text-gray-900 mb-1">{translatedTitle}</div>
                  <div className="text-sm text-gray-600 mb-2">{translatedFraudType}</div>
                  <div className="text-xs text-gray-500">{translatedTime}</div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

import { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: number
  icon: ReactNode
  color: 'blue' | 'green' | 'orange' | 'purple'
  loading?: boolean
  subtitle?: string
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-600',
  orange: 'bg-orange-500',
  purple: 'bg-purple-600',
}

export default function StatsCard({ title, value, icon, color, loading, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className={`${colorClasses[color]} text-white p-4 rounded-lg text-3xl`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
          )}
          <span className="text-xs text-gray-500 mt-1">{subtitle || `All time ${title.toLowerCase()}`}</span>
        </div>
      </div>
    </div>
  )
}

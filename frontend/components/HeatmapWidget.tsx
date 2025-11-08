'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, useLoadScript, HeatmapLayer, InfoWindow } from '@react-google-maps/api'
import { fetchHeatmapData } from '@/lib/api'
import { FaMapMarkedAlt, FaSpinner } from 'react-icons/fa'

const libraries: ('visualization')[] = ['visualization']

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '8px',
}

// Center of India
const center = {
  lat: 20.5937,
  lng: 78.9629,
}

interface HeatmapPoint {
  lat: number
  lng: number
  weight?: number
  caseId?: string
  fraudType?: string
  category?: string
  status?: string
  district?: string
  pincode?: string
  createdAt?: string
}

export default function HeatmapWidget() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  })

  const [heatmapData, setHeatmapData] = useState<google.maps.LatLng[]>([])
  const [rawData, setRawData] = useState<HeatmapPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<HeatmapPoint | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    financial: 0,
    social: 0,
    pending: 0,
    solved: 0,
  })

  useEffect(() => {
    loadHeatmapData()
  }, [])

  const loadHeatmapData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchHeatmapData()
      
      if (!data || data.length === 0) {
        setError('No location data available')
        setLoading(false)
        return
      }

      setRawData(data)

      // Calculate stats
      const newStats = {
        total: data.length,
        financial: data.filter((d: HeatmapPoint) => d.category === 'Financial').length,
        social: data.filter((d: HeatmapPoint) => d.category === 'Social').length,
        pending: data.filter((d: HeatmapPoint) => d.status === 'pending').length,
        solved: data.filter((d: HeatmapPoint) => d.status === 'solved').length,
      }
      setStats(newStats)

      // Convert to Google Maps LatLng objects with weights
      if (window.google) {
        const points = data.map((point: HeatmapPoint) => ({
          location: new window.google.maps.LatLng(point.lat, point.lng),
          weight: point.weight || 1,
        }))
        setHeatmapData(points as any)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error loading heatmap data:', err)
      setError('Failed to load heatmap data')
      setLoading(false)
    }
  }

  if (loadError) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaMapMarkedAlt className="text-2xl text-primary" />
          <h3 className="text-xl font-semibold text-primary">Fraud Heatmap</h3>
        </div>
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          Error loading Google Maps. Please check your API key.
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <FaMapMarkedAlt className="text-2xl text-primary" />
          <h3 className="text-xl font-semibold text-primary">Fraud Heatmap</h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaMapMarkedAlt className="text-2xl text-primary" />
          <h3 className="text-xl font-semibold text-primary">Fraud Heatmap - India</h3>
        </div>
        <button
          onClick={loadHeatmapData}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">Total Cases</div>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">Financial</div>
          <div className="text-2xl font-bold text-purple-600">{stats.financial}</div>
        </div>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">Social</div>
          <div className="text-2xl font-bold text-indigo-600">{stats.social}</div>
        </div>
        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600">Solved</div>
          <div className="text-2xl font-bold text-green-600">{stats.solved}</div>
        </div>
      </div>

      {/* Map */}
      {loading ? (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-primary mx-auto mb-3" />
            <p className="text-gray-600">Loading heatmap data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={loadHeatmapData}
              className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden border-2 border-gray-200">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={7}
            center={center}
            options={{
              mapTypeControl: true,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {heatmapData.length > 0 && (
              <HeatmapLayer
                data={heatmapData}
                options={{
                  radius: 25,
                  opacity: 0.7,
                  gradient: [
                    'rgba(0, 255, 255, 0)',
                    'rgba(0, 255, 255, 1)',
                    'rgba(0, 191, 255, 1)',
                    'rgba(0, 127, 255, 1)',
                    'rgba(0, 63, 255, 1)',
                    'rgba(0, 0, 255, 1)',
                    'rgba(0, 0, 223, 1)',
                    'rgba(0, 0, 191, 1)',
                    'rgba(0, 0, 159, 1)',
                    'rgba(0, 0, 127, 1)',
                    'rgba(63, 0, 91, 1)',
                    'rgba(127, 0, 63, 1)',
                    'rgba(191, 0, 31, 1)',
                    'rgba(255, 0, 0, 1)',
                  ],
                }}
              />
            )}
          </GoogleMap>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">Heatmap Legend:</div>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
            <span>Low Density</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span>Medium Density</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span>High Density</span>
          </div>
          <div className="ml-auto text-gray-500">
            Updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { fetchFraudTypeDistribution } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function FraudTypeChart() {
  const { t, currentLanguage } = useTranslation()
  const [chartData, setChartData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('Most Common Type of Fraud')
  const [noDataText, setNoDataText] = useState('No data available')

  useEffect(() => {
    loadChartData()
  }, [])

  useEffect(() => {
    setTitle(t('Most Common Type of Fraud'))
    setNoDataText(t('No data available'))
  }, [currentLanguage, t])

  const loadChartData = async () => {
    try {
      setLoading(true)
      const distribution = await fetchFraudTypeDistribution()

      if (distribution.length > 0) {
        const data = {
          labels: distribution.map((item) => item.type),
          datasets: [
            {
              label: 'Number of Cases',
              data: distribution.map((item) => item.count),
              backgroundColor: [
                '#1a237e',
                '#0d47a1',
                '#2e7d32',
                '#f57c00',
                '#c62828',
                '#0288d1',
                '#7b1fa2',
                '#455a64',
                '#00695c',
                '#5d4037',
              ],
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        }
        setChartData(data)
      }
    } catch (error) {
      console.error('Error loading chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold text-primary mb-4">{title}</h3>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : chartData ? (
        <div className="h-64 flex items-center justify-center">
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    boxWidth: 12,
                    padding: 10,
                    font: {
                      size: 10,
                    },
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          {noDataText}
        </div>
      )}
    </div>
  )
}

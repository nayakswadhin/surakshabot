'use client'

import { useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)
    const today = new Date()

    const calendar = []
    let dayCount = 1

    // Generate weeks
    for (let week = 0; week < 6; week++) {
      const weekDays = []
      
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < firstDay) || dayCount > days) {
          weekDays.push(null)
        } else {
          const isToday = 
            dayCount === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
          
          weekDays.push({ day: dayCount, isToday })
          dayCount++
        }
      }
      
      calendar.push(weekDays)
      
      if (dayCount > days) break
    }

    return calendar
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const calendar = generateCalendar()

  return (
    <div className="card p-6 bg-white rounded-lg shadow-2xl border border-gray-200 w-[400px]">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <FaChevronLeft className="text-primary text-lg" />
        </button>
        
        <h3 className="text-xl font-bold text-primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <FaChevronRight className="text-primary text-lg" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-2 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="space-y-2">
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map((dayObj, dayIndex) => (
              <div
                key={dayIndex}
                className={`
                  h-12 flex items-center justify-center text-base font-medium rounded-lg
                  ${dayObj ? 'hover:bg-gray-100 cursor-pointer transition-colors' : ''}
                  ${dayObj?.isToday ? 'bg-primary text-white font-bold hover:bg-primary-dark shadow-md' : ''}
                  ${dayObj && !dayObj.isToday ? 'text-gray-700' : ''}
                `}
              >
                {dayObj?.day}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Today's Date Footer */}
      <div className="mt-5 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 font-medium">
          Today: {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}

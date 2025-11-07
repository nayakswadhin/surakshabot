'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaCheck, FaTrash, FaCalendarAlt } from 'react-icons/fa'
import { isAuthenticated, clearAuth } from '@/lib/auth'
import { initSocket, Notification } from '@/lib/socket'
import Image from 'next/image'
import CalendarWidget from './CalendarWidget'

export default function Header() {
  const [auth, setAuth] = useState(false)
  const [open, setOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const notificationRef = useRef<HTMLDivElement | null>(null)
  const calendarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setAuth(isAuthenticated())

    // Initialize WebSocket connection
    if (isAuthenticated()) {
      const socket = initSocket()

      socket.on('notification', (notification: Notification) => {
        console.log('📢 Received notification:', notification)
        setNotifications((prev) => [notification, ...prev])
        
        // Play notification sound (optional)
        if (typeof Audio !== 'undefined') {
          try {
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => {
              // Silently fail if autoplay is blocked
            })
          } catch (e) {
            // Ignore audio errors
          }
        }
      })
    }
  }, [])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    function onDocNotification(e: MouseEvent) {
      if (!notificationRef.current) return
      if (e.target instanceof Node && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('click', onDocNotification)
    return () => document.removeEventListener('click', onDocNotification)
  }, [])

  useEffect(() => {
    function onDocCalendar(e: MouseEvent) {
      if (!calendarRef.current) return
      if (e.target instanceof Node && !calendarRef.current.contains(e.target)) {
        setCalendarOpen(false)
      }
    }
    document.addEventListener('click', onDocCalendar)
    return () => document.removeEventListener('click', onDocCalendar)
  }, [])

  const handleLogout = () => {
    clearAuth()
    setAuth(false)
    setOpen(false)
    router.push('/login')
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_complaint':
        return '🚨'
      case 'status_update':
        return '🔄'
      case 'new_user':
        return '👤'
      default:
        return '📢'
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Don't show header on login page - check at the end after all hooks
  if (pathname === '/login') {
    return null
  }

  return (
    <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center p-3">
              <Image 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png"
                alt="Emblem of India"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SurakshaBot</h1>
              <p className="text-sm opacity-90">1930 Cyber Helpline, Odisha</p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-6">
            {/* Calendar */}
            <div className="relative" ref={calendarRef}>
              <button
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="relative cursor-pointer hover:scale-110 transition-transform"
                title="Calendar"
              >
                <FaCalendarAlt className="text-2xl" />
              </button>

              {/* Calendar Dropdown */}
              {calendarOpen && (
                <div className="absolute right-0 mt-4 z-50">
                  <CalendarWidget />
                </div>
              )}
            </div>

            {/* Notification */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative cursor-pointer hover:scale-110 transition-transform"
              >
                <FaBell className="text-2xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary text-white">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Notifications</h3>
                      {notifications.length > 0 && (
                        <div className="flex gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs hover:underline flex items-center gap-1"
                              title="Mark all as read"
                            >
                              <FaCheck /> Mark all
                            </button>
                          )}
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs hover:underline flex items-center gap-1"
                            title="Clear all"
                          >
                            <FaTrash /> Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FaBell className="text-4xl mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No notifications yet</p>
                        <p className="text-xs mt-1">You'll see new updates here</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="text-2xl flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-xs text-gray-400">
                                    {new Date(notification.timestamp).toLocaleString()}
                                  </span>
                                  <div className="flex gap-2">
                                    {!notification.read && (
                                      <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                        title="Mark as read"
                                      >
                                        <FaCheck />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-xs text-red-600 hover:text-red-800"
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Dropdown */}
            {auth && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((s) => !s)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-all"
                >
                  <FaUserCircle className="text-3xl" />
                  <span className="font-medium">Admin</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg overflow-hidden z-50">
                    <Link
                      href="/settings"
                      onClick={() => setOpen(false)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-b border-gray-200"
                    >
                      <FaCog className="text-lg" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-red-600"
                    >
                      <FaSignOutAlt className="text-lg" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

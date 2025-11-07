import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export interface Notification {
  id: string
  type: 'new_complaint' | 'status_update' | 'new_user' | 'general'
  title: string
  message: string
  data: any
  timestamp: string
  read: boolean
}

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  return socket
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FaExternalLinkAlt, FaPaperPlane, FaRobot } from 'react-icons/fa'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  links?: Array<{ text: string; url: string }>
  data?: any
}

export default function AssistantPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      fetchInitialStats()
    }
  }, [])

  const fetchInitialStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/chatbot/stats')
      const result = await response.json()
      
      if (result.success) {
        const stats = result.data
        setMessages([
          {
            id: 1,
            text: `Hello! I am SurakshaBot, your 1930 Cyber Helpline Assistant.\n\nQuick Overview:\nTotal Complaints: ${stats.total}\nSolved: ${stats.byStatus.solved}\nPending: ${stats.byStatus.pending}\nUnder Review: ${stats.byStatus.under_review}\n\nHow may I assist you today?`,
            sender: 'bot',
            timestamp: new Date(),
            links: [
              { text: 'View Dashboard', url: '/' },
              { text: 'All Complaints', url: '/complaints' },
            ],
            data: stats
          }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch initial stats:', error)
      setMessages([
        {
          id: 1,
          text: 'Hello! I am SurakshaBot, your 1930 Cyber Helpline Assistant. How may I assist you today?',
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    }
  }

  const handleNavigate = (url: string) => {
    router.push(url)
  }

  const getBotResponse = async (userMessage: string): Promise<Message> => {
    try {
      const response = await fetch('http://localhost:3000/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const result = await response.json()

      if (result.success) {
        return {
          id: messages.length + 2,
          text: result.response,
          sender: 'bot',
          timestamp: new Date(),
          links: result.links || [],
          data: result.data
        }
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Bot response error:', error)
      return {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error processing your query. Please try again or contact support at 1930.',
        sender: 'bot',
        timestamp: new Date(),
        links: [{ text: 'Contact Support', url: '/settings' }]
      }
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages([...messages, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Get bot response from backend
    const botResponse = await getBotResponse(inputMessage)
    setMessages(prev => [...prev, botResponse])
    setIsTyping(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActionButtons = [
    { text: 'Total Complaints', value: 'How many total complaints are there?' },
    { text: 'Pending Cases', value: 'Show me pending cases' },
    { text: 'Solved Cases', value: 'How many cases are solved?' },
    { text: 'Long Pending', value: 'Which cases are pending for long time?' },
    { text: 'Urgent Cases', value: 'Show urgent cases' },
    { text: 'Today\'s Cases', value: 'How many complaints today?' },
    { text: 'Fraud Types', value: 'Show me fraud types' },
    { text: 'Analytics', value: 'Show me analytics' },
  ]

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-full p-3">
            <FaRobot className="text-primary text-3xl" />
          </div>
          <div>
            <h1 className="font-bold text-2xl">SurakshaBot Assistant</h1>
            <p className="text-sm opacity-90">1930 Cyber Helpline - Intelligent Query System</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[70%] p-4 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-md border border-gray-200'
              }`}
            >
              <p className="whitespace-pre-line text-sm leading-relaxed">{message.text}</p>
              <p
                className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            {/* Render navigation links if available */}
            {message.links && message.links.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 max-w-[70%]">
                {message.links.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleNavigate(link.url)}
                    className="text-sm bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors py-2 px-4 rounded-lg font-medium flex items-center gap-2 shadow-sm"
                  >
                    {link.text}
                    <FaExternalLinkAlt className="text-xs" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-none shadow-md border border-gray-200 p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      {messages.length === 1 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-700 mb-3 font-medium">Suggested Queries:</p>
          <div className="grid grid-cols-4 gap-3">
            {quickActionButtons.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInputMessage(action.value)
                  setTimeout(() => handleSendMessage(), 100)
                }}
                className="text-sm bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors py-2 px-4 rounded-lg font-medium"
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your query here..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputMessage.trim() === ''}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Send</span>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  )
}

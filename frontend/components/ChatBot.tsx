'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FaComments, FaExternalLinkAlt, FaPaperPlane, FaRobot, FaTimes } from 'react-icons/fa'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  links?: Array<{ text: string; url: string }>
  data?: any
}

export default function ChatBot() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
            text: `👋 Hello! I'm SurakshaBot, your 1930 Cyber Helpline assistant.\n\n**Quick Overview:**\n📊 Total Complaints: ${stats.total}\n✅ Solved: ${stats.byStatus.solved}\n⏳ Pending: ${stats.byStatus.pending}\n🔍 Under Review: ${stats.byStatus.under_review}\n\nAsk me anything about complaints, statistics, or help!`,
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
          text: 'Hello! I\'m SurakshaBot. How can I assist you today with the 1930 Cyber Helpline?',
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    }
  }

  const handleNavigate = (url: string) => {
    router.push(url)
    setIsOpen(false) // Close chatbot after navigation
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

  // Don't show chatbot on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary-dark text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center gap-2 group"
        >
          <FaComments className="text-2xl" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Need Help?
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-5">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-5 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <FaRobot className="text-primary text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-lg">SurakshaBot</h3>
                <p className="text-xs opacity-90">1930 Cyber Helpline Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
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
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
                    {message.links.map((link, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavigate(link.url)}
                        className="text-xs bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors py-2 px-3 rounded-lg font-medium flex items-center gap-1 shadow-sm"
                      >
                        {link.text}
                        <FaExternalLinkAlt className="text-[10px]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-md p-3">
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
            <div className="px-4 pb-2 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2 font-medium">Quick Questions:</p>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {quickActionButtons.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputMessage(action.value)
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                    className="text-xs bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors py-2 px-3 rounded-lg font-medium"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ''}
                className="bg-primary hover:bg-primary-dark text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

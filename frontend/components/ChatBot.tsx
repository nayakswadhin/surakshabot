'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatBot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I\'m SurakshaBot. How can I assist you today with the 1930 Cyber Helpline?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickResponses: { [key: string]: string } = {
    'complaint': 'To register a complaint, please WhatsApp us at 1930 or visit the Complaints section in the dashboard. Our team will assist you promptly.',
    'status': 'You can check your complaint status in the Complaints section by entering your complaint ID. We update statuses in real-time.',
    'help': 'I can help you with:\n• Registering complaints\n• Checking complaint status\n• Understanding cyber fraud types\n• Accessing reports and analytics\n\nWhat would you like to know?',
    'contact': 'Contact Information:\n📞 Helpline: 1930\n📧 Email: cybercrime.odisha@gov.in\n🏛️ Cyber Crime Police Station, Odisha',
    'fraud': 'Common fraud types we handle:\n• UPI/Payment Fraud\n• Social Media Fraud\n• OTP Fraud\n• Fake Calls\n• Email Phishing\n• Online Shopping Fraud\n\nFor immediate assistance, call 1930.',
  }

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('complaint') || lowerMessage.includes('register')) {
      return quickResponses['complaint']
    } else if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
      return quickResponses['status']
    } else if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
      return quickResponses['help']
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
      return quickResponses['contact']
    } else if (lowerMessage.includes('fraud') || lowerMessage.includes('scam') || lowerMessage.includes('types')) {
      return quickResponses['fraud']
    } else {
      return 'Thank you for your message. For specific assistance, please call our helpline at 1930 or describe your issue in more detail. I\'m here to help!'
    }
  }

  const handleSendMessage = () => {
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

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActionButtons = [
    { text: 'Register Complaint', value: 'How do I register a complaint?' },
    { text: 'Check Status', value: 'How can I check my complaint status?' },
    { text: 'Contact Info', value: 'What is the contact information?' },
    { text: 'Fraud Types', value: 'What types of fraud do you handle?' },
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
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
            <div className="px-4 pb-2 bg-gray-50 grid grid-cols-2 gap-2">
              {quickActionButtons.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInputMessage(action.value)
                    handleSendMessage()
                  }}
                  className="text-xs bg-white text-primary border border-primary hover:bg-primary hover:text-white transition-colors py-2 px-3 rounded-lg font-medium"
                >
                  {action.text}
                </button>
              ))}
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

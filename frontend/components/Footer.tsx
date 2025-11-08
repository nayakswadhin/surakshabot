"use client"

import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const lastUpdated = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="bg-gray-800 py-4">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side - Government Info */}
            <div className="text-sm text-gray-300 text-left">
              <p className="mb-1">
                Website Content Managed by <span className="font-semibold text-white">Ministry of Home Affairs, Govt. of India</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1200px-Emblem_of_India.svg.png"
                  alt="Emblem of India"
                  width={20}
                  height={20}
                  className="brightness-0 invert opacity-80"
                />
                <span>© {currentYear} Government of India. All Rights Reserved.</span>
              </div>
            </div>

            {/* Right Side - Credits */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-300">Powered by <span className="text-white font-medium">SurakshaBot</span></span>
              <span className="text-gray-600">|</span>
              <span className="text-gray-300">Digital India Initiative</span>
              <span className="text-gray-600">|</span>
              <span className="text-orange-400 font-medium">Emergency: 1930</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50"
        aria-label="Scroll to top"
      >
        <span className="text-2xl">↑</span>
      </button>
    </footer>
  )
}

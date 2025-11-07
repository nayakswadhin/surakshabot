import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import ChatBot from '@/components/ChatBot'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SurakshaBot - 1930 Cyber Helpline Dashboard',
  description: 'Government of Odisha - Cyber Crime Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthGuard>
          <Header />
          <Navbar />
          <main className="max-w-[1400px] mx-auto px-4 py-6 flex-grow">
            {children}
          </main>
          <Footer />
          <ChatBot />
        </AuthGuard>
      </body>
    </html>
  )
}

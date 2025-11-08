import AuthGuard from '@/components/AuthGuard'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SurakshaBot - 1930 Cyber Helpline Dashboard',
  description: 'Government of India - Cyber Crime Management System',
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
          <main className="max-w-[95%] 2xl:max-w-[1800px] mx-auto px-6 py-6 flex-grow w-full">
            {children}
          </main>
          <Footer />
        </AuthGuard>
      </body>
    </html>
  )
}

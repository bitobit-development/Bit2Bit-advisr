import '../globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Carla Prinsloo Your Financial Advisor - Sign Up Process',
  description: 'Today marks the beginning of your future journey!',
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('✅ Public layout loaded')
  return (
   <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function StartPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStart = () => {
    setLoading(true)
    // Slight delay for visual feedback before navigation
    setTimeout(() => {
      router.push('/new-vehicle-leads/signup')
    }, 500)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Welcome to Vitality Day</h1>

        <p className="text-sm text-gray-600 mb-6">
          <span
            className="text-base"
            style={{ color: '#ec1f5e', textTransform: 'uppercase', fontWeight: 'normal' }}
          >
            Vitality Day Exclusive – Save on Your Vehicle Insurance!
          </span>
          <br /> <br />
          We’re here to help you reduce your monthly vehicle insurance premium and unlock more value by integrating your insurance with Discovery’s rewards ecosystem.
          <br /> <br />
          <strong>Carla, our dedicated financial advisor at Morningside Gym</strong>, is offering special discounted quotes today — with savings of up to <strong>20%</strong> on your premium, available exclusively during <strong>Vitality Day</strong>.
          <br /> <br />
          All we need is:
          <ul className="list-disc list-inside mt-2 mb-4">
            <li>A quick photo of your car’s license disc</li>
            <li>Your basic info – just scan the QR code to get started</li>
          </ul>
          <strong>Already covered?</strong> No problem — we can take over your existing policy and still offer additional benefits tailored to your lifestyle and driving behavior.
          <br /> <br />
          <strong>And here’s the exciting part:</strong> Everyone who submits their details today stands a chance to win a <strong>JBL Go 3 Waterproof Bluetooth Speaker</strong>!
          <br />
          <em>T&Cs apply.</em>
          <br /> <br />
          It’s <strong>fast, free, and completely obligation-free</strong>. And <strong>Carla is inside</strong> if you'd like a live quote or have any questions.
          <br /> <br />
          <span className="font-semibold">Date:</span> Thursday, April 27, 2025 <br />
          <span className="font-semibold">Time:</span> 06:00 AM - 04:00 PM <br />
          <span className="font-semibold">Location:</span> Virgin Active Morningside, Johannesburg
        </p>


        <Button
          onClick={handleStart}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Thinking...' : 'Start the Process'}
        </Button>
      </div>
    </div>
  )
}
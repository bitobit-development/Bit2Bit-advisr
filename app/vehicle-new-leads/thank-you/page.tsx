'use client'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ThankYouPage() {
  const router = useRouter()

  const steps = ['Sign Up', 'Verify OTP', 'Complete']
  const currentStep = 2

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        
        {/* Step Progress Bar */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => {
            const isActive = index === currentStep
            return (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold
                    ${isActive ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  {index + 1}
                </div>
                <span className={`text-sm ${isActive ? 'text-pink-600 font-medium' : 'text-gray-500'}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        {/* Thank You Content */}
        <CheckCircle2 className="mx-auto text-green-600 w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Thank you!</h1>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Your information has been successfully submitted.<br />
          We&apos;ll be in touch shortly to assist you further.
        </p>

        <Button onClick={() => router.push('http://www.carlaprinsloo.co.za')} className="w-full">
          Return to Home
        </Button>
      </div>
    </div>
  )
}
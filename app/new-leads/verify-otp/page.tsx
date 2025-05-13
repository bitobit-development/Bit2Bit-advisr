// welness-comp/verify-otp/page.tsx
'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

function VerifyOtpContent() {
  const searchParams = useSearchParams()
  const mobile = searchParams.get('mobile')

  const [otp, setOtp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleVerify = async () => {
    if (!mobile || otp.length < 6) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/validate_otp_clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile_number: mobile,
          otp: otp,
        }),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ OTP verified')

        // 🔁 INSERT LEAD TO SUPABASE
        const leadInfo = JSON.parse(localStorage.getItem('lead_info') || '{}')

        const leadResponse = await fetch('/api/create-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: leadInfo.name,
            surname: leadInfo.surname,
            email: leadInfo.email,
            mobile: leadInfo.mobile,
            consent: leadInfo.consent,
            lead_type: 'VA - Morning Side'
          }),
        })

        const leadData = await leadResponse.json()
        if (leadData.success) {
          console.log('✅ Lead inserted into Supabase:', leadData.data)

          // 🔑 Send SMS to client with his unique ID
          const firstName = leadInfo.name // Assuming leadInfo contains the name
          const uniqueId = leadData.data[0].unique_id;  // Get the unique ID from the lead data

          const message = `Hi ${firstName}, your unique number is ${uniqueId}. Keep it safe and mention it to the Vitality team upon arrival. See you at Wellness Day!\nCarla Prinsloo,\nYour Financial Advisor.`;

          // **Call the SMS API to send the message**
          const smsResponse = await fetch('/api/send_sms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phoneNumber: mobile,
              messageContent: message,
            }),
          })

          const smsData = await smsResponse.json()

          if (smsData.success) {
            console.log('✅ SMS sent to client with unique ID')
          } else {
            console.error('❌ Failed to send SMS:', smsData.message)
          }

          // Optionally, you can remove lead_info from localStorage after successful submission
          localStorage.removeItem('lead_info')
          router.push('/new-leads/thank-you')
        } else {
          console.error('❌ Failed to insert lead:', leadData.message)
          router.push(`/new-leads/failed?reason=${encodeURIComponent(leadData.details || leadData.message || 'Lead submission failed')}`)
        }
      } else {
        setError(data.message || 'Invalid OTP. Please try again.')
        setLoading(false) // Ensure loading is set to false when OTP fails
      }
    } catch (err) {
      console.error('❌ OTP validation error:', err)
      setError('Something went wrong. Please try again.')
      setLoading(false) // Ensure loading is set to false in case of an error
    } 
  }

  const steps = ['Sign Up', 'Verify OTP', 'Complete']
  const currentStep = 1

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
                  className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm ${
                    isActive ? 'text-pink-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        <h1 className="text-2xl font-bold mb-4">Verify OTP</h1>
        <p className="text-sm text-gray-600 mb-4">
          We’ve sent a one-time PIN to your mobile number:{' '}
          <strong>{mobile}</strong>
        </p>

        <div className="flex justify-center my-4">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
          >
            <InputOTPGroup>
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot key={index} index={index} className="w-12 h-12 text-xl" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <Button
          className="mt-4 w-full"
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  )
}
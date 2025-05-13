'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [form, setForm] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    consent: false,
  })

  const [formError, setFormError] = useState<string | null>(null)
  const [mobileError, setMobileError] = useState(false)
  const [consentError, setConsentError] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckbox = (checked: boolean) => {
    setForm(prev => ({ ...prev, consent: checked }))
    if (checked) setConsentError(false)
  }

  const isValidMobile = (mobile: string) => {
    const regex = /^(06|07|08)[0-9]{8}$/
    return regex.test(mobile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setMobileError(false)
    setConsentError(false)

    const { name, surname, email, mobile, consent } = form

    if (!name || !surname || !email || !mobile) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!isValidMobile(mobile)) {
      setMobileError(true)
      return
    }

    if (!consent) {
      setConsentError(true)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/send_otp_clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile_number: mobile }),
      })
      const data = await response.json()

      if (data.success) {
        localStorage.setItem('lead_info', JSON.stringify(form))
        router.push(`/new-leads/verify-otp?mobile=${encodeURIComponent(mobile)}`)
      } else {
        setFormError(data.message || 'Failed to send OTP. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ OTP request error:', err)
      setFormError('Something went wrong while sending the OTP. Please try again.')
      setLoading(false)
    }
  }

  if (!mounted) return null

  const steps = ['Sign Up', 'Verify OTP', 'Complete']
  const currentStep = 0

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
        {/* Step Progress Bar */}
        <div className="flex justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step} className="flex-1 text-center">
              <div
                className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center text-white text-sm font-bold
                  ${index === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                {index + 1}
              </div>
              <span className={`text-sm ${index === currentStep ? 'text-pink-600 font-medium' : 'text-gray-500'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold mb-2">Sign up: Tell us about yourself</h1>

        <p className="text-sm text-gray-600 mb-6">
          <span
            className="text-base"
            style={{
              color: '#ec1f5e',
              textTransform: 'uppercase',
              fontWeight: 'normal'
            }}
          >
            Get Ready for Discovery Wellness Day!
          </span>
          <br /><br />
          Join us for a fun-filled day dedicated to your health and wellness. Complete the registration form below to secure your spot for this special event, where you can earn <strong>Vitality points</strong>, enjoy engaging activities, and meet with our expert financial advisor, <strong>Carla Prinsloo</strong>.
          <br /><br />
          To ensure your spot and the security of your <strong>Vitality health check</strong>, please <span style={{ color: '#ec1f5e' }}><strong>register now</strong></span>!
          <br /><br />
          Take part in <span style={{ color: '#ec1f5e' }}><strong>Vitality health checks</strong></span> during the day and get rewarded with up to <strong>22,500 points</strong>!
          <br /><br />
          <span className="font-semibold">Date:</span> Thursday, April 27, 2025<br />
          <span className="font-semibold">Time:</span> 06:00 AM - 04:00 PM<br />
          <span className="font-semibold">Location:</span> Virgin Active Morningside, Johannesburg
        </p>

        {formError && <p className="text-sm text-red-600 mb-4">{formError}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="surname">Surname</Label>
            <Input name="surname" value={form.surname} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              name="mobile"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.mobile}
              onChange={handleChange}
              required
            />
            {mobileError && (
              <p className="text-xs text-red-600 mt-1">
                Please enter a valid South African mobile number (e.g. 0712345678).
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          {/* Consent */}
          <div className="mt-4 flex flex-col space-y-1">
            <div className="flex items-start space-x-2">
              <Checkbox id="consent" checked={form.consent} onCheckedChange={handleCheckbox} />
              <Label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                By registering for this event, you consent to being contacted by Carla Prinsloo and receiving marketing materials related to Discovery products, including Life, Investments, Banking, Insurance, Medical Aid, Gap Cover, Will & Trust services, Vitality, Health & Wellness solutions, Retirement Planning, and Estate Management, as well as updates on wellness events, exclusive offers, and personalized financial advice.
              </Label>
            </div>
            {consentError && (
              <p className="text-xs text-red-600 mt-1">Please accept the consent to proceed.</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  )
}

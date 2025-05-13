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
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showConsentError, setShowConsentError] = useState(false)

  const [form, setForm] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    consent: false, // ⛔ Start as unchecked
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleCheckbox = (checked: boolean) => {
    setForm({ ...form, consent: checked })
    if (checked) setShowConsentError(false)
  }

  const isValidMobile = (mobile: string) => {
    const regex = /^(06|07|08)[0-9]{8}$/
    return regex.test(mobile)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { name, surname, email, mobile, consent } = form

    if (!name || !surname || !email || !mobile) {
      setError('Please fill in all required fields.')
      return
    }

    if (!isValidMobile(mobile)) {
      setError('Please enter a valid South African mobile number (e.g. 0712345678).')
      return
    }

    if (!consent) {
      setShowConsentError(true)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/send_otp_clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobile }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem(
          'lead_info',
          JSON.stringify({ name, surname, email, mobile, consent })
        )
        router.push(`/vehicle-new-leads/verify-otp?mobile=${encodeURIComponent(mobile)}`)
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('❌ OTP request error:', err)
      setError('Something went wrong. Please try again.')
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

        <h1 className="text-2xl font-bold mb-2">Sign up: Tell us about yourself</h1>

        <p className="text-sm text-gray-600 mb-6">
          <a href="/terms" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            Our terms and conditions
          </a>{' '}
          apply. By entering your details on this site, you give the consent and permission to contact you.
        </p>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

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
            <Input name="mobile" value={form.mobile} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          {/* Consent Checkbox with inline error */}
          <div className="flex flex-col space-y-1 mt-2">
            <div className="flex items-start space-x-2">
              <Checkbox id="consent" checked={form.consent} onCheckedChange={handleCheckbox} />
              <Label
                htmlFor="consent"
                className="text-xs text-gray-600 leading-relaxed cursor-pointer"
              >
                I grant consent to access my insurance score, claims, and vehicle licensing details from a third-party credit bureau to save time and ensure the premium is calculated correctly according to my risk rating, including any others on my plan.
              </Label>
            </div>
            {showConsentError && (
              <p className="text-xs text-red-600 mt-1">
                Please accept the consent to proceed.
              </p>
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

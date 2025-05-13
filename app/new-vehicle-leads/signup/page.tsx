'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export default function SignUpPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    id_number: '',
    consent: false,
    discoveryClient: '',
  })

  const [formError, setFormError] = useState<string | null>(null)
  const [consentError, setConsentError] = useState(false)
  const [radioError, setRadioError] = useState(false)

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

  const handleDiscoveryChange = (value: string) => {
    setForm(prev => ({ ...prev, discoveryClient: value }))
    setRadioError(false)
  }

  const isValidMobile = (mobile: string) => {
    return /^(06|07|08)[0-9]{8}$/.test(mobile)
  }

  const isValidSAID = (id: string) => {
    if (!/^\d{13}$/.test(id)) return false
    let sum = 0
    for (let i = 0; i < 13; i++) {
      let digit = parseInt(id.charAt(i), 10)
      if ((i % 2) === 1) {
        digit *= 2
        if (digit > 9) digit -= 9
      }
      sum += digit
    }
    return sum % 10 === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { name, surname, email, mobile, id_number, consent, discoveryClient } = form

    if (!name || !surname || !email || !mobile || !id_number) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (!isValidMobile(mobile)) {
      setFormError('Please enter a valid South African mobile number (e.g. 0712345678).')
      return
    }

    if (!isValidSAID(id_number)) {
      setFormError('Please enter a valid South African ID number.')
      return
    }

    if (!discoveryClient) {
      setRadioError(true)
      return
    }

    if (!consent) {
      setConsentError(true)
      return
    }

    // clear all inline errors
    setFormError(null)
    setRadioError(false)
    setConsentError(false)
    setLoading(true)

    try {
      const response = await fetch('/api/send_otp_clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobile }),
      })
      const data = await response.json()

      if (data.success) {
        localStorage.setItem('lead_info', JSON.stringify(form))
        router.push(`/new-vehicle-leads/verify-otp?mobile=${encodeURIComponent(mobile)}`)
      } else {
        setFormError(data.message || 'Failed to send OTP. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('OTP request error:', err)
      setFormError('Something went wrong. Please try again.')
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

        <h1 className="text-2xl font-bold mb-6">Step 1: Tell us about yourself</h1>

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
            <Input name="mobile" type="tel" inputMode="numeric" pattern="[0-9]*" value={form.mobile} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="id_number">South African ID Number</Label>
            <Input name="id_number" type="tel" inputMode="numeric" pattern="[0-9]*" value={form.id_number} onChange={handleChange} required />
          </div>

          {/* Radio Group */}
          <div className="mt-6">
            <Label className="mb-2 block">Are you already with Discovery Insure?</Label>
            <RadioGroup
              value={form.discoveryClient}
              onValueChange={handleDiscoveryChange}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
            {radioError && (
              <p className="text-xs text-red-600 mt-1">
                Please select if you're already with Discovery Insure.
              </p>
            )}
          </div>

          {/* Consent */}
          <div className="mt-6 flex flex-col space-y-1">
            <div className="flex items-start space-x-2">
              <Checkbox id="consent" checked={form.consent} onCheckedChange={handleCheckbox} />
              <Label htmlFor="consent" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                I grant consent to Discovery Insure to access my insurance score, claims, and vehicle licensing details from a third-party credit bureau to save time and ensure the premium is calculated correctly according to my risk rating, including any others on my Plan.
              </Label>
            </div>
            {consentError && (
              <p className="text-xs text-red-600 mt-1">
                Please accept the consent to proceed.
              </p>
            )}
          </div>

          <div className="mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

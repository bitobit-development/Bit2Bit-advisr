// app/pre-welness-day-reg/page.tsx
// _____________________________________
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image';

export default function HomePage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // State to check if we are on the client side
  const [isClient, setIsClient] = useState(false)

  // Check if we're on the client side (i.e., in the browser)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)
    }
  }, [])

  // Reset QR code state only on the client side
  useEffect(() => {
    if (!isClient) return;
    setQrCode(null) // Reset QR code state during client-side rendering
  }, [isClient])

  // Generate QR code
  useEffect(() => {
    if (!isClient) return; // Ensure this only runs on the client side

    const generateQr = async () => {
      const signupUrl = `${window.location.origin}/pre-welness-day-reg/registration`
      try {
        const res = await fetch('/api/generate-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: signupUrl,
          }),
        })

        const data = await res.json()

        if (data.success && data.qr_code_base64) {
          setQrCode(`data:image/png;base64,${data.qr_code_base64}`)
        } else {
          setError(data.message || 'QR generation failed.')
        }
      } catch (err) {
        setError('Something went wrong while generating QR.')
        console.error('QR error:', err)
      }
    }

    generateQr()
  }, [isClient]) // This runs only when `isClient` is true

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="bg-white p-8 rounded-xl max-w-md w-full text-center relative pt-20"
          style={{
            boxShadow: '0 4px 10px rgba(230, 0, 126, 0.25)', // Discovery pink shadow (#E6007E)
          }}
        >
          {/* Vitality Logo at top-left */}
          <Image
            src="/Vitality-Pink-logo.svg"
            alt="Vitality Logo"
            width={100}  // Adjust size as needed
            height={35}
            className="absolute top-4 left-4"
            priority
          />

        <h1 className="text-3xl font-semibold text-[#E6007E] mb-4 uppercase">
          Let’s Get to Diamond – Scan to Reserve
        </h1>

        <p className="text-base text-[#666666] mb-6">
          Register now and earn up to 22,500 Vitality points to boost your Vitality status. Scan the QR code with your phone or tap the button below.
        </p>

        {qrCode ? (
          <img src={qrCode} alt="QR Code" className="mx-auto mb-4 w-48 h-48" />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <p className="text-sm text-gray-500">Generating QR code...</p>
        )}

        {isClient && (
         <a
           href={`${window.location.origin}/pre-welness-day-reg/registration`}
           target="_blank"
           rel="noopener noreferrer"
           className="inline-flex items-center justify-center w-full h-10 rounded-md bg-[#E6007E] hover:bg-[#D81B60] text-white text-sm font-semibold transition-colors duration-300 mt-4"
         >
           Register Now
         </a>
        )}
      </div>
    </div>
  )
}
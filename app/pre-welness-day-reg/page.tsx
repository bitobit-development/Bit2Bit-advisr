// app/pre-welness-day-reg/page.tsx
// _____________________________________
'use client'

import { useEffect, useState } from 'react'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Lets get to Diamond – Scan to Reserve</h1>
        <p className="text-sm text-gray-600 mb-6">
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
            className="inline-block mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-blue-700 transition"
          >
            Register Now
          </a>
        )}
      </div>
    </div>
  )
}
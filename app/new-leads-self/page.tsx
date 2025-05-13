'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // First useEffect: Set `isClient` to true once the component is mounted on the client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsClient(true)
    }
  }, [])

  // Second useEffect: Reset QR code state only on client-side rendering
  useEffect(() => {
    if (!isClient) return; // Skip on SSR
    setQrCode(null) // Reset the QR code state during client-side rendering
  }, [isClient])

  // Third useEffect: Generate the QR code only on the client side
  useEffect(() => {
    if (!isClient) return; // Ensure this runs only on the client-side

    const generateQr = async () => {
      const signupUrl = `${window.location.origin}/new-leads/signup`
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
  }, [isClient]) // This effect will run once when `isClient` is set to true

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Scan to Start</h1>
        <p className="text-sm text-gray-600 mb-6">
          Use your phone to scan this QR code to begin the sign-up process.
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
            href={`${window.location.origin}/new-leads/signup`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-4 py-2 bg-pink-600 text-white rounded hover:bg-blue-700 transition"
          >
            Go to Sign-Up
          </a>
        )}
      </div>
    </div>
  )
}
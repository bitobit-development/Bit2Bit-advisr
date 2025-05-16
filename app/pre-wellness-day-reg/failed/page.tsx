'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function FailedPageContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'Something went wrong.'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl max-w-md w-full text-center"
          style={{
            boxShadow: '0 4px 10px rgba(230, 0, 126, 0.25)', // Discovery pink shadow (#E6007E)
          }}
        >
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#EB2660' }}>
          Submission Failed</h1>
        <p className="text-gray-700 text-sm mb-4">
          We couldn&apos;t complete your submission.
        </p>
        <p className="text-red-500 text-sm font-mono">{reason}</p>
        <a
          href="/new-leads/"
          className="inline-block mt-6 px-4 py-2 rounded text-white transition-colors duration-300"
          style={{ backgroundColor: '#EB2660' }}
        >
          Go Back
        </a>
      </div>
    </div>
  )
}

export default function FailedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FailedPageContent />
    </Suspense>
  )
}
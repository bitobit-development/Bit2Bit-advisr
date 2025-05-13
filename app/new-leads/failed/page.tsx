'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function FailedPageContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'Something went wrong.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Submission Failed</h1>
        <p className="text-gray-700 text-sm mb-4">
          We couldn&apos;t complete your submission.
        </p>
        <p className="text-red-500 text-sm font-mono">{reason}</p>
        <a
          href="/new-leads/"
          className="inline-block mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
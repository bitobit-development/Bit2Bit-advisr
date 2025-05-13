// /api/generate-qr/route.ts
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    const response = await fetch('https://discovery-brokeredge-app-haimderazon.replit.app/string_to_qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.REPLIT_API_KEY as string, // Move to .env
      },
      body: JSON.stringify({ text }),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('❌ QR Proxy Error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'QR proxy failed' }),
      { status: 500 }
    )
  }
}

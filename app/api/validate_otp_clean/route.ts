export async function POST(req: Request) {
  try {
    const body = await req.json()

    // ✅ Grab cookie from the incoming request
    const cookie = req.headers.get('cookie') || ''
    console.log('🍪 Incoming Cookie from browser ➝', cookie)
    

    const response = await fetch('https://discovery-brokeredge-app-haimderazon.replit.app/validate_otp_clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JKLIO+_RIPGJ3sS_6Y4bJwyP71Qg==',
        'Cookie': cookie, // ✅ Forward browser session cookie to Replit
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (err) {
    console.error('❌ validate_otp_clean proxy error:', err)
    return new Response(JSON.stringify({
      success: false,
      message: 'Proxy failed to verify OTP.',
    }), { status: 500 })
  }
}

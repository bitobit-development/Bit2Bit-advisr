//app/api/send_otp_clean/route.ts
// ______________________________________________

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const response = await fetch('https://discovery-brokeredge-app-haimderazon.replit.app/send_otp_clean', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JKLIO+_RIPGJ3sS_6Y4bJwyP71Qg==',
      },
      body: JSON.stringify(body),
    })

    const responseBody = await response.text()
    const setCookie = response.headers.get('set-cookie')

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        ...(setCookie ? { 'Set-Cookie': setCookie } : {}), // ✅ Forward cookie to browser
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to send OTP' }), {
      status: 500,
    })
  }
}

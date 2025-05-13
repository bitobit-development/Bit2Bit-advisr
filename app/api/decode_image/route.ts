export async function POST(req: Request) {
  try {
    const body = await req.json()

    const url_dev = "https://71255cae-18de-4d1b-8cde-1575ae45d659-00-1zagoojgq7nxf.worf.replit.dev"
    //const url_prod = "https://discovery-brokeredge-app-haimderazon.replit.app"
    
      const response = await fetch(`${url_dev}/load_base_64_disc`, {
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

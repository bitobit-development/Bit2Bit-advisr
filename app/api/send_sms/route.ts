// app/api/send_sms/route.js
export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { phoneNumber, messageContent } = body;

    if (!phoneNumber || !messageContent) {
      return new Response(
        JSON.stringify({ success: false, message: 'Phone number and message content are required.' }),
        { status: 400 }
      );
    }

    // 1) Strip all non‐digit characters
    let digits = phoneNumber.replace(/\D/g, '');

    // 2) Normalize to South Africa country code "27"
    if (digits.startsWith('27')) {
      // already correct
    } else if (digits.startsWith('0')) {
      digits = '27' + digits.slice(1);
    } else {
      // no leading 0 or 27
      digits = '27' + digits;
    }

    // Final formatted number
    const formatted = digits; // e.g. "27823292438"

    // Prepare Clickatell payload
    const payload = {
      messages: [
        {
          channel: 'sms',
          to: formatted,
          content: messageContent,
        },
      ],
    };

    const response = await fetch('https://platform.clickatell.com/v1/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'CRIPGJ3sS_6Y4bJwyP71Qg==', // your Clickatell API key
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await response.json();

    if (response.ok) {
      return new Response(
        JSON.stringify({ success: true, message: 'SMS sent successfully.', response: responseBody }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: responseBody.error || 'Failed to send SMS.' }),
        { status: response.status }
      );
    }
  } catch (err) {
    console.error('Error sending SMS:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error.' }),
      { status: 500 }
    );
  }
}

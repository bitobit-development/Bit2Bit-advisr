import { NextRequest, NextResponse } from 'next/server';
import { sendGraphEmail } from '@/lib/send-grapgh-email';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, text, attachmentPath } = await req.json();
    const result = await sendGraphEmail({ to, subject, html, text, attachmentPath });
    return NextResponse.json(result);
  } catch (e: any) {
    console.error('Send-email error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
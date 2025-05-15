import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sendGraphEmail } from '@/lib/send-grapgh-email';
import { emailDisclaimer } from '@/lib/emailDisclaimer';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, templateData, attachmentPath } = await req.json();

    const templatePath = path.resolve('./lib/templates/email-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    // Inject the disclaimer
    templateData.disclaimer = emailDisclaimer;

    // Replace placeholders with templateData values
    Object.entries(templateData).forEach(([key, value]) => {
      htmlTemplate = htmlTemplate.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    const result = await sendGraphEmail({ to, subject, html: htmlTemplate, attachmentPath });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('send-email-with-details error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

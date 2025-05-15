// app/api/send-vitality-email/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { sendGraphEmail } from '@/lib/send-grapgh-email';
import { emailDisclaimer } from '@/lib/emailDisclaimer';
import { carlaPrinslooText } from '@/lib/carla-prinsloo-text';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { to, name, DiscoveryCustomer, hasVitality, leadNumber } = await req.json();
    if (!to || !name || DiscoveryCustomer === undefined || hasVitality === undefined || leadNumber === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, name, DiscoveryCustomer, or hasVitality, leadNumber ' },
        { status: 400 }
      );
    }

    // 1) Load the HTML template
    const templatePath = path.resolve('./lib/templates/vitality-email-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    // 2) Determine subject
    const subject = hasVitality
      ? `${name}, Your Confirmation for the Vitality Wellness Day Event!`
      : `${name} ,Discover Vitality and Join Our Wellness Day Event!`;

    // 3) Build prompt for AI
    const prompt = `
    You are a content marketing specialist writing HTML body content for Discovery Vitality Wellness Day email campaigns.

    You will generate a short and friendly email message in basic HTML format (using only <p>, <strong>, <ul>, and <a> tags) that gets inserted into a styled email template. You do not need to add styles, headers, or layout — this is done separately by the system.

    PARAMETERS:
    * Name: ${name}
    * Registration reference number: ${leadNumber}
    * Discovery customer: ${DiscoveryCustomer}
    * Vitality member: ${hasVitality}
    * Carla’s profile: ${carlaPrinslooText}

    OBJECTIVE:
    Write a personalized thank-you message to users who registered for an upcoming Vitality Wellness Day organized by Discovery’s financial advisor, Carla Prinsloo.

    Your goal is to:
    * Thank them for registering
    * Encourage Discovery + Vitality activation if they’re not members
    * Highlight 2–4 core benefits from the brochure (briefly)
    * Introduce and mention Carla as their potential financial advisor and emphasize her skills and experience
    * End with a warm sign-off: Carla Prinsloo and Discovery Vitality team

    SCENARIO LOGIC:

    If ${DiscoveryCustomer} === true and ${hasVitality} === true:
    * Thank them for registering
    * Mention reference number: <strong>${leadNumber}</strong>
    * Acknowledge they’re fully eligible and can earn points through participation
    * Invite them to attend the Wellness 
    * Mention that <strong style="color: #eb2660;">Carla Prinsloo</strong> is available to help enhance their wellness and financial strategy

    If ${DiscoveryCustomer} === true and ${hasVitality} === false:
    * Thank them for registering
    * Acknowledge they are a Discovery customer but not yet Vitality
    * Encourage them to activate Vitality to unlock lifestyle rewards
    * Mention a few benefits (example: gym, healthy food, flights)
    * Invite them to attend the Wellness Day 
    * Recommend connecting with <strong style="color: #eb2660;">Carla Prinsloo</strong> for onboarding

    If ${DiscoveryCustomer} === false:
    * Thank them for registering
    * Mention they are not a Discovery customer yet
    * Invite them to join Discovery first, then activate Vitality
    * Mention top lifestyle benefits
    * Encourage reaching out to <strong style="color: #eb2660;">Carla Prinsloo</strong> for assistance
    * Reinforce participation in the upcoming Wellness Day

    DO NOT:
    * Include any <html>, <head>, or <style> tags
    * Add your own layout elements — just raw HTML body content
    * Add new lines around Carla’s name — it should be inline

    Carla’s Name Format:
    Use this inline format: <strong style="color: #eb2660;">Carla Prinsloo</strong>

    TONE & FORMAT:
    * Professional and friendly
    * Keep it short: 4–6 sentences max
    * HTML content only
    * Return only what will go inside the body placeholder
    `.trim();


    // 4) Generate body via OpenAI
    const aiRes = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a content marketing specialist writing vibrant, on-brand emails for Discovery Vitality.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });
    const aiBody = aiRes.choices[0].message?.content?.trim() ?? '';

    // 4.1) Throw error if AI failed to generate body
    if (!aiBody) {
      throw new Error('AI generation error: empty email body');
    }

    // 5) Inject placeholders into template
    try {
      const iconPath = (icon: string) =>fs.readFileSync(`lib/icons/base64/${icon}.svg.txt`, 'utf-8').replace(/\s+/g, '');
      const vitality_logo = fs.readFileSync(`lib/images/base64/Vitality-Pink-logo.png.txt`, 'utf-8').replace(/\s+/g, '');;
      const disc_bullet = fs.readFileSync(`lib/images/base64/disc-bullet-point.png.txt`, 'utf-8').replace(/\s+/g, '');
      const download_icon = iconPath('download'); // ← added
      const domain = 'http://bit-2-leads.replit.app'; // ← added
      const vitality_logo_disc = 'Vitality-Pink-logo-disc.png';

      htmlTemplate = htmlTemplate
        .replace(/{{image_disc_bullet}}/g,disc_bullet)
        .replace(/{{image_vitality}}/g, vitality_logo)
        .replace(/{{header}}/g, subject)
        .replace(/{{body}}/g, aiBody)
        .replace(/{{disclaimer}}/g, emailDisclaimer)
        .replace(/{{domain}}/g, domain) // ← added
        .replace(/{{image_vitality_disc}}/g, vitality_logo_disc)
        .replace(/{{icon_user}}/g, iconPath('user'))
        .replace(/{{icon_briefcase}}/g, iconPath('briefcase'))
        .replace(/{{icon_phone}}/g, iconPath('phone'))
        .replace(/{{icon_mail}}/g, iconPath('mail'))
        .replace(/{{icon_globe}}/g, iconPath('globe'))
        .replace(/{{icon_building}}/g, iconPath('building'))
        .replace(/{{icon_download}}/g, download_icon); // ← added

      // Verify injection
      if (htmlTemplate.includes('{{') || htmlTemplate.includes('}}')) {
        throw new Error('Placeholder injection incomplete');
      }
    } catch (e: any) {
      throw new Error(`Template injection error: ${e.message}`);
    }
    // log-the email
    fs.writeFileSync(`./debug-output/${leadNumber}.html`, htmlTemplate);

    // 6) Attach the brochure
    const attachmentPath = path.resolve(
      './public/vitality-brochures/vitality-2025-brochure.pdf'
    );
    if (!fs.existsSync(attachmentPath)) {
      throw new Error(`Attachment not found at ${attachmentPath}`);
    }

    // 7) Send email
    const mailResult = await sendGraphEmail({
      to,
      subject,
      html: htmlTemplate,
      attachmentPath,
    });

    return NextResponse.json(mailResult);
  } catch (error: any) {
    console.error('send-vitality-email error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

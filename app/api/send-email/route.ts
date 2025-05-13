// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ConfidentialClientApplication } from '@azure/msal-node'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

// MSAL configuration
const cca = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID!}`,
  }
})

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text, html, attachmentPath } = await req.json()

    // 1) Acquire token for Graph
    const tokenResp = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default']
    })
    if (!tokenResp?.accessToken) {
      throw new Error('Could not acquire Graph token')
    }

    // 2) Build the core message object
    const message: any = {
      subject,
      body: {
        contentType: html ? 'HTML' : 'Text',
        content: html ?? text
      },
      toRecipients: [
        { emailAddress: { address: to } }
      ]
    }

    // 3) Attach file if requested
    if (attachmentPath) {
      const abs = path.join(process.cwd(), attachmentPath)
      if (fs.existsSync(abs)) {
        const contentBytes = fs.readFileSync(abs).toString('base64')
        message.attachments = [{
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: path.basename(abs),
          contentBytes
        }]
      }
    }

    // 4) Call sendMail with the correct wrapper
    const payload = {
      message,
      saveToSentItems: true
    }

    const graphRes = await fetch(
      'https://graph.microsoft.com/v1.0/users/info@bit2bit.co.za/sendMail',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenResp.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    if (!graphRes.ok) {
      const errText = await graphRes.text()
      throw new Error(`Graph sendMail failed: ${errText}`)
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Send-email error:', e)
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

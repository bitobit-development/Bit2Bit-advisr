import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const cca = new ConfidentialClientApplication({
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID!}`,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachmentPath?: string;
}

export async function sendGraphEmail({
  to,
  subject,
  html,
  text,
  attachmentPath,
}: SendEmailParams) {
  const tokenResp = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });
  if (!tokenResp?.accessToken) {
    throw new Error('Could not acquire Graph token');
  }

  const message: any = {
    subject,
    body: {
      contentType: html ? 'HTML' : 'Text',
      content: html || text,
    },
    toRecipients: [{ emailAddress: { address: to } }],
  };

  if (attachmentPath) {
    const abs = path.join(process.cwd(), attachmentPath);
    if (fs.existsSync(abs)) {
      const contentBytes = fs.readFileSync(abs).toString('base64');
      message.attachments = [{
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: path.basename(abs),
        contentBytes,
      }];
    }
  }

  const payload = { message, saveToSentItems: true };

  const graphRes = await fetch(
    'https://graph.microsoft.com/v1.0/users/info@bit2bit.co.za/sendMail',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenResp.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!graphRes.ok) {
    const errText = await graphRes.text();
    throw new Error(`Graph sendMail failed: ${errText}`);
  }

  return { success: true };
}

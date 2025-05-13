// app/api/create-contact-card/route.ts
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      surname,
      email,
      mobile,
      isDiscoveryCustomer,
      hasVitality,
      products,
      consent,
      phoneType = 'iphone',
    } = await req.json()

    // Build vCard (version 3.0)
    const fullName = `${name} ${surname}`
    const noteFields = [
      `Discovery Customer: ${isDiscoveryCustomer}`,
      `Has Vitality: ${hasVitality}`,
      `Products: ${products.join(', ')}`,
      `Consent given: ${consent}`,
    ]
    const vcardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${surname};${name};;;`,
      `FN:${fullName}`,
      email ? `EMAIL;TYPE=INTERNET:${email}` : null,
      `TEL;TYPE=CELL:${mobile}`,
      `X-PHONETYPE:${phoneType}`,
      // Single-line NOTE with pipe separators
      `NOTE:${noteFields.join(' | ')}`,
      'END:VCARD',
    ].filter(Boolean as any)

    const vcardContent = vcardLines.join('\r\n')

    // Ensure vcards directory under app exists
    const vcardsDir = path.join(process.cwd(), 'app', 'vcards')
    if (!fs.existsSync(vcardsDir)) {
      fs.mkdirSync(vcardsDir, { recursive: true })
    }

    // Write file to /app/vcards/{{name}}_{{surname}}.vcf
    const fileName = `${name}_${surname}.vcf`
    const filePath = path.join(vcardsDir, fileName)
    fs.writeFileSync(filePath, vcardContent, 'utf8')

    // Return the vCard content as attachment
    return new Response(vcardContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (err) {
    console.error('Create contact card error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'Invalid request' }),
      { status: 400 }
    )
  }
}

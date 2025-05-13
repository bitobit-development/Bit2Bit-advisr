// app/api/empty-vcard-lib/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    // Directory containing vCard files
    const vcardsDir = path.join(process.cwd(), 'app', 'vcards')

    if (!fs.existsSync(vcardsDir)) {
      // Nothing to delete
      return NextResponse.json({ success: true, deleted: 0 })
    }

    const files = fs.readdirSync(vcardsDir)
    let deletedCount = 0

    files.forEach((file) => {
      const filePath = path.join(vcardsDir, file)
      try {
        fs.unlinkSync(filePath)
        deletedCount++
      } catch (err) {
        console.warn(`Failed to delete ${filePath}:`, err)
      }
    })

    return NextResponse.json({ success: true, deleted: deletedCount })
  } catch (error: any) {
    console.error('Error emptying vCard library:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

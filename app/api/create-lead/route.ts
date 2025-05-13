import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { name, surname, email, mobile, consent, lead_type } = body

    const { data, error } = await supabase
      .from('leads')
      .insert([{ name, surname, email, mobile, consent, lead_type },])
      .select()


    if (error) {
    console.error('Supabase insert error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        details: error.details,
      }),
      { status: 500 }
    )
    }
   
    return new Response(JSON.stringify({ success: true, data }), { status: 200 })
  } catch (err) {
    console.error('Create lead error:', err)
    return new Response(JSON.stringify({ success: false, message: 'Internal server error' }), { status: 500 })
  }
}

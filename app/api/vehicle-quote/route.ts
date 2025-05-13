import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      surname,
      email,
      mobile,
      lead_type,
      id_number,
      consent,
      discoveryClient,
    } = body

    const { data, error } = await supabase
      .from('vehicle_quote')
      .insert([{
        name,
        surname,
        email,
        mobile,
        lead_type,
        id_or_passport: id_number, // mapped column
        consent,
        is_discovery_client: discoveryClient === 'yes' ? true : false,
      }])
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
    console.error('Vehicle quote insert error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500 }
    )
  }
}

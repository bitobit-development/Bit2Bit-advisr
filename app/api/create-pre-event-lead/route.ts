// app/api/create-pre-event-lead/route.ts
import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Destructure exactly the columns in pre_reg_lead, now including email
    const {
      name,
      surname,
      email,
      mobile,
      is_discovery_customer,
      has_vitality,
      products,
      consent,
    } = await req.json()

    // Insert into pre_reg_lead
    const { data, error } = await supabase
      .from('pre_reg_lead')
      .insert([{
        name,
        surname,
        email,
        mobile,
        is_discovery_customer,
        has_vitality,
        products,
        consent,
      }])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return new Response(JSON.stringify({
        success: false,
        message: error.message,
        details: error.details,
      }), { status: 500 })
    }

    // On success, data[0] will have lead_id, lead_code, create_time, etc.
    return new Response(JSON.stringify({ success: true, data }), { status: 200 })
  } catch (err) {
    console.error('Create pre_reg_lead error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500 }
    )
  }
}

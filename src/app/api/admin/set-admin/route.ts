import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin endpoint to mark a broker as admin (bypasses payment)
// This should be called manually or via secure admin interface

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { email, isAdmin = true } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find broker by email
    const { data: broker, error: brokerError } = await supabaseAdmin
      .from('brokers')
      .select('id')
      .eq('email', email)
      .single()

    if (brokerError || !broker) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      )
    }

    // Update broker to admin status
    const { error: updateBrokerError } = await supabaseAdmin
      .from('brokers')
      .update({
        is_admin: isAdmin,
        payment_status: isAdmin ? 'active' : 'pending'
      })
      .eq('id', broker.id)

    if (updateBrokerError) {
      return NextResponse.json(
        { error: updateBrokerError.message },
        { status: 500 }
      )
    }

    // Update broker_settings
    const { error: updateSettingsError } = await supabaseAdmin
      .from('broker_settings')
      .update({
        is_admin: isAdmin,
        payment_status: isAdmin ? 'active' : 'pending'
      })
      .eq('broker_id', broker.id)

    if (updateSettingsError) {
      return NextResponse.json(
        { error: updateSettingsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Broker ${email} ${isAdmin ? 'marked as admin' : 'admin status removed'}`
    })
  } catch (error) {
    console.error('Set admin error:', error)
    return NextResponse.json(
      { error: 'Failed to update admin status' },
      { status: 500 }
    )
  }
}

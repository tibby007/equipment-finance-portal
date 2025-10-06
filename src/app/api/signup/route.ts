import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with the service role key to bypass RLS
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
    const { userId, email, companyName, subscriptionTier } = await request.json()

    // Validate required fields
    if (!userId || !email || !companyName || !subscriptionTier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create broker profile using admin client (bypasses RLS)
    const { data: broker, error: brokerError } = await supabaseAdmin
      .from('brokers')
      .insert({
        id: userId,
        email: email,
        company_name: companyName,
        subscription_tier: subscriptionTier,
        payment_status: 'active', // All signups are active - no payment required
        is_admin: false,
      })
      .select()
      .single()

    if (brokerError) {
      console.error('Error creating broker profile:', brokerError)
      return NextResponse.json(
        { error: brokerError.message },
        { status: 500 }
      )
    }

    // Create default broker settings
    const { error: settingsError } = await supabaseAdmin
      .from('broker_settings')
      .insert({
        broker_id: userId,
        subscription_tier: subscriptionTier,
        payment_status: 'active', // All signups are active - no payment required
        is_admin: false,
        company_name: companyName,
        primary_color: '#16a34a',
        secondary_color: '#ea580c',
      })

    if (settingsError) {
      console.error('Error creating broker settings:', settingsError)
      // Don't fail the signup if settings creation fails, just log it
    }

    return NextResponse.json({ success: true, broker })
  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Failed to create broker profile' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-08-27.basil',
  })
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Stripe price IDs - you'll need to create these in Stripe Dashboard
const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  professional: process.env.STRIPE_PRICE_PROFESSIONAL!,
  premium: process.env.STRIPE_PRICE_PREMIUM!,
}

export async function POST(request: Request) {
  try {
    const { userId, tier, email } = await request.json()

    if (!userId || !tier || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate tier
    if (!['starter', 'professional', 'premium'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      )
    }

    const stripe = getStripe()
    const supabaseAdmin = getSupabaseAdmin()

    // Get or create Stripe customer
    const { data: settings } = await supabaseAdmin
      .from('broker_settings')
      .select('stripe_customer_id')
      .eq('broker_id', userId)
      .single()

    let customerId = settings?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          broker_id: userId,
        },
      })
      customerId = customer.id

      // Save customer ID
      await supabaseAdmin
        .from('broker_settings')
        .update({ stripe_customer_id: customerId })
        .eq('broker_id', userId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-required?payment=cancelled`,
      metadata: {
        broker_id: userId,
        subscription_tier: tier,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

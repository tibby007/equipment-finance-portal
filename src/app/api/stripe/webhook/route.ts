import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

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

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const brokerId = session.metadata?.broker_id
        const tier = session.metadata?.subscription_tier

        if (brokerId && session.subscription) {
          await supabaseAdmin
            .from('broker_settings')
            .update({
              payment_status: 'active',
              stripe_subscription_id: session.subscription as string,
              subscription_tier: tier,
            })
            .eq('broker_id', brokerId)

          await supabaseAdmin
            .from('brokers')
            .update({
              payment_status: 'active',
              subscription_tier: tier,
            })
            .eq('id', brokerId)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const brokerId = subscription.metadata?.broker_id

        if (brokerId) {
          const status = subscription.status === 'active' ? 'active' :
                        subscription.status === 'past_due' ? 'past_due' : 'cancelled'

          await supabaseAdmin
            .from('broker_settings')
            .update({ payment_status: status })
            .eq('broker_id', brokerId)

          await supabaseAdmin
            .from('brokers')
            .update({ payment_status: status })
            .eq('id', brokerId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const brokerId = subscription.metadata?.broker_id

        if (brokerId) {
          await supabaseAdmin
            .from('broker_settings')
            .update({ payment_status: 'cancelled' })
            .eq('broker_id', brokerId)

          await supabaseAdmin
            .from('brokers')
            .update({ payment_status: 'cancelled' })
            .eq('id', brokerId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

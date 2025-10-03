# Payment Gate & Stripe Setup Instructions

## Overview
The payment system is now configured to require payment before users can access the platform. Admin users (like you) are whitelisted and bypass payment requirements.

## Database Setup

1. **Run the SQL migration** in your Supabase SQL Editor:
   ```bash
   # Copy and paste the contents of add-payment-status.sql into Supabase SQL Editor
   ```

## Stripe Configuration

### 1. Create Stripe Products and Prices

In your [Stripe Dashboard](https://dashboard.stripe.com):

1. Go to **Products** → **Add Product**
2. Create three products with recurring monthly prices:

   **Starter Plan**
   - Name: VendorHub OS - Starter
   - Price: $199/month
   - Copy the Price ID (starts with `price_...`)

   **Professional Plan**
   - Name: VendorHub OS - Professional
   - Price: $499/month
   - Copy the Price ID

   **Premium Plan**
   - Name: VendorHub OS - Premium
   - Price: $999/month
   - Copy the Price ID

### 2. Set Environment Variables

Add these to your `.env.local` file AND Vercel environment variables:

```env
# Stripe Keys (from Stripe Dashboard → Developers → API Keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from Products you just created)
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_PREMIUM=price_...

# Webhook Secret (set this up next)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://www.vendorhubos.com
```

### 3. Configure Stripe Webhook

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Endpoint URL: `https://www.vendorhubos.com/api/stripe/webhook`
4. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** and add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

## Admin User Setup

### Mark Your Account as Admin (No Payment Required)

To whitelist your account so you don't need to pay:

**Option 1: Using curl**
```bash
curl -X POST https://www.vendorhubos.com/api/admin/set-admin \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "isAdmin": true}'
```

**Option 2: Using Supabase SQL Editor**
```sql
-- Replace with your actual email
UPDATE brokers
SET is_admin = true, payment_status = 'active'
WHERE email = 'your-email@example.com';

UPDATE broker_settings
SET is_admin = true, payment_status = 'active'
WHERE broker_id = (SELECT id FROM brokers WHERE email = 'your-email@example.com');
```

## How It Works

### For New Users:
1. User signs up and selects a tier
2. Account is created with `payment_status = 'pending'`
3. Middleware redirects them to `/payment-required` page
4. User selects a plan and completes Stripe checkout
5. Webhook updates `payment_status = 'active'`
6. User can now access the dashboard

### For Admin Users:
1. Admin flag bypasses all payment checks
2. Can access dashboard immediately
3. No payment required

### Payment Statuses:
- **pending**: Needs to complete payment
- **active**: Paid and can access platform
- **past_due**: Payment failed, limited access
- **cancelled**: Subscription cancelled, blocked

## Testing

### Test Mode (Development)
Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

### Production Checklist
- [ ] Run SQL migration in production Supabase
- [ ] Create production Stripe products
- [ ] Set production environment variables in Vercel
- [ ] Configure production webhook endpoint
- [ ] Mark your admin account in production database
- [ ] Test signup flow with test account
- [ ] Verify payment gate blocks unpaid users
- [ ] Verify admin can bypass payment

## Deployment

After making code changes:
```bash
git add .
git commit -m "Add payment gate and Stripe integration"
git push
```

Vercel will automatically deploy. Don't forget to set the environment variables in Vercel!

## Support

If you encounter issues:
1. Check Stripe webhook logs in Dashboard
2. Check Vercel function logs
3. Check Supabase database for payment_status values
4. Verify environment variables are set correctly

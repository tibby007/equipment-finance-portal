-- Add payment status and admin flags to broker_settings
ALTER TABLE broker_settings
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active', 'past_due', 'cancelled')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Add payment_status to brokers table for easier access
ALTER TABLE brokers
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create function to sync payment status from broker_settings to brokers
CREATE OR REPLACE FUNCTION sync_broker_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE brokers
  SET
    payment_status = NEW.payment_status,
    is_admin = NEW.is_admin
  WHERE id = NEW.broker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-sync payment status
DROP TRIGGER IF EXISTS sync_payment_status_trigger ON broker_settings;
CREATE TRIGGER sync_payment_status_trigger
AFTER INSERT OR UPDATE OF payment_status, is_admin ON broker_settings
FOR EACH ROW
EXECUTE FUNCTION sync_broker_payment_status();

-- Mark existing brokers as needing payment (except if you want to grandfather them in)
-- UPDATE broker_settings SET payment_status = 'pending' WHERE payment_status IS NULL;

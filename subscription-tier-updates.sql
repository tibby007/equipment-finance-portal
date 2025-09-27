-- Update broker_settings table with proper subscription tiers and limits
-- Run this in Supabase SQL Editor

-- First, drop any existing constraint to avoid conflicts
ALTER TABLE broker_settings DROP CONSTRAINT IF EXISTS broker_settings_subscription_tier_check;

-- Update all existing data to use the new tier names
UPDATE broker_settings SET subscription_tier = 'starter' WHERE subscription_tier = 'basic';
UPDATE broker_settings SET subscription_tier = 'starter' WHERE subscription_tier NOT IN ('starter', 'professional', 'premium');

-- Now add the constraint after all data is cleaned up
ALTER TABLE broker_settings ADD CONSTRAINT broker_settings_subscription_tier_check
    CHECK (subscription_tier IN ('starter', 'professional', 'premium'));

-- Add subscription tracking columns to brokers table
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Add usage tracking columns
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS current_vendor_count INTEGER DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS current_month_deals INTEGER DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS storage_used_mb INTEGER DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS monthly_deals_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to get subscription limits
CREATE OR REPLACE FUNCTION get_subscription_limits(tier TEXT)
RETURNS TABLE(
    max_vendors INTEGER,
    max_deals_per_month INTEGER,
    document_storage_limit_gb INTEGER
) AS $$
BEGIN
    CASE tier
        WHEN 'starter' THEN
            RETURN QUERY SELECT 3, 50, 1;
        WHEN 'professional' THEN
            RETURN QUERY SELECT 10, 200, 10;
        WHEN 'premium' THEN
            RETURN QUERY SELECT -1, -1, 100; -- -1 means unlimited
        ELSE
            RETURN QUERY SELECT 3, 50, 1; -- Default to starter limits
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if broker can add vendor
CREATE OR REPLACE FUNCTION can_add_vendor(broker_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    broker_tier TEXT;
BEGIN
    -- Get broker's current vendor count and tier
    SELECT current_vendor_count,
           COALESCE(bs.subscription_tier, 'starter')
    INTO current_count, broker_tier
    FROM brokers b
    LEFT JOIN broker_settings bs ON b.id = bs.broker_id
    WHERE b.id = broker_uuid;

    -- Get max allowed for this tier
    SELECT max_vendors INTO max_allowed
    FROM get_subscription_limits(broker_tier);

    -- -1 means unlimited
    IF max_allowed = -1 THEN
        RETURN TRUE;
    END IF;

    RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if broker can add deal this month
CREATE OR REPLACE FUNCTION can_add_deal(broker_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
    broker_tier TEXT;
    reset_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get broker's current deal count and tier
    SELECT current_month_deals,
           monthly_deals_reset_date,
           COALESCE(bs.subscription_tier, 'starter')
    INTO current_count, reset_date, broker_tier
    FROM brokers b
    LEFT JOIN broker_settings bs ON b.id = bs.broker_id
    WHERE b.id = broker_uuid;

    -- Reset counter if it's a new month
    IF reset_date < DATE_TRUNC('month', NOW()) THEN
        UPDATE brokers
        SET current_month_deals = 0,
            monthly_deals_reset_date = NOW()
        WHERE id = broker_uuid;
        current_count := 0;
    END IF;

    -- Get max allowed for this tier
    SELECT max_deals_per_month INTO max_allowed
    FROM get_subscription_limits(broker_tier);

    -- -1 means unlimited
    IF max_allowed = -1 THEN
        RETURN TRUE;
    END IF;

    RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update vendor count when vendors are added/removed
CREATE OR REPLACE FUNCTION update_vendor_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE brokers
        SET current_vendor_count = current_vendor_count + 1
        WHERE id = NEW.broker_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE brokers
        SET current_vendor_count = GREATEST(current_vendor_count - 1, 0)
        WHERE id = OLD.broker_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update deal count when deals are added
CREATE OR REPLACE FUNCTION update_deal_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE brokers
        SET current_month_deals = current_month_deals + 1
        WHERE id = NEW.broker_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_vendor_count ON vendors;
CREATE TRIGGER trigger_vendor_count
    AFTER INSERT OR DELETE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_count();

DROP TRIGGER IF EXISTS trigger_deal_count ON deals;
CREATE TRIGGER trigger_deal_count
    AFTER INSERT ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deal_count();

-- Initialize current vendor counts for existing brokers
UPDATE brokers
SET current_vendor_count = (
    SELECT COUNT(*)
    FROM vendors
    WHERE vendors.broker_id = brokers.id
);
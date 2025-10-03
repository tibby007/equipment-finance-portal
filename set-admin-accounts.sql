-- Set Cheryl as admin (owner - full access, no payment required)
UPDATE brokers
SET is_admin = true, payment_status = 'active'
WHERE email = 'cheryl@commcapconnect.com';

UPDATE broker_settings
SET is_admin = true, payment_status = 'active', subscription_tier = 'premium'
WHERE broker_id = (SELECT id FROM brokers WHERE email = 'cheryl@commcapconnect.com');

-- Set Keenan as premium user (no payment required)
UPDATE brokers
SET is_admin = true, payment_status = 'active', subscription_tier = 'premium'
WHERE email = 'keenan@getmybusinesscredit.com';

UPDATE broker_settings
SET is_admin = true, payment_status = 'active', subscription_tier = 'premium'
WHERE broker_id = (SELECT id FROM brokers WHERE email = 'keenan@getmybusinesscredit.com');

-- Verify both accounts are set up correctly
SELECT
  b.email,
  b.is_admin,
  b.payment_status,
  b.subscription_tier as broker_tier,
  bs.subscription_tier as settings_tier,
  bs.is_admin as settings_admin,
  bs.payment_status as settings_status
FROM brokers b
LEFT JOIN broker_settings bs ON b.id = bs.broker_id
WHERE b.email IN ('cheryl@commcapconnect.com', 'keenan@getmybusinesscredit.com')
ORDER BY b.email;

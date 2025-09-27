-- Create Supabase Auth Users for Mock Vendors
-- This script needs to be run AFTER the mock-data-setup.sql
-- Note: In production, vendors would sign up through the application

-- Get vendor IDs to create auth accounts
-- You'll need to run these INSERT statements one by one and update the user IDs manually

-- First, get the vendor UUIDs from the vendors table:
SELECT id, email, first_name, last_name, company_name FROM vendors;

-- Then for each vendor, you'll need to:
-- 1. Create a Supabase auth user manually in the Auth > Users section of Supabase Dashboard
-- 2. Use the email from the vendors table (e.g., sarah@techflow.com)
-- 3. Set a temporary password (e.g., "VendorDemo123!")
-- 4. Copy the new auth user UUID
-- 5. Update the vendor record to use that auth UUID

-- Example UPDATE statements (replace the UUIDs with actual values):
-- UPDATE vendors SET id = 'NEW_AUTH_USER_UUID_HERE' WHERE email = 'sarah@techflow.com';
-- UPDATE vendors SET id = 'NEW_AUTH_USER_UUID_HERE' WHERE email = 'mike@mountainview.com';
-- UPDATE vendors SET id = 'NEW_AUTH_USER_UUID_HERE' WHERE email = 'lisa@greenenergy.com';
-- UPDATE vendors SET id = 'NEW_AUTH_USER_UUID_HERE' WHERE email = 'david@coastallogistics.com';

-- After updating vendor IDs, you'll also need to update the deals table:
-- UPDATE deals SET vendor_id = 'NEW_AUTH_USER_UUID_HERE' WHERE vendor_id = 'OLD_VENDOR_UUID_HERE';

-- Alternative: Simple test vendor creation script
-- This creates a single test vendor that you can use for testing

DO $$
DECLARE
    test_broker_id UUID;
    test_vendor_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- You'll replace this with actual auth user UUID
BEGIN
    -- Get the first broker ID
    SELECT id INTO test_broker_id FROM brokers LIMIT 1;

    -- Create a test vendor entry (you'll need to create the auth user manually first)
    INSERT INTO vendors (
        id,
        broker_id,
        email,
        company_name,
        first_name,
        last_name,
        password_hash,
        must_change_password,
        created_at,
        updated_at
    ) VALUES (
        test_vendor_id, -- Replace with actual Supabase auth user UUID
        test_broker_id,
        'testvendor@demo.com',
        'Demo Vendor Co',
        'Demo',
        'Vendor',
        'placeholder_hash',
        false,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        company_name = EXCLUDED.company_name,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name;

    -- Create a test deal for this vendor
    INSERT INTO deals (
        id,
        vendor_id,
        broker_id,
        customer_name,
        equipment_type,
        deal_amount,
        current_stage,
        prequalification_score,
        application_data,
        stage_history,
        last_activity,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        test_vendor_id,
        test_broker_id,
        'Test Customer Corp',
        'Demo Equipment',
        150000.00,
        'application',
        'green',
        '{"equipment_description": "Demo equipment for testing", "financing_amount": 150000, "term_months": 36}',
        jsonb_build_array(
            jsonb_build_object(
                'stage', 'new',
                'timestamp', NOW() - INTERVAL '5 days',
                'notes', 'Demo deal for testing vendor access'
            ),
            jsonb_build_object(
                'stage', 'application',
                'timestamp', NOW() - INTERVAL '2 days',
                'notes', 'Application submitted for testing'
            )
        ),
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day'
    );

    RAISE NOTICE 'Test vendor and deal created. Remember to:';
    RAISE NOTICE '1. Create Supabase auth user with email: testvendor@demo.com';
    RAISE NOTICE '2. Copy the auth user UUID';
    RAISE NOTICE '3. Update vendors table: UPDATE vendors SET id = ''NEW_UUID'' WHERE email = ''testvendor@demo.com'';';
    RAISE NOTICE '4. Update deals table: UPDATE deals SET vendor_id = ''NEW_UUID'' WHERE vendor_id = ''%'';', test_vendor_id;
END $$;

-- Instructions for manual setup:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user"
-- 3. Enter email: testvendor@demo.com
-- 4. Enter password: VendorDemo123!
-- 5. Click "Create user"
-- 6. Copy the UUID from the created user
-- 7. Run: UPDATE vendors SET id = 'COPIED_UUID' WHERE email = 'testvendor@demo.com';
-- 8. Run: UPDATE deals SET vendor_id = 'COPIED_UUID' WHERE customer_name = 'Test Customer Corp';
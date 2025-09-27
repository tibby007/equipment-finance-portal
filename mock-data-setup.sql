-- Mock Data Setup for VendorHub OS
-- Run this in Supabase SQL Editor to add sample data

-- First, let's add some mock vendors using the actual schema
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
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM brokers LIMIT 1), -- Uses the first broker
  'sarah@techflow.com',
  'TechFlow Solutions',
  'Sarah',
  'Martinez',
  '$2a$10$example.hash.for.demo.purposes.only.not.real',
  false,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM brokers LIMIT 1),
  'mike@mountainview.com',
  'Mountain View Construction',
  'Mike',
  'Johnson',
  '$2a$10$example.hash.for.demo.purposes.only.not.real',
  false,
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM brokers LIMIT 1),
  'lisa@greenenergy.com',
  'Green Energy Corp',
  'Lisa',
  'Chen',
  '$2a$10$example.hash.for.demo.purposes.only.not.real',
  false,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  (SELECT id FROM brokers LIMIT 1),
  'david@coastallogistics.com',
  'Coastal Logistics',
  'David',
  'Rodriguez',
  '$2a$10$example.hash.for.demo.purposes.only.not.real',
  true,
  NOW() - INTERVAL '15 days',
  NOW()
);

-- Insert mock deals in various stages using actual schema
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
) VALUES
-- New/Lead stage deals
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'TechFlow Solutions'),
  (SELECT id FROM brokers LIMIT 1),
  'DataCore Enterprises',
  'Server Infrastructure',
  125000.00,
  'new',
  'green',
  '{"equipment_description": "New server infrastructure for data center expansion", "financing_amount": 125000, "term_months": 36}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '5 days')::text || '", "notes": "Initial inquiry received"}]',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'Coastal Logistics'),
  (SELECT id FROM brokers LIMIT 1),
  'QuickShip Delivery',
  'Commercial Vehicles',
  89000.00,
  'new',
  'yellow',
  '{"equipment_description": "Fleet expansion with 3 delivery trucks", "financing_amount": 89000, "term_months": 48}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '3 days')::text || '", "notes": "Looking to expand delivery capabilities"}]',
  NOW(),
  NOW() - INTERVAL '3 days',
  NOW()
),

-- Application stage deals
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'Mountain View Construction'),
  (SELECT id FROM brokers LIMIT 1),
  'BuildRight Construction',
  'Heavy Machinery',
  340000.00,
  'application',
  'green',
  '{"equipment_description": "Heavy machinery package for large construction project", "financing_amount": 340000, "term_months": 60}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '12 days')::text || '"}, {"stage": "application", "timestamp": "' || (NOW() - INTERVAL '8 days')::text || '", "notes": "Application submitted with financial documents"}]',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '12 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'Green Energy Corp'),
  (SELECT id FROM brokers LIMIT 1),
  'SolarTech Manufacturing',
  'Manufacturing Equipment',
  580000.00,
  'application',
  'green',
  '{"equipment_description": "Solar panel manufacturing line equipment", "financing_amount": 580000, "term_months": 72}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '8 days')::text || '"}, {"stage": "application", "timestamp": "' || (NOW() - INTERVAL '5 days')::text || '", "notes": "Strong financials, application under review"}]',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '8 days',
  NOW() - INTERVAL '1 day'
),

-- Review stage deals
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'TechFlow Solutions'),
  (SELECT id FROM brokers LIMIT 1),
  'Office Pro Solutions',
  'Office Equipment',
  75000.00,
  'review',
  'green',
  '{"equipment_description": "Office technology upgrade package", "financing_amount": 75000, "term_months": 36}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '18 days')::text || '"}, {"stage": "application", "timestamp": "' || (NOW() - INTERVAL '10 days')::text || '"}, {"stage": "review", "timestamp": "' || (NOW() - INTERVAL '5 days')::text || '", "notes": "Credit review in progress"}]',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '3 days'
),

-- Approved stage deals
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'Mountain View Construction'),
  (SELECT id FROM brokers LIMIT 1),
  'CraneWorks LLC',
  'Construction Equipment',
  220000.00,
  'approved',
  'green',
  '{"equipment_description": "Crane and construction equipment lease", "financing_amount": 220000, "term_months": 48}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '25 days')::text || '"}, {"stage": "application", "timestamp": "' || (NOW() - INTERVAL '15 days')::text || '"}, {"stage": "review", "timestamp": "' || (NOW() - INTERVAL '8 days')::text || '"}, {"stage": "approved", "timestamp": "' || (NOW() - INTERVAL '2 days')::text || '", "notes": "Financing approved, pending final documentation"}]',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '1 day'
),

-- Funded stage deals
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'Green Energy Corp'),
  (SELECT id FROM brokers LIMIT 1),
  'Industrial Manufacturers Inc',
  'Production Equipment',
  450000.00,
  'funded',
  'green',
  '{"equipment_description": "Production line equipment financing", "financing_amount": 450000, "term_months": 60}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '35 days')::text || '"}, {"stage": "application", "timestamp": "' || (NOW() - INTERVAL '25 days')::text || '"}, {"stage": "review", "timestamp": "' || (NOW() - INTERVAL '15 days')::text || '"}, {"stage": "approved", "timestamp": "' || (NOW() - INTERVAL '8 days')::text || '"}, {"stage": "funded", "timestamp": "' || (NOW() - INTERVAL '5 days')::text || '", "notes": "Successfully funded! Equipment delivered."}]',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '35 days',
  NOW() - INTERVAL '5 days'
),

-- Declined deals
(
  gen_random_uuid(),
  (SELECT id FROM vendors WHERE company_name = 'Coastal Logistics'),
  (SELECT id FROM brokers LIMIT 1),
  'AutoWarehouse Systems',
  'Warehouse Equipment',
  185000.00,
  'declined',
  'red',
  '{"equipment_description": "Warehouse automation system", "financing_amount": 185000, "term_months": 48}',
  '[{"stage": "new", "timestamp": "' || (NOW() - INTERVAL '40 days')::text || '"}, {"stage": "application", "timestamp": "' || (NOW() - INTERVAL '30 days')::text || '"}, {"stage": "review", "timestamp": "' || (NOW() - INTERVAL '20 days')::text || '"}, {"stage": "declined", "timestamp": "' || (NOW() - INTERVAL '10 days')::text || '", "notes": "Credit score below threshold, declined."}]',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '10 days'
);

-- Add some sample notes for deals using the actual schema
INSERT INTO notes (
  id,
  deal_id,
  author_id,
  author_type,
  message,
  created_at
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'DataCore Enterprises'),
  (SELECT id FROM brokers LIMIT 1),
  'broker',
  'Initial contact made with client. They are very interested in server infrastructure upgrade for their data center expansion.',
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'BuildRight Construction'),
  (SELECT id FROM brokers LIMIT 1),
  'broker',
  'Site visit completed. Client has a large construction project starting next month and needs heavy machinery financing.',
  NOW() - INTERVAL '10 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'Office Pro Solutions'),
  (SELECT id FROM brokers LIMIT 1),
  'broker',
  'Credit review in progress. Client has strong financials and good payment history.',
  NOW() - INTERVAL '3 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'CraneWorks LLC'),
  (SELECT id FROM brokers LIMIT 1),
  'broker',
  'Financing approved! Client is very pleased with the terms. Waiting for final paperwork.',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'Industrial Manufacturers Inc'),
  (SELECT id FROM brokers LIMIT 1),
  'broker',
  'Deal successfully funded! Equipment has been delivered and client is operational.',
  NOW() - INTERVAL '5 days'
);

-- Add some sample documents using the actual schema
INSERT INTO documents (
  id,
  deal_id,
  file_name,
  file_path,
  file_type,
  uploaded_by,
  created_at
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'BuildRight Construction'),
  'Equipment_Specification.pdf',
  '/documents/equipment-spec-001.pdf',
  'application/pdf',
  (SELECT id FROM brokers LIMIT 1),
  NOW() - INTERVAL '8 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'Office Pro Solutions'),
  'Financial_Statements.pdf',
  '/documents/financial-statements-002.pdf',
  'application/pdf',
  (SELECT id FROM vendors WHERE company_name = 'TechFlow Solutions'),
  NOW() - INTERVAL '5 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM deals WHERE customer_name = 'Industrial Manufacturers Inc'),
  'Signed_Contract.pdf',
  '/documents/signed-contract-003.pdf',
  'application/pdf',
  (SELECT id FROM brokers LIMIT 1),
  NOW() - INTERVAL '6 days'
);

-- Note: To see these vendors and deals in your dashboard:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. The data will be associated with your first broker account
-- 3. Log in as a broker to see all vendors and deals
-- 4. Vendors can be given login credentials through Supabase Auth panel if needed

-- Summary of mock data created:
-- ✅ 4 Vendors (TechFlow Solutions, Mountain View Construction, Green Energy Corp, Coastal Logistics)
-- ✅ 8 Deals across all stages (new, application, review, approved, funded, declined)
-- ✅ 5 Notes with realistic broker communications
-- ✅ 3 Documents attached to deals
-- ✅ Realistic timestamps and stage progressions
-- ✅ Various prequalification scores (green, yellow, red)
-- ✅ Different equipment types and financing amounts
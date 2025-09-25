-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('starter', 'pro', 'premium');
CREATE TYPE prequalification_score AS ENUM ('green', 'yellow', 'red');
CREATE TYPE author_type AS ENUM ('vendor', 'broker');
CREATE TYPE resource_type AS ENUM ('file', 'text');

-- Brokers table
CREATE TABLE brokers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  subscription_tier subscription_tier DEFAULT 'starter',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendors table  
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals table
CREATE TABLE deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  deal_amount DECIMAL(12,2) NOT NULL,
  current_stage TEXT DEFAULT 'new',
  prequalification_score prequalification_score,
  application_data JSONB,
  stage_history JSONB DEFAULT '[]'::jsonb,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_type author_type NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources table
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_path TEXT,
  resource_type resource_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vendors_broker_id ON vendors(broker_id);
CREATE INDEX idx_deals_vendor_id ON deals(vendor_id);
CREATE INDEX idx_deals_broker_id ON deals(broker_id);
CREATE INDEX idx_deals_current_stage ON deals(current_stage);
CREATE INDEX idx_documents_deal_id ON documents(deal_id);
CREATE INDEX idx_notes_deal_id ON notes(deal_id);
CREATE INDEX idx_resources_broker_id ON resources(broker_id);

-- Enable Row Level Security on all tables
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brokers
CREATE POLICY "Brokers can view own profile" ON brokers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Brokers can update own profile" ON brokers
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for vendors
CREATE POLICY "Vendors can view own profile" ON vendors
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Vendors can update own profile" ON vendors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Brokers can view their vendors" ON vendors
  FOR SELECT USING (broker_id = auth.uid());

CREATE POLICY "Brokers can manage their vendors" ON vendors
  FOR ALL USING (broker_id = auth.uid());

-- RLS Policies for deals
CREATE POLICY "Brokers can view their deals" ON deals
  FOR SELECT USING (
    broker_id = auth.uid() OR 
    vendor_id IN (SELECT id FROM vendors WHERE broker_id = auth.uid())
  );

CREATE POLICY "Vendors can view their deals" ON deals
  FOR SELECT USING (vendor_id = auth.uid());

CREATE POLICY "Brokers can manage deals" ON deals
  FOR ALL USING (
    broker_id = auth.uid() OR 
    vendor_id IN (SELECT id FROM vendors WHERE broker_id = auth.uid())
  );

CREATE POLICY "Vendors can create deals" ON deals
  FOR INSERT WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their deals" ON deals
  FOR UPDATE USING (vendor_id = auth.uid());

-- RLS Policies for documents
CREATE POLICY "Deal participants can view documents" ON documents
  FOR SELECT USING (
    deal_id IN (
      SELECT id FROM deals 
      WHERE broker_id = auth.uid() OR vendor_id = auth.uid()
    )
  );

CREATE POLICY "Deal participants can upload documents" ON documents
  FOR INSERT WITH CHECK (
    deal_id IN (
      SELECT id FROM deals 
      WHERE broker_id = auth.uid() OR vendor_id = auth.uid()
    )
  );

-- RLS Policies for notes
CREATE POLICY "Deal participants can view notes" ON notes
  FOR SELECT USING (
    deal_id IN (
      SELECT id FROM deals 
      WHERE broker_id = auth.uid() OR vendor_id = auth.uid()
    )
  );

CREATE POLICY "Deal participants can create notes" ON notes
  FOR INSERT WITH CHECK (
    deal_id IN (
      SELECT id FROM deals 
      WHERE broker_id = auth.uid() OR vendor_id = auth.uid()
    ) AND author_id = auth.uid()
  );

-- RLS Policies for resources
CREATE POLICY "Brokers can manage their resources" ON resources
  FOR ALL USING (broker_id = auth.uid());

CREATE POLICY "Vendors can view broker resources" ON resources
  FOR SELECT USING (
    broker_id IN (SELECT broker_id FROM vendors WHERE id = auth.uid())
  );

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
CREATE TRIGGER update_brokers_updated_at 
  BEFORE UPDATE ON brokers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at 
  BEFORE UPDATE ON deals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity on deals
CREATE OR REPLACE FUNCTION update_deal_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE deals SET last_activity = NOW() WHERE id = NEW.deal_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update deal activity
CREATE TRIGGER update_deal_activity_on_note 
  AFTER INSERT ON notes 
  FOR EACH ROW EXECUTE FUNCTION update_deal_activity();

CREATE TRIGGER update_deal_activity_on_document 
  AFTER INSERT ON documents 
  FOR EACH ROW EXECUTE FUNCTION update_deal_activity();
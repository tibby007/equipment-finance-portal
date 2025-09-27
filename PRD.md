# Comprehensive PRD for Equipment Finance Vendor Portal

## Project Context
You are building a multi-tenant SaaS equipment finance vendor portal that streamlines broker-vendor workflows and deal management. The tech stack is:
- Frontend: NextJS with Shadcn UI components
- Backend: n8n workflow automation via webhooks
- Database & Auth: Supabase
- Payments: Stripe integration for subscriptions

## Detailed Requirements

### 1. Product Overview
An equipment finance vendor portal that eliminates communication gaps and workflow inefficiencies between brokers and their vendor networks. Brokers can manage multiple vendors through tiered subscriptions, while vendors get tools to prequalify deals and submit complete applications with shared pipeline visibility.

### 2. User Personas
**Brokers**: Equipment finance professionals who process deals and manage vendor networks. Need pipeline control, vendor management, and resource sharing capabilities.

**Vendors**: Equipment suppliers/dealers who originate deals for brokers. Need prequalification tools, application forms, document upload, and pipeline visibility.

**Super Admin**: System administrator with oversight of all broker accounts and subscription management.

### 3. User Journey Map

**Broker Flow:**
1. Signs up and selects subscription tier
2. Invites vendors via email with auto-generated credentials
3. Receives new leads from vendors in kanban board
4. Moves deals through pipeline stages
5. Communicates with vendors via two-way notes in deal cards
6. Manages resource library for vendor education
7. Views metrics on dashboard

**Vendor Flow:**
1. Receives email invitation with login credentials
2. Changes default password on first login
3. Uses prequalification tool (gets red/yellow/green result)
4. Completes online application for qualified deals
5. Uploads supporting documents (invoices, quotes, misc)
6. Watches deal progress through shared kanban view
7. Communicates with broker via deal card notes
8. Views personal metrics on dashboard

### 4. Feature Specifications

**Invite System**
- Broker creates vendor account with email/password
- Auto-generated email with credentials and password change prompt
- Vendor tied permanently to creating broker's subscription

**Shared Kanban CRM**
- Visual pipeline with customizable stages
- Deal cards show application details and documents
- Real-time updates visible to both broker and vendor
- Broker controls stage movements

**Prequalification Tool**
- Green Light: 640+ FICO, 2+ years in business, no public records, $120K+ annual revenue, deals ≤$100K
- Red Light: Outside parameters (can still submit for manual review)
- Yellow Light: Close to parameters but not quite meeting criteria

**Online Application Builder**
- Complete customer application form
- Field validation and required field enforcement
- Save as draft functionality

**Document Upload System**
- Invoice/quote upload
- Miscellaneous supporting documents
- File type restrictions and size limits
- Organized by deal

**Two-Way Communication**
- Note system within deal cards
- Real-time notifications for new messages
- Message history and timestamps

**Resource Library**
- Broker can upload files for vendor education
- Text-based resources and guides
- Organized categorization

**Dashboards & Metrics**
- Deal volume, conversion rates, processing times
- Vendor performance metrics
- Revenue tracking per broker tier

### 5. Data Architecture

**Supabase Schema:**
```sql
-- Broker Accounts
brokers (
  id uuid primary key,
  email text unique,
  company_name text,
  subscription_tier text, -- starter/pro/premium
  stripe_customer_id text,
  created_at timestamp,
  updated_at timestamp
)

-- Vendors
vendors (
  id uuid primary key,
  broker_id uuid references brokers(id),
  email text unique,
  company_name text,
  first_name text,
  last_name text,
  password_hash text,
  must_change_password boolean default true,
  created_at timestamp,
  updated_at timestamp
)

-- Deals
deals (
  id uuid primary key,
  vendor_id uuid references vendors(id),
  broker_id uuid references brokers(id),
  customer_name text,
  equipment_type text,
  deal_amount decimal,
  current_stage text,
  prequalification_score text, -- green/yellow/red
  application_data jsonb,
  created_at timestamp,
  updated_at timestamp
)

-- Documents
documents (
  id uuid primary key,
  deal_id uuid references deals(id),
  file_name text,
  file_path text,
  file_type text,
  uploaded_by uuid, -- vendor or broker id
  created_at timestamp
)

-- Notes
notes (
  id uuid primary key,
  deal_id uuid references deals(id),
  author_id uuid,
  author_type text, -- vendor or broker
  message text,
  created_at timestamp
)

-- Resources
resources (
  id uuid primary key,
  broker_id uuid references brokers(id),
  title text,
  content text,
  file_path text,
  resource_type text, -- file or text
  created_at timestamp
)
```

### 6. Technical Implementation

**Authentication & Authorization**
- Supabase Auth for user management
- Row Level Security (RLS) policies
- Role-based access control (broker vs vendor)

**Frontend Components**
- Responsive design with Tailwind CSS
- Shadcn UI component library
- Real-time updates via Supabase subscriptions

**Subscription Management**
- Stripe integration for payment processing
- Tiered pricing: Starter/Pro/Premium
- Usage-based billing considerations

**File Storage**
- Supabase Storage for document uploads
- Secure file access with signed URLs
- File type validation and size limits

**Workflow Automation**
- n8n integration for email notifications
- Automated vendor invitation process
- Deal stage change notifications

### 7. Subscription Tiers

**Starter Tier**
- Up to 5 vendors
- Basic kanban board
- Standard prequalification
- Email support

**Pro Tier**
- Up to 20 vendors
- Advanced analytics
- Custom stages
- Priority support

**Premium Tier**
- Unlimited vendors
- White-label options
- API access
- Dedicated support

### 8. Security Requirements

**Data Protection**
- HTTPS everywhere
- Database encryption at rest
- Secure file uploads
- Personal data anonymization options

**Access Control**
- Multi-factor authentication options
- Session management
- Audit logging
- Role-based permissions

### 9. Performance Requirements

**Response Times**
- Page loads < 2 seconds
- Real-time updates < 1 second
- File uploads with progress indicators

**Scalability**
- Support 1000+ concurrent users
- Database optimization for large datasets
- CDN for static assets

### 10. Integration Requirements

**Email System**
- Transactional emails via n8n
- Vendor invitation emails
- Deal notification emails
- Password reset functionality

**Payment Processing**
- Stripe webhook handling
- Subscription lifecycle management
- Invoice generation
- Failed payment handling

**API Design**
- RESTful endpoints
- Webhook support for integrations
- Rate limiting
- API documentation
-- Create Storage Bucket for Documents
-- IMPORTANT: Run this in Supabase SQL Editor OR create through Dashboard

-- Method 1: SQL (Run this in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the documents bucket
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Method 2: Supabase Dashboard (Easier)
-- 1. Go to Storage in Supabase Dashboard
-- 2. Click "Create new bucket"
-- 3. Name: documents
-- 4. Public: true
-- 5. Click "Create bucket"

-- The application will work with either method, but the bucket MUST exist
-- for file uploads to work properly.

-- Current Status: Bucket creation is REQUIRED for file uploads
-- Without this bucket, uploads will fail with "Bucket not found" error
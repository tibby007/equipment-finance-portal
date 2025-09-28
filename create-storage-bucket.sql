-- Create Storage Bucket for Documents
-- Run this in Supabase SQL Editor to create the documents bucket

-- Create the documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the documents bucket
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Or alternatively, create through Supabase Dashboard:
-- 1. Go to Storage > Create new bucket
-- 2. Name: documents
-- 3. Public: true
-- 4. Set up the RLS policies as above
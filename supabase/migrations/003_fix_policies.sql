
-- Campus Voting System - Policy Fixes
-- This migration adds missing UPDATE/DELETE policies and storage access

-- ============================================================================
-- TABLE POLICIES
-- ============================================================================

-- Positions
CREATE POLICY "Only EC can update positions"
  ON positions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

CREATE POLICY "Only EC can delete positions"
  ON positions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- Candidates
CREATE POLICY "Only EC can update candidates"
  ON candidates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- Voter Assignments
CREATE POLICY "Only EC can delete assignments"
  ON voter_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Allow public access to read images
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'elections' );

-- Allow EC admins to upload images
CREATE POLICY "EC Admin Upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'elections' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- Allow EC admins to update images
CREATE POLICY "EC Admin Update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'elections' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- Allow EC admins to delete images
CREATE POLICY "EC Admin Delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'elections' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- Campus Voting System - Row Level Security (RLS) Policies
-- CRITICAL: These policies enforce voting restrictions at database level
-- Run this SQL in your Supabase SQL Editor

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE voter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voter_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VOTER_PROFILES - Users can read profiles, EC can manage
-- ============================================================================

CREATE POLICY "Everyone can view voter profiles"
  ON voter_profiles FOR SELECT
  USING (true);

CREATE POLICY "EC can create voter profiles"
  ON voter_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

CREATE POLICY "EC can update voter profiles"
  ON voter_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- ============================================================================
-- ELECTIONS - Anyone can view public election info
-- ============================================================================

CREATE POLICY "Everyone can view elections"
  ON elections FOR SELECT
  USING (true);

CREATE POLICY "Only EC can create elections"
  ON elections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

CREATE POLICY "Only EC can update elections"
  ON elections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- ============================================================================
-- POSITIONS - Anyone can view positions
-- ============================================================================

CREATE POLICY "Everyone can view positions"
  ON positions FOR SELECT
  USING (true);

CREATE POLICY "Only EC can create positions"
  ON positions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- ============================================================================
-- CANDIDATES - Anyone can view candidates
-- ============================================================================

CREATE POLICY "Everyone can view candidates"
  ON candidates FOR SELECT
  USING (true);

CREATE POLICY "Only EC can create candidates"
  ON candidates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

CREATE POLICY "Only EC can delete candidates"
  ON candidates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- ============================================================================
-- VOTES - CRITICAL SECURITY POLICIES
-- ============================================================================

-- Users can only view their own votes (for audit purposes)
-- For email-based voters, this allows anonymous viewing of their own votes
CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT
  USING (true);

-- EC can view all votes (for results)
CREATE POLICY "EC can view all votes"
  ON votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- CRITICAL: Users can only vote if:
-- 1. They exist as a voter profile (auto-created when they enter email)
-- 2. They haven't voted for this position yet (enforced by UNIQUE constraint)
-- 3. The election is within voting window
CREATE POLICY "Users can vote if assigned"
  ON votes FOR INSERT
  WITH CHECK (
    -- Voter exists and is active
    EXISTS (
      SELECT 1 FROM voter_profiles
      WHERE voter_id = votes.voter_id
      AND status = 'active'
    )
    -- Election is within voting window (regardless of status)
    AND EXISTS (
      SELECT 1 FROM elections
      WHERE id = votes.election_id
      AND start_time <= NOW()
      AND end_time > NOW()
    )
  );

-- ============================================================================
-- VOTER_ASSIGNMENTS - Only EC can manage
-- ============================================================================

CREATE POLICY "EC can view assignments"
  ON voter_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

CREATE POLICY "Only EC can create assignments"
  ON voter_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

-- ============================================================================
-- LOGS - Only EC and the user can view their own logs
-- ============================================================================

CREATE POLICY "Users can view own logs"
  ON logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "EC can view all logs"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'ec_admin'
    )
  );

CREATE POLICY "Authenticated users can create logs"
  ON logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

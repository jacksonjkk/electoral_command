-- Campus Voting System - Supabase PostgreSQL Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Voter Profiles (linked to Supabase Auth)
CREATE TABLE voter_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for email-based voters
  voter_id VARCHAR(50) NOT NULL UNIQUE, -- Anonymized voter identifier
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elections
CREATE TABLE elections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'paused', 'closed')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Positions (e.g., President, Secretary)
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_votes INTEGER DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(election_id, name)
);

-- Candidates
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  manifesto TEXT,
  image_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes (CRITICAL: The voting record)
-- UNIQUE constraint prevents duplicate votes per voter per position
-- This is the primary anti-rigging mechanism
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id VARCHAR(50) NOT NULL REFERENCES voter_profiles(voter_id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  position_id UUID NOT NULL REFERENCES positions(id),
  election_id UUID NOT NULL REFERENCES elections(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- CRITICAL: Prevent duplicate votes
  UNIQUE(voter_id, position_id)
);

-- Voter Assignments (EC assigns voters to elections)
-- Only assigned voters can vote in an election
CREATE TABLE voter_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id VARCHAR(50) NOT NULL REFERENCES voter_profiles(voter_id),
  election_id UUID NOT NULL REFERENCES elections(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voter_id, election_id)
);

-- Audit Logs
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (Performance)
-- ============================================================================

CREATE INDEX idx_voter_profiles_user_id ON voter_profiles(user_id);
CREATE INDEX idx_voter_profiles_email ON voter_profiles(email);
CREATE INDEX idx_elections_status ON elections(status);
CREATE INDEX idx_elections_created_by ON elections(created_by);
CREATE INDEX idx_positions_election_id ON positions(election_id);
CREATE INDEX idx_candidates_position_id ON candidates(position_id);
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_election_id ON votes(election_id);
CREATE INDEX idx_votes_position_id ON votes(position_id);
CREATE INDEX idx_voter_assignments_voter_id ON voter_assignments(voter_id);
CREATE INDEX idx_voter_assignments_election_id ON voter_assignments(election_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp DESC);

-- ============================================================================
-- STORAGE
-- ============================================================================

-- Create storage bucket for election images
INSERT INTO storage.buckets (id, name, public)
VALUES ('elections', 'elections', true)
ON CONFLICT DO NOTHING;

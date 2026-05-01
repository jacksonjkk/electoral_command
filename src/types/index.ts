import { User } from '@supabase/supabase-js';

// Type definitions for the voting system

export type UserRole = 'voter' | 'ec_admin';

export interface VoterProfile {
  id: string;
  user_id: string;
  voter_id: string; // Unique identifier for voting purposes
  email: string;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export type ElectionStatus = 'scheduled' | 'active' | 'paused' | 'closed';

export interface Election {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: ElectionStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  reg_no_rule?: string;
  results_published?: boolean;
}

export interface Position {
  id: string;
  election_id: string;
  name: string;
  description?: string;
  max_votes?: number;
  display_order: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  position_id: string;
  name: string;
  manifesto?: string;
  image_url?: string;
  display_order: number;
  created_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  candidate_id: string;
  position_id: string;
  election_id: string;
  created_at: string;
}

export interface VoterAssignment {
  id: string;
  voter_id: string;
  election_id: string;
  assigned_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  details?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
}

export interface BallotItem {
  position: Position;
  candidates: Candidate[];
}

export interface VotePayload {
  voter_id: string;
  candidate_id: string;
  position_id: string;
  election_id: string;
}

export interface ElectionResults {
  election_id: string;
  election_title: string;
  positions: PositionResults[];
  total_voters_assigned: number;
  total_votes_cast: number;
  turnout_percentage: number;
}

export interface PositionResults {
  position_id: string;
  position_name: string;
  candidates: CandidateResult[];
  total_votes: number;
}

export interface CandidateResult {
  candidate_id: string;
  name: string;
  image_url?: string;
  votes: number;
  percentage: number;
}

export interface RecentVote {
  id: string;
  created_at: string;
  voter_profiles: {
    email: string;
  };
}

export interface AuthContextType {
  user: User | null;
  profile: VoterProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendOtp?: (email: string) => Promise<void>;
  verifyOtp?: (email: string, otp: string) => Promise<void>;
}

import { supabase } from './supabase';
import { VotePayload, BallotItem, Election } from '@/types';
import { generateVoterId } from '@/utils/helpers';
import { resolveCandidateImageUrl } from '@/utils/storage';


export const ballotService = {
  /**
   * Get or create voter profile from email
   */
  getOrCreateVoter: async (email: string): Promise<{ voter_id: string; profile: any } | undefined> => {
    const voterId = generateVoterId(email);

    // Try to get existing voter
    const { data: existing, error: selectError } = await supabase
      .from('voter_profiles')
      .select('*')
      .eq('voter_id', voterId)
      .maybeSingle();

    if (existing) {
      return { voter_id: voterId, profile: existing };
    }

    // Create new voter profile
    if (!existing) {
      // No rows found, create new voter
      const { data: newVoter, error: insertError } = await supabase
        .from('voter_profiles')
        .insert({
          voter_id: voterId,
          email: email,
          user_id: null, // Email-based voters don't have auth accounts
          status: 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return { voter_id: voterId, profile: newVoter };
    }

    if (selectError) throw selectError;
  },

  /**
   * Check if voter has voted in ANY position of an election
   */
  hasVotedInElection: async (voterId: string, electionId: string): Promise<boolean> => {
    const { error, count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('voter_id', voterId)
      .eq('election_id', electionId);

    if (error) throw error;
    return (count ?? 0) > 0;
  },

  /**
   * Get assigned elections for a voter
   */
  getAssignedElections: async (voterId: string): Promise<Election[]> => {
    const { data, error } = await supabase
      .from('voter_assignments')
      .select(
        `
        election_id,
        elections(
          id,
          title,
          description,
          start_time,
          end_time,
          status,
          created_at
        )
      `
      )
      .eq('voter_id', voterId);

    if (error) throw error;

    return (data || [])
      .map((item: any) => item.elections)
      .filter((election: Election | null) => election !== null) as Election[];
  },

  /**
   * Get ballot for an election
   * Returns positions with candidates
   */
  getBallot: async (electionId: string): Promise<BallotItem[]> => {
    const { data, error } = await supabase
      .from('positions')
      .select(
        `
        id,
        name,
        description,
        display_order,
        candidates(
          id,
          name,
          manifesto,
          image_url,
          display_order
        )
      `
      )
      .eq('election_id', electionId)
      .order('display_order');

    if (error) throw error;

    return (
      (data as Array<Record<string, any>>)?.map((position) => ({
        position: {
          id: position.id,
          election_id: electionId,
          name: position.name,
          description: position.description,
          display_order: position.display_order,
          created_at: '',
        },
        candidates: (position.candidates || []).map((candidate: Record<string, any>) => ({
          ...candidate,
          image_url: resolveCandidateImageUrl(candidate.image_url as string),
        })),
      })) || []
    );
  },

  /**
   * Check if voter has already voted for a position
   */
  hasVoted: async (voterId: string, positionId: string): Promise<boolean> => {
    const { error, count } = await supabase
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('voter_id', voterId)
      .eq('position_id', positionId);

    if (error) throw error;
    return (count ?? 0) > 0;
  },

  /**
   * Get voter's votes in an election
   */
  getVoterVotes: async (
    voterId: string,
    electionId: string
  ): Promise<Record<string, string>> => {
    const { data, error } = await supabase
      .from('votes')
      .select('position_id, candidate_id')
      .eq('voter_id', voterId)
      .eq('election_id', electionId);

    if (error) throw error;

    // Convert to map of position_id -> candidate_id
    const voteMap: Record<string, string> = {};
    (data as any[])?.forEach((vote) => {
      voteMap[vote.position_id] = vote.candidate_id;
    });

    return voteMap;
  },

  /**
   * Get detailed receipt of voter's choices
   */
  getVoterReceipt: async (voterId: string, electionId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        positions ( position_name ),
        candidates ( name, image_url )
      `)
      .eq('voter_id', voterId)
      .eq('election_id', electionId);

    if (error) throw error;
    return data;
  },

  /**
   * Submit a vote
   * This is protected by RLS at the database level
   */
  submitVote: async (votePayload: VotePayload) => {
    // Check if already voted for this position (RLS will also enforce)
    const hasVotedBefore = await ballotService.hasVoted(
      votePayload.voter_id,
      votePayload.position_id
    );

    if (hasVotedBefore) {
      throw new Error('You have already voted for this position');
    }

    // Submit vote
    const { data, error } = await supabase
      .from('votes')
      .insert([votePayload])
      .select();

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('You have already voted for this position');
      }
      throw error;
    }

    return data?.[0];
  },

  /**
   * Get election details for voter
   */
  getElectionDetails: async (electionId: string): Promise<Election> => {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();

    if (error) throw error;
    return data as Election;
  },

  /**
   * Get candidate details
   */
  getCandidate: async (candidateId: string) => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (error) throw error;
    return {
      ...data,
      image_url: resolveCandidateImageUrl(data.image_url),
    };
  },

  /**
   * Check if election is active
   */
  isElectionActive: (election: Election): boolean => {
    const now = new Date();
    const startTime = new Date(election.start_time);
    const endTime = new Date(election.end_time);

    return (
      election.status === 'active' &&
      now >= startTime &&
      now <= endTime
    );
  },

  /**
   * Format election time range
   */
  formatElectionTime: (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  },
};

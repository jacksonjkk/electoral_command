import { supabase } from './supabase';
import {
  Election,
  Position,
  Candidate,
  RecentVote,
} from '@/types';
import { resolveCandidateImageUrl } from '@/utils/storage';


export const electionService = {
  // Elections
  createElection: async (
    title: string,
    description: string,
    start_time: string,
    end_time: string,
    userId: string,
    reg_no_rule?: string
  ): Promise<Election> => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .insert([
          {
            title,
            description,
            start_time,
            end_time,
            status: 'scheduled',
            created_by: userId,
            reg_no_rule,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      try {
        await logAction(userId, 'CREATE_ELECTION', { election_id: data?.id });
      } catch (logErr) {
        console.error('Failed to log action:', logErr);
      }
      
      return data as Election;
    } catch (err) {
      console.error('Create election error:', err);
      const error = err as Error;
      throw new Error(error.message || 'Failed to create election');
    }
  },

  getElections: async (userId?: string): Promise<Election[]> => {
    let query = supabase
      .from('elections')
      .select('*');

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data as Election[];
  },

  getElectionById: async (electionId: string): Promise<Election> => {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();

    if (error) throw error;
    return data as Election;
  },

  updateElectionStatus: async (
    electionId: string,
    status: string,
    userId: string
  ): Promise<Election> => {
    const { data, error } = await supabase
      .from('elections')
      .update({ status })
      .eq('id', electionId)
      .select()
      .single();

    if (error) throw error;
    await logAction(userId, 'UPDATE_ELECTION_STATUS', {
      election_id: electionId,
      new_status: status,
    });
    return data as Election;
  },

  toggleResultsPublished: async (
    electionId: string,
    isPublished: boolean,
    userId: string
  ): Promise<Election> => {
    const { data, error } = await supabase
      .from('elections')
      .update({ results_published: isPublished })
      .eq('id', electionId)
      .select()
      .single();

    if (error) throw error;
    await logAction(userId, 'TOGGLE_RESULTS_PUBLISHED', {
      election_id: electionId,
      is_published: isPublished,
    });
    return data as Election;
  },

  updateElection: async (
    electionId: string,
    updates: {
      title?: string;
      description?: string;
      start_time?: string;
      end_time?: string;
      reg_no_rule?: string;
    },
    userId: string
  ): Promise<Election> => {
    const { data, error } = await supabase
      .from('elections')
      .update(updates)
      .eq('id', electionId)
      .select()
      .single();

    if (error) throw error;
    await logAction(userId, 'UPDATE_ELECTION', {
      election_id: electionId,
      updates,
    });
    return data as Election;
  },

  deleteElection: async (electionId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('elections')
      .delete()
      .eq('id', electionId);

    if (error) throw error;
    await logAction(userId, 'DELETE_ELECTION', { election_id: electionId });
  },

  // Positions
  createPosition: async (
    electionId: string,
    name: string,
    description: string,
    userId: string
  ): Promise<Position> => {
    // Get next display order
    const { data: positions } = await supabase
      .from('positions')
      .select('display_order')
      .eq('election_id', electionId)
      .order('display_order', { ascending: false })
      .limit(1);

    const displayOrder = (positions?.[0]?.display_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('positions')
      .insert([
        {
          election_id: electionId,
          name,
          description,
          display_order: displayOrder,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    await logAction(userId, 'CREATE_POSITION', {
      position_id: data?.id,
      election_id: electionId,
    });
    return data as Position;
  },

  getPositionsByElection: async (electionId: string): Promise<Position[]> => {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('election_id', electionId)
      .order('display_order');

    if (error) throw error;
    return data as Position[];
  },

  // Candidates
  createCandidate: async (
    positionId: string,
    name: string,
    manifesto: string,
    imageUrl: string | null,
    userId: string
  ): Promise<Candidate> => {
    // Get next display order
    const { data: candidates } = await supabase
      .from('candidates')
      .select('display_order')
      .eq('position_id', positionId)
      .order('display_order', { ascending: false })
      .limit(1);

    const displayOrder = (candidates?.[0]?.display_order ?? -1) + 1;

    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          position_id: positionId,
          name,
          manifesto,
          image_url: imageUrl,
          display_order: displayOrder,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    await logAction(userId, 'CREATE_CANDIDATE', {
      candidate_id: data?.id,
      position_id: positionId,
    });
    return data as Candidate;
  },

  updateCandidate: async (
    candidateId: string,
    updates: {
      name?: string;
      manifesto?: string;
      image_url?: string;
    },
    userId: string
  ): Promise<Candidate> => {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', candidateId)
      .select()
      .single();

    if (error) throw error;
    await logAction(userId, 'UPDATE_CANDIDATE', {
      candidate_id: candidateId,
      updates,
    });
    return data as Candidate;
  },

  getCandidatesByPosition: async (positionId: string): Promise<Candidate[]> => {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('position_id', positionId)
      .order('display_order');

    if (error) throw error;
    return (data || []).map((candidate: Record<string, unknown>) => ({
      ...candidate,
      image_url: resolveCandidateImageUrl(candidate.image_url as string | undefined),
    })) as unknown as Candidate[];
  },

  deleteCandidate: async (candidateId: string, userId: string): Promise<void> => {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', candidateId);

    if (error) throw error;
    await logAction(userId, 'DELETE_CANDIDATE', { candidate_id: candidateId });
  },

  // Image upload
  uploadCandidateImage: async (
    candidateId: string,
    file: File,
    userId: string
  ): Promise<string> => {
    const fileName = `${candidateId}_${Date.now()}_${file.name}`;
    const filePath = `candidate-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('elections')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Update candidate record with the relative path
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ image_url: filePath })
      .eq('id', candidateId);

    if (updateError) throw updateError;
    await logAction(userId, 'UPLOAD_CANDIDATE_IMAGE', { candidate_id: candidateId });

    return resolveCandidateImageUrl(filePath);
  },

  // Voter assignments
  assignVotersToElection: async (
    electionId: string,
    voterIds: string[],
    userId: string
  ): Promise<any> => {
    const assignments = voterIds.map((voterId) => ({
      voter_id: voterId,
      election_id: electionId,
    }));

    const { data, error } = await supabase
      .from('voter_assignments')
      .insert(assignments)
      .select();

    if (error) throw error;
    await logAction(userId, 'ASSIGN_VOTERS', {
      election_id: electionId,
      voter_count: voterIds.length,
    });
    return data;
  },

  getAssignedVoters: async (electionId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('voter_assignments')
      .select(
        `
        *,
        voter_profiles!inner(user_id, email)
      `
      )
      .eq('election_id', electionId);

    if (error) throw error;
    return data as any[];
  },

  // Voting statistics
  getVotingStats: async (electionId: string) => {
    const { data: totalAssigned } = await supabase
      .from('voter_assignments')
      .select('*', { count: 'exact' })
      .eq('election_id', electionId);

    const { data: totalVotes } = await supabase
      .from('votes')
      .select('*', { count: 'exact' })
      .eq('election_id', electionId);

    return {
      total_voters_assigned: totalAssigned?.length ?? 0,
      total_votes_cast: totalVotes?.length ?? 0,
    };
  },

  // Results
  getElectionResults: async (electionId: string): Promise<any> => {
    // Get positions with candidates
    const { data: positions, error: posError } = await supabase
      .from('positions')
      .select(
        `
        id,
        name,
        candidates(
          id,
          name,
          image_url
        )
      `
      )
      .eq('election_id', electionId)
      .order('display_order');

    if (posError) throw posError;

    // Get vote counts for each candidate
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('candidate_id')
      .eq('election_id', electionId);

    if (votesError) throw votesError;

    // Count votes by candidate
    const voteCounts = ((votes || []) as Array<Record<string, string>>).reduce((acc: Record<string, number>, vote) => {
      acc[vote.candidate_id] = (acc[vote.candidate_id] || 0) + 1;
      return acc;
    }, {});

    const enhancedPositions = ((positions || []) as Array<Record<string, unknown>>).map((position) => ({
      ...position,
      position_id: position.id,
      position_name: position.name,
      candidates: ((position.candidates as Array<Record<string, unknown>>) || []).map((candidate) => ({
        ...candidate,
        candidate_id: candidate.id,
        image_url: resolveCandidateImageUrl(candidate.image_url as string | undefined),
        votes: voteCounts[candidate.id as string] || 0,
      })),
    }));

    const stats = await electionService.getVotingStats(electionId);

    return {
      positions: enhancedPositions,
      stats,
    };
  },

  getRecentVoters: async (electionId: string, limit = 10): Promise<RecentVote[]> => {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        created_at,
        voter_profiles!inner(
          email,
          voter_id
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as unknown as RecentVote[];
  },

  getAllVotersForExport: async (electionId: string): Promise<RecentVote[]> => {
    const { data, error } = await supabase
      .from('votes')
      .select(`
        id,
        created_at,
        voter_profiles!inner(
          email,
          voter_id
        )
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as RecentVote[];
  },
};

// Audit logging
async function logAction(
  userId: string,
  action: string,
  details?: Record<string, any>
) {
  try {
    await supabase
      .from('logs')
      .insert([
        {
          user_id: userId,
          action,
          details,
        },
      ]);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

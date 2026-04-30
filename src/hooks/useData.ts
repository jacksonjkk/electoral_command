import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { ballotService } from '@/services/ballot';
import { electionService } from '@/services/election';

export function useAssignedElections(voterId: string | undefined) {
  return useQuery(
    ['assigned-elections', voterId],
    () => ballotService.getAssignedElections(voterId!),
    {
      enabled: !!voterId,
      staleTime: 60000, // 1 minute
    }
  );
}

export function useBallot(electionId: string | undefined) {
  return useQuery(
    ['ballot', electionId],
    () => ballotService.getBallot(electionId!),
    {
      enabled: !!electionId,
      staleTime: 30000, // 30 seconds
    }
  );
}

export function useElectionDetails(electionId: string | undefined) {
  return useQuery(
    ['election-details', electionId],
    () => ballotService.getElectionDetails(electionId!),
    {
      enabled: !!electionId,
      staleTime: 30000,
    }
  );
}

export function useVoterVotes(voterId: string | undefined, electionId: string | undefined) {
  return useQuery(
    ['voter-votes', voterId, electionId],
    () => ballotService.getVoterVotes(voterId!, electionId!),
    {
      enabled: !!voterId && !!electionId,
      staleTime: 10000, // 10 seconds
    }
  );
}

export function useElections() {
  return useQuery(
    ['all-elections'],
    () => electionService.getElections(),
    {
      staleTime: 60000,
    }
  );
}

export function useElectionById(electionId: string | undefined) {
  return useQuery(
    ['election', electionId],
    () => electionService.getElectionById(electionId!),
    {
      enabled: !!electionId,
      staleTime: 30000,
    }
  );
}

export function usePositions(electionId: string | undefined) {
  return useQuery(
    ['positions', electionId],
    () => electionService.getPositionsByElection(electionId!),
    {
      enabled: !!electionId,
      staleTime: 30000,
    }
  );
}

export function useCandidates(positionId: string | undefined) {
  return useQuery(
    ['candidates', positionId],
    () => electionService.getCandidatesByPosition(positionId!),
    {
      enabled: !!positionId,
      staleTime: 30000,
    }
  );
}

export function useElectionResults(electionId: string | undefined) {
  return useQuery(
    ['election-results', electionId],
    () => electionService.getElectionResults(electionId!),
    {
      enabled: !!electionId,
      staleTime: 5000, // 5 seconds for live updates
    }
  );
}

export function useVotingStats(electionId: string | undefined) {
  return useQuery(
    ['voting-stats', electionId],
    () => electionService.getVotingStats(electionId!),
    {
      enabled: !!electionId,
      staleTime: 5000, // 5 seconds for live updates
    }
  );
}

export function useRecentVoters(electionId: string | undefined) {
  return useQuery(
    ['recent-voters', electionId],
    () => electionService.getRecentVoters(electionId!),
    {
      enabled: !!electionId,
      staleTime: 5000, // 5 seconds for live updates
      refetchInterval: 5000, // Explicitly refetch every 5 seconds
    }
  );
}


// Local state hook for form management
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [state, setState] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const reset = () => {
    setState(initialState);
    setErrors({});
  };

  return { state, setState, errors, setErrors, handleChange, reset };
}

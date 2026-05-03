import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { supabase } from '@/services/supabase';
import { ballotService } from '@/services/ballot';
import { Button, Card, Alert, Loading, EmptyState } from '@/components/UI';
import { formatDateTime, getTimeRemaining, getInitials } from '@/utils/helpers';
import { User, ShieldCheck, Lock, Clock, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';
import { VotePayload } from '@/types';
import clsx from 'clsx';

export const PublicBallot: React.FC = () => {
  const { electionId } = useParams<{
    electionId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  // Retrieve voter ID from secure session storage instead of URL
  const [voterId, setVoterId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>(location.state?.email || '');

  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  // Live timer for countdowns and auto-transitions
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeVoter = async () => {
      // Check if arriving from a Magic Link (Supabase Auth Session)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        const email = session.user.email;
        if (isMounted) setUserEmail(email);

        try {
          const voterData = await ballotService.getOrCreateVoter(email);
          if (voterData?.voter_id) {
            sessionStorage.setItem(`voter_session_${electionId}`, voterData.voter_id);
            if (isMounted) setVoterId(voterData.voter_id);
          } else {
            if (isMounted) navigate(`/ballot/${electionId}`, { replace: true });
          }
        } catch (e) {
          if (isMounted) navigate(`/ballot/${electionId}`, { replace: true });
        }
      } else {
        // Fallback for page reloads (if session was already created)
        const sessionVoterId = sessionStorage.getItem(`voter_session_${electionId}`);
        if (!sessionVoterId) {
          if (isMounted) navigate(`/ballot/${electionId}`, { replace: true });
        } else {
          if (isMounted) setVoterId(sessionVoterId);
        }
      }
    };

    initializeVoter();

    return () => { isMounted = false; };
  }, [electionId, navigate]);

  // Fetch ballot
  const { data: ballot, isLoading: ballotLoading } = useQuery(
    ['ballot', electionId],
    () => ballotService.getBallot(electionId!),
    { enabled: !!electionId }
  );

  // Fetch election details
  const { data: election } = useQuery(
    ['election', electionId],
    async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();

      if (error) throw error;
      return data;
    },
    { enabled: !!electionId }
  );

  // Submit vote mutation
  const submitVoteMutation = useMutation(
    async () => {
      if (!voterId) throw new Error('Session expired. Please log in again.');

      const votes: VotePayload[] = Object.entries(selectedVotes).map(
        ([positionId, candidateId]) => ({
          voter_id: voterId,
          candidate_id: candidateId,
          position_id: positionId,
          election_id: electionId!,
        })
      );

      for (const vote of votes) {
        const { error } = await supabase.from('votes').insert([vote]);
        if (error) throw error;
      }

      return votes;
    },
    {
      onSuccess: () => {
        // Clear session after successful vote
        sessionStorage.removeItem(`voter_session_${electionId}`);

        // Also sign out from Supabase to clear the magic link session so they can't vote again
        supabase.auth.signOut();

        navigate(`/public-ballot/${electionId}/success`, {
          state: { email: userEmail },
        });
      },
      onError: (err: unknown) => {
        const error = err as { code?: string; message?: string };
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
          setError('You have already voted in this election.');
        } else {
          setError('Error sending your vote. Please try again.');
        }
        setShowConfirmation(false);
      },
    }
  );

  const handleSelectCandidate = (positionId: string, candidateId: string) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [positionId]: prev[positionId] === candidateId ? '' : candidateId,
    }));
    setError('');
  };

  const hasSelectedAllPositions = ballot
    ? ballot.length > 0 && ballot.every((item) => selectedVotes[item.position.id])
    : false;

  const now = currentTime;
  const startTime = new Date(election?.start_time || '');
  const endTime = new Date(election?.end_time || '');
  const isStarted = now >= startTime;
  const isEnded = now >= endTime;
  const isVotingOpen = (election?.status === 'active' || (election?.status === 'scheduled' && isStarted)) && !isEnded;

  if (ballotLoading || !voterId) {
    return <Loading message="Authorizing secure session..." />;
  }

  if (!ballot || ballot.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <EmptyState
          icon="🗳️"
          title="No Candidates Found"
          message="No candidates have been added to this election yet."
          action={{
            label: "Return to Entry",
            onClick: () => navigate(`/ballot/${electionId}`)
          }}
        />
      </div>
    );
  }

  if (!isVotingOpen && !isEnded) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-8 md:py-12 px-4">
        <Card className="max-w-xl w-full text-center !p-6 md:!p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 animate-pulse" />
          <div className="w-16 h-16 md:w-24 md:h-24 bg-primary-500/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-primary-500/20">
            <Clock className="w-8 h-8 md:w-12 md:h-12 text-primary-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">{election?.title}</h1>
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-1.5 bg-primary-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-full mb-8 md:mb-10">
            Awaiting Launch
          </span>

          <div className="bg-gray-50 rounded-2xl md:rounded-3xl p-6 md:p-10 border border-gray-100 mb-6 md:mb-10">
            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-4">Starts In</p>
            <p className="text-2xl sm:text-4xl md:text-5xl font-black text-primary-600 tabular-nums tracking-tighter">
              {getTimeRemaining(election?.start_time || '')}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // If the election has ended
  if (isEnded || election?.status === 'closed') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-8 md:py-12 px-4">
        <Card className="max-w-xl w-full text-center !p-6 md:!p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-400" />
          <div className="w-16 h-16 md:w-24 md:h-24 bg-gray-100 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-gray-200">
            <Lock className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">{election?.title}</h1>
          <span className="inline-block px-3 py-1.5 md:px-4 md:py-1.5 bg-gray-100 text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-full mb-8 md:mb-10">
            Election Closed
          </span>
          <p className="text-sm md:text-base text-gray-500 font-medium mb-6 md:mb-10 leading-relaxed">
            Voting for this election has concluded.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-32 pt-6 md:pt-10 px-4">
      {/* Terminal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12 bg-white/40 backdrop-blur-xl p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center border border-gray-100">
            <ShieldCheck className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-1">Voting Page</p>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">{election?.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <span className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-500 tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg max-w-full whitespace-normal break-all">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                Voter: {userEmail.toLowerCase() || 'Verified Student'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="error" title="Error" message={error} className="mb-10 rounded-[32px]" onClose={() => setError('')} />}

      {/* Ballot Items */}
      <div className="space-y-16">
        {ballot.map((item, index) => (
          <div key={item.position.id} className="space-y-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl md:text-2xl font-black shadow-2xl shrink-0">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 border-b-2 md:border-b-4 border-gray-100 pb-2 md:pb-4">
                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight mb-0.5 md:mb-1">{item.position.name}</h2>
                <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-widest">{item.position.description || 'Voting Category'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {item.candidates.map((candidate) => {
                const isSelected = selectedVotes[item.position.id] === candidate.id;

                return (
                  <button
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(item.position.id, candidate.id)}
                    className={clsx(
                      'relative group rounded-[32px] transition-all duration-500 text-left flex flex-col h-full overflow-hidden border-4',
                      isSelected
                        ? 'border-primary-500 bg-white shadow-neon-primary'
                        : 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-2xl hover:-translate-y-2'
                    )}
                  >
                    <div className="relative w-full h-64 md:h-72 overflow-hidden bg-gray-100">
                      {candidate.image_url ? (
                        <img
                          src={candidate.image_url}
                          alt={candidate.name}
                          onError={(e) => {
                            // If the image fails to load (broken link, permissions), hide it and let the fallback show
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                          className={clsx(
                            'w-full h-full object-cover transition-transform duration-700',
                            isSelected ? 'scale-110' : 'group-hover:scale-110'
                          )}
                        />
                      ) : null}

                      {/* Fallback avatar (Initials) */}
                      <div
                        className={clsx(
                          "w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100",
                          candidate.image_url ? "hidden" : ""
                        )}
                      >
                        <span className="text-6xl font-black text-primary-300 tracking-tighter">
                          {getInitials(candidate.name)}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary-600/40 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl animate-glow">
                            <CheckCircle2 className="w-12 h-12 text-primary-600" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-8 flex-1">
                      <h3 className="font-black text-2xl text-gray-900 mb-3 tracking-tight group-hover:text-primary-600 transition-colors">
                        {candidate.name}
                      </h3>
                      {candidate.manifesto && (
                        <p className="text-gray-500 font-medium leading-relaxed line-clamp-3 text-sm">
                          {candidate.manifesto}
                        </p>
                      )}
                    </div>

                    <div className={clsx(
                      'p-6 border-t-2 transition-all',
                      isSelected ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-100'
                    )}>
                      <span className={clsx(
                        'text-[10px] font-black uppercase tracking-[0.2em]',
                        isSelected ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                      )}>
                        {isSelected ? 'Selection Confirmed' : 'Authorize Selection'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Final Submission Section */}
      <div className="mt-16 md:mt-24 mb-32 flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="glass-card !p-6 md:!p-12 !rounded-3xl md:!rounded-[40px] border-white/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 bg-white/80 backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-6">
              <div className={clsx(
                'w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[32px] flex items-center justify-center transition-all duration-700 shrink-0',
                hasSelectedAllPositions ? 'bg-success-500 text-white shadow-neon-success scale-110' : 'bg-gray-100 text-gray-400'
              )}>
                {hasSelectedAllPositions ? <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12" /> : <ShieldCheck className="w-8 h-8 md:w-12 md:h-12" />}
              </div>
              <div>
                <p className="text-[10px] md:text-[14px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1 md:mb-2">Final Step</p>
                <h3 className={clsx(
                  'text-xl md:text-4xl font-black tracking-tight transition-colors duration-500',
                  hasSelectedAllPositions ? 'text-success-600' : 'text-gray-900'
                )}>
                  {hasSelectedAllPositions
                    ? 'Ready to Submit'
                    : 'Selections Incomplete'}
                </h3>
                <p className="text-xs md:text-lg font-medium text-gray-500 mt-1">
                  {hasSelectedAllPositions
                    ? 'You have selected a candidate for every position.'
                    : `Please choose a candidate for all ${ballot.length} positions.`}
                </p>
              </div>
            </div>

            <Button
              size="lg"
              className={clsx(
                '!rounded-2xl md:!rounded-[32px] transition-all duration-500 w-full md:w-auto px-12 md:px-16 py-6 md:py-10 text-lg md:text-2xl font-black uppercase tracking-widest',
                hasSelectedAllPositions
                  ? 'bg-primary-600 shadow-neon-primary hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
              )}
              isLoading={submitVoteMutation.isLoading}
              disabled={!hasSelectedAllPositions}
              onClick={() => setShowConfirmation(true)}
            >
              Finish Voting
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <Card className="w-full max-w-xl !p-10 relative overflow-hidden border-2 border-white/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-500" />
            <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
              Final Confirmation
            </h3>

            <h2 className="text-3xl font-black text-gray-900 mb-6">Confirm Your Vote</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
              ⚠️ Your choices will be securely saved. No changes are possible after this point.
            </p>

            <div className="space-y-4 mb-10">
              {ballot.map((item) => (
                <div key={item.position.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.position.name}</p>
                    <p className="font-bold text-gray-900">
                      {item.candidates.find((c) => c.id === selectedVotes[item.position.id])?.name}
                    </p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="!rounded-2xl border-2 border-gray-100"
                onClick={() => setShowConfirmation(false)}
                disabled={submitVoteMutation.isLoading}
              >
                Go Back
              </Button>
              <Button
                size="lg"
                className="!rounded-2xl shadow-neon-primary"
                onClick={() => submitVoteMutation.mutate()}
                isLoading={submitVoteMutation.isLoading}
              >
                Send My Vote
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

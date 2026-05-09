import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBallot, useElectionDetails, useVoterVotes } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { ballotService } from '@/services/ballot';
import { Card, Button, Loading, Alert } from '@/components/UI';
import { formatDateTime, getTimeRemaining } from '@/utils/helpers';
import { ArrowLeft, User, ShieldCheck, Lock, Clock, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export function Ballot() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const { data: ballot, isLoading: ballotLoading } = useBallot(electionId);
  const { data: election, isLoading: electionLoading } =
    useElectionDetails(electionId);
  const { data: voterVotes } = useVoterVotes(profile?.voter_id, electionId);

  const [selectedVotes, setSelectedVotes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (ballotLoading || electionLoading) {
    return <Loading message="Loading ballot..." />;
  }

  if (!election || !ballot) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <Alert variant="error" title="Error" message="Unable to load the election. Please try again." />
      </div>
    );
  }

  const now = new Date();
  const startTime = new Date(election.start_time);
  const isStarted = now >= startTime;
  const isEnded = now > new Date(election.end_time);

  // If the election hasn't started yet, show a countdown UX
  if (!isStarted || election.status === 'scheduled') {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <Card className="text-center !p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500 animate-pulse" />
          <div className="w-24 h-24 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-primary-500/20 shadow-neon-primary animate-glow">
            <Clock className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{election.title}</h1>
          <span className="inline-block px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8">
            Voting Not Started Yet
          </span>
          
          <div className="bg-gray-900/5 backdrop-blur-sm rounded-[24px] md:rounded-3xl p-6 md:p-10 border border-gray-100 mb-6 md:mb-10">
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 md:mb-4">
              Time Left
            </p>
            <p className="text-4xl md:text-6xl font-black text-primary-600 tabular-nums tracking-tighter">
              {getTimeRemaining(election.start_time)}
            </p>
          </div>

          <p className="text-gray-500 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            Voting starts on <br/>
            <span className="text-gray-900 font-bold">{formatDateTime(election.start_time)}</span>
          </p>

          <Button 
            variant="secondary" 
            fullWidth 
            size="lg"
            className="!rounded-2xl border-2 border-gray-100"
            onClick={() => navigate('/vote')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Elections
          </Button>
        </Card>
      </div>
    );
  }

  // If the election has already ended
  if (isEnded || election.status === 'closed') {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4">
        <Card className="text-center !p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-400" />
          <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-gray-200">
            <Lock className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">{election.title}</h1>
          <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-8">
            Voting Closed
          </span>
          <p className="text-gray-500 font-medium mb-10 max-w-md mx-auto leading-relaxed">
            Voting for this election has finished. Results are being counted.
          </p>
          <Button fullWidth size="lg" className="!rounded-2xl shadow-neon-primary" onClick={() => navigate('/results/' + electionId)}>
            View Results
          </Button>
        </Card>
      </div>
    );
  }

  const handleCandidateSelect = (positionId: string, candidateId: string) => {
    setSelectedVotes((prev) => ({
      ...prev,
      [positionId]: prev[positionId] === candidateId ? '' : candidateId,
    }));
    setError('');
  };

  const handleVoteSubmission = async () => {
    const unfilled = ballot.filter((item) => !selectedVotes[item.position.id]);
    if (unfilled.length > 0) {
      setError(`Please choose a candidate for: ${unfilled.map((i) => i.position.name).join(', ')}`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      for (const [positionId, candidateId] of Object.entries(selectedVotes)) {
        if (!candidateId) continue;
        await ballotService.submitVote({
          voter_id: profile!.voter_id,
          candidate_id: candidateId,
          position_id: positionId,
          election_id: electionId!,
        });
      }
      navigate(`/vote/${electionId}/success`, { state: { ballotSize: ballot.length } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allVotesSelected = ballot.every((item) => selectedVotes[item.position.id]);

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center px-4 py-4 md:py-0">
        {/* Modal Container - Clean, Professional */}
        <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-2xl max-h-[90vh] md:max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 px-4 md:px-8 pt-6 md:pt-8 pb-3 md:pb-4 border-b border-gray-100">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-2 md:gap-4">
              <ShieldCheck className="w-6 md:w-8 h-6 md:h-8 text-primary-600" />
              <span>Confirm Your Vote</span>
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mt-2">Review your selections below</p>
          </div>
          
          {/* Scrollable Content - This is the only scrollable part */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 md:space-y-4 p-4 md:p-8">
              {ballot.map((item) => {
                const selectedCandidate = item.candidates.find(
                  (c) => c.id === selectedVotes[item.position.id]
                );
                return (
                  <div key={item.position.id} className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-gray-100 hover:border-primary-200 transition-colors flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">{item.position.name}</p>
                      <h3 className="text-sm md:text-xl font-black text-gray-900">{selectedCandidate?.name || 'Not Selected'}</h3>
                    </div>
                    <div className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 rounded-full bg-success-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 md:w-6 h-5 md:h-6 text-success-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Error Alert - Fixed between scroll and buttons */}
          {error && (
            <div className="flex-shrink-0 px-4 md:px-8 py-3">
              <Alert variant="error" message={error} className="m-0" onClose={() => setError('')} />
            </div>
          )}

          {/* Footer Buttons - Fixed at bottom, always visible */}
          <div className="flex-shrink-0 px-4 md:px-8 py-4 md:py-6 bg-white border-t border-gray-100 grid grid-cols-2 gap-3 md:gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="!rounded-xl md:!rounded-2xl border-2 border-gray-100 !py-3 md:!py-4"
              onClick={() => setShowConfirmation(false)}
              disabled={submitting}
            >
              Go Back
            </Button>
            <Button
              size="lg"
              className="!rounded-xl md:!rounded-2xl shadow-neon-primary !py-3 md:!py-4"
              isLoading={submitting}
              onClick={handleVoteSubmission}
            >
              Send My Vote
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-40 md:pb-32">
      {/* Terminal Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12 bg-white/40 backdrop-blur-xl p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="flex items-center gap-4 md:gap-8 relative z-10">
          <button
            onClick={() => navigate('/vote')}
            className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors group border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-0.5 md:mb-1">Secure Voting Page</p>
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">{election.title}</h1>
            <div className="flex items-center gap-2 md:gap-4 mt-1 md:mt-2">
              <span className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-2 md:px-3 py-1 rounded-lg border border-gray-200">
                <Lock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                Secure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ballot Items */}
      <div className="space-y-12 px-2">
        {ballot.map((item, index) => (
          <div key={item.position.id} className="space-y-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-900 text-white flex items-center justify-center text-xl md:text-2xl font-black shadow-2xl">
                {String(index + 1).padStart(2, '0')}
              </div>
              <div className="flex-1 border-b-2 md:border-b-4 border-gray-100 pb-2 md:pb-4">
                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight mb-0.5 md:mb-1">{item.position.name}</h2>
                <p className="text-[10px] md:text-sm font-medium text-gray-500 uppercase tracking-widest">{item.position.description || 'Global Standing'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {item.candidates.map((candidate) => {
                const isSelected = selectedVotes[item.position.id] === candidate.id;

                return (
                  <button
                    key={candidate.id}
                    onClick={() => handleCandidateSelect(item.position.id, candidate.id)}
                    className={clsx(
                      'relative group rounded-[32px] transition-all duration-500 text-left flex flex-col h-full overflow-hidden border-4',
                      isSelected
                        ? 'border-primary-500 bg-white shadow-neon-primary'
                        : 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-2xl hover:-translate-y-2'
                    )}
                  >
                    <div className="relative w-full h-48 md:h-72 overflow-hidden bg-gray-100">
                      {candidate.image_url ? (
                        <img
                          src={candidate.image_url}
                          alt={candidate.name}
                          className={clsx(
                            'w-full h-full object-cover transition-transform duration-700',
                            isSelected ? 'scale-110' : 'group-hover:scale-110'
                          )}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                          <User className="w-12 md:w-20 h-12 md:h-20" />
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary-600/40 backdrop-blur-sm flex items-center justify-center">
                          <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl animate-glow">
                            <CheckCircle2 className="w-8 md:w-12 h-8 md:h-12 text-primary-600" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full h-16 md:h-24 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <div className="p-4 md:p-8 flex-1">
                      <h3 className="font-black text-lg md:text-2xl text-gray-900 mb-1 md:mb-3 tracking-tight group-hover:text-primary-600 transition-colors">
                        {candidate.name}
                      </h3>
                      {candidate.manifesto && (
                        <p className="text-gray-500 font-medium leading-relaxed line-clamp-2 md:line-clamp-3 text-xs md:text-sm">
                          {candidate.manifesto}
                        </p>
                      )}
                    </div>

                    <div className={clsx(
                      'p-4 md:p-6 border-t-2 transition-all',
                      isSelected ? 'bg-primary-50 border-primary-100' : 'bg-gray-50 border-gray-100'
                    )}>
                      <span className={clsx(
                        'text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]',
                        isSelected ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'
                      )}>
                        {isSelected ? 'Selected' : 'Click to Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-4 md:bottom-10 left-4 md:left-1/2 md:-translate-x-1/2 right-4 md:w-full md:max-w-xl z-50">
        <div className="bg-gray-900/90 backdrop-blur-2xl p-2 md:p-4 rounded-[24px] md:rounded-[32px] border border-white/20 shadow-2xl flex items-center gap-3 md:gap-4">
          <div className="flex-1 pl-3 md:pl-4">
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Voting Progress</p>
            <p className="text-white font-bold text-xs md:text-sm">
              {allVotesSelected 
                ? 'All choices made' 
                : `${Object.values(selectedVotes).filter(Boolean).length} of ${ballot.length} selected`}
            </p>
          </div>
          <Button
            size="md"
            className={clsx(
              '!rounded-xl md:!rounded-2xl transition-all duration-500 px-6 md:px-8',
              allVotesSelected ? 'bg-primary-600 shadow-neon-primary' : 'opacity-40 grayscale'
            )}
            isLoading={submitting}
            disabled={!allVotesSelected}
            onClick={() => setShowConfirmation(true)}
          >
            Review Vote
          </Button>
        </div>
      </div>
    </div>
  );
}

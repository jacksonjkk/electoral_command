import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { supabase } from '@/services/supabase';
import { ballotService } from '@/services/ballot';
import { Button, Input, Alert, Loading, Card, EmptyState } from '@/components/UI';
import { isValidEmailDomain, getTimeRemaining } from '@/utils/helpers';
import { ShieldCheck, Lock, ArrowRight, Fingerprint, Mail, Clock } from 'lucide-react';
import { Election } from '@/types';
import clsx from 'clsx';

export const PublicBallotEntry: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if this device has already voted for this election
    if (electionId && localStorage.getItem(`voted_${electionId}`)) {
      navigate(`/public-results/${electionId}`, { replace: true });
    }
  }, [electionId, navigate]);

  // Live timer for countdowns and auto-transitions
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch election details with strict typing
  const { data: election, isLoading: electionLoading } = useQuery<Election>(
    ['election', electionId],
    async () => {
      if (!electionId) throw new Error('Election ID is required');
      
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', electionId)
        .single();

      if (error) throw error;
      return data as Election;
    },
    { enabled: !!electionId }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electionId) return;
    
    setError('');
    setLoading(true);

    try {
      // Validate official student email format
      if (!isValidEmailDomain(email)) {
        throw new Error('Invalid format. Use: 20[Year]a[CourseCode][f/gf]@kab.ac.ug (e.g., 2024abc123f@kab.ac.ug)');
      }

      if (!email.trim()) {
        throw new Error('Please enter your email address');
      }

      // Validate course codes directly from email if rule exists
      if (election?.reg_no_rule) {
        const allowedCodes = election.reg_no_rule.split(',').map((c) => c.trim().toLowerCase());
        const emailPrefix = email.split('@')[0].toLowerCase();
        
        const isValid = allowedCodes.some((code) => emailPrefix.includes(code));

        if (!isValid) {
          throw new Error(`Access denied. Your course code is not authorized for this election.`);
        }
      }

      // Check if voter has already voted in this election BEFORE sending the link
      const voterData = await ballotService.getOrCreateVoter(email);
      if (voterData?.voter_id) {
        const hasVoted = await ballotService.hasVotedInElection(voterData.voter_id, electionId);
        if (hasVoted) {
          setError('You have already voted in this election.');
          setLoading(false);
          return;
        }
      }

      // TEMPORARY BYPASS: Skip Magic Link while setting up SMTP
      /*
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/public-ballot/${electionId}`,
        },
      });

      if (authError) {
        throw new Error('Failed to send secure link: ' + authError.message);
      }

      setSuccessMessage('Check your university email! We just sent you a secure magic link to access the ballot.');
      setLoading(false);
      */

      // Directly log them in (Temporary)
      sessionStorage.setItem(`voter_session_${electionId}`, voterData.voter_id);
      navigate(`/public-ballot/${electionId}`, {
        state: { email },
      });
      
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error sending magic link.');
      setLoading(false);
    }
  };

  if (electionLoading) {
    return <Loading message="Loading voting page..." />;
  }

  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <EmptyState
          icon="🌌"
          title="Election Not Found"
          message="This election does not exist or has been closed."
        />
      </div>
    );
  }

  const now = currentTime;
  const startTime = new Date(election.start_time);
  const endTime = new Date(election.end_time);
  const isStarted = now >= startTime;
  const isEnded = now >= endTime;
  
  const isVotingOpen = (election.status === 'active' || (election.status === 'scheduled' && isStarted)) && !isEnded;
  const isScheduled = election.status === 'scheduled' && !isStarted;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -mr-48 -mt-48 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[120px] -ml-48 -mb-48" />

      <Card className="w-full max-w-xl !p-0 overflow-hidden relative z-10 border-2 border-white/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent-cyan to-primary-600" />
        
        <div className="p-6 md:p-10 text-center border-b border-gray-100">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-primary-500/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 border border-primary-500/20">
            <Fingerprint className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-1">Voter Access</p>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              Start Voting
            </h1>
          </div>

          <p className="text-xs md:text-base text-gray-500 font-medium leading-relaxed mt-3 md:mt-4">
            Enter your university email to begin.
          </p>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
          {/* Status Banner */}
          <div className={clsx(
            'p-4 md:p-6 rounded-2xl md:rounded-[24px] border-2 flex items-center gap-4 md:gap-6 transition-all',
            isScheduled ? 'bg-primary-500/5 border-primary-500/10' : 
            isEnded ? 'bg-danger-500/5 border-danger-500/10' : 
            'bg-success-500/5 border-success-500/10'
          )}>
            <div className={clsx(
              'w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border-2 shrink-0',
              isScheduled ? 'bg-white border-primary-500/20 text-primary-600' : 
              isEnded ? 'bg-white border-danger-500/20 text-danger-600' : 
              'bg-white border-success-500/20 text-success-600'
            )}>
              {isScheduled ? <Clock className="w-5 h-5 md:w-6 md:h-6" /> : isEnded ? <Lock className="w-5 h-5 md:w-6 md:h-6" /> : <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />}
            </div>
            <div className="flex-1">
              <p className={clsx(
                'text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-0.5 md:mb-1',
                isScheduled ? 'text-primary-600' : isEnded ? 'text-danger-600' : 'text-success-600'
              )}>
                {isScheduled ? 'Coming Soon' : isEnded ? 'Election Closed' : 'Voting Open'}
              </p>
              <p className="text-xs md:text-sm font-black text-gray-900 tabular-nums">
                {isScheduled 
                  ? `Starts in ${getTimeRemaining(election.start_time)}` 
                  : isEnded 
                    ? 'Voting has ended' 
                    : 'The election is live'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert variant="error" title="Error" message={error} className="rounded-[24px]" onClose={() => setError('')} />}
            {successMessage && <Alert variant="success" title="Email Sent!" message={successMessage} className="rounded-[24px]" onClose={() => setSuccessMessage('')} />}

            {isVotingOpen ? (
              <div className="space-y-6">
                <div className="relative group">
                  <Input
                    label="University Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@kab.ac.ug"
                    className="!pl-14 !py-4"
                    disabled={loading}
                    required
                  />
                  <Mail className="absolute left-5 top-[44px] w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  fullWidth
                  size="lg"
                  className="!rounded-[24px] py-6 shadow-neon-primary"
                >
                  {loading ? 'Checking...' : 'Start Voting'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="p-8 bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-200">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {isEnded ? 'This election has ended.' : 'Voting will start soon.'}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] animate-pulse">Waiting for voting to start...</p>
                  <div className="flex items-center gap-6 mt-4">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-success-500" />
                      Secure & Private
                    </p>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-primary-500" />
                      Verified Identity
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  );
};

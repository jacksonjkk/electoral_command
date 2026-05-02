import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAssignedElections } from '@/hooks/useData';
import { Card, EmptyState, Button, Skeleton, ElectionSkeleton } from '@/components/UI';
import { formatDateTime, isElectionActive, getTimeRemaining, getElectionStatus } from '@/utils/helpers';
import { CalendarDays, Clock, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

export function ElectionsList() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { data: elections, isLoading, error } = useAssignedElections(profile?.voter_id);

  const handleVote = (electionId: string) => {
    navigate(`/vote/${electionId}`);
  };


  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <Card className="text-center !p-12 border-2 border-danger-500/20 bg-danger-500/5">
          <p className="text-danger-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Error</p>
          <h2 className="text-2xl font-black text-gray-900 mb-8">Something went wrong</h2>
          <Button variant="danger" onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </div>
    );
  }

  if (!isLoading && (!elections || elections.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4">
        <EmptyState
          icon="🌌"
          title="No Elections"
          message="There are no active elections for you at the moment. Please check back later."
        />
      </div>
    );
  }

  const activeElections = (elections || []).filter(
    (e) => getElectionStatus(e) === 'active'
  );
  const upcomingElections = (elections || []).filter(
    (e) => getElectionStatus(e) === 'scheduled'
  );
  const pastElections = (elections || []).filter(
    (e) => getElectionStatus(e) === 'closed'
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto">
      {/* Voter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 bg-white/40 backdrop-blur-xl p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <p className="text-[8px] md:text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-0.5 md:mb-1">Secure Voting</p>
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight uppercase">Your <span className="text-primary-600">Elections</span></h1>
          <p className="text-xs md:text-sm font-medium mt-1 md:mt-2 flex items-center gap-2">
            <ShieldCheck className="w-3.5 md:w-4 h-3.5 md:h-4 text-success-500" />
            ID: <span className="font-bold text-gray-900">{profile?.voter_id?.slice(0, 8)}...</span>
          </p>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <Skeleton className="w-2 h-2 rounded-full" />
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Array(4).fill(0).map((_, i) => (
              <ElectionSkeleton key={i} />
            ))}
          </div>
        </section>
      )}

      {/* Active Elections */}
      {!isLoading && activeElections.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse shadow-neon-success" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-[0.2em]">Active Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activeElections.map((election) => (
              <Card 
                key={election.id} 
                className="group relative overflow-hidden border-2 border-transparent hover:border-primary-500/30 transition-all duration-500 cursor-pointer"
                onClick={() => handleVote(election.id)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-success-500/5 rounded-full blur-3xl group-hover:bg-success-500/10 transition-colors" />
                
                <div className="flex items-start justify-between mb-6 md:mb-8 relative z-10">
                  <div className="space-y-1">
                    <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
                      {election.title}
                    </h3>
                    <p className="text-xs md:text-gray-500 font-medium line-clamp-1">
                      {election.description || 'Voting Event'}
                    </p>
                  </div>
                  <span className="bg-success-500 text-white text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-neon-success">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 relative z-10">
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Remaining</p>
                    <p className="text-xs md:text-base font-bold text-danger-600 tabular-nums">
                      {getTimeRemaining(election.end_time)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100">
                    <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Ends</p>
                    <p className="text-xs md:text-base font-bold text-gray-900">
                      {formatDateTime(election.end_time).split(',')[0]}
                    </p>
                  </div>
                </div>

                <Button
                  fullWidth
                  className="!rounded-2xl group-hover:shadow-neon-primary py-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(election.id);
                  }}
                >
                  Start Voting
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming & Past Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upcoming Elections */}
        {!isLoading && upcomingElections.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <Clock className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-[0.2em]">Coming Soon</h2>
            </div>
            <div className="space-y-4">
              {upcomingElections.map((election) => (
                <Card 
                  key={election.id} 
                  className="group hover:border-primary-500/20 transition-all cursor-pointer"
                  onClick={() => handleVote(election.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
                      {election.title}
                    </h3>
                    <span className="bg-primary-500/10 text-primary-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary-500/20">
                      Preparing
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary-400" />
                      Starts in <span className="text-primary-600">{getTimeRemaining(election.start_time)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Past Elections */}
        {!isLoading && pastElections.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 px-2">
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-[0.2em]">Past Elections</h2>
            </div>
            <div className="space-y-4">
              {pastElections.map((election) => (
                <Card 
                  key={election.id} 
                  variant="outline"
                  className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => navigate(`/results/${election.id}`)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-500 group-hover:text-gray-900 transition-colors tracking-tight">
                      {election.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Closed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Finalized {formatDateTime(election.end_time).split(',')[0]}
                    </div>
                    <span className="text-primary-500 group-hover:underline">View Final Tally</span>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

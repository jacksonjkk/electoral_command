import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useElectionResults, useVotingStats, useRecentVoters, useElectionById } from '@/hooks/useData';
import { Card, Loading } from '@/components/UI';
import { formatDateTime } from '@/utils/helpers';
import { ArrowLeft, TrendingUp, Users, Activity, Download } from 'lucide-react';
import { electionService } from '@/services/election';
import { CandidateResult, PositionResults, RecentVote } from '@/types';
import clsx from 'clsx';

export function ElectionResults() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: results, isLoading: resultsLoading } = useElectionResults(electionId);
  const { data: stats } = useVotingStats(electionId);
  const { data: recentVoters } = useRecentVoters(electionId);
  const { data: election } = useElectionById(electionId);

  const handleExportVoters = async () => {
    try {
      const allVoters = await electionService.getAllVotersForExport(electionId!);
      if (!allVoters || allVoters.length === 0) {
        alert('No votes found to export.');
        return;
      }

      // Prepare CSV Content
      const csvRows = [
        ['Timestamp', 'Email', 'Security Status'],
        ...allVoters.map((v: RecentVote) => {
          const isValid = /^20\d{2}a[a-z0-9]+(f|gf)@kab\.ac\.ug$/i.test(v.voter_profiles.email);
          return [
            `"${new Date(v.created_at).toLocaleString()}"`,
            `"${v.voter_profiles.email}"`,
            `"${isValid ? 'Verified' : 'Flagged (Security Audit)'}"`
          ];
        })
      ];

      const csvContent = csvRows.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Electoral_Command_Voters_${election?.title || 'Report'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export voter list. Please try again.');
    }
  };

  if (resultsLoading) {
    return <Loading message="Loading results..." />;
  }

  if (!results) {
    return (
      <div className="bg-danger-50 text-danger-800 border border-danger-200 rounded-lg p-4">
        Results not available.
      </div>
    );
  }

  const now = new Date();
  const isEnded = election ? now >= new Date(election.end_time) : false;
  const isPublicView = location.pathname.startsWith('/public-results');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        {!isPublicView && (
          <button
            onClick={() => navigate('/ec')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        )}
        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-600 rounded-full border border-red-500/20 shadow-neon-danger animate-glow">
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Live Results</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Results Column */}
        <div className={clsx("space-y-8", isPublicView ? "lg:col-span-3" : "lg:col-span-2")}>
          {/* Voting Stats Summary */}
          <Card className="relative overflow-hidden !p-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-accent-cyan to-success-500" />
            <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-around gap-8">
              {/* Verified Votes */}
              <div className="flex flex-col items-center">
                <p className="text-success-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 md:mb-4">Verified Votes</p>
                <div className="relative">
                  <div className="absolute inset-0 blur-3xl bg-success-500/20 rounded-full" />
                  <p className="text-6xl md:text-8xl font-black text-gray-900 tabular-nums relative z-10 tracking-tighter">
                    {recentVoters ? recentVoters.filter((v: RecentVote) => /^20\d{2}a[a-z0-9]+(f|gf)@kab\.ac\.ug$/i.test(v.voter_profiles.email)).length : stats?.total_votes_cast || 0}
                  </p>
                </div>
              </div>

              {/* Security Flagged */}
              {!isPublicView && (
                <div className="flex flex-col items-center opacity-50">
                  <p className="text-red-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-2 md:mb-4">Flagged Attempts</p>
                  <p className="text-4xl md:text-5xl font-black text-gray-400 tabular-nums tracking-tighter">
                    {recentVoters ? recentVoters.filter((v: RecentVote) => !/^20\d{2}a[a-z0-9]+(f|gf)@kab\.ac\.ug$/i.test(v.voter_profiles.email)).length : 0}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-success-700">
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Secure Enrollment</span>
              </div>
            </div>
          </Card>

          {/* Position Results */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 px-2">
              <TrendingUp className="w-6 h-6 text-primary-500" />
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Current Standings</h2>
            </div>

            {results.positions?.map((position: PositionResults) => {
              const totalVotes = position.candidates.reduce(
                (sum: number, c: CandidateResult) => sum + c.votes,
                0
              );
              const sortedCandidates = [...position.candidates].sort(
                (a: CandidateResult, b: CandidateResult) => b.votes - a.votes
              );

              return (
                <Card key={position.position_id} className="border-t-4 border-t-primary-500/30">
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-6 md:mb-8 pb-3 md:pb-4 border-b border-gray-100 flex items-center justify-between">
                    {position.position_name}
                    <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {totalVotes} Votes
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 gap-6">
                    {sortedCandidates.map((candidate: CandidateResult, index: number) => {
                      const percentage = totalVotes > 0
                        ? ((candidate.votes / totalVotes) * 100).toFixed(1)
                        : '0';
                      const isLeading = index === 0 &&
                        candidate.votes > 0 &&
                        (sortedCandidates.length === 1 || candidate.votes > sortedCandidates[1].votes);

                      return (
                        <div
                          key={candidate.candidate_id}
                          className={clsx(
                            'p-4 md:p-6 rounded-[24px] md:rounded-3xl border-2 transition-all duration-500 group',
                            isLeading
                              ? 'border-primary-500/20 bg-primary-500/5 shadow-neon-primary'
                              : 'border-gray-100 bg-white hover:border-gray-200'
                          )}
                        >
                          <div className="flex items-center gap-4 md:gap-6 mb-4 md:mb-6">
                            <div className="relative">
                              {candidate.image_url ? (
                                <img
                                  src={candidate.image_url}
                                  alt={candidate.name}
                                  className="w-14 h-14 md:w-20 md:h-20 object-cover rounded-xl md:rounded-2xl ring-2 md:ring-4 ring-white shadow-xl"
                                />
                              ) : (
                                <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                                  <Users className="w-5 md:w-8 h-5 md:h-8" />
                                </div>
                              )}
                              {isLeading && (
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 md:w-8 md:h-8 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                  <TrendingUp className="w-3 md:w-4 h-3 md:h-4" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 md:gap-3 mb-1 md:mb-2">
                                <h4 className="text-lg md:text-xl font-black text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                                  {candidate.name}
                                </h4>
                                {isLeading && (
                                  <span className={clsx(
                                    'inline-block w-fit text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border-2',
                                    isEnded || election?.status === 'closed'
                                      ? 'bg-success-500 text-white border-success-400'
                                      : 'bg-primary-500 text-white border-primary-400 shadow-neon-primary'
                                  )}>
                                    {isEnded || election?.status === 'closed' ? 'Winner' : 'Leading'}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                                <span className="text-sm md:text-lg text-gray-900 font-black">{candidate.votes}</span> Votes
                              </p>
                            </div>

                            <div className="text-right">
                              <p className={clsx(
                                'text-2xl md:text-4xl font-black tracking-tighter',
                                isLeading ? 'text-primary-600' : 'text-gray-900'
                              )}>
                                {percentage}%
                              </p>
                            </div>
                          </div>

                          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden p-1 border border-gray-200">
                            <div
                              className={clsx(
                                'h-full rounded-full transition-all duration-1000 relative overflow-hidden',
                                isLeading ? 'bg-primary-600 shadow-neon-primary' : 'bg-gray-400'
                              )}
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Live Activity Sidebar - Hidden for Public View */}
        {!isPublicView && (
          <div className="h-full">
            <Card variant="dark" className="sticky top-8 !p-8 shadow-2xl border border-white/10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-10 shrink-0">
                <div>
                  <h3 className="font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse shadow-neon-primary" />
                    Recent Votes
                  </h3>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live Audit Feed</p>
                </div>
                <button
                  onClick={handleExportVoters}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all group"
                  title="Download Voter List (CSV)"
                >
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Export CSV</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar scroll-smooth space-y-6">
                {recentVoters && recentVoters.length > 0 ? (
                recentVoters.map((vote: RecentVote, index: number) => {
                  const isValid = /^20\d{2}a[a-z0-9]+(f|gf)@kab\.ac\.ug$/i.test(vote.voter_profiles.email);
                  return (
                    <div
                      key={index}
                      className={clsx(
                        "flex items-center gap-4 group transition-all p-3 rounded-xl border",
                        isValid ? "border-transparent bg-white/[0.02]" : "bg-red-500/10 border-red-500/20"
                      )}
                    >
                      <div className={clsx(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all duration-300",
                        isValid 
                          ? "bg-white/5 border border-white/10 text-primary-400 group-hover:bg-primary-500 group-hover:text-white" 
                          : "bg-red-500 text-white shadow-neon-danger"
                      )}>
                        {vote.voter_profiles.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={clsx(
                            "text-sm font-bold truncate transition-colors",
                            isValid ? "text-gray-200 group-hover:text-primary-400" : "text-red-400"
                          )}>
                            {vote.voter_profiles.email}
                          </p>
                          {!isValid && (
                            <span className="shrink-0 bg-red-500 text-white text-[6px] font-black px-1 py-0.5 rounded uppercase tracking-tighter">Flagged</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter mt-1">
                          {isValid ? `Voted at ${new Date(vote.created_at).toLocaleTimeString()}` : "SECURITY ALERT: INVALID FORMAT"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                  <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-xs text-gray-500 font-black uppercase tracking-widest animate-pulse">Waiting for network activity...</p>
                  </div>
                )}
              </div>

              {recentVoters && recentVoters.length > 0 && (
                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                  <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                    <span className="w-1 h-1 bg-primary-500 rounded-full" />
                    Updating every 5s
                    <span className="w-1 h-1 bg-primary-500 rounded-full" />
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useElections, useVotingStats } from '@/hooks/useData';
import { Card, Button, Loading, EmptyState } from '@/components/UI';
import { formatDateTime, isElectionActive } from '@/utils/helpers';
import { Plus, BarChart3, Clock, Users, CalendarDays } from 'lucide-react';

export function ECDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: elections, isLoading } = useElections(user?.id);
  const filter = (searchParams.get('tab') as 'active' | 'past') || 'active';

  const setFilter = (newFilter: 'active' | 'past') => {
    setSearchParams({ tab: newFilter });
  };

  if (isLoading) {
    return <Loading message="Loading elections..." />;
  }

  const activeCount =
    elections?.filter((e) => isElectionActive(e.start_time, e.end_time)).length || 0;
  const scheduledCount =
    elections?.filter((e) => e.status === 'scheduled').length || 0;
  const closedCount =
    elections?.filter((e) => e.status === 'closed').length || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-xl">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
            Admin <span className="text-primary-600">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
            System is ready • Secure counting active
          </p>
        </div>
        <Button onClick={() => navigate('/ec/elections/new')} size="lg" className="shadow-neon-primary">
          <Plus className="w-5 h-5 mr-2" />
          Create New Election
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Elections', value: elections?.length || 0, icon: BarChart3, color: 'primary' },
          { label: 'Active Now', value: activeCount, icon: Clock, color: 'success', pulse: true },
          { label: 'Scheduled', value: scheduledCount, icon: CalendarDays, color: 'blue' },
          { label: 'Closed', value: closedCount, icon: Users, color: 'gray' },
        ].map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/10 rounded-full blur-3xl group-hover:bg-${stat.color}-500/20 transition-colors`} />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className={`text-4xl font-black text-gray-900`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className={`w-6 h-6 ${stat.pulse ? 'animate-glow' : ''}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Elections List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex bg-white/50 p-1 rounded-2xl border border-white/40 shadow-sm backdrop-blur-sm">
            <button
              onClick={() => setFilter('active')}
              className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === 'active' ? 'bg-primary-600 text-white shadow-neon-primary' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              Active & Scheduled
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-8 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === 'past' ? 'bg-primary-600 text-white shadow-neon-primary' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              Past Results
            </button>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total {elections?.length || 0} Elections</span>
        </div>
        
        {elections && elections.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {elections
              .filter(e => filter === 'active' ? e.status !== 'closed' : e.status === 'closed')
              .map((election) => (
              <Card
                key={election.id}
                className="group border-2 border-transparent hover:border-primary-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="font-black text-xl text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
                      {election.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(election.start_time).toLocaleDateString()} — {new Date(election.end_time).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-2 ${
                      election.status === 'active'
                        ? 'bg-success-500/10 text-success-700 border-success-500/20'
                        : election.status === 'scheduled'
                          ? 'bg-primary-500/10 text-primary-700 border-primary-500/20'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                  >
                    {election.status}
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    className="flex-1 !rounded-2xl"
                    onClick={() => navigate(`/ec/elections/${election.id}`)}
                  >
                    Manage
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 !rounded-2xl border-2 border-gray-100"
                    onClick={() => navigate(`/ec/elections/${election.id}/results`)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🌌"
            title="No Elections Found"
            message="There are no elections in the system yet. Create your first one to get started."
            action={{
              label: "Create Election",
              onClick: () => navigate('/ec/elections/new')
            }}
          />
        )}
      </div>
    </div>
  );
}


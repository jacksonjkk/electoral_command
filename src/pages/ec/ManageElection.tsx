import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useElectionById, usePositions } from '@/hooks/useData';
import { useIsEcAdmin } from '@/hooks/useIsEcAdmin';
import { electionService } from '@/services/election';
import { Card, Button, Loading, Alert, Input, Textarea, EmptyState } from '@/components/UI';
import { formatDateTime, getElectionStatus, formatForInput } from '@/utils/helpers';
import { ArrowLeft, Plus, Trash2, Edit2, Activity, Users, Check } from 'lucide-react';

const COMMON_COURSES = ['KEP', 'BSCED', 'KSE', 'HEC', 'BIT', 'KCS', 'BBA', 'LLB'];

export function ManageElection() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEcAdmin = useIsEcAdmin();

  const { data: election, isLoading: electionLoading } = useElectionById(electionId);

  const { data: positions, isLoading: positionsLoading } = usePositions(electionId);

  const [newPosition, setNewPosition] = useState('');
  const [positionDesc, setPositionDesc] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingPosition, setLoadingPosition] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingElection, setDeletingElection] = useState(false);
  const [editingElection, setEditingElection] = useState(false);
  const [editTitle, setEditTitle] = useState(election?.title || '');
  const [editDesc, setEditDesc] = useState(election?.description || '');
  const [editStartTime, setEditStartTime] = useState(formatForInput(election?.start_time));
  const [editEndTime, setEditEndTime] = useState(formatForInput(election?.end_time));
  const [editRegNoRule, setEditRegNoRule] = useState(election?.reg_no_rule || '');
  const [editShowLiveResults, setEditShowLiveResults] = useState(election?.show_live_results || false);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleDeleteElection = async () => {
    setDeletingElection(true);
    try {
      await electionService.deleteElection(electionId!, user!.id);
      setSuccess('Election deleted successfully');
      setTimeout(() => navigate('/ec'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete election');
      setDeletingElection(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveElectionEdit = async () => {
    setError('');
    if (!editTitle.trim()) {
      setError('Title is required');
      return;
    }

    setSavingEdit(true);
    try {
      await electionService.updateElection(
        electionId!,
        {
          title: editTitle,
          description: editDesc,
          start_time: new Date(editStartTime).toISOString(),
          end_time: new Date(editEndTime).toISOString(),
          reg_no_rule: editRegNoRule || undefined,
          show_live_results: editShowLiveResults,
        },
        user!.id
      );
      
      // Invalidate caches so the dashboard and other views update immediately
      await queryClient.invalidateQueries(['election', electionId]);
      await queryClient.invalidateQueries(['all-elections']);
      await queryClient.invalidateQueries(['assigned-elections']);
      
      setSuccess('Election updated successfully');
      setEditingElection(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update election');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPosition.trim()) {
      setError('Position name is required');
      return;
    }

    setLoadingPosition(true);

    try {
      const createdPosition = await electionService.createPosition(
        electionId!,
        newPosition,
        positionDesc,
        user!.id
      );

      setNewPosition('');
      setPositionDesc('');
      await queryClient.invalidateQueries(['positions', electionId]);

      if (createdPosition?.id) {
        navigate(`/ec/elections/${electionId}/positions/${createdPosition.id}`);
      } else {
        setSuccess('Position added successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add position');
    } finally {
      setLoadingPosition(false);
    }
  };

  if (electionLoading || positionsLoading) {
    return <Loading message="Loading election..." />;
  }

  if (!election || (user && election.created_by !== user.id)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <EmptyState
          icon="🛡️"
          title={!election ? "Election Not Found" : "Access Denied"}
          message={!election 
            ? "The election you are looking for does not exist." 
            : "You do not have permission to manage this election profile."}
          action={{
            label: "Back to Dashboard",
            onClick: () => navigate('/ec')
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/ec')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 text-primary-700 rounded-full border border-primary-500/20 shadow-neon-primary">
          <Activity className="w-4 h-4 animate-glow" />
          <span className="text-[10px] font-black uppercase tracking-widest">Management Mode</span>
        </div>
      </div>

      {/* Election Header Hub */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 -mr-20 -mt-20 bg-primary-500/5 rounded-full blur-3xl" />
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-md border ${
                election.status === 'active' 
                  ? 'bg-success-500/10 text-success-700 border-success-500/20' 
                  : 'bg-primary-500/10 text-primary-700 border-primary-500/20'
              }`}>
                {election.status}
              </span>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight pt-2">
                {election.title}
              </h1>
            </div>
            
            {election.description && (
              <p className="text-gray-500 font-medium text-lg leading-relaxed border-l-4 border-primary-500/20 pl-6 py-2">
                {election.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Starts</p>
                <p className="font-bold text-gray-900">{formatDateTime(election.start_time)}</p>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ends</p>
                <p className="font-bold text-gray-900">{formatDateTime(election.end_time)}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[240px]">
            <Button
              variant="success"
              className="!rounded-2xl !py-4 shadow-neon-success"
              onClick={() => navigate(`/ec/elections/${electionId}/results`)}
            >
              <Activity className="w-4 h-4 mr-2" />
              View Results
            </Button>
            {getElectionStatus(election) !== 'closed' && (
              <Button
                className="!rounded-2xl !py-4"
                onClick={() => navigate(`/ec/elections/${electionId}/publish`)}
              >
                Publish Election
              </Button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="!rounded-2xl border-2 border-gray-100"
                onClick={() => {
                  setEditingElection(true);
                  setEditTitle(election.title);
                  setEditDesc(election.description || '');
                  setEditStartTime(formatForInput(election.start_time));
                  setEditEndTime(formatForInput(election.end_time));
                  setEditRegNoRule(election.reg_no_rule || '');
                  setEditShowLiveResults(election.show_live_results || false);
                }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="danger"
                className="!rounded-2xl border-2 border-danger-100/50"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Publish/Unpublish Results Button — EC Admins only, shown when election is closed */}
            {getElectionStatus(election) === 'closed' && (
              <Button
                variant={election.results_published ? 'danger' : 'success'}
                className="!rounded-2xl"
                onClick={async () => {
                  try {
                    await electionService.toggleResultsPublished(
                      electionId!,
                      !election.results_published,
                      user!.id
                    );
                    await queryClient.invalidateQueries(['election', electionId]);
                  } catch (err) {
                    console.error('Toggle publish error', err);
                  }
                }}
              >
                {election.results_published ? '🔒 Unpublish Results' : '🌐 Publish Results'}
              </Button>
            )}


          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Positions Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
              <Users className="w-6 h-6 text-primary-500" />
              Ballot Positions
            </h2>
            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
              {positions?.length || 0} Registered
            </span>
          </div>

          {positions && positions.length > 0 ? (
            <div className="space-y-4">
              {positions.map((position) => (
                <Card
                  key={position.id}
                  onClick={() => navigate(`/ec/elections/${electionId}/positions/${position.id}`)}
                  className="group !p-0 overflow-hidden border-2 border-transparent hover:border-primary-500/20 transition-all cursor-pointer"
                >
                  <div className="flex items-stretch">
                    <div className="w-2 bg-primary-500/10 group-hover:bg-primary-500 transition-colors" />
                    <div className="flex-1 p-6 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
                          {position.name}
                        </h3>
                        {position.description && (
                          <p className="text-sm text-gray-500 font-medium mt-1">
                            {position.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
                          Manage Candidates
                        </span>
                        <Plus className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-all" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Positions Configured"
              message="Initialize the ballot structure by adding positions (e.g., President, Secretary)."
            />
          )}
        </div>

        {/* Add Position Panel */}
        <div className="space-y-6">
          <Card className="sticky top-8 border-2 border-primary-500/10 shadow-2xl">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-500" />
              New Position
            </h3>

            <form onSubmit={handleAddPosition} className="space-y-6">
              <Input
                label="Role Title"
                placeholder="e.g. Chief Administrator"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                required
              />

              <Textarea
                label="Role Description"
                placeholder="Scope of responsibility..."
                value={positionDesc}
                onChange={(e) => setPositionDesc(e.target.value)}
                rows={3}
              />

              <Button type="submit" isLoading={loadingPosition} fullWidth size="lg">
                Add Position
              </Button>
            </form>
          </Card>
        </div>
      </div>


      {/* Edit Election Modal */}
      {editingElection && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10001] p-4 md:p-6 backdrop-blur-sm">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto !p-6 md:!p-8 relative">
            <div className="pb-16 md:pb-0"> {/* Mobile safety spacer */}
              <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Election</h2>

            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            <div className="space-y-4 mb-6">
              <Input
                label="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={savingEdit}
              />
              <Textarea
                label="Description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                disabled={savingEdit}
              />
              <Input
                label="Start Time"
                type="datetime-local"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                disabled={savingEdit}
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                disabled={savingEdit}
              />
              <div className="space-y-3">
                <Input
                  label="Allowed Course Codes"
                  value={editRegNoRule}
                  onChange={(e) => setEditRegNoRule(e.target.value)}
                  placeholder="e.g., KEP, BSCED"
                  disabled={savingEdit}
                />
                <div className="flex flex-wrap gap-2">
                  {COMMON_COURSES.map(course => {
                    const isSelected = editRegNoRule.split(',').map(c => c.trim()).includes(course);
                    return (
                      <button
                        key={course}
                        type="button"
                        disabled={savingEdit}
                        onClick={() => {
                          const currentCodes = editRegNoRule.split(',').map(c => c.trim()).filter(c => c);
                          if (isSelected) {
                            setEditRegNoRule(currentCodes.filter(c => c !== course).join(', '));
                          } else {
                            setEditRegNoRule([...currentCodes, course].join(', '));
                          }
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all flex items-center gap-1 ${
                          isSelected 
                            ? 'bg-primary-500 text-white border-primary-500 shadow-neon-primary' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-primary-500/50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {course}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-wider">Show Live Results</h3>
                  <p className="text-xs text-gray-500">Allow voters to see live results immediately after voting.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={editShowLiveResults}
                    onChange={(e) => setEditShowLiveResults(e.target.checked)}
                    disabled={savingEdit}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setEditingElection(false)}
                  className="flex-1"
                  disabled={savingEdit}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveElectionEdit}
                  disabled={savingEdit}
                  className="flex-1"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[10001] p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md !p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Election?</h2>
            <p className="text-gray-600 mb-6">
              This will permanently delete the election "{election?.title}" and all associated positions, candidates, and votes. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
                disabled={deletingElection}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteElection}
                disabled={deletingElection}
                className="flex-1"
              >
                {deletingElection ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

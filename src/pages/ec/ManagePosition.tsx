import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCandidates } from '@/hooks/useData';
import { electionService } from '@/services/election';
import { Card, Button, Loading, Alert, Input, Textarea } from '@/components/UI';
import { ArrowLeft, Plus, Upload, Trash2, Edit2, User } from 'lucide-react';
import { isValidImageType, isValidFileSize, formatBytes } from '@/utils/helpers';

export function ManagePosition() {
  const { electionId, positionId } = useParams<{
    electionId: string;
    positionId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: candidates, isLoading: candidatesLoading, refetch } = useCandidates(positionId);

  const [candidateName, setCandidateName] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingCandidate, setLoadingCandidate] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editManifesto, setEditManifesto] = useState('');
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageType(file)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    if (!isValidFileSize(file, 5)) {
      setError(`Image size must be less than 5MB (current: ${formatBytes(file.size)})`);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!candidateName.trim()) {
      setError('Candidate name is required');
      return;
    }

    if (!selectedFile) {
      setError('Candidate image is required');
      return;
    }

    setLoadingCandidate(true);

    try {
      // Create candidate
      const candidate = await electionService.createCandidate(
        positionId!,
        candidateName,
        manifesto,
        null, // Image URL will be set by upload
        user!.id
      );

      // Upload image
      const imageUrl = await electionService.uploadCandidateImage(
        candidate.id,
        selectedFile,
        user!.id
      );

      setCandidateName('');
      setManifesto('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      setSuccess('Candidate added successfully');
      setTimeout(() => setSuccess(''), 3000);

      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add candidate');
    } finally {
      setLoadingCandidate(false);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    if (!confirm('Delete this candidate? This action cannot be undone.')) return;

    setDeletingCandidateId(candidateId);

    try {
      await electionService.deleteCandidate(candidateId, user!.id);
      setSuccess('Candidate deleted');
      setTimeout(() => setSuccess(''), 3000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete candidate');
    } finally {
      setDeletingCandidateId(null);
    }
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageType(file)) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    if (!isValidFileSize(file, 5)) {
      setError(`Image size must be less than 5MB (current: ${formatBytes(file.size)})`);
      return;
    }

    setEditSelectedFile(file);
    setError('');
  };

  const handleSaveCandidateEdit = async () => {
    setError('');
    if (!editName.trim()) {
      setError('Candidate name is required');
      return;
    }

    setSavingEdit(true);
    try {
      // Update candidate details
      await electionService.updateCandidate(
        editingCandidateId!,
        {
          name: editName,
          manifesto: editManifesto,
        },
        user!.id
      );

      // Upload new image if selected
      if (editSelectedFile) {
        await electionService.uploadCandidateImage(
          editingCandidateId!,
          editSelectedFile,
          user!.id
        );
      }

      setSuccess('Candidate updated successfully');
      setEditingCandidateId(null);
      setEditSelectedFile(null);
      if (editFileInputRef.current) editFileInputRef.current.value = '';
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update candidate');
    } finally {
      setSavingEdit(false);
    }
  };

  if (candidatesLoading) {
    return <Loading message="Loading candidates..." />;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(`/ec/elections/${electionId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-black text-[10px] uppercase tracking-widest"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Election Manager
      </button>

      {error && (
        <Alert
          variant="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          variant="success"
          message={success}
          onClose={() => setSuccess('')}
        />
      )}

      {/* Add Candidate Form */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-widest">Add New Candidate</h2>

        <form onSubmit={handleAddCandidate} className="space-y-4">
          <Input
            label="Candidate Name"
            placeholder="Full name"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            required
          />

          <Textarea
            label="Candidate Bio"
            placeholder="Candidate's vision and platform (optional)"
            value={manifesto}
            onChange={(e) => setManifesto(e.target.value)}
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Candidate Image (Required)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              {selectedFile ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(selectedFile.size)}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-danger-600 text-sm font-medium hover:text-danger-700"
                  >
                    Remove image
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">
                    Click to select image
                  </p>
                  <p className="text-xs text-gray-500">
                    JPEG, PNG, or WebP (max 5MB)
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              {selectedFile ? 'Change image' : 'Select image'}
            </button>
          </div>

          <Button type="submit" fullWidth isLoading={loadingCandidate}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Candidate
          </Button>
        </form>
      </Card>

      {/* Candidates List */}
      {candidates && candidates.length > 0 ? (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Candidates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {candidate.image_url ? (
                  <div className="w-full h-64 bg-gray-100 overflow-hidden">
                    <img
                      src={candidate.image_url}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="p-4">
                  <h3 className="font-black text-gray-900">{candidate.name}</h3>
                  {candidate.manifesto && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {candidate.manifesto}
                    </p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingCandidateId(candidate.id);
                        setEditName(candidate.name);
                        setEditManifesto(candidate.manifesto || '');
                        setEditSelectedFile(null);
                        if (editFileInputRef.current) editFileInputRef.current.value = '';
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      disabled={deletingCandidateId === candidate.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card>
          <p className="text-gray-500 text-center py-8">
            No candidates added yet. Add one above to get started!
          </p>
        </Card>
      )}

      {/* Edit Candidate Modal */}
      {editingCandidateId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-widest">Edit Candidate</h2>

            {error && (
              <Alert
                variant="error"
                message={error}
                onClose={() => setError('')}
              />
            )}

            <div className="space-y-4 mb-6">
              <Input
                label="Candidate Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={savingEdit}
              />
              <Textarea
                label="Candidate Bio"
                value={editManifesto}
                onChange={(e) => setEditManifesto(e.target.value)}
                rows={3}
                disabled={savingEdit}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                  {editSelectedFile ? (
                    <div className="space-y-2">
                      <img
                        src={URL.createObjectURL(editSelectedFile)}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm font-medium text-gray-900">{editSelectedFile.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditSelectedFile(null);
                          if (editFileInputRef.current) editFileInputRef.current.value = '';
                        }}
                        className="text-danger-600 text-sm font-medium hover:text-danger-700"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <p className="text-xs text-gray-500">Click to select image</p>
                    </div>
                  )}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleEditFileSelect}
                    className="hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  className="mt-2 text-primary-600 text-sm font-medium hover:text-primary-700"
                >
                  {editSelectedFile ? 'Change image' : 'Select new image'}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingCandidateId(null);
                  setEditSelectedFile(null);
                }}
                className="flex-1"
                disabled={savingEdit}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCandidateEdit}
                disabled={savingEdit}
                className="flex-1"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

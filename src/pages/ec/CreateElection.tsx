import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { electionService } from '@/services/election';
import { Card, Button, Input, Textarea, Alert } from '@/components/UI';
import { ArrowLeft, Check } from 'lucide-react';

const COMMON_COURSES = ['KEP', 'BSCED', 'KSE', 'HEC', 'BIT', 'BCS', 'BBA', 'LLB'];

export function CreateElection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [regNoRule, setRegNoRule] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Election title is required');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start and end times are required');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const newElection = await electionService.createElection(
        title,
        description,
        startTime,
        endTime,
        user!.id,
        regNoRule || undefined
      );

      navigate(`/ec/elections/${newElection.id}`, {
        state: { isNew: true },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/ec')}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Election</h1>

        {error && (
          <Alert
            variant="error"
            title="Error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Input
            label="Election Title"
            placeholder="e.g., 2024 Student Government Election"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Describe this election..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min={getMinDateTime()}
              required
            />

            <Input
              label="End Date & Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={getMinDateTime()}
              required
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Voter Eligibility Rules</h3>
              <div className="space-y-3">
                <Input
                  label="Allowed Course Codes"
                  placeholder="e.g., KEP, BSCED"
                  value={regNoRule}
                  onChange={(e) => setRegNoRule(e.target.value)}
                  helperText="Selected codes will be allowed to vote"
                />
                <div className="flex flex-wrap gap-2">
                  {COMMON_COURSES.map(course => {
                    const isSelected = regNoRule.split(',').map(c => c.trim()).includes(course);
                    return (
                      <button
                        key={course}
                        type="button"
                        onClick={() => {
                          const currentCodes = regNoRule.split(',').map(c => c.trim()).filter(c => c);
                          if (isSelected) {
                            setRegNoRule(currentCodes.filter(c => c !== course).join(', '));
                          } else {
                            setRegNoRule([...currentCodes, course].join(', '));
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
            </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Next Steps:</strong> After creating this election, you'll add positions
              (President, Secretary, etc.), then add candidates for each position.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/ec')}
              type="button"
            >
              Cancel
            </Button>
            <Button fullWidth isLoading={loading} type="submit">
              Create Election
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, Button, Loading } from '@/components/UI';
import { CheckCircle2, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { generateVoterId } from '@/utils/helpers';
import { ballotService } from '@/services/ballot';
import { resolveCandidateImageUrl } from '@/utils/storage';

export const PublicBallotSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { electionId } = useParams();
  const [receipt, setReceipt] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const email = location.state?.email || 'voter';

  useEffect(() => {
    // Lock this device for this election
    if (electionId) {
      localStorage.setItem(`voted_${electionId}`, 'true');
    }

    const fetchReceipt = async () => {
      if (!electionId || !email) return;
      try {
        const voterId = generateVoterId(email);
        const data = await ballotService.getVoterReceipt(voterId, electionId);
        setReceipt(data || []);
      } catch (err) {
        console.error('Failed to fetch receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [electionId, email]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-success-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -ml-48 -mb-48" />

      <Card className="w-full max-w-xl !p-0 overflow-hidden relative z-10 border-2 border-white/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 via-primary-500 to-success-500" />

        <div className="p-8 md:p-12 text-center">
          <div className="relative inline-block mb-6 md:mb-8">
            <div className="absolute inset-0 bg-success-500/20 blur-3xl rounded-full" />
            <div className="w-24 h-24 bg-success-500 text-white rounded-[32px] flex items-center justify-center relative z-10 shadow-neon-success animate-glow">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          </div>

          <p className="text-[10px] font-black text-success-600 uppercase tracking-[0.4em] mb-3">Vote Received</p>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 md:mb-6 tracking-tight">Success!</h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed max-w-md mx-auto mb-6 md:mb-8">
            Thank you for voting. Your choices have been securely saved.
          </p>

          <div className="bg-gray-50 rounded-[32px] p-6 md:p-8 border border-gray-100 flex items-center gap-4 md:gap-6 mb-6 md:mb-8 text-left">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-primary-600">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Your Email</p>
              <p className="text-xs md:text-sm font-bold text-gray-900">{email}</p>
            </div>
          </div>

          {/* Voter Receipt Section */}
          <div className="mt-8 pt-8 border-t border-gray-100 text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6 text-center">Your Ballot Receipt</p>

            {loading ? (
              <div className="flex justify-center p-4"><Loading /></div>
            ) : receipt.length > 0 ? (
              <div className="space-y-3 mb-8">
                {receipt.map((vote) => (
                  <div key={vote.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {Array.isArray(vote.positions) ? vote.positions[0]?.name : vote.positions?.name}
                      </p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">
                        {Array.isArray(vote.candidates) ? vote.candidates[0]?.name : vote.candidates?.name}
                      </p>
                    </div>
                    {((Array.isArray(vote.candidates) ? vote.candidates[0] : vote.candidates)?.image_url) ? (
                      <img 
                        src={resolveCandidateImageUrl((Array.isArray(vote.candidates) ? vote.candidates[0] : vote.candidates).image_url)} 
                        alt={(Array.isArray(vote.candidates) ? vote.candidates[0] : vote.candidates).name} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100" 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center mb-8">No votes found.</p>
            )}
          </div>

          <Button
            onClick={() => navigate(`/public-results/${electionId}`)}
            fullWidth
            size="lg"
            className="!rounded-[24px] py-6 shadow-neon-success mt-10"
          >
            Check Election Results
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Card, Button, Loading } from '@/components/UI';
import { CheckCircle2, ShieldCheck, ArrowRight, User } from 'lucide-react';
import { generateVoterId } from '@/utils/helpers';
import { ballotService } from '@/services/ballot';

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
              <div className="flex justify-center p-4"><Loading size="sm" /></div>
            ) : receipt.length > 0 ? (
              <div className="space-y-3 mb-8">
                {receipt.map((vote) => (
                  <div key={vote.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{vote.positions?.position_name}</p>
                      <p className="text-sm font-black text-gray-900 mt-0.5">{vote.candidates?.name}</p>
                    </div>
                    {vote.candidates?.image_url ? (
                      <img src={vote.candidates.image_url} alt={vote.candidates.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
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

          {/* Social Sharing Section */}
          <div className="mt-4 pt-8 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Encourage others to vote</p>
            <div className="flex items-center justify-center gap-4 md:gap-6">
              {/* WhatsApp (Flaticon Style) */}
              <button className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-all hover:-translate-y-1 shadow-lg border border-[#25D366]/20">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793 0-.853.448-1.273.607-1.446.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.101-.177.211-.077.383.1.173.444.735.95 1.185.65.58 1.2.76 1.37.846.171.086.271.07.371-.044.103-.114.444-.52.564-.694.12-.174.241-.145.405-.087.163.058 1.04.49 1.214.577.174.087.289.13.332.202.045.075.045.433-.1.839zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.017 21.671c-1.747 0-3.453-.469-4.933-1.356l-3.541.93 1.011-3.689c-1.107-1.634-1.742-3.612-1.741-5.557 0-5.341 4.347-9.688 9.69-9.688 2.587 0 5.018 1.006 6.848 2.837s2.836 4.261 2.836 6.848c-.001 5.344-4.349 9.688-9.69 9.688z"/>
                </svg>
              </button>

              {/* Facebook */}
              <button className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-all hover:-translate-y-1 shadow-lg border border-[#1877F2]/20">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              {/* Twitter / X */}
              <button className="w-12 h-12 rounded-2xl bg-black/5 text-black flex items-center justify-center hover:bg-black hover:text-white transition-all hover:-translate-y-1 shadow-lg border border-black/10">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
                </svg>
              </button>
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

          {/* Hidden Icon Attribution for Compliance */}
          <div className="mt-0 opacity-0 pointer-events-none h-0 overflow-hidden">
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[8px] text-gray-500">
              <a href="https://www.flaticon.com/free-icons/brands-and-logotypes" title="brands and logotypes icons">Brands and logotypes icons created by Freepik - Flaticon</a>
              <a href="https://www.flaticon.com/free-icons/whatsapp" title="whatsapp icons">Whatsapp icons created by Indygo - Flaticon</a>
              <a href="https://www.flaticon.com/free-icons/email" title="email icons">Email icons created by Uniconlabs - Flaticon</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

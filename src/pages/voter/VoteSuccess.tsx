import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from '@/components/UI';
import { CheckCircle2, ShieldCheck, ArrowRight, Zap } from 'lucide-react';

export function VoteSuccess() {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(8);

  const ballotSize = (location.state as { ballotSize?: number })?.ballotSize || 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/vote');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-success-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] -ml-48 -mb-48" />

      <Card className="w-full max-w-xl !p-0 overflow-hidden relative z-10 border-2 border-white/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success-500 via-primary-500 to-success-500" />
        
        <div className="p-16 text-center">
          <div className="relative inline-block mb-10">
            <div className="absolute inset-0 bg-success-500/20 blur-3xl rounded-full" />
            <div className="w-24 h-24 bg-success-500 text-white rounded-[32px] flex items-center justify-center relative z-10 shadow-neon-success animate-glow">
              <CheckCircle2 className="w-14 h-14" />
            </div>
          </div>

          <p className="text-[10px] font-black text-success-600 uppercase tracking-[0.4em] mb-3">Vote Finalized & Sealed</p>
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Access Granted</h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-md mx-auto mb-10">
            Your choices for <span className="text-gray-900 font-bold">{ballotSize} positions</span> have been successfully saved.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 flex items-center gap-4 text-left">
              <Zap className="w-6 h-6 text-primary-500" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="text-xs font-bold text-gray-900 uppercase">Confirmed</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 flex items-center gap-4 text-left">
              <ShieldCheck className="w-6 h-6 text-success-500" />
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Security</p>
                <p className="text-xs font-bold text-gray-900 uppercase">Encrypted</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Button onClick={() => navigate('/vote')} fullWidth size="lg" className="!rounded-[24px] py-6 shadow-neon-primary">
              Return to Elections
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Terminal redirect in <span className="text-primary-600">{countdown}s</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Alert, Card } from '@/components/UI';
import { authService } from '@/services/auth';
import { ShieldCheck, Lock, ArrowRight, Fingerprint, Mail, Key } from 'lucide-react';

export function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!authService.isValidEmailDomain(email)) {
        throw new Error('Unauthorized domain. Use @kab.ac.ug credentials.');
      }

      await signIn(email, password);
      
      setTimeout(() => {
        navigate('/ec');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication sequence failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 md:py-20 relative overflow-hidden">
      {/* Background Decorations - Optimized for Mobile */}
      <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary-600/5 rounded-full blur-[60px] md:blur-[120px] -mr-48 md:-mr-96 -mt-48 md:-mt-96 md:animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[400px] bg-accent-cyan/5 rounded-full blur-[40px] md:blur-[120px] -ml-24 md:-ml-48 -mb-24 md:-mb-48" />

      <Card className="w-full max-w-xl !p-0 overflow-hidden relative z-10 border-2 border-white/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent-cyan to-primary-600" />
        
        <div className="p-6 md:p-10 text-center border-b border-gray-100 bg-gray-50/30">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl border border-gray-100">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-1 md:mb-2">Official Portal</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 md:mb-2 tracking-tighter uppercase">Electoral <span className="text-primary-600">Command</span></h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium">Administrator Authentication Required</p>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {error && (
              <Alert
                variant="error"
                title="Access Denied"
                message={error}
                className="rounded-2xl md:rounded-[24px]"
                onClose={() => setError('')}
              />
            )}

            <div className="space-y-4 md:space-y-6">
              <div className="relative group">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@kab.ac.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="!pl-12 md:!pl-14 !py-3 md:!py-4 !rounded-xl md:!rounded-2xl"
                  required
                  autoComplete="email"
                />
                <Mail className="absolute left-4 md:left-5 top-[38px] md:top-[44px] w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>

              <div className="relative group">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="!pl-12 md:!pl-14 !py-3 md:!py-4 !rounded-xl md:!rounded-2xl"
                  required
                  autoComplete="current-password"
                />
                <Key className="absolute left-4 md:left-5 top-[38px] md:top-[44px] w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="!rounded-xl md:!rounded-[24px] py-4 md:py-6 shadow-neon-primary text-sm font-black uppercase tracking-widest"
              isLoading={loading}
              disabled={!email || !password}
            >
              Authorize
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <Lock className="w-4 h-4 text-gray-300" />
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-6 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-relaxed">
              Standard operating procedures require <br/>
              verified university credentials for all admins.
            </p>
            
            <p className="text-sm font-bold text-gray-500">
              Awaiting initialization?{' '}
              <Link to="/ec/signup" className="text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2">
                Register Administrator Profile
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

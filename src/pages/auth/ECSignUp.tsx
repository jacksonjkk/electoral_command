import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/services/supabase';
import { Button, Input, Alert, Card, Loading } from '@/components/UI';
import { isValidEmailDomain } from '@/utils/helpers';
import { ShieldPlus, Mail, Lock, UserPlus, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';

export const ECSignUp: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    setError('');

    if (!email.trim()) {
      setError('Credential field empty: Email required.');
      return false;
    }

    if (!isValidEmailDomain(email)) {
      setError('Unauthorized domain. Use @kab.ac.ug credentials.');
      return false;
    }

    if (password.length < 8) {
      setError('Security key too weak. 8 characters minimum.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Security keys do not match.');
      return false;
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: { role: 'ec_admin' },
          emailRedirectTo: `${window.location.origin}/ec/login`,
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error('Failed to initialize administrator profile.');

      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/ec/login', {
          state: {
            message: 'Verification packet transmitted. Check your inbox to authorize your node.',
          },
        });
      }, 3000);
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-20 relative">
        <Card className="w-full max-w-xl !p-16 text-center relative overflow-hidden border-2 border-white/20 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-success-500 animate-pulse" />
          <div className="w-24 h-24 bg-success-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-success-500/20 shadow-neon-success">
            <ShieldCheck className="w-12 h-12 text-success-600" />
          </div>
        <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Account Created!</h1>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed max-w-sm mx-auto">
          Your account has been created. Please check your email to verify your account.
        </p>
        <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] animate-pulse">
          Redirecting to Login...
        </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20 relative">
      <Card className="w-full max-w-xl !p-0 overflow-hidden relative z-10 border-2 border-white/20 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-accent-cyan to-primary-600" />
        
        <div className="p-6 md:p-10 text-center border-b border-gray-100 bg-gray-50/30">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-xl border border-gray-100">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-1 md:mb-2">Admin Registration</p>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1 md:mb-2 tracking-tighter uppercase">Electoral <span className="text-primary-600">Command</span></h1>
          <p className="text-xs md:text-sm text-gray-500 font-medium">Initialize your administrator node.</p>
        </div>

        <div className="p-6 md:p-10 space-y-6 md:space-y-8">
          <form onSubmit={handleSignUp} className="space-y-5 md:space-y-6">
            {error && <Alert variant="error" title="Validation Failed" message={error} className="rounded-2xl md:rounded-[24px]" onClose={() => setError('')} />}

            <div className="space-y-4 md:space-y-6">
              <div className="relative group">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kab.ac.ug"
                  className="!pl-12 md:!pl-14 !py-3 md:!py-4 !rounded-xl md:!rounded-2xl"
                  disabled={loading}
                  required
                />
                <Mail className="absolute left-4 md:left-5 top-[38px] md:top-[44px] w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="relative group">
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="!pl-12 md:!pl-14 !py-3 md:!py-4 !rounded-xl md:!rounded-2xl"
                    disabled={loading}
                    required
                  />
                  <Lock className="absolute left-4 md:left-5 top-[38px] md:top-[44px] w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>

                <div className="relative group">
                  <Input
                    label="Confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="!pl-12 md:!pl-14 !py-3 md:!py-4 !rounded-xl md:!rounded-2xl"
                    disabled={loading}
                    required
                  />
                  <Lock className="absolute left-4 md:left-5 top-[38px] md:top-[44px] w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading} fullWidth size="lg" className="!rounded-xl md:!rounded-[24px] py-4 md:py-6 shadow-neon-primary text-sm font-black uppercase tracking-widest">
              {loading ? 'Initializing...' : 'Register Node'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <Fingerprint className="w-4 h-4 text-gray-300" />
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="space-y-6 text-center">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-relaxed">
              Accounts are restricted to authorized university domains.
            </p>
            
            <p className="text-sm font-bold text-gray-500">
              Already have an account?{' '}
              <Link to="/ec/login" className="text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

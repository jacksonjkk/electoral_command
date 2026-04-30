import { useEffect, useState, useContext, createContext } from 'react';
import { authService } from '@/services/auth';
import { VoterProfile } from '@/types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: VoterProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<VoterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // Only fetch voter profile if user is NOT an EC admin
        if (currentUser) {
          const isEC = currentUser?.user_metadata?.role === 'ec_admin';
          if (!isEC) {
            const voterProfile = await authService.getVoterProfile(
              currentUser.id
            );
            setProfile(voterProfile);
          }
        }
      } catch (err) {
        // Quiet the auth error for anonymous users
        if (err instanceof Error && !err.message.includes('Auth session missing')) {
          console.error('Auth check failed:', err);
        }
        
        // Don't set error for 406 - it's expected if user doesn't have voter profile
        if (err instanceof Error && !err.message.includes('406') && !err.message.includes('Auth session missing')) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen to auth changes
    const subscription = authService.onAuthStateChange(async (newUser) => {
      setUser(newUser);

      if (newUser) {
        const isEC = newUser?.user_metadata?.role === 'ec_admin';
        if (!isEC) {
          const voterProfile = await authService.getVoterProfile(newUser.id);
          setProfile(voterProfile);
        }
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription?.data?.subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      await authService.signUp(email, password);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await authService.signIn(email, password);
      setUser(data.user);
      const voterProfile = await authService.getVoterProfile(data.user.id);
      setProfile(voterProfile);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
}

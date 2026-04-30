import { supabase } from './supabase';
import { AuthError, User } from '@supabase/supabase-js';

const ALLOWED_EMAIL_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN || '@kab.ac.ug';

export const authService = {
  /**
   * Validate email domain - only @kab.ac.ug allowed
   */
  isValidEmailDomain: (email: string): boolean => {
    return email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN.toLowerCase());
  },

  /**
   * Sign up with email and password
   * Enforces @kab.ac.ug email domain
   */
  signUp: async (email: string, password: string) => {
    // Validate email domain
    if (!authService.isValidEmailDomain(email)) {
      throw new Error(
        `Only emails ending in ${ALLOWED_EMAIL_DOMAIN} are allowed`
      );
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;

    // Create voter profile
    if (data.user) {
      await authService.createVoterProfile(data.user.id, email);
    }

    return data;
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    // Validate email domain
    if (!authService.isValidEmailDomain(email)) {
      throw new Error(
        `Only emails ending in ${ALLOWED_EMAIL_DOMAIN} are allowed`
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Create voter profile in database
   */
  createVoterProfile: async (userId: string, email: string) => {
    const voterId = `voter_${userId.substring(0, 12)}`;

    const { data, error } = await supabase
      .from('voter_profiles')
      .insert([
        {
          user_id: userId,
          voter_id: voterId,
          email: email.toLowerCase(),
          status: 'active',
        },
      ])
      .select();

    if (error) throw error;
    return data?.[0];
  },

  /**
   * Get voter profile by user ID
   */
  getVoterProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('voter_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Verify email is confirmed
   */
  isEmailConfirmed: async () => {
    try {
      const user = await authService.getCurrentUser();
      return user?.email_confirmed_at !== null;
    } catch {
      return false;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

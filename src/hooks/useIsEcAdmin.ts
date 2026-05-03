import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to determine if the currently authenticated user is an EC admin.
 * Checks the user metadata for the 'ec_admin' role.
 */
export const useIsEcAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.user_metadata?.role === 'ec_admin';
};

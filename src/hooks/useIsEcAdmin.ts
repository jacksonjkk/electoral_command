import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to determine if the currently authenticated user is an EC admin.
 * Queries the `ec_admins` table for a matching user_id.
 */
export const useIsEcAdmin = (): boolean => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from('ec_admins')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  return isAdmin;
};


'use client';

import { useState, useEffect } from 'react';
import { useUser, useSupabase } from '@/lib/supabase/provider';
import type { User } from '@/lib/types';

export function useSuggestedUsers(limit: number = 5) {
  const { user: authUser } = useUser();
  const supabase = useSupabase();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!authUser || !supabase) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // This is a placeholder logic. In a real app, this would be a complex query
      // or a call to a dedicated recommendations engine/function.
      // For now, we fetch a few random users who are not the current user.
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .not('id', 'eq', authUser.id)
        .limit(limit);

      if (error) {
        console.error('Error fetching suggested users:', error);
        setSuggestedUsers([]);
      } else {
        setSuggestedUsers(data as User[]);
      }
      setIsLoading(false);
    };

    fetchSuggestions();
  }, [authUser, supabase, limit]);

  return { suggestedUsers, isLoading };
}

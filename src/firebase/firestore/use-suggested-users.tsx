
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/firebase/provider';
import type { User } from '@/lib/types';

interface UseSuggestedUsersResult {
  suggestedUsers: User[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * A custom hook to fetch a list of suggested users to follow from Supabase.
 * @param currentUserId The ID of the currently authenticated user.
 */
export function useSuggestedUsers(
  currentUserId: string | null | undefined
): UseSuggestedUsersResult {
  const supabase = useSupabase();
  const [suggestedUsers, setSuggestedUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true);

  useEffect(() => {
    if (!supabase || !currentUserId) {
        setIsLoadingFollowing(false);
        return;
    };
    
    const fetchFollowing = async () => {
        setIsLoadingFollowing(true);
        const { data, error } = await supabase.from('followers').select('following_id').eq('follower_id', currentUserId);
        if (data) {
            setFollowingIds(new Set(data.map(d => d.following_id)));
        }
        setIsLoadingFollowing(false);
    }
    fetchFollowing();

  }, [supabase, currentUserId]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (isLoadingFollowing) return;
      if (!supabase) {
          setIsLoading(false);
          return;
      }
      
      setIsLoading(true);

      try {
        const excludedIds = new Set(followingIds);
        if (currentUserId) {
            excludedIds.add(currentUserId);
        }
        
        let dismissedUsers: string[] = [];
        const dismissedData = typeof window !== 'undefined' ? localStorage.getItem('dismissedUsers') : null;
        if (dismissedData) {
            try {
                dismissedUsers = JSON.parse(dismissedData);
            } catch (e) {
                console.error("Failed to parse dismissed users from localStorage", e);
            }
        }
        dismissedUsers.forEach((id: string) => excludedIds.add(id));

        // Using a Postgres function to get random users is more efficient.
        // This would be created in the Supabase SQL Editor:
        // CREATE FUNCTION get_random_users(exclude_ids text[], count int) ...
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            // This is not efficient on large tables. A function is preferred.
            .limit(50);
        
        if (usersError) throw usersError;

        const suggestions = usersData.filter(user => !excludedIds.has(user.id));
        
        suggestions.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));

        setSuggestedUsers(suggestions.slice(0, 5));
        setError(null);
      } catch (e: any) {
        console.error("Error fetching suggested users:", e);
        setError(e);
        setSuggestedUsers(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [supabase, currentUserId, followingIds, isLoadingFollowing]);

  return { suggestedUsers, isLoading, error };
}

    
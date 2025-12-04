
'use client';

import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a following relationship between two users.
 * @param supabase Supabase client instance.
 * @param currentUserId The user initiating the follow.
 * @param targetUserId The user to be followed.
 */
export async function followUser(
  supabase: SupabaseClient,
  currentUserId: string,
  targetUserId: string
) {
  const { error } = await supabase
    .from('followers')
    .insert({ follower_id: currentUserId, following_id: targetUserId });

  if (error) {
    console.error("Error following user:", error);
    throw error;
  }
}

/**
 * Removes a following relationship between two users.
 * @param supabase Supabase client instance.
 * @param currentUserId The user initiating the unfollow.
 * @param targetUserId The user to be unfollowed.
 */
export async function unfollowUser(
  supabase: SupabaseClient,
  currentUserId: string,
  targetUserId: string
) {
    const { error } = await supabase
        .from('followers')
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId });
    
    if (error) {
        console.error("Error unfollowing user:", error);
        throw error;
    }
}

    
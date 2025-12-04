
'use client';

import { useContext } from 'react';
import { User } from 'firebase/auth';
import { FirebaseContext } from '../provider';

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * A hook that provides the current Firebase user's authentication state.
 *
 * It must be used within a descendant of FirebaseProvider.
 *
 * @returns An object containing the user, loading state, and any error.
 * @deprecated Import `useUser` directly from `@/firebase/provider` instead.
 */
export function useUser(): UserHookResult {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  
  // Return the user state directly from the context
  return {
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
}

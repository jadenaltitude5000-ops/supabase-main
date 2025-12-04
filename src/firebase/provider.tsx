
'use client';

import React, { createContext, useContext, ReactNode, useMemo, FC, useState, useEffect } from 'react';
import { SupabaseClient, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// --- React Context ---
export interface SupabaseContextState {
  supabase: SupabaseClient;
  session: Session | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const SupabaseContext = createContext<SupabaseContextState | undefined>(undefined);

interface SupabaseProviderProps {
  children: ReactNode;
}

export const SupabaseProvider: FC<SupabaseProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    setIsUserLoading(true);
    const { data: { subscription }, } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsUserLoading(false);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsUserLoading(false);
    }).catch(error => {
        console.error("Error getting initial session:", error);
        setUserError(error);
        setIsUserLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const contextValue = useMemo((): SupabaseContextState => ({
    supabase: supabase,
    session,
    user,
    isUserLoading,
    userError,
  }), [session, user, isUserLoading, userError]);

  return (
    <SupabaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </SupabaseContext.Provider>
  );
};


// --- HOOKS ---

function useSupabaseServices() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabaseServices must be used within a SupabaseProvider.');
  }
  return context;
}

export const useSupabase = (): SupabaseClient => useSupabaseServices().supabase;

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
  session: Session | null;
}

export function useUser(): UserHookResult {
  const context = useSupabaseServices();
  return {
    user: context.user,
    session: context.session,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
}

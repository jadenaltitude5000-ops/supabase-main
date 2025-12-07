
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { createBrowserClient } from './client';
import { useRouter } from 'next/navigation';

type SupabaseContextType = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  isUserLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createBrowserClient() as SupabaseClient<Database>;
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
      
      if (event === 'SIGNED_OUT') {
        router.push('/signin');
      }
    });

    // Fetch initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    };
    getInitialSession();


    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <SupabaseContext.Provider value={{ supabase, user, isUserLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context.supabase;
};

export const useUser = () => {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a SupabaseProvider');
  }
  return { user: context.user, isUserLoading: context.isUserLoading };
};

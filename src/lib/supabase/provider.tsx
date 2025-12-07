
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Define a more specific type for the client instance if needed, or use 'any' as a last resort.
type SupabaseClientType = SupabaseClient<Database>;

type SupabaseContextType = {
  supabase: SupabaseClientType;
  user: User | null;
  isUserLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  // Use the more specific type returned by the client creation helper
  const supabase = createBrowserClient() as unknown as SupabaseClientType;
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

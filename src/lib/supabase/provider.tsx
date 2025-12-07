
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type SupabaseContextType = {
  supabase: SupabaseClient<Database>;
  user: User | null;
  isUserLoading: boolean;
};

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [supabase] = useState(() => createBrowserClient());
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      
      setIsUserLoading(false);

      if (event === 'SIGNED_IN') {
        // Can handle redirect on sign-in here if needed
      } else if (event === 'SIGNED_OUT') {
        router.push('/signin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

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

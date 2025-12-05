
'use client';

import { useRouter } from 'next/navigation';
import { useSupabase, useUser } from '@/lib/supabase/provider';
import { useEffect } from 'react';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    const handleLogout = async () => {
      if (!supabase) return;
      await supabase.auth.signOut();
      // The onAuthStateChange listener in the provider will handle the redirect.
    };

    if (user) {
      handleLogout();
    } else {
      // If already logged out, just redirect to signin
      router.push('/signin');
    }
  }, [supabase, user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p>Logging you out...</p>
    </div>
  );
}

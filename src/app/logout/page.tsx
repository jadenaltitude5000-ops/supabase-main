
'use client';

import { useRouter } from 'next/navigation';
import { useUser, useSupabase } from '@/lib/supabase/provider';

export default function LogoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const supabase = useSupabase();

  const handleLogout = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error logging out:', error);
    } else {
      // After successful logout, redirect to the sign-in page
      router.push('/signin');
    }
  };

  if (user) {
    // If user is logged in, show the logout button
    return (
      <div>
        <h1>Are you sure you want to logout?</h1>
        <button onClick={handleLogout}>Sign Out</button>
      </div>
    );
  }

  // If user is not logged in, maybe show a message or redirect them
  return (
    <div>
      <p>You are not logged in.</p>
    
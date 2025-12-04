'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user'; // Using our new hook
import { supabase } from '@/lib/supabase-client'; // Using our new client

export default function LogoutPage() {
  const router = useRouter();
  const { user } = useUser();

  const handleLogout = async () => {
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
    </div>
  );
}

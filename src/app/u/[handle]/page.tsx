import React from 'react';
import { supabase } from '@/lib/supabase-client'; // Adjust path if needed
import { Database } from '@/lib/types'; // Our new DB types

// This is a Server Component, so we can do async data fetching directly
export default async function UserProfilePage({ params }: { params: { handle: string } }) {
  const { handle } = params;

  // Fetch user data from Supabase
  const { data: userData, error } = await supabase
    .from('users')
    .select('*')
    .eq('handle', handle)
    .single(); // .single() is like .limit(1) and .getDocs()[0]

  if (error) {
    // Handle the case where the user is not found or another error occurs
    console.error('Error fetching user:', error);
    return <div>Error loading profile.</div>;
  }

  if (!userData) {
    return <div>User not found.</div>;
  }

  // Supabase returns timestamps as ISO strings, so we can use them directly
  // or convert them to Date objects if needed: const lastSeen = new Date(userData.last_seen);

  return (
    <div>
      <h1>{userData.display_name || userData.handle}'s Profile</h1>
      <p>Email: {userData.email}</p>
      <p>Username: {userData.username}</p>
      <p>Bio: {userData.bio}</p>
      {/* Display other user data as needed */}
    </div>
  );
}

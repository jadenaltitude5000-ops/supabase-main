'use client';

import React, { useState } from 'react';
import { useUser } from './use-user'; // Our new hook
import { supabase } from '@/lib/supabase-client';
import { isSupabaseAuthError } from './errors'; // Our new error helper

interface NonBlockingUpdatesProps {
  // Define the props this component might take, if any
}

export function NonBlockingUpdates(props: NonBlockingUpdatesProps) {
  const { user } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!user) {
      setMessage('You must be logged in to update your profile.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('users')
        .update({ display_name: displayName, bio: bio })
        .eq('id', user.id); // The crucial part: update WHERE id = user.id

      if (error) {
        throw error;
      }

      setMessage('Profile updated successfully!');
      setDisplayName('');
      setBio('');

    } catch (error: any) {
      if (isSupabaseAuthError(error)) {
        setMessage(`Authentication Error: ${error.message}`);
      } else {
        setMessage(`An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2>Update Profile</h2>
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <textarea
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        onClick={handleUpdate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}

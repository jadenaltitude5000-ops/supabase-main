'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './use-user'; // Our new hook
import { supabase } from '@/lib/supabase-client';
import { isSupabaseAuthError } from './errors'; // Our new error helper

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // On successful login, redirect to the homepage or dashboard
      router.push('/');

    } catch (error: any) {
      if (isSupabaseAuthError(error)) {
        setMessage(`Login Failed: ${error.message}`);
      } else {
        setMessage(`An unexpected error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, redirect them
  if (user) {
    router.push('/');
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleLogin} className="p-8 border rounded-md">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        {message && <p className="mt-4 text-red-600">{message}</p>}
      </form>
    </div>
  );
}

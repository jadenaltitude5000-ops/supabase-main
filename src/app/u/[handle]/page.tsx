
'use client';

import React, { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/provider';
import { AppUser as User } from '@/lib/types';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function UserProfilePage() {
  const params = useParams();
  const { handle } = params;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();

  useEffect(() => {
    if (!handle || !supabase) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('handle', handle)
        .single();

      if (fetchError) {
        console.error('Error fetching user:', fetchError);
        setError('Could not load profile. This user may not exist.');
        setUser(null);
      } else {
        setUser(userData as User);
      }
      setLoading(false);
    };

    fetchUser();
  }, [handle, supabase]);


  if (loading) {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <Skeleton className="h-48 w-full" />
                <div className="flex items-end -mt-16 ml-8">
                    <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
                </div>
                 <div className="mt-4 space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-center p-8">{error}</div>;
  }

  if (!user) {
    return <div className="text-center p-8">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            <div className="h-48 bg-muted rounded-lg" style={{ backgroundImage: `url(${user.business_card_background ?? ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="flex items-end -mt-16 ml-8">
                <img src={user.avatar ?? undefined} alt={user.name} className="h-32 w-32 rounded-full border-4 border-background bg-background" />
            </div>
             <div className="mt-4">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.handle}</p>
                <p className="text-lg mt-1">{user.headline}</p>
                <p className="mt-4">{user.bio}</p>
            </div>
        </div>
    </div>
  );
}

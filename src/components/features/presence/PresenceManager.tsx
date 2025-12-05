
'use client';

import { useEffect, useState } from 'react';
import { useUser, useSupabase } from '@/lib/supabase/provider';

/**
 * An invisible component that manages the user's online presence
 * using Supabase Realtime Channels.
 */
export function PresenceManager() {
  const { user } = useUser();
  const supabase = useSupabase();
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !supabase) return;

    const presenceChannel = supabase.channel(`presence:${user.id}`);

    const updateUserStatus = async (status: 'ONLINE' | 'OFFLINE') => {
      try {
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString(), online_status: status })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating user status:', error);
      }
    };

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        // This event is triggered when the client successfully connects to the channel
        // and receives the current presence state.
        updateUserStatus('ONLINE');
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // The user is now subscribed to the channel, track their presence.
          await presenceChannel.track({ online_at: new Date().toISOString() });
        }
      });
    
    setChannel(presenceChannel);

    // Set up a listener for when the browser window/tab is closed
    const handleBeforeUnload = () => {
        // Note: This is a best-effort attempt. Modern browsers limit what can be done here.
        // Supabase's server will eventually detect the disconnected socket.
        updateUserStatus('OFFLINE');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (channel) {
        // When the component unmounts (e.g., logout), update status and unsubscribe.
        updateUserStatus('OFFLINE');
        supabase.removeChannel(channel);
      }
       window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, supabase, channel]);

  return null; // This component does not render anything.
}

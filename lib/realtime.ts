import { supabase } from './supabase';
import type { 
  RealtimeChannel, 
  RealtimePostgresChangesPayload 
} from '@supabase/supabase-js';

/**
 * Real-time collaboration and updates for crew system
 */

export interface RealtimeUpdate {
  type: 'crew_updated' | 'member_joined' | 'member_left' | 'quest_updated' | 'activity_added';
  payload: any;
  timestamp: string;
}

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<(update: RealtimeUpdate) => void>> = new Map();

  /**
   * Subscribe to crew updates
   */
  subscribeToCrewUpdates(
    crewId: string,
    callback: (update: RealtimeUpdate) => void
  ): RealtimeSubscription {
    const channelName = `crew:${crewId}`;
    
    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }
    
    this.subscriptions.get(channelName)!.add(callback);

    // Create or reuse channel
    if (!this.channels.has(channelName)) {
      const channel = supabase.channel(channelName);
      
      // Listen to crew table changes
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'crews',
            filter: `id=eq.${crewId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            this.handleCrewUpdate(channelName, 'crew_updated', payload);
          }
        )
        // Listen to crew members changes
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'crew_members',
            filter: `crew_id=eq.${crewId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            const eventType = payload.eventType === 'INSERT' ? 'member_joined' : 
                           payload.eventType === 'DELETE' ? 'member_left' : 
                           'member_updated';
            this.handleCrewUpdate(channelName, eventType as any, payload);
          }
        )
        // Listen to quest changes
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'quests',
            filter: `crew_id=eq.${crewId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            this.handleCrewUpdate(channelName, 'quest_updated', payload);
          }
        )
        // Listen to activity feed
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'crew_activity',
            filter: `crew_id=eq.${crewId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            this.handleCrewUpdate(channelName, 'activity_added', payload);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    }

    return {
      channel: this.channels.get(channelName)!,
      unsubscribe: () => {
        this.unsubscribeFromCrewUpdates(crewId, callback);
      }
    };
  }

  /**
   * Unsubscribe from crew updates
   */
  unsubscribeFromCrewUpdates(
    crewId: string,
    callback: (update: RealtimeUpdate) => void
  ): void {
    const channelName = `crew:${crewId}`;
    const callbacks = this.subscriptions.get(channelName);
    
    if (callbacks) {
      callbacks.delete(callback);
      
      // If no more callbacks, remove the channel
      if (callbacks.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
        this.subscriptions.delete(channelName);
      }
    }
  }

  /**
   * Subscribe to user's crew list updates
   */
  subscribeToUserCrewUpdates(
    userId: string,
    callback: (update: RealtimeUpdate) => void
  ): RealtimeSubscription {
    const channelName = `user_crews:${userId}`;
    
    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }
    
    this.subscriptions.get(channelName)!.add(callback);

    if (!this.channels.has(channelName)) {
      const channel = supabase.channel(channelName);
      
      // Listen to crew member changes for this user
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'crew_members',
            filter: `user_id=eq.${userId}`
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            this.handleCrewUpdate(channelName, 'member_joined', payload);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    }

    return {
      channel: this.channels.get(channelName)!,
      unsubscribe: () => {
        this.unsubscribeFromUserCrewUpdates(userId, callback);
      }
    };
  }

  /**
   * Unsubscribe from user crew updates
   */
  unsubscribeFromUserCrewUpdates(
    userId: string,
    callback: (update: RealtimeUpdate) => void
  ): void {
    const channelName = `user_crews:${userId}`;
    const callbacks = this.subscriptions.get(channelName);
    
    if (callbacks) {
      callbacks.delete(callback);
      
      if (callbacks.size === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
        this.subscriptions.delete(channelName);
      }
    }
  }

  /**
   * Broadcast crew presence (user online/offline)
   */
  broadcastPresence(
    crewId: string,
    userId: string,
    userData: {
      name: string;
      avatar?: string;
      status: 'online' | 'away' | 'offline';
      currentActivity?: string;
    }
  ): void {
    const channelName = `crew:${crewId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      channel.track({
        user_id: userId,
        ...userData,
        online_at: new Date().toISOString()
      });
    }
  }

  /**
   * Subscribe to crew presence updates
   */
  subscribeToCrewPresence(
    crewId: string,
    callback: (presenceState: any) => void
  ): RealtimeSubscription {
    const channelName = `crew:${crewId}`;
    let channel = this.channels.get(channelName);
    
    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState();
        callback(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
      }
    };
  }

  /**
   * Send real-time message to crew
   */
  sendCrewMessage(
    crewId: string,
    message: {
      userId: string;
      userName: string;
      content: string;
      type: 'text' | 'system' | 'achievement';
      metadata?: any;
    }
  ): void {
    const channelName = `crew:${crewId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'crew_message',
        payload: {
          ...message,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Subscribe to crew messages
   */
  subscribeToCrewMessages(
    crewId: string,
    callback: (message: any) => void
  ): RealtimeSubscription {
    const channelName = `crew:${crewId}`;
    let channel = this.channels.get(channelName);
    
    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    channel
      .on('broadcast', { event: 'crew_message' }, ({ payload }) => {
        callback(payload);
      })
      .subscribe();

    return {
      channel,
      unsubscribe: () => {
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
        }
      }
    };
  }

  /**
   * Handle crew update and notify subscribers
   */
  private handleCrewUpdate(
    channelName: string,
    type: RealtimeUpdate['type'],
    payload: RealtimePostgresChangesPayload<any>
  ): void {
    const callbacks = this.subscriptions.get(channelName);
    
    if (callbacks) {
      const update: RealtimeUpdate = {
        type,
        payload,
        timestamp: new Date().toISOString()
      };

      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in realtime callback:', error);
        }
      });
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    
    this.channels.clear();
    this.subscriptions.clear();
  }
}

// Create singleton instance
export const realtimeManager = new RealtimeManager();

// Convenience hooks for React components
export const useCrewRealtime = (
  crewId: string | null,
  onUpdate?: (update: RealtimeUpdate) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<RealtimeUpdate | null>(null);
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!crewId) return;

    const handleUpdate = (update: RealtimeUpdate) => {
      setLastUpdate(update);
      onUpdate?.(update);
    };

    subscriptionRef.current = realtimeManager.subscribeToCrewUpdates(crewId, handleUpdate);
    setIsConnected(true);

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      setIsConnected(false);
    };
  }, [crewId, onUpdate]);

  return { isConnected, lastUpdate };
};

export const useCrewPresence = (
  crewId: string | null,
  userData?: {
    name: string;
    avatar?: string;
    status: 'online' | 'away' | 'offline';
  }
) => {
  const [presenceState, setPresenceState] = useState<any>({});
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);

  useEffect(() => {
    if (!crewId) return;

    subscriptionRef.current = realtimeManager.subscribeToCrewPresence(
      crewId,
      setPresenceState
    );

    // Track user presence if userData provided
    if (userData) {
      realtimeManager.broadcastPresence(crewId, 'user-id', userData);
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [crewId, userData]);

  return { presenceState };
};

// React imports for hooks
import { useState, useEffect, useRef } from 'react';
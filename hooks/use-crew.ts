'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import type { Crew, CrewMember, Quest, ActivityItem } from '@/types';

interface CrewHook {
  // State
  crews: Crew[] | null;
  currentCrew: Crew | null;
  crewMembers: CrewMember[] | null;
  crewQuests: Quest[] | null;
  crewActivity: ActivityItem[] | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadUserCrews: (userId: string) => Promise<void>;
  loadCrew: (crewId: string) => Promise<void>;
  createCrew: (crewData: Partial<Crew>) => Promise<Crew | null>;
  joinCrew: (crewId: string, userId: string) => Promise<void>;
  leaveCrew: (crewId: string, userId: string) => Promise<void>;
  removeMemberFromCrew: (crewId: string, memberId: string) => Promise<void>;
  promoteMember: (crewId: string, memberId: string) => Promise<void>;
  sendInvitation: (crewId: string, email: string, message?: string) => Promise<void>;
  generateInviteLink: (crewId: string) => Promise<string>;
  updateCrewSettings: (crewId: string, settings: Partial<Crew>) => Promise<void>;
}

export function useCrew(): CrewHook {
  const { user } = useAuth();
  const [crews, setCrews] = useState<Crew[] | null>(null);
  const [currentCrew, setCurrentCrew] = useState<Crew | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[] | null>(null);
  const [crewQuests, setCrewQuests] = useState<Quest[] | null>(null);
  const [crewActivity, setCrewActivity] = useState<ActivityItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserCrews = useCallback(async (userId: string) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query crews where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from('crew_members')
        .select(`
          crew_id,
          role,
          joined_at,
          crews (
            id,
            name,
            description,
            type,
            leader_id,
            max_members,
            is_private,
            total_xp,
            created_at,
            updated_at,
            tags,
            rules
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (membershipError) throw membershipError;

      // Transform data to match our Crew type
      const crewsData = membershipData?.map(membership => ({
        id: membership.crews.id,
        name: membership.crews.name,
        description: membership.crews.description,
        type: membership.crews.type,
        leaderId: membership.crews.leader_id,
        maxMembers: membership.crews.max_members,
        isPrivate: membership.crews.is_private,
        totalXP: membership.crews.total_xp || 0,
        createdAt: membership.crews.created_at,
        updatedAt: membership.crews.updated_at,
        tags: membership.crews.tags || [],
        rules: membership.crews.rules,
        memberCount: 0, // Will be populated below
        activeQuests: 0,
        lastActivity: membership.crews.updated_at
      })) || [];

      // Get member counts for each crew
      for (const crew of crewsData) {
        const { count } = await supabase
          .from('crew_members')
          .select('*', { count: 'exact', head: true })
          .eq('crew_id', crew.id)
          .eq('status', 'active');
        
        crew.memberCount = count || 0;
      }

      setCrews(crewsData);
    } catch (err) {
      console.error('Error loading user crews:', err);
      setError('Failed to load crews');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCrew = useCallback(async (crewId: string) => {
    if (!crewId) return;

    setLoading(true);
    setError(null);

    try {
      // Load crew details
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('*')
        .eq('id', crewId)
        .single();

      if (crewError) throw crewError;

      // Load crew members
      const { data: membersData, error: membersError } = await supabase
        .from('crew_members')
        .select(`
          user_id,
          role,
          joined_at,
          last_active,
          contribution,
          users (
            id,
            full_name,
            avatar_url,
            email
          ),
          user_stats (
            level,
            total_xp,
            completed_quests
          )
        `)
        .eq('crew_id', crewId)
        .eq('status', 'active');

      if (membersError) throw membersError;

      // Load crew quests
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('crew_id', crewId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (questsError) throw questsError;

      // Load crew activity
      const { data: activityData, error: activityError } = await supabase
        .from('crew_activity')
        .select(`
          id,
          type,
          user_id,
          description,
          metadata,
          created_at,
          users (
            full_name,
            avatar_url
          )
        `)
        .eq('crew_id', crewId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (activityError) throw activityError;

      // Transform data
      const crew: Crew = {
        id: crewData.id,
        name: crewData.name,
        description: crewData.description,
        type: crewData.type,
        leaderId: crewData.leader_id,
        maxMembers: crewData.max_members,
        isPrivate: crewData.is_private,
        totalXP: crewData.total_xp || 0,
        createdAt: crewData.created_at,
        updatedAt: crewData.updated_at,
        tags: crewData.tags || [],
        rules: crewData.rules,
        memberCount: membersData?.length || 0,
        activeQuests: questsData?.length || 0,
        lastActivity: crewData.updated_at
      };

      const members: CrewMember[] = membersData?.map(member => ({
        userId: member.user_id,
        crewId: crewId,
        name: member.users?.full_name || 'Anonymous',
        avatar: member.users?.avatar_url,
        email: member.users?.email,
        role: member.role,
        joinedAt: member.joined_at,
        lastActive: member.last_active,
        contribution: member.contribution || 0,
        stats: {
          level: member.user_stats?.level || 1,
          totalXP: member.user_stats?.total_xp || 0,
          completedQuests: member.user_stats?.completed_quests || 0
        }
      })) || [];

      const quests: Quest[] = questsData?.map(quest => ({
        id: quest.id,
        title: quest.title,
        description: quest.description,
        type: quest.type,
        difficulty: quest.difficulty,
        xpReward: quest.xp_reward,
        status: quest.status,
        createdAt: quest.created_at,
        endDate: quest.end_date,
        participants: quest.participants || [],
        completedBy: quest.completed_by || [],
        requirements: quest.requirements || [],
        rewards: quest.rewards || []
      })) || [];

      const activity: ActivityItem[] = activityData?.map(item => ({
        id: item.id,
        type: item.type,
        userId: item.user_id,
        userName: item.users?.full_name || 'Anonymous',
        userAvatar: item.users?.avatar_url,
        description: item.description,
        timestamp: item.created_at,
        metadata: item.metadata
      })) || [];

      setCurrentCrew(crew);
      setCrewMembers(members);
      setCrewQuests(quests);
      setCrewActivity(activity);

    } catch (err) {
      console.error('Error loading crew:', err);
      setError('Failed to load crew details');
    } finally {
      setLoading(false);
    }
  }, []);

  const createCrew = useCallback(async (crewData: Partial<Crew>): Promise<Crew | null> => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Create crew
      const { data: newCrew, error: crewError } = await supabase
        .from('crews')
        .insert([{
          name: crewData.name,
          description: crewData.description,
          type: crewData.type,
          leader_id: user.id,
          max_members: crewData.maxMembers || 5,
          is_private: crewData.isPrivate || false,
          tags: crewData.tags || [],
          rules: crewData.rules,
          total_xp: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (crewError) throw crewError;

      // Add creator as leader member
      const { error: memberError } = await supabase
        .from('crew_members')
        .insert([{
          crew_id: newCrew.id,
          user_id: user.id,
          role: 'leader',
          joined_at: new Date().toISOString(),
          status: 'active'
        }]);

      if (memberError) throw memberError;

      // Add activity log
      await supabase
        .from('crew_activity')
        .insert([{
          crew_id: newCrew.id,
          user_id: user.id,
          type: 'member_joined',
          description: 'Created the crew',
          created_at: new Date().toISOString()
        }]);

      return {
        id: newCrew.id,
        name: newCrew.name,
        description: newCrew.description,
        type: newCrew.type,
        leaderId: newCrew.leader_id,
        maxMembers: newCrew.max_members,
        isPrivate: newCrew.is_private,
        totalXP: newCrew.total_xp,
        createdAt: newCrew.created_at,
        updatedAt: newCrew.updated_at,
        tags: newCrew.tags || [],
        rules: newCrew.rules,
        memberCount: 1,
        activeQuests: 0,
        lastActivity: newCrew.created_at
      };

    } catch (err) {
      console.error('Error creating crew:', err);
      setError('Failed to create crew');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const joinCrew = useCallback(async (crewId: string, userId: string) => {
    setLoading(true);
    
    try {
      // Add user as member
      const { error } = await supabase
        .from('crew_members')
        .insert([{
          crew_id: crewId,
          user_id: userId,
          role: 'member',
          joined_at: new Date().toISOString(),
          status: 'active'
        }]);

      if (error) throw error;

      // Add activity log
      await supabase
        .from('crew_activity')
        .insert([{
          crew_id: crewId,
          user_id: userId,
          type: 'member_joined',
          description: 'Joined the crew',
          created_at: new Date().toISOString()
        }]);

      // Refresh crew data if currently viewing this crew
      if (currentCrew?.id === crewId) {
        await loadCrew(crewId);
      }

    } catch (err) {
      console.error('Error joining crew:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentCrew, loadCrew]);

  const leaveCrew = useCallback(async (crewId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('crew_members')
        .update({ status: 'left', left_at: new Date().toISOString() })
        .eq('crew_id', crewId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh crews list
      if (user) {
        await loadUserCrews(user.id);
      }
    } catch (err) {
      console.error('Error leaving crew:', err);
      throw err;
    }
  }, [user, loadUserCrews]);

  const removeMemberFromCrew = useCallback(async (crewId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('crew_members')
        .update({ status: 'removed', left_at: new Date().toISOString() })
        .eq('crew_id', crewId)
        .eq('user_id', memberId);

      if (error) throw error;

      // Refresh crew data
      await loadCrew(crewId);
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  }, [loadCrew]);

  const promoteMember = useCallback(async (crewId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from('crew_members')
        .update({ role: 'co-leader' })
        .eq('crew_id', crewId)
        .eq('user_id', memberId);

      if (error) throw error;

      // Add activity log
      await supabase
        .from('crew_activity')
        .insert([{
          crew_id: crewId,
          user_id: memberId,
          type: 'member_promoted',
          description: 'Promoted to Co-Leader',
          created_at: new Date().toISOString()
        }]);

      // Refresh crew data
      await loadCrew(crewId);
    } catch (err) {
      console.error('Error promoting member:', err);
      throw err;
    }
  }, [loadCrew]);

  const sendInvitation = useCallback(async (crewId: string, email: string, message?: string) => {
    try {
      const { error } = await supabase
        .from('crew_invitations')
        .insert([{
          crew_id: crewId,
          email: email,
          message: message,
          invited_by: user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Here you would typically send an actual email
      // For now, we'll just log it
      console.log(`Invitation sent to ${email} for crew ${crewId}`);
      
    } catch (err) {
      console.error('Error sending invitation:', err);
      throw err;
    }
  }, [user]);

  const generateInviteLink = useCallback(async (crewId: string): Promise<string> => {
    try {
      // Generate a unique invite token
      const token = crypto.randomUUID();
      
      const { error } = await supabase
        .from('crew_invite_links')
        .insert([{
          crew_id: crewId,
          token: token,
          created_by: user?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      return `${window.location.origin}/crew/join/${token}`;
    } catch (err) {
      console.error('Error generating invite link:', err);
      throw err;
    }
  }, [user]);

  const updateCrewSettings = useCallback(async (crewId: string, settings: Partial<Crew>) => {
    try {
      const { error } = await supabase
        .from('crews')
        .update({
          name: settings.name,
          description: settings.description,
          is_private: settings.isPrivate,
          max_members: settings.maxMembers,
          tags: settings.tags,
          rules: settings.rules,
          updated_at: new Date().toISOString()
        })
        .eq('id', crewId);

      if (error) throw error;

      // Refresh crew data
      await loadCrew(crewId);
    } catch (err) {
      console.error('Error updating crew settings:', err);
      throw err;
    }
  }, [loadCrew]);

  return {
    crews,
    currentCrew,
    crewMembers,
    crewQuests,
    crewActivity,
    loading,
    error,
    loadUserCrews,
    loadCrew,
    createCrew,
    joinCrew,
    leaveCrew,
    removeMemberFromCrew,
    promoteMember,
    sendInvitation,
    generateInviteLink,
    updateCrewSettings
  };
}
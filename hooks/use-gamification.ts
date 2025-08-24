'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';
import { calculateXpForLevel, calculateLevelFromXp } from '@/lib/xp-calculator';
import { Achievement } from '@/components/gamification/achievement-grid';

export interface LevelInfo {
  level: number;
  title: string;
  description: string;
  benefits: string[];
  xpRequired: number;
  icon: string;
}

export interface UserStats {
  currentXp: number;
  currentLevel: number;
  totalQuestsCompleted: number;
  totalDailyGoalsCompleted: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: Date;
  lastActive: Date;
}

// Gamification and XP management hook
export function useGamification() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    currentXp: 2450,
    currentLevel: 12,
    totalQuestsCompleted: 23,
    totalDailyGoalsCompleted: 156,
    currentStreak: 12,
    bestStreak: 18,
    joinedAt: new Date('2024-06-01'),
    lastActive: new Date()
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Level progression data
  const levelData: LevelInfo[] = [
    {
      level: 1,
      title: 'Beginner',
      description: 'Just getting started on your journey',
      benefits: ['Basic quest creation', 'Daily goals tracking'],
      xpRequired: 0,
      icon: '🌱'
    },
    {
      level: 5,
      title: 'Apprentice',
      description: 'Learning the ropes',
      benefits: ['Public quest sharing', 'Achievement tracking'],
      xpRequired: 500,
      icon: '📚'
    },
    {
      level: 10,
      title: 'Adventurer',
      description: 'Building momentum',
      benefits: ['Quest collaboration', 'Advanced statistics'],
      xpRequired: 1500,
      icon: '🚀'
    },
    {
      level: 15,
      title: 'Explorer',
      description: 'Discovering new paths',
      benefits: ['Custom categories', 'Milestone rewards'],
      xpRequired: 3000,
      icon: '🧭'
    },
    {
      level: 20,
      title: 'Champion',
      description: 'Proven dedication',
      benefits: ['Leadership features', 'Mentoring access'],
      xpRequired: 5500,
      icon: '🏆'
    },
    {
      level: 30,
      title: 'Master',
      description: 'Expert in personal development',
      benefits: ['Advanced automation', 'Priority support'],
      xpRequired: 12000,
      icon: '👑'
    },
    {
      level: 50,
      title: 'Grandmaster',
      description: 'Peak performance achieved',
      benefits: ['Exclusive features', 'Community leadership'],
      xpRequired: 35000,
      icon: '⭐'
    },
    {
      level: 75,
      title: 'Legend',
      description: 'Inspiring others through excellence',
      benefits: ['Legacy features', 'Platform influence'],
      xpRequired: 75000,
      icon: '🌟'
    },
    {
      level: 100,
      title: 'Mythic',
      description: 'Transcended ordinary limits',
      benefits: ['Ultimate recognition', 'Eternal legacy'],
      xpRequired: 150000,
      icon: '💎'
    }
  ];

  // Load initial data
  useEffect(() => {
    const loadGamificationData = async () => {
      try {
        setLoading(true);
        // In real app: fetch user stats and achievements from API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Calculate level from XP
        const calculatedLevel = calculateLevelFromXp(userStats.currentXp);
        setUserStats(prev => ({ ...prev, currentLevel: calculatedLevel }));
        
      } catch (err) {
        setError('Failed to load gamification data');
        console.error('Error loading gamification data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadGamificationData();
    }
  }, [user]);

  // Calculate XP for next level
  const xpForNextLevel = useMemo(() => {
    return calculateXpForLevel(userStats.currentLevel + 1);
  }, [userStats.currentLevel]);

  // Calculate total XP needed for current level
  const totalXpForLevel = useMemo(() => {
    return calculateXpForLevel(userStats.currentLevel);
  }, [userStats.currentLevel]);

  // Calculate level progress percentage
  const levelProgress = useMemo(() => {
    const currentLevelXp = calculateXpForLevel(userStats.currentLevel);
    const nextLevelXp = calculateXpForLevel(userStats.currentLevel + 1);
    const progressXp = userStats.currentXp - currentLevelXp;
    const requiredXp = nextLevelXp - currentLevelXp;
    
    return Math.min((progressXp / requiredXp) * 100, 100);
  }, [userStats.currentXp, userStats.currentLevel]);

  // Get XP gained today (mock data)
  const xpGainedToday = useMemo(() => {
    // In real app, calculate from today's completed quests/goals
    return 145;
  }, []);

  // Award XP
  const awardXp = useCallback(async (amount: number, reason: string) => {
    try {
      const newXp = userStats.currentXp + amount;
      const newLevel = calculateLevelFromXp(newXp);
      const leveledUp = newLevel > userStats.currentLevel;

      setUserStats(prev => ({
        ...prev,
        currentXp: newXp,
        currentLevel: newLevel
      }));

      // In real app: await api.awardXp(amount, reason);

      // Check for level up
      if (leveledUp) {
        // Trigger level up celebration
        onLevelUp(newLevel);
      }

      return { newXp, leveledUp, newLevel };
    } catch (err) {
      setError('Failed to award XP');
      throw err;
    }
  }, [userStats.currentXp, userStats.currentLevel]);

  // Handle level up
  const onLevelUp = useCallback((newLevel: number) => {
    // In real app: show celebration modal, unlock achievements, etc.
    console.log(`🎉 Level up! You reached level ${newLevel}!`);
    
    // Check for level-based achievements
    checkLevelAchievements(newLevel);
  }, []);

  // Check for achievements
  const checkAchievements = useCallback(async (trigger: string, value?: number) => {
    try {
      // In real app: check server-side for new achievements
      // This is a simplified version
      
      const newAchievements: Achievement[] = [];

      switch (trigger) {
        case 'first_quest':
          if (userStats.totalQuestsCompleted === 1) {
            // Award first quest achievement
          }
          break;
        case 'streak':
          if (value === 7) {
            // Award week streak achievement
          }
          if (value === 30) {
            // Award month streak achievement
          }
          break;
        // Add more achievement triggers
      }

      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
        // Show achievement notification
      }
    } catch (err) {
      console.error('Error checking achievements:', err);
    }
  }, [userStats.totalQuestsCompleted]);

  // Check level-based achievements
  const checkLevelAchievements = useCallback((level: number) => {
    // Check milestone levels
    const milestones = [5, 10, 25, 50, 75, 100];
    if (milestones.includes(level)) {
      checkAchievements('level_milestone', level);
    }
  }, [checkAchievements]);

  // Get level info
  const getLevelInfo = useCallback((level: number): LevelInfo => {
    // Find the highest level info that applies
    const applicableLevel = levelData
      .filter(l => l.level <= level)
      .sort((a, b) => b.level - a.level)[0];
    
    return applicableLevel || levelData[0];
  }, []);

  // Get next level info
  const getNextLevelInfo = useCallback((): LevelInfo | null => {
    const nextLevel = userStats.currentLevel + 1;
    return levelData.find(l => l.level === nextLevel) || null;
  }, [userStats.currentLevel]);

  // Get achievement progress
  const getAchievementProgress = useCallback((achievementId: string) => {
    // In real app: calculate based on current stats
    return {
      current: 0,
      target: 100,
      percentage: 0
    };
  }, []);

  // Update stats (called when quests/goals are completed)
  const updateStats = useCallback(async (updates: Partial<UserStats>) => {
    try {
      setUserStats(prev => ({ ...prev, ...updates }));
      
      // In real app: await api.updateUserStats(updates);
    } catch (err) {
      setError('Failed to update stats');
      throw err;
    }
  }, []);

  // Get rank/position (mock data)
  const getCurrentRank = useCallback(() => {
    // In real app: fetch from leaderboard API
    return {
      global: 1247,
      percentile: 78,
      category: 'rising_star' // based on recent activity
    };
  }, []);

  return {
    // State
    userStats,
    achievements,
    loading,
    error,

    // Computed values
    currentXp: userStats.currentXp,
    currentLevel: userStats.currentLevel,
    xpForNextLevel,
    totalXpForLevel,
    levelProgress,
    xpGainedToday,

    // Level info
    getLevelInfo,
    getNextLevelInfo,
    levelData,

    // Actions
    awardXp,
    updateStats,
    checkAchievements,

    // Achievement utilities
    getAchievementProgress,

    // Utility
    getCurrentRank,
    clearError: () => setError(null)
  };
}
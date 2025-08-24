'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { Quest } from '@/components/quests/quest-card';
import { SecondaryGoal } from '@/components/quests/secondary-goals';

// Quest management hook
export function useQuests() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [dailyGoals, setDailyGoals] = useState<SecondaryGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - in real app, fetch from API/database
  const mockQuests: Quest[] = [
    {
      id: '1',
      title: 'Daily 5km Run',
      description: 'Build endurance and maintain cardiovascular health by running 5km every day.',
      category: 'health',
      difficulty: 2,
      status: 'active',
      progress: 65,
      xpReward: 150,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isDaily: true,
      isPublic: true,
      tags: ['running', 'cardio', 'fitness'],
      milestones: [
        'Complete first week',
        'Run 10km total',
        'Maintain streak for 2 weeks',
        'Complete full month'
      ],
      completedMilestones: 2,
      participantCount: 23,
      streak: 13
    },
    {
      id: '2',
      title: 'Learn TypeScript',
      description: 'Master TypeScript fundamentals and advanced concepts for better web development.',
      category: 'learning',
      difficulty: 3,
      status: 'active',
      progress: 40,
      xpReward: 500,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      isDaily: false,
      isPublic: false,
      tags: ['programming', 'typescript', 'webdev'],
      milestones: [
        'Complete basic types chapter',
        'Build first TypeScript project',
        'Learn advanced types',
        'Contribute to open source TS project'
      ],
      completedMilestones: 1,
      participantCount: 1
    },
    {
      id: '3',
      title: 'Build Emergency Fund',
      description: 'Save $10,000 for financial security and peace of mind.',
      category: 'financial',
      difficulty: 4,
      status: 'active',
      progress: 25,
      xpReward: 750,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isDaily: false,
      isPublic: false,
      tags: ['savings', 'emergency', 'finance'],
      milestones: [
        'Save first $1,000',
        'Reach $2,500',
        'Hit halfway mark ($5,000)',
        'Complete $10,000 goal'
      ],
      completedMilestones: 1,
      participantCount: 1
    }
  ];

  const mockDailyGoals: SecondaryGoal[] = [
    {
      id: '1',
      title: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      category: 'health',
      frequency: 'daily',
      targetCount: 8,
      currentCount: 5,
      xpReward: 25,
      isCompleted: false,
      completedDates: [
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      ],
      streak: 2,
      bestStreak: 5,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: '2',
      title: '30 minutes of reading',
      description: 'Read educational or personal development content',
      category: 'learning',
      frequency: 'daily',
      targetCount: 1,
      currentCount: 1,
      xpReward: 50,
      isCompleted: true,
      completedDates: [
        new Date(),
        new Date(Date.now() - 24 * 60 * 60 * 1000)
      ],
      streak: 8,
      bestStreak: 12,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: '3',
      title: 'Practice meditation',
      description: '10 minutes of mindfulness meditation',
      category: 'mindfulness',
      frequency: 'daily',
      targetCount: 1,
      currentCount: 0,
      xpReward: 40,
      isCompleted: false,
      completedDates: [
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      ],
      streak: 0,
      bestStreak: 7,
      createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  // Load initial data
  useEffect(() => {
    const loadQuests = async () => {
      try {
        setLoading(true);
        // In real app: const response = await api.getQuests();
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setQuests(mockQuests);
        setDailyGoals(mockDailyGoals);
      } catch (err) {
        setError('Failed to load quests');
        console.error('Error loading quests:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadQuests();
    }
  }, [user]);

  // Create new quest
  const createQuest = useCallback(async (questData: Omit<Quest, 'id'>) => {
    try {
      const newQuest: Quest = {
        ...questData,
        id: Date.now().toString(),
        status: 'active',
        progress: 0,
        completedMilestones: 0,
        participantCount: questData.isPublic ? 1 : undefined
      };

      setQuests(prev => [newQuest, ...prev]);
      
      // In real app: await api.createQuest(newQuest);
      
      return newQuest;
    } catch (err) {
      setError('Failed to create quest');
      throw err;
    }
  }, []);

  // Update quest
  const updateQuest = useCallback(async (questId: string, updates: Partial<Quest>) => {
    try {
      setQuests(prev => prev.map(quest => 
        quest.id === questId ? { ...quest, ...updates } : quest
      ));

      // In real app: await api.updateQuest(questId, updates);
    } catch (err) {
      setError('Failed to update quest');
      throw err;
    }
  }, []);

  // Complete quest
  const completeQuest = useCallback(async (questId: string) => {
    try {
      await updateQuest(questId, { 
        status: 'completed', 
        progress: 100,
        completedMilestones: quests.find(q => q.id === questId)?.milestones.length || 0
      });
    } catch (err) {
      setError('Failed to complete quest');
      throw err;
    }
  }, [updateQuest, quests]);

  // Pause quest
  const pauseQuest = useCallback(async (questId: string) => {
    try {
      await updateQuest(questId, { status: 'paused' });
    } catch (err) {
      setError('Failed to pause quest');
      throw err;
    }
  }, [updateQuest]);

  // Resume quest
  const resumeQuest = useCallback(async (questId: string) => {
    try {
      await updateQuest(questId, { status: 'active' });
    } catch (err) {
      setError('Failed to resume quest');
      throw err;
    }
  }, [updateQuest]);

  // Delete quest
  const deleteQuest = useCallback(async (questId: string) => {
    try {
      setQuests(prev => prev.filter(quest => quest.id !== questId));
      
      // In real app: await api.deleteQuest(questId);
    } catch (err) {
      setError('Failed to delete quest');
      throw err;
    }
  }, []);

  // Add secondary goal
  const addSecondaryGoal = useCallback(async (goalData: Omit<SecondaryGoal, 'id' | 'createdAt' | 'completedDates' | 'currentCount' | 'isCompleted' | 'streak' | 'bestStreak'>) => {
    try {
      const newGoal: SecondaryGoal = {
        ...goalData,
        id: Date.now().toString(),
        createdAt: new Date(),
        completedDates: [],
        currentCount: 0,
        isCompleted: false,
        streak: 0,
        bestStreak: 0
      };

      setDailyGoals(prev => [newGoal, ...prev]);
      
      // In real app: await api.createSecondaryGoal(newGoal);
      
      return newGoal;
    } catch (err) {
      setError('Failed to add goal');
      throw err;
    }
  }, []);

  // Complete secondary goal
  const completeSecondaryGoal = useCallback(async (goalId: string) => {
    try {
      const today = new Date();
      
      setDailyGoals(prev => prev.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const updatedGoal = {
          ...goal,
          currentCount: goal.currentCount + 1,
          completedDates: [...goal.completedDates, today],
          isCompleted: goal.currentCount + 1 >= goal.targetCount
        };

        // Calculate streak
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const hasYesterday = goal.completedDates.some(date => 
          date.toDateString() === yesterday.toDateString()
        );
        
        if (hasYesterday) {
          updatedGoal.streak = goal.streak + 1;
          updatedGoal.bestStreak = Math.max(goal.bestStreak, updatedGoal.streak);
        } else {
          updatedGoal.streak = 1;
        }

        return updatedGoal;
      }));

      // In real app: await api.completeSecondaryGoal(goalId);
    } catch (err) {
      setError('Failed to complete goal');
      throw err;
    }
  }, []);

  // Delete secondary goal
  const deleteSecondaryGoal = useCallback(async (goalId: string) => {
    try {
      setDailyGoals(prev => prev.filter(goal => goal.id !== goalId));
      
      // In real app: await api.deleteSecondaryGoal(goalId);
    } catch (err) {
      setError('Failed to delete goal');
      throw err;
    }
  }, []);

  // Computed values
  const completedQuests = quests.filter(quest => quest.status === 'completed');
  const activeQuests = quests.filter(quest => quest.status === 'active');
  const pausedQuests = quests.filter(quest => quest.status === 'paused');

  const totalXpFromQuests = completedQuests.reduce((total, quest) => total + quest.xpReward, 0);
  const totalXpFromDailyGoals = dailyGoals
    .filter(goal => goal.isCompleted)
    .reduce((total, goal) => total + goal.xpReward, 0);

  return {
    // State
    quests,
    dailyGoals,
    loading,
    error,

    // Computed
    completedQuests,
    activeQuests,
    pausedQuests,
    totalXpFromQuests,
    totalXpFromDailyGoals,

    // Quest actions
    createQuest,
    updateQuest,
    completeQuest,
    pauseQuest,
    resumeQuest,
    deleteQuest,

    // Secondary goal actions
    addSecondaryGoal,
    completeSecondaryGoal,
    deleteSecondaryGoal,

    // Utility
    clearError: () => setError(null)
  };
}
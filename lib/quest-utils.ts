// Quest utility functions for LifeQuest application

import { Quest } from '@/components/quests/quest-card';
import { SecondaryGoal } from '@/components/quests/secondary-goals';
import { format, differenceInDays, isSameDay, startOfDay, addDays } from 'date-fns';

/**
 * Calculate quest completion percentage based on milestones
 */
export function calculateQuestProgress(
  completedMilestones: number,
  totalMilestones: number,
  manualProgress?: number
): number {
  if (manualProgress !== undefined) {
    return Math.min(Math.max(manualProgress, 0), 100);
  }

  if (totalMilestones === 0) {
    return 0;
  }

  return Math.floor((completedMilestones / totalMilestones) * 100);
}

/**
 * Check if a quest is overdue
 */
export function isQuestOverdue(quest: Quest): boolean {
  if (!quest.deadline || quest.status === 'completed') {
    return false;
  }

  return new Date() > quest.deadline;
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(deadline: Date): number {
  return differenceInDays(deadline, new Date());
}

/**
 * Get quest urgency level based on deadline
 */
export function getQuestUrgency(quest: Quest): 'low' | 'medium' | 'high' | 'overdue' {
  if (!quest.deadline) return 'low';
  
  const daysLeft = getDaysUntilDeadline(quest.deadline);
  
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 1) return 'high';
  if (daysLeft <= 7) return 'medium';
  return 'low';
}

/**
 * Filter quests by status
 */
export function filterQuestsByStatus(quests: Quest[], status: Quest['status'] | Quest['status'][]): Quest[] {
  const statusArray = Array.isArray(status) ? status : [status];
  return quests.filter(quest => statusArray.includes(quest.status));
}

/**
 * Filter quests by category
 */
export function filterQuestsByCategory(
  quests: Quest[], 
  category: Quest['category'] | Quest['category'][]
): Quest[] {
  const categoryArray = Array.isArray(category) ? category : [category];
  return quests.filter(quest => categoryArray.includes(quest.category));
}

/**
 * Sort quests by priority (difficulty, deadline, progress)
 */
export function sortQuestsByPriority(quests: Quest[]): Quest[] {
  return [...quests].sort((a, b) => {
    // First by urgency (overdue items first)
    const aUrgency = getQuestUrgency(a);
    const bUrgency = getQuestUrgency(b);
    
    const urgencyOrder = { overdue: 0, high: 1, medium: 2, low: 3 };
    const urgencyDiff = urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // Then by difficulty (higher difficulty first)
    const difficultyDiff = b.difficulty - a.difficulty;
    if (difficultyDiff !== 0) return difficultyDiff;
    
    // Then by progress (lower progress first to encourage completion)
    return a.progress - b.progress;
  });
}

/**
 * Calculate total XP available from active quests
 */
export function calculatePotentialXp(quests: Quest[]): number {
  return quests
    .filter(quest => quest.status === 'active')
    .reduce((total, quest) => total + quest.xpReward, 0);
}

/**
 * Calculate quest completion rate
 */
export function calculateCompletionRate(quests: Quest[]): number {
  if (quests.length === 0) return 0;
  
  const completed = quests.filter(quest => quest.status === 'completed').length;
  return (completed / quests.length) * 100;
}

/**
 * Get next milestone for a quest
 */
export function getNextMilestone(quest: Quest): string | null {
  if (quest.completedMilestones >= quest.milestones.length) {
    return null;
  }
  
  return quest.milestones[quest.completedMilestones];
}

/**
 * Calculate streak for daily quests
 */
export function calculateDailyQuestStreak(quest: Quest, completedDates: Date[]): number {
  if (!quest.isDaily || completedDates.length === 0) {
    return 0;
  }

  let streak = 0;
  let currentDate = startOfDay(new Date());
  
  // Check if today is completed
  const todayCompleted = completedDates.some(date => isSameDay(date, currentDate));
  if (todayCompleted) {
    streak = 1;
    currentDate = addDays(currentDate, -1);
  } else {
    // If today isn't completed, start checking from yesterday
    currentDate = addDays(currentDate, -1);
  }
  
  // Count consecutive days backwards
  while (completedDates.some(date => isSameDay(date, currentDate))) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }
  
  return streak;
}

/**
 * Check if secondary goal is completed today
 */
export function isSecondaryGoalCompletedToday(goal: SecondaryGoal): boolean {
  const today = startOfDay(new Date());
  return goal.completedDates.some(date => isSameDay(startOfDay(date), today));
}

/**
 * Calculate secondary goal streak
 */
export function calculateSecondaryGoalStreak(goal: SecondaryGoal): number {
  if (goal.completedDates.length === 0) return 0;
  
  let streak = 0;
  let currentDate = startOfDay(new Date());
  
  // Check if today is completed
  const todayCompleted = isSecondaryGoalCompletedToday(goal);
  if (todayCompleted) {
    streak = 1;
    currentDate = addDays(currentDate, -1);
  } else {
    // If today isn't completed, start from yesterday
    currentDate = addDays(currentDate, -1);
  }
  
  // Count backwards
  while (goal.completedDates.some(date => isSameDay(startOfDay(date), currentDate))) {
    streak++;
    currentDate = addDays(currentDate, -1);
  }
  
  return streak;
}

/**
 * Get quest statistics
 */
export interface QuestStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  failed: number;
  overdue: number;
  completionRate: number;
  averageProgress: number;
  totalXpEarned: number;
  potentialXp: number;
}

export function getQuestStatistics(quests: Quest[]): QuestStats {
  const total = quests.length;
  const active = quests.filter(q => q.status === 'active').length;
  const completed = quests.filter(q => q.status === 'completed').length;
  const paused = quests.filter(q => q.status === 'paused').length;
  const failed = quests.filter(q => q.status === 'failed').length;
  const overdue = quests.filter(q => isQuestOverdue(q)).length;
  
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  const averageProgress = total > 0 
    ? quests.reduce((sum, q) => sum + q.progress, 0) / total 
    : 0;
  
  const totalXpEarned = quests
    .filter(q => q.status === 'completed')
    .reduce((sum, q) => sum + q.xpReward, 0);
    
  const potentialXp = calculatePotentialXp(quests);
  
  return {
    total,
    active,
    completed,
    paused,
    failed,
    overdue,
    completionRate,
    averageProgress,
    totalXpEarned,
    potentialXp
  };
}

/**
 * Generate quest suggestions based on user activity
 */
export interface QuestSuggestion {
  title: string;
  description: string;
  category: Quest['category'];
  difficulty: Quest['difficulty'];
  estimatedDuration: string;
  benefits: string[];
}

export function generateQuestSuggestions(
  completedQuests: Quest[],
  userPreferences: Quest['category'][] = []
): QuestSuggestion[] {
  // Analyze completed quests to suggest similar ones
  const categoryFrequency = completedQuests.reduce((acc, quest) => {
    acc[quest.category] = (acc[quest.category] || 0) + 1;
    return acc;
  }, {} as Record<Quest['category'], number>);
  
  // Get preferred categories (either from user prefs or most completed)
  const preferredCategories = userPreferences.length > 0 
    ? userPreferences 
    : Object.entries(categoryFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category as Quest['category']);
  
  // Base suggestions by category
  const suggestions: Record<Quest['category'], QuestSuggestion[]> = {
    health: [
      {
        title: 'Morning Yoga Routine',
        description: 'Start each day with 20 minutes of yoga for flexibility and mindfulness',
        category: 'health',
        difficulty: 2,
        estimatedDuration: '30 days',
        benefits: ['Improved flexibility', 'Better sleep', 'Reduced stress']
      },
      {
        title: '10,000 Steps Daily',
        description: 'Walk at least 10,000 steps every day to boost cardiovascular health',
        category: 'health',
        difficulty: 2,
        estimatedDuration: 'Ongoing',
        benefits: ['Better cardiovascular health', 'Weight management', 'Increased energy']
      }
    ],
    learning: [
      {
        title: 'Read One Book Per Month',
        description: 'Expand your knowledge by reading one book every month',
        category: 'learning',
        difficulty: 2,
        estimatedDuration: 'Ongoing',
        benefits: ['Increased knowledge', 'Better vocabulary', 'Improved focus']
      },
      {
        title: 'Learn a New Language',
        description: 'Dedicate 30 minutes daily to learning a new language',
        category: 'learning',
        difficulty: 3,
        estimatedDuration: '6 months',
        benefits: ['Cognitive improvement', 'Career opportunities', 'Cultural understanding']
      }
    ],
    career: [
      {
        title: 'Professional Certification',
        description: 'Earn a certification relevant to your career field',
        category: 'career',
        difficulty: 4,
        estimatedDuration: '3-6 months',
        benefits: ['Career advancement', 'Salary increase', 'Professional recognition']
      },
      {
        title: 'Network Building',
        description: 'Connect with 5 new professionals in your industry each month',
        category: 'career',
        difficulty: 3,
        estimatedDuration: 'Ongoing',
        benefits: ['Career opportunities', 'Industry insights', 'Professional growth']
      }
    ],
    financial: [
      {
        title: 'Emergency Fund',
        description: 'Save 6 months of expenses for financial security',
        category: 'financial',
        difficulty: 4,
        estimatedDuration: '12 months',
        benefits: ['Financial security', 'Peace of mind', 'Better sleep']
      },
      {
        title: 'Investment Portfolio',
        description: 'Start investing 15% of income for long-term wealth building',
        category: 'financial',
        difficulty: 3,
        estimatedDuration: 'Ongoing',
        benefits: ['Wealth building', 'Retirement security', 'Financial independence']
      }
    ],
    social: [
      {
        title: 'Volunteer Regularly',
        description: 'Volunteer 4 hours monthly for a cause you care about',
        category: 'social',
        difficulty: 2,
        estimatedDuration: 'Ongoing',
        benefits: ['Community impact', 'Personal fulfillment', 'New connections']
      }
    ],
    personal: [
      {
        title: 'Daily Meditation',
        description: 'Practice mindfulness meditation for 10 minutes daily',
        category: 'personal',
        difficulty: 2,
        estimatedDuration: 'Ongoing',
        benefits: ['Reduced stress', 'Better focus', 'Emotional balance']
      }
    ]
  };
  
  // Return suggestions for preferred categories
  return preferredCategories.flatMap(category => suggestions[category] || []).slice(0, 6);
}

/**
 * Validate quest data
 */
export interface QuestValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateQuestData(questData: Partial<Quest>): QuestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!questData.title?.trim()) {
    errors.push('Title is required');
  } else if (questData.title.length > 100) {
    warnings.push('Title is quite long, consider shortening it');
  }
  
  if (!questData.category) {
    errors.push('Category is required');
  }
  
  if (!questData.difficulty || questData.difficulty < 1 || questData.difficulty > 5) {
    errors.push('Difficulty must be between 1 and 5');
  }
  
  // Deadline validation
  if (questData.deadline && questData.deadline <= new Date()) {
    warnings.push('Deadline is in the past');
  }
  
  // Daily quest validation
  if (questData.isDaily && questData.deadline) {
    const daysDiff = differenceInDays(questData.deadline, new Date());
    if (daysDiff > 365) {
      warnings.push('Daily quest deadline is more than a year away');
    }
  }
  
  // Milestone validation
  if (questData.milestones && questData.milestones.length > 10) {
    warnings.push('Quest has many milestones, consider breaking it into smaller quests');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
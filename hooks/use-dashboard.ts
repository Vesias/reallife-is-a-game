'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';

// Types for dashboard data
interface DashboardStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  streakDays: number;
  completedGoals: number;
  totalGoals: number;
  weeklyProgress: number;
  monthlyProgress: number;
  rank: string;
  achievements: number;
}

interface DigitalAgent {
  id: string;
  name: string;
  avatar?: string;
  personality: string;
  mood: 'happy' | 'neutral' | 'focused' | 'excited' | 'tired';
  energy: number;
  intelligence: number;
  experience: number;
  status: 'active' | 'idle' | 'working' | 'offline';
  currentTask?: string;
  lastActive: Date;
  traits: string[];
  level: number;
  responses: number;
  helpfulness: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'health' | 'mind' | 'social' | 'productivity' | 'creativity';
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  unlocked: boolean;
  prerequisites: string[];
  rewards: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

interface ProgressData {
  daily: Array<{
    date: string;
    goals: number;
    habits: number;
    xp: number;
    mood: number;
  }>;
  weekly: Array<{
    week: string;
    completed: number;
    total: number;
    completion: number;
  }>;
  monthly: Array<{
    month: string;
    goals: number;
    habits: number;
    streaks: number;
  }>;
  categories: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  streaks: Array<{
    habit: string;
    current: number;
    best: number;
    completion: number;
  }>;
}

// Using ActivityItem from types/index.ts to avoid conflicts
  category?: string;
  metadata?: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
}

interface CrewMember {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  role: 'leader' | 'member' | 'new';
  status: 'online' | 'offline' | 'away';
  weeklyContribution: number;
  streakDays: number;
}

interface Crew {
  id: string;
  name: string;
  description: string;
  members: CrewMember[];
  maxMembers: number;
  totalXp: number;
  weeklyGoal: number;
  weeklyProgress: number;
  rank: number;
  category: string;
  joinedDate: Date;
  achievements: string[];
  currentChallenge?: {
    name: string;
    progress: number;
    target: number;
    endsAt: Date;
  };
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'epic' | 'special';
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  xpReward: number;
  objectives: Array<{
    id: string;
    description: string;
    completed: boolean;
    progress?: number;
    target?: number;
  }>;
  timeLimit?: Date;
  isGroupQuest: boolean;
  participants?: number;
  maxParticipants?: number;
  status: 'available' | 'active' | 'completed' | 'failed' | 'locked';
  progress: number;
  tags: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'goals' | 'habits' | 'streaks' | 'social' | 'special' | 'milestone';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  earnedAt: Date;
  xpReward: number;
  progress?: {
    current: number;
    total: number;
  };
  isNew?: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  agent: DigitalAgent;
  skills: Skill[];
  progress: ProgressData;
  activities: ActivityItem[];
  crew: Crew | null;
  quests: Quest[];
  achievements: Achievement[];
}

// Mock data generator functions
const generateMockStats = (): DashboardStats => ({
  level: 12,
  xp: 2450,
  xpToNextLevel: 3000,
  totalXp: 15750,
  streakDays: 23,
  completedGoals: 45,
  totalGoals: 52,
  weeklyProgress: 78,
  monthlyProgress: 92,
  rank: 'Gold',
  achievements: 28,
});

const generateMockAgent = (): DigitalAgent => ({
  id: 'agent-001',
  name: 'Luna',
  avatar: '/avatars/luna.png',
  personality: 'Encouraging and analytical companion',
  mood: 'focused',
  energy: 85,
  intelligence: 92,
  experience: 78,
  status: 'active',
  currentTask: 'Analyzing your habit patterns',
  lastActive: new Date(),
  traits: ['Motivating', 'Data-driven', 'Supportive', 'Insightful'],
  level: 15,
  responses: 1247,
  helpfulness: 94,
});

const generateMockSkills = (): Skill[] => [
  {
    id: 'fitness',
    name: 'Physical Fitness',
    description: 'Build strength, endurance, and overall physical health',
    icon: 'fitness',
    category: 'health',
    level: 5,
    maxLevel: 10,
    xp: 450,
    xpToNext: 200,
    unlocked: true,
    prerequisites: [],
    rewards: ['Increased energy', 'Better sleep', 'Improved mood'],
    difficulty: 'intermediate',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Develop awareness and presence in daily life',
    icon: 'mind',
    category: 'mind',
    level: 3,
    maxLevel: 10,
    xp: 180,
    xpToNext: 120,
    unlocked: true,
    prerequisites: [],
    rewards: ['Reduced stress', 'Better focus', 'Emotional balance'],
    difficulty: 'beginner',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Master time management and efficiency techniques',
    icon: 'focus',
    category: 'productivity',
    level: 7,
    maxLevel: 10,
    xp: 680,
    xpToNext: 320,
    unlocked: true,
    prerequisites: [],
    rewards: ['Time savings', 'Goal achievement', 'Work-life balance'],
    difficulty: 'advanced',
  },
  {
    id: 'social',
    name: 'Social Connection',
    description: 'Build meaningful relationships and community',
    icon: 'social',
    category: 'social',
    level: 2,
    maxLevel: 10,
    xp: 90,
    xpToNext: 110,
    unlocked: true,
    prerequisites: [],
    rewards: ['Stronger relationships', 'Support network', 'Happiness'],
    difficulty: 'intermediate',
  },
];

const generateMockProgress = (): ProgressData => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      goals: Math.floor(Math.random() * 5) + 1,
      habits: Math.floor(Math.random() * 8) + 2,
      xp: Math.floor(Math.random() * 150) + 50,
      mood: Math.floor(Math.random() * 5) + 6,
    };
  });

  return {
    daily: last30Days,
    weekly: [
      { week: 'Week 1', completed: 25, total: 30, completion: 83 },
      { week: 'Week 2', completed: 28, total: 32, completion: 88 },
      { week: 'Week 3', completed: 22, total: 28, completion: 79 },
      { week: 'Week 4', completed: 30, total: 35, completion: 86 },
    ],
    monthly: [
      { month: 'Jan', goals: 45, habits: 180, streaks: 12 },
      { month: 'Feb', goals: 38, habits: 165, streaks: 15 },
      { month: 'Mar', goals: 52, habits: 195, streaks: 18 },
    ],
    categories: [
      { name: 'Health', value: 35, color: '#10B981' },
      { name: 'Productivity', value: 25, color: '#3B82F6' },
      { name: 'Learning', value: 20, color: '#8B5CF6' },
      { name: 'Social', value: 15, color: '#F59E0B' },
      { name: 'Creative', value: 5, color: '#EF4444' },
    ],
    streaks: [
      { habit: 'Morning Exercise', current: 15, best: 23, completion: 85 },
      { habit: 'Daily Reading', current: 12, best: 30, completion: 70 },
      { habit: 'Meditation', current: 8, best: 15, completion: 60 },
      { habit: 'Healthy Eating', current: 20, best: 25, completion: 95 },
    ],
  };
};

const generateMockActivities = (): ActivityItem[] => {
  const activities: ActivityItem[] = [];
  const types: ActivityItem['type'][] = [
    'goal_completed', 'habit_logged', 'achievement_earned', 'level_up', 
    'streak_milestone', 'quest_started', 'crew_joined', 'skill_unlocked'
  ];
  
  for (let i = 0; i < 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const timestamp = new Date();
    timestamp.setTime(timestamp.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    
    activities.push({
      id: `activity-${i}`,
      type,
      title: `Sample ${type.replace('_', ' ')} ${i + 1}`,
      description: `This is a sample activity description for ${type}`,
      timestamp,
      xp: Math.floor(Math.random() * 100) + 10,
      category: ['Health', 'Productivity', 'Learning', 'Social'][Math.floor(Math.random() * 4)],
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
    });
  }
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const generateMockCrew = (): Crew => ({
  id: 'crew-001',
  name: 'Productivity Champions',
  description: 'A crew focused on maximizing productivity and achieving goals together',
  members: [
    {
      id: 'member-1',
      name: 'Alex Chen',
      level: 15,
      xp: 3200,
      role: 'leader',
      status: 'online',
      weeklyContribution: 450,
      streakDays: 12,
    },
    {
      id: 'member-2',
      name: 'Maria Garcia',
      level: 12,
      xp: 2800,
      role: 'member',
      status: 'online',
      weeklyContribution: 380,
      streakDays: 8,
    },
    {
      id: 'member-3',
      name: 'James Wilson',
      level: 10,
      xp: 2100,
      role: 'member',
      status: 'away',
      weeklyContribution: 290,
      streakDays: 15,
    },
  ],
  maxMembers: 10,
  totalXp: 24500,
  weeklyGoal: 2000,
  weeklyProgress: 1520,
  rank: 15,
  category: 'Productivity',
  joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  achievements: ['Team Player', 'Goal Crusher', 'Consistency Master'],
  currentChallenge: {
    name: '30-Day Focus Challenge',
    progress: 18,
    target: 30,
    endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
  },
});

const generateMockQuests = (): Quest[] => [
  {
    id: 'quest-1',
    title: 'Morning Warrior',
    description: 'Complete your morning routine for 7 consecutive days',
    category: 'daily',
    difficulty: 'easy',
    xpReward: 150,
    objectives: [
      { id: 'obj-1', description: 'Wake up before 7 AM', completed: true },
      { id: 'obj-2', description: 'Exercise for 30 minutes', completed: true },
      { id: 'obj-3', description: 'Healthy breakfast', completed: false },
    ],
    timeLimit: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    isGroupQuest: false,
    status: 'active',
    progress: 67,
    tags: ['health', 'routine'],
  },
  {
    id: 'quest-2',
    title: 'Knowledge Seeker',
    description: 'Read for at least 30 minutes daily for 2 weeks',
    category: 'weekly',
    difficulty: 'medium',
    xpReward: 300,
    objectives: [
      { id: 'obj-4', description: 'Read for 30 minutes', completed: false, progress: 8, target: 14 },
    ],
    isGroupQuest: false,
    status: 'active',
    progress: 57,
    tags: ['learning', 'books'],
  },
  {
    id: 'quest-3',
    title: 'Team Challenge: Fitness Month',
    description: 'Work with your crew to complete 1000 collective workout minutes',
    category: 'epic',
    difficulty: 'hard',
    xpReward: 500,
    objectives: [
      { id: 'obj-5', description: 'Collective workout minutes', completed: false, progress: 650, target: 1000 },
    ],
    isGroupQuest: true,
    participants: 8,
    maxParticipants: 10,
    status: 'active',
    progress: 65,
    tags: ['fitness', 'team'],
  },
];

const generateMockAchievements = (): Achievement[] => [
  {
    id: 'ach-1',
    title: 'Early Bird',
    description: 'Wake up before 6 AM for 7 consecutive days',
    category: 'habits',
    rarity: 'uncommon',
    icon: 'sunrise',
    earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    xpReward: 100,
    isNew: true,
  },
  {
    id: 'ach-2',
    title: 'Goal Crusher',
    description: 'Complete 50 goals in total',
    category: 'goals',
    rarity: 'rare',
    icon: 'target',
    earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    xpReward: 250,
  },
  {
    id: 'ach-3',
    title: 'Streak Master',
    description: 'Maintain a 30-day streak in any habit',
    category: 'streaks',
    rarity: 'epic',
    icon: 'flame',
    earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    xpReward: 500,
  },
  {
    id: 'ach-4',
    title: 'Social Butterfly',
    description: 'Join your first crew and participate actively',
    category: 'social',
    rarity: 'common',
    icon: 'users',
    earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    xpReward: 50,
  },
];

export function useDashboard() {
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock data
      const dashboardData: DashboardData = {
        stats: generateMockStats(),
        agent: generateMockAgent(),
        skills: generateMockSkills(),
        progress: generateMockProgress(),
        activities: generateMockActivities(),
        crew: generateMockCrew(),
        quests: generateMockQuests(),
        achievements: generateMockAchievements(),
      };

      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    isLoading,
    error,
    refreshData,
  };
}
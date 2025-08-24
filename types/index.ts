// Existing types (keeping all previous types)

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  locale?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: Record<string, string>;
  preferences?: UserPreferences;
  stats?: UserStats;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    marketing?: boolean;
  };
  privacy?: {
    profile_public?: boolean;
    show_activity?: boolean;
    show_stats?: boolean;
  };
}

export interface UserStats {
  level: number;
  total_xp: number;
  completed_quests: number;
  active_streaks: number;
  total_achievements: number;
  rank?: string;
}

// NEW: Crew-related types

export interface Crew {
  id: string;
  name: string;
  description?: string;
  type: 'fitness' | 'productivity' | 'learning' | 'creative' | 'social' | 'general';
  leaderId: string;
  maxMembers: number;
  isPrivate: boolean;
  autoAcceptMembers?: boolean;
  tags?: string[];
  rules?: string;
  totalXP: number;
  createdAt: string;
  updatedAt: string;
  
  // Computed fields
  memberCount?: number;
  memberIds?: string[];
  activeQuests?: number;
  lastActivity?: string;
}

export interface CrewMember {
  userId: string;
  crewId: string;
  name?: string;
  avatar?: string;
  email?: string;
  role: 'leader' | 'co-leader' | 'member';
  joinedAt: string;
  lastActive?: string;
  status: 'active' | 'inactive' | 'left' | 'removed';
  contribution?: number; // Percentage contribution to crew goals
  stats?: {
    level: number;
    totalXP: number;
    completedQuests: number;
  };
}

export interface CrewInvitation {
  id: string;
  crewId: string;
  email: string;
  invitedBy: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: string;
  createdAt: string;
  respondedAt?: string;
}

export interface CrewInviteLink {
  id: string;
  crewId: string;
  token: string;
  createdBy: string;
  expiresAt: string;
  usageLimit?: number;
  usageCount: number;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'challenge' | 'milestone' | 'collaborative';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  category?: string;
  xpReward: number;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  createdBy: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
  
  // Crew-specific fields
  crewId?: string;
  participants?: string[]; // User IDs
  completedBy?: string[]; // User IDs
  requirements?: string[];
  rewards?: string[];
  
  // Progress tracking
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'quest_completed' | 'member_joined' | 'member_left' | 'level_up' | 
        'achievement' | 'message' | 'quest_created' | 'crew_updated';
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: string;
  metadata?: {
    questId?: string;
    questTitle?: string;
    level?: number;
    xpGained?: number;
    achievementName?: string;
    crewId?: string;
    [key: string]: any;
  };
}

export interface CrewAchievement {
  id: string;
  crewId: string;
  name: string;
  description: string;
  icon: string;
  type: 'milestone' | 'special' | 'seasonal' | 'challenge';
  requirements: {
    type: 'total_xp' | 'member_count' | 'quest_completion' | 'streak' | 'collaborative';
    target: number;
    timeframe?: number; // days
  };
  rewards: {
    xp: number;
    badge?: string;
    title?: string;
  };
  unlockedAt?: string;
  progress?: number;
}

export interface CrewMessage {
  id: string;
  crewId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  type: 'text' | 'system' | 'achievement' | 'quest_update';
  attachments?: {
    type: 'image' | 'file' | 'quest' | 'achievement';
    url?: string;
    metadata?: any;
  }[];
  createdAt: string;
  editedAt?: string;
  replyTo?: string; // Message ID
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

// Crew statistics and analytics
export interface CrewStats {
  crewId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  
  // Member activity
  activeMemberCount: number;
  newMembersCount: number;
  retentionRate: number;
  
  // Quest performance
  totalQuestsCompleted: number;
  averageCompletionTime: number; // hours
  questSuccessRate: number; // percentage
  
  // Experience and progression
  totalXPEarned: number;
  averageMemberLevel: number;
  levelUpsCount: number;
  
  // Collaboration metrics
  collaborativeQuestsCount: number;
  messagesSent: number;
  achievementsUnlocked: number;
  
  // Engagement
  dailyActiveUsers: number;
  averageSessionTime: number; // minutes
  lastUpdated: string;
}

export interface CrewLeaderboard {
  crewId: string;
  period: 'weekly' | 'monthly' | 'all_time';
  members: {
    userId: string;
    userName: string;
    userAvatar?: string;
    rank: number;
    score: number;
    xpGained: number;
    questsCompleted: number;
    contribution: number;
    badges?: string[];
  }[];
  lastUpdated: string;
}

// Real-time presence
export interface CrewPresence {
  userId: string;
  userName: string;
  userAvatar?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  currentActivity?: {
    type: 'viewing_quest' | 'in_chat' | 'editing_profile' | 'creating_quest';
    details?: string;
  };
}

// Crew settings and configuration
export interface CrewSettings {
  crewId: string;
  
  // Privacy settings
  isPrivate: boolean;
  autoAcceptMembers: boolean;
  memberCanInvite: boolean;
  showMemberList: boolean;
  
  // Quest settings
  allowMemberQuests: boolean;
  requireQuestApproval: boolean;
  maxActiveQuests: number;
  
  // Notification settings
  notifyOnMemberJoin: boolean;
  notifyOnQuestComplete: boolean;
  notifyOnAchievement: boolean;
  notifyOnMessage: boolean;
  
  // Activity settings
  showActivityFeed: boolean;
  showLeaderboard: boolean;
  trackPresence: boolean;
  
  updatedBy: string;
  updatedAt: string;
}

// Export utility types
export type CrewRole = 'leader' | 'co-leader' | 'member';
export type CrewType = 'fitness' | 'productivity' | 'learning' | 'creative' | 'social' | 'general';
export type QuestType = 'daily' | 'weekly' | 'challenge' | 'milestone' | 'collaborative';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type ActivityType = 'quest_completed' | 'member_joined' | 'member_left' | 
                          'level_up' | 'achievement' | 'message' | 'quest_created' | 'crew_updated';

// Form types for crew creation/editing
export interface CreateCrewForm {
  name: string;
  description: string;
  type: CrewType;
  maxMembers: number;
  isPrivate: boolean;
  autoAcceptMembers: boolean;
  tags: string[];
  rules: string;
}

export interface UpdateCrewForm extends Partial<CreateCrewForm> {
  id: string;
}

// API response types
export interface CrewApiResponse {
  success: boolean;
  data?: Crew;
  error?: string;
  message?: string;
}

export interface CrewListApiResponse {
  success: boolean;
  data?: Crew[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface CrewMemberApiResponse {
  success: boolean;
  data?: CrewMember[];
  error?: string;
}

// Filter and search types
export interface CrewFilters {
  type?: CrewType | 'all';
  privacy?: 'all' | 'public' | 'private';
  availability?: 'all' | 'available' | 'full';
  sortBy?: 'newest' | 'oldest' | 'members' | 'activity' | 'xp' | 'name';
  searchQuery?: string;
  tags?: string[];
}

export interface CrewSearchResult {
  crews: Crew[];
  totalCount: number;
  filters: CrewFilters;
}
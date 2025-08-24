import type { Crew, CrewMember, Quest } from '@/types';

/**
 * Utility functions for crew management
 */

// Crew validation utilities
export const crewValidation = {
  /**
   * Validate crew name
   */
  isValidCrewName: (name: string): boolean => {
    return name.trim().length >= 3 && name.trim().length <= 50;
  },

  /**
   * Validate crew description
   */
  isValidDescription: (description: string): boolean => {
    return description.length <= 200;
  },

  /**
   * Check if crew can accept new members
   */
  canAcceptMembers: (crew: Crew): boolean => {
    return (crew.memberCount || 0) < (crew.maxMembers || 5);
  },

  /**
   * Check if user can join crew
   */
  canUserJoin: (crew: Crew, userId: string): boolean => {
    return !crew.memberIds?.includes(userId) && crewValidation.canAcceptMembers(crew);
  },

  /**
   * Validate crew tags
   */
  isValidTags: (tags: string[]): boolean => {
    return tags.length <= 5 && tags.every(tag => tag.trim().length >= 2 && tag.trim().length <= 20);
  }
};

// Crew statistics calculations
export const crewStats = {
  /**
   * Calculate crew level based on total XP
   */
  getCrewLevel: (totalXP: number): number => {
    return Math.floor(totalXP / 1000) + 1;
  },

  /**
   * Calculate XP needed for next level
   */
  getXPToNextLevel: (totalXP: number): number => {
    const currentLevel = crewStats.getCrewLevel(totalXP);
    return (currentLevel * 1000) - totalXP;
  },

  /**
   * Calculate progress to next level (0-100)
   */
  getLevelProgress: (totalXP: number): number => {
    const progressInLevel = totalXP % 1000;
    return (progressInLevel / 1000) * 100;
  },

  /**
   * Calculate average member level
   */
  getAverageMemberLevel: (members: CrewMember[]): number => {
    if (members.length === 0) return 1;
    
    const totalLevel = members.reduce((sum, member) => 
      sum + (member.stats?.level || 1), 0
    );
    
    return Math.round(totalLevel / members.length);
  },

  /**
   * Calculate crew activity score
   */
  getActivityScore: (crew: Crew, members: CrewMember[]): number => {
    const daysSinceCreated = Math.floor(
      (Date.now() - new Date(crew.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const activeMembers = members.filter(member => {
      if (!member.lastActive) return false;
      const daysSinceActive = Math.floor(
        (Date.now() - new Date(member.lastActive).getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceActive <= 7;
    }).length;

    // Score based on active members, total XP, and age
    const memberActivity = (activeMembers / Math.max(members.length, 1)) * 40;
    const xpActivity = Math.min((crew.totalXP || 0) / 1000, 30);
    const ageBonus = Math.min(daysSinceCreated / 7, 30); // Bonus for established crews
    
    return Math.round(memberActivity + xpActivity + ageBonus);
  },

  /**
   * Get top performing members
   */
  getTopPerformers: (members: CrewMember[], limit: number = 3): CrewMember[] => {
    return [...members]
      .sort((a, b) => (b.stats?.totalXP || 0) - (a.stats?.totalXP || 0))
      .slice(0, limit);
  }
};

// Crew role utilities
export const crewRoles = {
  /**
   * Check if user is crew leader
   */
  isLeader: (crew: Crew, userId: string): boolean => {
    return crew.leaderId === userId;
  },

  /**
   * Check if user is co-leader
   */
  isCoLeader: (members: CrewMember[], userId: string): boolean => {
    const member = members.find(m => m.userId === userId);
    return member?.role === 'co-leader';
  },

  /**
   * Check if user has admin permissions
   */
  hasAdminPermissions: (crew: Crew, members: CrewMember[], userId: string): boolean => {
    return crewRoles.isLeader(crew, userId) || crewRoles.isCoLeader(members, userId);
  },

  /**
   * Get user's role in crew
   */
  getUserRole: (crew: Crew, members: CrewMember[], userId: string): 'leader' | 'co-leader' | 'member' | null => {
    if (crewRoles.isLeader(crew, userId)) return 'leader';
    
    const member = members.find(m => m.userId === userId);
    return member?.role || null;
  },

  /**
   * Get permissions for role
   */
  getRolePermissions: (role: 'leader' | 'co-leader' | 'member'): {
    canInviteMembers: boolean;
    canRemoveMembers: boolean;
    canPromoteMembers: boolean;
    canEditSettings: boolean;
    canCreateQuests: boolean;
    canDeleteCrew: boolean;
  } => {
    switch (role) {
      case 'leader':
        return {
          canInviteMembers: true,
          canRemoveMembers: true,
          canPromoteMembers: true,
          canEditSettings: true,
          canCreateQuests: true,
          canDeleteCrew: true
        };
      case 'co-leader':
        return {
          canInviteMembers: true,
          canRemoveMembers: true,
          canPromoteMembers: false,
          canEditSettings: false,
          canCreateQuests: true,
          canDeleteCrew: false
        };
      case 'member':
      default:
        return {
          canInviteMembers: false,
          canRemoveMembers: false,
          canPromoteMembers: false,
          canEditSettings: false,
          canCreateQuests: false,
          canDeleteCrew: false
        };
    }
  }
};

// Quest utilities
export const questUtils = {
  /**
   * Calculate quest completion percentage
   */
  getCompletionPercentage: (quest: Quest): number => {
    if (!quest.participants || quest.participants.length === 0) return 0;
    
    const completed = quest.completedBy?.length || 0;
    return Math.round((completed / quest.participants.length) * 100);
  },

  /**
   * Check if quest is overdue
   */
  isOverdue: (quest: Quest): boolean => {
    if (!quest.endDate) return false;
    return new Date(quest.endDate) < new Date();
  },

  /**
   * Get time remaining for quest
   */
  getTimeRemaining: (quest: Quest): string => {
    if (!quest.endDate) return 'No deadline';
    
    const end = new Date(quest.endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Expired';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m remaining`;
    } else {
      return `${diffMinutes}m remaining`;
    }
  },

  /**
   * Check if user can participate in quest
   */
  canUserParticipate: (quest: Quest, userId: string): boolean => {
    return quest.status === 'active' && 
           !quest.participants?.includes(userId) &&
           !questUtils.isOverdue(quest);
  },

  /**
   * Check if user has completed quest
   */
  hasUserCompleted: (quest: Quest, userId: string): boolean => {
    return quest.completedBy?.includes(userId) || false;
  }
};

// Search and filtering utilities
export const crewFilters = {
  /**
   * Filter crews by search query
   */
  filterBySearch: (crews: Crew[], query: string): Crew[] => {
    if (!query.trim()) return crews;
    
    const searchLower = query.toLowerCase();
    return crews.filter(crew => 
      crew.name.toLowerCase().includes(searchLower) ||
      crew.description?.toLowerCase().includes(searchLower) ||
      crew.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  },

  /**
   * Filter crews by type
   */
  filterByType: (crews: Crew[], type: string): Crew[] => {
    if (type === 'all') return crews;
    return crews.filter(crew => crew.type === type);
  },

  /**
   * Filter crews by availability
   */
  filterByAvailability: (crews: Crew[], availability: 'all' | 'available' | 'full'): Crew[] => {
    if (availability === 'all') return crews;
    
    return crews.filter(crew => {
      const isFull = (crew.memberCount || 0) >= (crew.maxMembers || 5);
      return availability === 'available' ? !isFull : isFull;
    });
  },

  /**
   * Filter crews by privacy
   */
  filterByPrivacy: (crews: Crew[], privacy: 'all' | 'public' | 'private'): Crew[] => {
    if (privacy === 'all') return crews;
    return crews.filter(crew => 
      privacy === 'public' ? !crew.isPrivate : crew.isPrivate
    );
  },

  /**
   * Sort crews by criteria
   */
  sortCrews: (crews: Crew[], sortBy: string): Crew[] => {
    const sorted = [...crews];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'members':
        return sorted.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
      case 'activity':
        return sorted.sort((a, b) => {
          const aActivity = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
          const bActivity = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
          return bActivity - aActivity;
        });
      case 'xp':
        return sorted.sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }
};

// Utility for generating crew colors/themes
export const crewTheming = {
  /**
   * Get color scheme for crew type
   */
  getTypeColors: (type: string): {
    primary: string;
    secondary: string;
    accent: string;
  } => {
    const colorSchemes: Record<string, { primary: string; secondary: string; accent: string }> = {
      fitness: {
        primary: 'text-red-600',
        secondary: 'bg-red-50',
        accent: 'border-red-200'
      },
      productivity: {
        primary: 'text-blue-600',
        secondary: 'bg-blue-50',
        accent: 'border-blue-200'
      },
      learning: {
        primary: 'text-green-600',
        secondary: 'bg-green-50',
        accent: 'border-green-200'
      },
      creative: {
        primary: 'text-purple-600',
        secondary: 'bg-purple-50',
        accent: 'border-purple-200'
      },
      social: {
        primary: 'text-orange-600',
        secondary: 'bg-orange-50',
        accent: 'border-orange-200'
      },
      general: {
        primary: 'text-gray-600',
        secondary: 'bg-gray-50',
        accent: 'border-gray-200'
      }
    };
    
    return colorSchemes[type] || colorSchemes.general;
  },

  /**
   * Get emoji for crew type
   */
  getTypeEmoji: (type: string): string => {
    const emojis: Record<string, string> = {
      fitness: '💪',
      productivity: '⚡',
      learning: '📚',
      creative: '🎨',
      social: '🌍',
      general: '🎯'
    };
    
    return emojis[type] || emojis.general;
  }
};

// Date and time utilities
export const dateUtils = {
  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffWeeks < 4) return `${diffWeeks}w ago`;
    
    return date.toLocaleDateString();
  },

  /**
   * Format date for display
   */
  formatDisplayDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  /**
   * Check if date is today
   */
  isToday: (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  /**
   * Check if date is this week
   */
  isThisWeek: (dateString: string): boolean => {
    const date = new Date(dateString);
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return date >= weekStart && date < weekEnd;
  }
};
// XP calculation utilities for the gamification system

/**
 * Calculate XP reward based on quest difficulty and type
 */
export function calculateXpReward(
  difficulty: 1 | 2 | 3 | 4 | 5, 
  isDaily: boolean = false,
  multipliers: {
    category?: number;
    streak?: number;
    collaboration?: number;
  } = {}
): number {
  // Base XP by difficulty
  const baseXpMap = {
    1: 50,   // Easy
    2: 100,  // Medium
    3: 200,  // Hard
    4: 400,  // Expert
    5: 800   // Legendary
  };

  let xp = baseXpMap[difficulty];

  // Daily quest modifier (reduced since they're repeated)
  if (isDaily) {
    xp = Math.floor(xp * 0.4);
  }

  // Apply multipliers
  if (multipliers.category) {
    xp = Math.floor(xp * multipliers.category);
  }

  if (multipliers.streak && multipliers.streak > 1) {
    // Streak bonus: +5% per day, capped at 50%
    const streakBonus = Math.min(multipliers.streak * 0.05, 0.5);
    xp = Math.floor(xp * (1 + streakBonus));
  }

  if (multipliers.collaboration) {
    xp = Math.floor(xp * multipliers.collaboration);
  }

  return Math.max(xp, 10); // Minimum 10 XP
}

/**
 * Calculate XP needed for a specific level
 * Uses a logarithmic curve to make higher levels increasingly difficult
 */
export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0;
  
  // XP formula: base * level^2.1 * log(level + 1)
  // This creates a smooth curve that gets steeper at higher levels
  const base = 100;
  const exponential = Math.pow(level, 2.1);
  const logarithmic = Math.log(level + 1) * 1.5;
  
  return Math.floor(base * exponential * logarithmic);
}

/**
 * Calculate current level from total XP
 */
export function calculateLevelFromXp(totalXp: number): number {
  if (totalXp < 0) return 1;
  
  let level = 1;
  
  // Binary search for efficiency with high XP values
  let low = 1;
  let high = 100; // Reasonable upper bound
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const xpRequired = calculateXpForLevel(mid);
    const nextLevelXp = calculateXpForLevel(mid + 1);
    
    if (totalXp >= xpRequired && totalXp < nextLevelXp) {
      return mid;
    } else if (totalXp >= nextLevelXp) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  
  return high;
}

/**
 * Calculate XP needed to reach next level
 */
export function calculateXpToNextLevel(currentXp: number, currentLevel: number): number {
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);
  return Math.max(0, nextLevelXp - currentXp);
}

/**
 * Calculate level progress as percentage
 */
export function calculateLevelProgress(currentXp: number, currentLevel: number): number {
  const currentLevelXp = calculateXpForLevel(currentLevel);
  const nextLevelXp = calculateXpForLevel(currentLevel + 1);
  const progressXp = currentXp - currentLevelXp;
  const requiredXp = nextLevelXp - currentLevelXp;
  
  return Math.min((progressXp / requiredXp) * 100, 100);
}

/**
 * Calculate XP for secondary goals (daily habits)
 */
export function calculateSecondaryGoalXp(
  baseXp: number = 25,
  streak: number = 0,
  difficulty: 1 | 2 | 3 = 1
): number {
  let xp = baseXp;

  // Difficulty multiplier for secondary goals
  const difficultyMultiplier = {
    1: 1.0,   // Easy daily habits
    2: 1.3,   // Moderate habits  
    3: 1.6    // Challenging habits
  };

  xp *= difficultyMultiplier[difficulty];

  // Streak bonus for consistency
  if (streak >= 7) {
    xp *= 1.2; // 20% bonus for week+ streaks
  }
  if (streak >= 30) {
    xp *= 1.4; // 40% bonus for month+ streaks
  }
  if (streak >= 100) {
    xp *= 1.6; // 60% bonus for 100+ day streaks
  }

  return Math.floor(xp);
}

/**
 * Calculate achievement XP based on rarity
 */
export function calculateAchievementXp(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): number {
  const rarityXpMap = {
    common: 100,
    uncommon: 250,
    rare: 500,
    epic: 1000,
    legendary: 2500
  };

  return rarityXpMap[rarity];
}

/**
 * Calculate milestone XP rewards
 */
export function calculateMilestoneXp(
  questXpReward: number,
  milestoneIndex: number,
  totalMilestones: number
): number {
  // Milestone rewards are 10% of quest XP, with final milestone giving 25%
  const baseReward = Math.floor(questXpReward * 0.1);
  const isFinalMilestone = milestoneIndex === totalMilestones - 1;
  
  return isFinalMilestone ? Math.floor(questXpReward * 0.25) : baseReward;
}

/**
 * Calculate collaboration XP bonus
 */
export function calculateCollaborationBonus(
  baseXp: number,
  participantCount: number
): number {
  if (participantCount <= 1) return 0;
  
  // 5% bonus per additional participant, capped at 50%
  const bonusPercentage = Math.min((participantCount - 1) * 0.05, 0.5);
  return Math.floor(baseXp * bonusPercentage);
}

/**
 * Calculate time-based XP penalties/bonuses
 */
export function calculateTimeBasedModifier(
  deadline: Date,
  completedAt: Date,
  baseXp: number
): { xp: number; modifier: 'early' | 'on_time' | 'late' | 'overdue' } {
  const daysDifference = Math.floor((deadline.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDifference > 7) {
    // Completed more than a week early: 25% bonus
    return { xp: Math.floor(baseXp * 1.25), modifier: 'early' };
  } else if (daysDifference >= 0) {
    // Completed on time: no modifier
    return { xp: baseXp, modifier: 'on_time' };
  } else if (daysDifference >= -3) {
    // Up to 3 days late: 10% penalty
    return { xp: Math.floor(baseXp * 0.9), modifier: 'late' };
  } else {
    // More than 3 days late: 25% penalty
    return { xp: Math.floor(baseXp * 0.75), modifier: 'overdue' };
  }
}

/**
 * Generate XP summary for completed quest
 */
export interface XpBreakdown {
  base: number;
  difficulty: number;
  milestones: number;
  streak: number;
  collaboration: number;
  timing: number;
  achievements: number;
  total: number;
}

export function generateXpBreakdown(
  questDifficulty: 1 | 2 | 3 | 4 | 5,
  completedMilestones: number,
  totalMilestones: number,
  streak: number = 0,
  participantCount: number = 1,
  deadline?: Date,
  completedAt: Date = new Date(),
  newAchievements: number = 0
): XpBreakdown {
  const baseXp = calculateXpReward(questDifficulty, false);
  
  const milestoneXp = Array.from({ length: completedMilestones }, (_, i) => 
    calculateMilestoneXp(baseXp, i, totalMilestones)
  ).reduce((sum, xp) => sum + xp, 0);
  
  const streakBonus = streak > 1 ? Math.floor(baseXp * Math.min(streak * 0.05, 0.5)) : 0;
  
  const collaborationBonus = calculateCollaborationBonus(baseXp, participantCount);
  
  const timingInfo = deadline ? calculateTimeBasedModifier(deadline, completedAt, baseXp) : { xp: baseXp, modifier: 'on_time' as const };
  const timingBonus = timingInfo.xp - baseXp;
  
  const achievementXp = newAchievements * 100; // Simplified
  
  const total = baseXp + milestoneXp + streakBonus + collaborationBonus + timingBonus + achievementXp;
  
  return {
    base: baseXp,
    difficulty: questDifficulty,
    milestones: milestoneXp,
    streak: streakBonus,
    collaboration: collaborationBonus,
    timing: timingBonus,
    achievements: achievementXp,
    total
  };
}
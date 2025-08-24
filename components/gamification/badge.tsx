'use client';

import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { Crown, Star, Medal, Award, Shield, Gem, Flame, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BadgeType = 
  | 'level' 
  | 'achievement' 
  | 'streak' 
  | 'quest' 
  | 'social' 
  | 'milestone'
  | 'rarity';

export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface BadgeProps {
  type: BadgeType;
  value?: string | number;
  rarity?: BadgeRarity;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  glow?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Badge({ 
  type, 
  value, 
  rarity = 'common', 
  size = 'md', 
  animated = false,
  glow = false,
  children, 
  className 
}: BadgeProps) {
  const getTypeConfig = (type: BadgeType) => {
    switch (type) {
      case 'level':
        return {
          icon: Crown,
          baseColor: 'bg-purple-100 text-purple-800 border-purple-200',
          glowColor: 'shadow-purple-200/50'
        };
      case 'achievement':
        return {
          icon: Medal,
          baseColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          glowColor: 'shadow-yellow-200/50'
        };
      case 'streak':
        return {
          icon: Flame,
          baseColor: 'bg-orange-100 text-orange-800 border-orange-200',
          glowColor: 'shadow-orange-200/50'
        };
      case 'quest':
        return {
          icon: Target,
          baseColor: 'bg-blue-100 text-blue-800 border-blue-200',
          glowColor: 'shadow-blue-200/50'
        };
      case 'social':
        return {
          icon: Users,
          baseColor: 'bg-pink-100 text-pink-800 border-pink-200',
          glowColor: 'shadow-pink-200/50'
        };
      case 'milestone':
        return {
          icon: Star,
          baseColor: 'bg-green-100 text-green-800 border-green-200',
          glowColor: 'shadow-green-200/50'
        };
      case 'rarity':
      default:
        return {
          icon: Award,
          baseColor: 'bg-gray-100 text-gray-800 border-gray-200',
          glowColor: 'shadow-gray-200/50'
        };
    }
  };

  const getRarityConfig = (rarity: BadgeRarity) => {
    switch (rarity) {
      case 'common':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          glow: 'shadow-gray-200/30'
        };
      case 'uncommon':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          glow: 'shadow-green-200/40'
        };
      case 'rare':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          glow: 'shadow-blue-200/50'
        };
      case 'epic':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          glow: 'shadow-purple-200/60 shadow-lg'
        };
      case 'legendary':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          glow: 'shadow-yellow-200/70 shadow-xl'
        };
    }
  };

  const getSizeConfig = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return {
          text: 'text-xs',
          padding: 'px-2 py-1',
          icon: 'w-3 h-3'
        };
      case 'md':
        return {
          text: 'text-sm',
          padding: 'px-2.5 py-1.5',
          icon: 'w-4 h-4'
        };
      case 'lg':
        return {
          text: 'text-base',
          padding: 'px-3 py-2',
          icon: 'w-5 h-5'
        };
    }
  };

  const typeConfig = getTypeConfig(type);
  const rarityConfig = type === 'rarity' ? getRarityConfig(rarity) : null;
  const sizeConfig = getSizeConfig(size);
  const Icon = typeConfig.icon;

  const badgeClasses = cn(
    'inline-flex items-center gap-1.5 font-medium border rounded-full',
    sizeConfig.text,
    sizeConfig.padding,
    rarityConfig ? rarityConfig.color : typeConfig.baseColor,
    glow && (rarityConfig ? rarityConfig.glow : typeConfig.glowColor),
    animated && 'transition-all duration-200 hover:scale-105',
    'select-none',
    className
  );

  return (
    <ShadcnBadge variant="outline" className={badgeClasses}>
      <Icon className={sizeConfig.icon} />
      {value && <span>{value}</span>}
      {children}
    </ShadcnBadge>
  );
}

// Specialized badge components for common use cases
export function LevelBadge({ level, size = 'md', animated = false }: { 
  level: number; 
  size?: 'sm' | 'md' | 'lg'; 
  animated?: boolean;
}) {
  const getRarity = (level: number): BadgeRarity => {
    if (level >= 80) return 'legendary';
    if (level >= 60) return 'epic';
    if (level >= 40) return 'rare';
    if (level >= 20) return 'uncommon';
    return 'common';
  };

  return (
    <Badge 
      type="level" 
      value={level} 
      rarity={getRarity(level)}
      size={size} 
      animated={animated}
      glow={level >= 40}
    />
  );
}

export function StreakBadge({ streak, size = 'md', animated = true }: { 
  streak: number; 
  size?: 'sm' | 'md' | 'lg'; 
  animated?: boolean;
}) {
  const getRarity = (streak: number): BadgeRarity => {
    if (streak >= 365) return 'legendary';
    if (streak >= 100) return 'epic';
    if (streak >= 30) return 'rare';
    if (streak >= 7) return 'uncommon';
    return 'common';
  };

  return (
    <Badge 
      type="streak" 
      value={`${streak}🔥`} 
      rarity={getRarity(streak)}
      size={size} 
      animated={animated}
      glow={streak >= 30}
    />
  );
}

export function AchievementBadge({ 
  rarity, 
  size = 'md', 
  animated = true,
  children 
}: { 
  rarity: BadgeRarity; 
  size?: 'sm' | 'md' | 'lg'; 
  animated?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Badge 
      type="rarity" 
      rarity={rarity}
      size={size} 
      animated={animated}
      glow={['epic', 'legendary'].includes(rarity)}
    >
      {children}
    </Badge>
  );
}

export function QuestBadge({ 
  count, 
  size = 'md', 
  type = 'completed'
}: { 
  count: number; 
  size?: 'sm' | 'md' | 'lg';
  type?: 'completed' | 'active';
}) {
  return (
    <Badge 
      type="quest" 
      value={count} 
      size={size}
      className={type === 'active' ? 'bg-blue-100 text-blue-800' : undefined}
    />
  );
}

export function SocialBadge({ 
  count, 
  size = 'md'
}: { 
  count: number; 
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Badge 
      type="social" 
      value={count} 
      size={size}
    />
  );
}
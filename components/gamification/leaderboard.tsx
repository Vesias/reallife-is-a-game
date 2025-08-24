'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useGamification } from '@/hooks/use-gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LevelBadge, StreakBadge, QuestBadge } from './badge';
import { 
  Trophy, 
  Medal, 
  Award,
  TrendingUp,
  Calendar,
  Target,
  Users,
  Crown,
  Star,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  totalXp: number;
  completedQuests: number;
  currentStreak: number;
  bestStreak: number;
  joinedAt: Date;
  isCurrentUser?: boolean;
  weeklyXp?: number;
  monthlyXp?: number;
}

interface LeaderboardProps {
  timeframe?: 'all' | 'weekly' | 'monthly';
  category?: 'xp' | 'level' | 'quests' | 'streak';
  showCurrentUser?: boolean;
  limit?: number;
}

export function Leaderboard({ 
  timeframe = 'all',
  category = 'xp',
  showCurrentUser = true,
  limit = 50 
}: LeaderboardProps) {
  const { t } = useTranslation();
  const { currentLevel, currentXp } = useGamification();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedCategory, setSelectedCategory] = useState(category);

  // Mock data - in real app, fetch from API
  const mockLeaderboard: LeaderboardEntry[] = [
    {
      id: '1',
      username: 'QuestMaster2024',
      avatar: undefined,
      level: 42,
      totalXp: 25600,
      completedQuests: 128,
      currentStreak: 45,
      bestStreak: 67,
      joinedAt: new Date('2024-01-15'),
      weeklyXp: 1200,
      monthlyXp: 4800
    },
    {
      id: '2',
      username: 'StreakLegend',
      avatar: undefined,
      level: 38,
      totalXp: 21900,
      completedQuests: 95,
      currentStreak: 89,
      bestStreak: 89,
      joinedAt: new Date('2024-02-20'),
      weeklyXp: 980,
      monthlyXp: 3900
    },
    {
      id: 'current',
      username: 'You',
      avatar: undefined,
      level: currentLevel,
      totalXp: currentXp,
      completedQuests: 23,
      currentStreak: 12,
      bestStreak: 18,
      joinedAt: new Date('2024-06-01'),
      isCurrentUser: true,
      weeklyXp: 450,
      monthlyXp: 1800
    },
    {
      id: '4',
      username: 'HealthWarrior',
      avatar: undefined,
      level: 31,
      totalXp: 18200,
      completedQuests: 87,
      currentStreak: 28,
      bestStreak: 44,
      joinedAt: new Date('2024-03-10'),
      weeklyXp: 720,
      monthlyXp: 2900
    },
    {
      id: '5',
      username: 'LearningEnthusiast',
      avatar: undefined,
      level: 29,
      totalXp: 16500,
      completedQuests: 72,
      currentStreak: 15,
      bestStreak: 32,
      joinedAt: new Date('2024-04-05'),
      weeklyXp: 650,
      monthlyXp: 2600
    }
  ];

  const timeframes = [
    { value: 'all', label: t('leaderboard.timeframes.allTime'), icon: Trophy },
    { value: 'weekly', label: t('leaderboard.timeframes.weekly'), icon: Calendar },
    { value: 'monthly', label: t('leaderboard.timeframes.monthly'), icon: TrendingUp }
  ];

  const categories = [
    { value: 'xp', label: t('leaderboard.categories.experience'), icon: Star },
    { value: 'level', label: t('leaderboard.categories.level'), icon: Crown },
    { value: 'quests', label: t('leaderboard.categories.quests'), icon: Target },
    { value: 'streak', label: t('leaderboard.categories.streak'), icon: Flame }
  ];

  const getSortValue = (entry: LeaderboardEntry, category: string, timeframe: string) => {
    switch (category) {
      case 'xp':
        if (timeframe === 'weekly') return entry.weeklyXp || 0;
        if (timeframe === 'monthly') return entry.monthlyXp || 0;
        return entry.totalXp;
      case 'level':
        return entry.level;
      case 'quests':
        return entry.completedQuests;
      case 'streak':
        return entry.currentStreak;
      default:
        return entry.totalXp;
    }
  };

  const sortedLeaderboard = [...mockLeaderboard]
    .sort((a, b) => getSortValue(b, selectedCategory, selectedTimeframe) - getSortValue(a, selectedCategory, selectedTimeframe))
    .slice(0, limit);

  const currentUserRank = sortedLeaderboard.findIndex(entry => entry.isCurrentUser) + 1;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {t('leaderboard.title')}
              </CardTitle>
              <CardDescription>
                {t('leaderboard.description')}
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((timeframe) => (
                    <SelectItem key={timeframe.value} value={timeframe.value}>
                      <div className="flex items-center gap-2">
                        <timeframe.icon className="w-4 h-4" />
                        {timeframe.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <category.icon className="w-4 h-4" />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Current User Rank */}
        {showCurrentUser && currentUserRank > 0 && (
          <CardContent className="pt-0">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {getRankIcon(currentUserRank)}
                  <span className="font-medium">
                    {t('leaderboard.yourRank')}: #{currentUserRank}
                  </span>
                </div>
                <Badge variant="outline">
                  {getSortValue(mockLeaderboard.find(e => e.isCurrentUser)!, selectedCategory, selectedTimeframe).toLocaleString()}
                  {selectedCategory === 'xp' ? ' XP' : selectedCategory === 'level' ? '' : selectedCategory === 'quests' ? ` ${t('common.quests')}` : ` ${t('common.days')}`}
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Leaderboard List */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-1">
            {sortedLeaderboard.map((entry, index) => {
              const rank = index + 1;
              const value = getSortValue(entry, selectedCategory, selectedTimeframe);
              
              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                    entry.isCurrentUser && "bg-primary/5 border-l-4 border-l-primary",
                    getRankColor(rank)
                  )}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback className={cn(
                        entry.isCurrentUser && "bg-primary text-primary-foreground"
                      )}>
                        {entry.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium truncate",
                          entry.isCurrentUser && "text-primary"
                        )}>
                          {entry.username}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            {t('leaderboard.you')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <LevelBadge level={entry.level} size="sm" />
                        
                        {entry.currentStreak > 0 && (
                          <StreakBadge streak={entry.currentStreak} size="sm" />
                        )}
                        
                        <QuestBadge count={entry.completedQuests} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Primary Metric */}
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {value.toLocaleString()}
                      {selectedCategory === 'xp' && (
                        <span className="text-sm text-muted-foreground ml-1">XP</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedCategory === 'xp' 
                        ? t('leaderboard.metrics.experience')
                        : selectedCategory === 'level'
                        ? t('leaderboard.metrics.level')
                        : selectedCategory === 'quests'
                        ? t('leaderboard.metrics.quests')
                        : t('leaderboard.metrics.streak')
                      }
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="hidden sm:flex flex-col text-right text-sm text-muted-foreground min-w-0">
                    <div>
                      {t('leaderboard.level')} {entry.level}
                    </div>
                    <div>
                      {entry.completedQuests} {t('common.quests')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('leaderboard.stats.topLevel')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...sortedLeaderboard.map(e => e.level))}
            </div>
            <p className="text-xs text-muted-foreground">
              {sortedLeaderboard.find(e => e.level === Math.max(...sortedLeaderboard.map(e => e.level)))?.username}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('leaderboard.stats.longestStreak')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...sortedLeaderboard.map(e => e.bestStreak))}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('leaderboard.stats.days')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('leaderboard.stats.totalUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sortedLeaderboard.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('leaderboard.stats.active')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
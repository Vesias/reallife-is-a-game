'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useGamification } from '@/hooks/use-gamification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Medal, 
  Award, 
  Crown,
  Target,
  Flame,
  Calendar,
  Users,
  CheckCircle,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'quest' | 'social' | 'streak' | 'milestone' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  xpReward: number;
  conditions: string[];
}

interface AchievementGridProps {
  showLocked?: boolean;
  showProgress?: boolean;
}

export function AchievementGrid({ showLocked = true, showProgress = true }: AchievementGridProps) {
  const { t } = useTranslation();
  const { achievements, getAchievementProgress } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: t('achievements.categories.all'), icon: Trophy },
    { value: 'quest', label: t('achievements.categories.quest'), icon: Target },
    { value: 'social', label: t('achievements.categories.social'), icon: Users },
    { value: 'streak', label: t('achievements.categories.streak'), icon: Flame },
    { value: 'milestone', label: t('achievements.categories.milestone'), icon: Medal },
    { value: 'special', label: t('achievements.categories.special'), icon: Crown }
  ];

  const rarityConfig = {
    common: { 
      label: t('achievements.rarity.common'), 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      glow: '',
      icon: Star
    },
    uncommon: { 
      label: t('achievements.rarity.uncommon'), 
      color: 'bg-green-100 text-green-800 border-green-200',
      glow: 'shadow-green-200/50',
      icon: Award
    },
    rare: { 
      label: t('achievements.rarity.rare'), 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      glow: 'shadow-blue-200/50',
      icon: Medal
    },
    epic: { 
      label: t('achievements.rarity.epic'), 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      glow: 'shadow-purple-200/50 shadow-lg',
      icon: Trophy
    },
    legendary: { 
      label: t('achievements.rarity.legendary'), 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      glow: 'shadow-yellow-200/50 shadow-xl',
      icon: Crown
    }
  };

  // Mock achievements data - in real app, this would come from the hook
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: t('achievements.firstQuest.title'),
      description: t('achievements.firstQuest.description'),
      category: 'quest',
      rarity: 'common',
      icon: '🎯',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      progress: 1,
      maxProgress: 1,
      xpReward: 100,
      conditions: ['Complete your first quest']
    },
    {
      id: '2',
      title: t('achievements.streakMaster.title'),
      description: t('achievements.streakMaster.description'),
      category: 'streak',
      rarity: 'rare',
      icon: '🔥',
      isUnlocked: false,
      progress: 12,
      maxProgress: 30,
      xpReward: 500,
      conditions: ['Maintain a 30-day streak']
    },
    {
      id: '3',
      title: t('achievements.socialButterfly.title'),
      description: t('achievements.socialButterfly.description'),
      category: 'social',
      rarity: 'uncommon',
      icon: '🦋',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      progress: 5,
      maxProgress: 5,
      xpReward: 250,
      conditions: ['Join 5 public quests']
    },
    {
      id: '4',
      title: t('achievements.levelMaster.title'),
      description: t('achievements.levelMaster.description'),
      category: 'milestone',
      rarity: 'epic',
      icon: '👑',
      isUnlocked: false,
      progress: 25,
      maxProgress: 50,
      xpReward: 1000,
      conditions: ['Reach level 50']
    },
    {
      id: '5',
      title: t('achievements.perfectWeek.title'),
      description: t('achievements.perfectWeek.description'),
      category: 'special',
      rarity: 'legendary',
      icon: '⭐',
      isUnlocked: false,
      progress: 5,
      maxProgress: 7,
      xpReward: 2000,
      conditions: ['Complete all daily goals for 7 consecutive days']
    },
    {
      id: '6',
      title: t('achievements.questCollector.title'),
      description: t('achievements.questCollector.description'),
      category: 'quest',
      rarity: 'rare',
      icon: '📚',
      isUnlocked: false,
      progress: 8,
      maxProgress: 25,
      xpReward: 750,
      conditions: ['Complete 25 quests']
    }
  ];

  const filteredAchievements = mockAchievements.filter(achievement => {
    if (selectedCategory === 'all') return true;
    return achievement.category === selectedCategory;
  }).filter(achievement => {
    if (!showLocked) return achievement.isUnlocked;
    return true;
  });

  const unlockedCount = mockAchievements.filter(a => a.isUnlocked).length;
  const totalXpFromAchievements = mockAchievements
    .filter(a => a.isUnlocked)
    .reduce((total, a) => total + a.xpReward, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('achievements.stats.unlocked')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedCount}</div>
            <p className="text-xs text-muted-foreground">
              {t('achievements.stats.of')} {mockAchievements.length}
            </p>
            <Progress 
              value={(unlockedCount / mockAchievements.length) * 100} 
              className="h-1 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('achievements.stats.xpEarned')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalXpFromAchievements.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">XP</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('achievements.stats.rarest')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAchievements
                .filter(a => a.isUnlocked)
                .reduce((rarest, a) => {
                  const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
                  return rarityOrder[a.rarity] > rarityOrder[rarest] ? a.rarity : rarest;
                }, 'common' as Achievement['rarity'])
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {t('achievements.stats.achieved')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-6 w-full">
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-1">
                <CategoryIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => {
                const rarity = rarityConfig[achievement.rarity];
                const RarityIcon = rarity.icon;
                const isComplete = achievement.progress >= achievement.maxProgress;
                const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

                return (
                  <Card 
                    key={achievement.id} 
                    className={cn(
                      "relative overflow-hidden transition-all hover:shadow-md",
                      rarity.color,
                      achievement.isUnlocked && rarity.glow,
                      !achievement.isUnlocked && "opacity-75"
                    )}
                  >
                    {/* Rarity Indicator */}
                    <div className="absolute top-2 right-2">
                      <RarityIcon className={cn(
                        "w-5 h-5",
                        achievement.isUnlocked ? "text-current" : "text-muted-foreground"
                      )} />
                    </div>

                    {/* Lock Overlay */}
                    {!achievement.isUnlocked && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}

                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-base leading-tight mb-1">
                            {achievement.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Progress (if not unlocked and progress shown) */}
                      {!achievement.isUnlocked && showProgress && achievement.maxProgress > 1 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {t('achievements.progress')}
                            </span>
                            <span className="text-xs font-medium">
                              {achievement.progress} / {achievement.maxProgress}
                            </span>
                          </div>
                          <Progress value={progressPercentage} className="h-1" />
                        </div>
                      )}

                      {/* Completion Status */}
                      {achievement.isUnlocked && achievement.unlockedAt && (
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            {t('achievements.unlocked')} {achievement.unlockedAt.toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* XP Reward */}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {rarity.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-primary font-medium text-sm">
                          <Star className="w-3 h-3" />
                          +{achievement.xpReward} XP
                        </div>
                      </div>

                      {/* Conditions (for locked achievements) */}
                      {!achievement.isUnlocked && achievement.conditions.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground mb-1">
                            {t('achievements.conditions')}:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {achievement.conditions.map((condition, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-muted-foreground">•</span>
                                {condition}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredAchievements.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 text-6xl opacity-20">🏆</div>
                  <h3 className="text-lg font-medium mb-2">
                    {t('achievements.empty.title')}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === 'all' 
                      ? t('achievements.empty.description')
                      : t('achievements.empty.categoryDescription', { category: categories.find(c => c.value === selectedCategory)?.label })
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
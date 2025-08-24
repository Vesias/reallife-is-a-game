'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Star, 
  Medal, 
  Award, 
  Crown, 
  Zap, 
  Target, 
  Heart,
  Calendar,
  ChevronRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

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

interface AchievementShowcaseProps {
  achievements: Achievement[];
}

const categoryConfig = {
  goals: { icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Goals' },
  habits: { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Habits' },
  streaks: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Streaks' },
  social: { icon: Trophy, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Social' },
  special: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Special' },
  milestone: { icon: Crown, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Milestone' },
};

const rarityConfig = {
  common: { 
    color: 'text-gray-600', 
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    glow: '',
    label: 'Common'
  },
  uncommon: { 
    color: 'text-green-600', 
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    glow: 'shadow-green-500/10',
    label: 'Uncommon'
  },
  rare: { 
    color: 'text-blue-600', 
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    glow: 'shadow-blue-500/20',
    label: 'Rare'
  },
  epic: { 
    color: 'text-purple-600', 
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    glow: 'shadow-purple-500/30',
    label: 'Epic'
  },
  legendary: { 
    color: 'text-yellow-600', 
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    glow: 'shadow-yellow-500/40',
    label: 'Legendary'
  },
};

export function AchievementShowcase({ achievements }: AchievementShowcaseProps) {
  const t = useTranslations('dashboard.achievements');
  const locale = useLocale();
  const dateLocale = locale === 'de' ? de : enUS;

  const recentAchievements = achievements
    .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
    .slice(0, 6);

  const newAchievements = achievements.filter(a => a.isNew).length;
  const totalXpFromAchievements = achievements.reduce((sum, a) => sum + a.xpReward, 0);

  const getCategoryStats = () => {
    const stats = Object.keys(categoryConfig).map(category => ({
      category,
      count: achievements.filter(a => a.category === category).length,
      ...categoryConfig[category as keyof typeof categoryConfig]
    }));
    return stats.sort((a, b) => b.count - a.count);
  };

  const getRarityStats = () => {
    return Object.entries(rarityConfig).map(([rarity, config]) => ({
      rarity,
      count: achievements.filter(a => a.rarity === rarity).length,
      ...config
    })).filter(stat => stat.count > 0);
  };

  const formatTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: dateLocale 
    });
  };

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-8">
            <Medal className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">{t('noAchievements')}</p>
            <p className="text-sm text-muted-foreground">{t('startEarning')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('title')}
          </div>
          <div className="flex items-center gap-2">
            {newAchievements > 0 && (
              <Badge variant="default" className="animate-pulse">
                {newAchievements} {t('new')}
              </Badge>
            )}
            <Badge variant="outline">
              {achievements.length} {t('total')}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Achievement Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-yellow-600">
              {achievements.length}
            </div>
            <p className="text-xs text-muted-foreground">{t('earned')}</p>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <Zap className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-600">
              {totalXpFromAchievements}
            </div>
            <p className="text-xs text-muted-foreground">{t('bonusXp')}</p>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            {t('recent')}
          </h4>
          
          <ScrollArea className="h-64">
            <div className="space-y-3 pr-2">
              {recentAchievements.map((achievement) => {
                const categoryInfo = categoryConfig[achievement.category];
                const rarityInfo = rarityConfig[achievement.rarity];
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <div 
                    key={achievement.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all hover:shadow-md relative',
                      rarityInfo.bg,
                      rarityInfo.border,
                      rarityInfo.glow && `shadow-lg ${rarityInfo.glow}`,
                      achievement.isNew && 'ring-2 ring-yellow-400 dark:ring-yellow-600'
                    )}
                  >
                    {achievement.isNew && (
                      <div className="absolute -top-1 -right-1">
                        <Badge className="text-xs h-5 bg-yellow-500 hover:bg-yellow-600">
                          {t('new')}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-full shrink-0',
                        categoryInfo.bg
                      )}>
                        <CategoryIcon className={cn('h-5 w-5', categoryInfo.color)} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-medium text-sm mb-1">
                              {achievement.title}
                            </h5>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {achievement.description}
                            </p>
                            
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="outline" className={rarityInfo.color}>
                                {rarityInfo.label}
                              </Badge>
                              <Badge variant="secondary">
                                {categoryInfo.label}
                              </Badge>
                              <div className="flex items-center gap-1 text-yellow-600">
                                <Zap className="h-3 w-3" />
                                <span>+{achievement.xpReward}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatTimeAgo(achievement.earnedAt)}</span>
                        </div>
                        
                        {achievement.progress && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{t('progress')}</span>
                              <span>{achievement.progress.current}/{achievement.progress.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                                style={{ 
                                  width: `${(achievement.progress.current / achievement.progress.total) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{t('categories')}</h4>
          <div className="grid grid-cols-2 gap-2">
            {getCategoryStats().slice(0, 4).map(({ category, count, icon: Icon, color, bg }) => (
              <div key={category} className={cn('p-2 rounded-lg flex items-center gap-2', bg)}>
                <Icon className={cn('h-4 w-4', color)} />
                <span className="text-xs font-medium">{category}</span>
                <Badge variant="outline" className="ml-auto text-xs h-4">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Rarity Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{t('rarity')}</h4>
          <div className="space-y-2">
            {getRarityStats().map(({ rarity, count, color, label }) => (
              <div key={rarity} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', color.replace('text-', 'bg-'))} />
                  <span className={color}>{label}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            <Award className="h-4 w-4 mr-2" />
            {t('viewAll')}
          </Button>
          <Button size="sm">
            <Target className="h-4 w-4 mr-2" />
            {t('discover')}
          </Button>
        </div>

        {/* Achievement Showcase */}
        {achievements.filter(a => a.rarity === 'legendary' || a.rarity === 'epic').length > 0 && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-yellow-50 dark:from-purple-950/20 dark:to-yellow-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium text-sm">{t('showcase')}</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('showcaseDesc')}
            </p>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              {t('manageShowcase')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
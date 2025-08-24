'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Zap, Target, Calendar, TrendingUp, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Stats {
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

interface StatsOverviewProps {
  stats: Stats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const t = useTranslations('dashboard.stats');

  const xpProgress = (stats.xp / stats.xpToNextLevel) * 100;
  const goalProgress = (stats.completedGoals / stats.totalGoals) * 100;

  const statCards = [
    {
      title: t('level'),
      value: stats.level,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      subtitle: `${stats.xp}/${stats.xpToNextLevel} XP`,
      progress: xpProgress,
    },
    {
      title: t('streak'),
      value: stats.streakDays,
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      subtitle: t('days'),
      badge: stats.streakDays >= 7 ? t('badges.onFire') : undefined,
    },
    {
      title: t('goals'),
      value: `${stats.completedGoals}/${stats.totalGoals}`,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      subtitle: t('completed'),
      progress: goalProgress,
    },
    {
      title: t('weeklyProgress'),
      value: `${stats.weeklyProgress}%`,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      subtitle: t('thisWeek'),
      progress: stats.weeklyProgress,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn('p-2 rounded-full', stat.bgColor)}>
                <Icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {stat.subtitle}
              </p>
              {stat.progress !== undefined && (
                <div className="space-y-1">
                  <Progress value={stat.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(stat.progress)}%
                  </p>
                </div>
              )}
            </CardContent>
            {/* Decorative gradient */}
            <div 
              className={cn(
                'absolute top-0 right-0 w-1 h-full opacity-50',
                stat.color.replace('text-', 'bg-')
              )} 
            />
          </Card>
        );
      })}
      
      {/* Additional Stats Row */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-purple-500" />
            {t('summary')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-500">
                {stats.rank}
              </div>
              <p className="text-sm text-muted-foreground">{t('rank')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {stats.totalXp.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">{t('totalXp')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">
                {stats.monthlyProgress}%
              </div>
              <p className="text-sm text-muted-foreground">{t('monthlyProgress')}</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {stats.achievements}
              </div>
              <p className="text-sm text-muted-foreground">{t('achievements')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
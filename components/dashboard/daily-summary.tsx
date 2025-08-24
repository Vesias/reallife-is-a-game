'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Moon, 
  Target, 
  Heart, 
  Zap, 
  Trophy, 
  Calendar,
  ChevronRight,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface DailyStats {
  goalsCompleted: number;
  totalGoals: number;
  habitsCompleted: number;
  totalHabits: number;
  xpEarned: number;
  streaksContinued: number;
  moodScore: number;
  energyLevel: number;
  productivityScore: number;
  achievements: string[];
  nextMilestone: {
    name: string;
    progress: number;
    target: number;
  };
  recommendedActions: string[];
}

export function DailySummary() {
  const t = useTranslations('dashboard.dailySummary');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyStats] = useState<DailyStats>({
    goalsCompleted: 3,
    totalGoals: 5,
    habitsCompleted: 4,
    totalHabits: 6,
    xpEarned: 245,
    streaksContinued: 2,
    moodScore: 8,
    energyLevel: 75,
    productivityScore: 82,
    achievements: ['Early Bird', 'Consistency King'],
    nextMilestone: {
      name: 'Habit Master',
      progress: 18,
      target: 25
    },
    recommendedActions: [
      'Complete remaining goals',
      'Log water intake',
      'Review tomorrow\'s tasks'
    ]
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isEvening = currentTime.getHours() >= 18;
  const goalProgress = (dailyStats.goalsCompleted / dailyStats.totalGoals) * 100;
  const habitProgress = (dailyStats.habitsCompleted / dailyStats.totalHabits) * 100;
  const milestoneProgress = (dailyStats.nextMilestone.progress / dailyStats.nextMilestone.target) * 100;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const getDayPerformance = () => {
    const avgScore = (goalProgress + habitProgress + dailyStats.productivityScore) / 3;
    if (avgScore >= 80) return { label: t('excellent'), color: 'text-green-500', bg: 'bg-green-500/10' };
    if (avgScore >= 60) return { label: t('good'), color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (avgScore >= 40) return { label: t('fair'), color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: t('needsImprovement'), color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const performance = getDayPerformance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEvening ? (
              <Moon className="h-5 w-5 text-indigo-500" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
            {t('title')}
          </div>
          <Badge className={cn(performance.color, performance.bg)}>
            {performance.label}
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {getGreeting()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Daily Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{t('goals')}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dailyStats.goalsCompleted}/{dailyStats.totalGoals}
            </span>
          </div>
          <Progress value={goalProgress} className="h-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">{t('habits')}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {dailyStats.habitsCompleted}/{dailyStats.totalHabits}
            </span>
          </div>
          <Progress value={habitProgress} className="h-2" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <Zap className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-yellow-600">
              {dailyStats.xpEarned}
            </div>
            <p className="text-xs text-muted-foreground">{t('xpEarned')}</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <Award className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">
              {dailyStats.streaksContinued}
            </div>
            <p className="text-xs text-muted-foreground">{t('streaks')}</p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-500 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-600">
              {dailyStats.productivityScore}%
            </div>
            <p className="text-xs text-muted-foreground">{t('productivity')}</p>
          </div>
        </div>

        {/* Mood & Energy */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{t('wellbeing')}</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('mood')}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'w-2 h-2 rounded-full',
                      i < dailyStats.moodScore ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                    )}
                  />
                ))}
                <span className="text-sm font-medium ml-2">
                  {dailyStats.moodScore}/10
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('energy')}</span>
              <div className="flex items-center gap-2">
                <Progress value={dailyStats.energyLevel} className="w-16 h-2" />
                <span className="text-sm font-medium">
                  {dailyStats.energyLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Achievements */}
        {dailyStats.achievements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <h4 className="font-medium text-sm">{t('achievements')}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {dailyStats.achievements.map((achievement) => (
                <Badge key={achievement} variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 text-yellow-500" />
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Next Milestone */}
        <div className="space-y-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-500" />
            <h4 className="font-medium text-sm">{t('nextMilestone')}</h4>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{dailyStats.nextMilestone.name}</span>
              <span className="text-sm text-muted-foreground">
                {dailyStats.nextMilestone.progress}/{dailyStats.nextMilestone.target}
              </span>
            </div>
            <Progress value={milestoneProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {dailyStats.nextMilestone.target - dailyStats.nextMilestone.progress} {t('remaining')}
            </p>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <h4 className="font-medium text-sm">{t('recommendedActions')}</h4>
          </div>
          <div className="space-y-2">
            {dailyStats.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">{action}</span>
              </div>
            ))}
          </div>
          <Button size="sm" variant="outline" className="w-full mt-2">
            {t('viewAllTasks')}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Time of Day Message */}
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
          <p className="text-sm text-muted-foreground">
            {isEvening ? t('eveningMessage') : t('dayMessage')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
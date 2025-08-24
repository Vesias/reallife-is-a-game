'use client';

import { useTranslation } from '@/hooks/use-translation';
import { useGamification } from '@/hooks/use-gamification';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XpBarProps {
  showDetails?: boolean;
  compact?: boolean;
  animated?: boolean;
}

export function XpBar({ showDetails = true, compact = false, animated = true }: XpBarProps) {
  const { t } = useTranslation();
  const { currentXp, currentLevel, xpForNextLevel, totalXpForLevel, xpGainedToday, levelProgress } = useGamification();

  const progressPercentage = (currentXp / xpForNextLevel) * 100;
  const xpNeeded = xpForNextLevel - currentXp;

  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Level {currentLevel}
        </Badge>
        <div className="flex-1">
          <Progress 
            value={progressPercentage} 
            className={cn("h-2", animated && "transition-all duration-500")} 
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {currentXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
        </span>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden", animated && "transition-all duration-300")}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">{t('gamification.experience')}</h3>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                {t('gamification.level')} {currentLevel}
              </Badge>
              
              {xpGainedToday > 0 && (
                <Badge className="bg-green-100 text-green-800">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{xpGainedToday.toLocaleString()} {t('gamification.today')}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progressPercentage} 
              className={cn("h-4", animated && "transition-all duration-500")}
            />
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {currentXp.toLocaleString()} XP
              </span>
              <span className="text-muted-foreground">
                {xpForNextLevel.toLocaleString()} XP
              </span>
            </div>
          </div>

          {/* Details */}
          {showDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {currentXp.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('gamification.totalXp')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold">
                  {xpNeeded.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('gamification.xpToNext')}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('gamification.progress')}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
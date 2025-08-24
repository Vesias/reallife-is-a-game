'use client';

import { useTranslation } from '@/hooks/use-translation';
import { useGamification } from '@/hooks/use-gamification';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Crown, Star, Shield, Sword, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelDisplayProps {
  showPopover?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelDisplay({ showPopover = true, size = 'md' }: LevelDisplayProps) {
  const { t } = useTranslation();
  const { 
    currentLevel, 
    currentXp, 
    xpForNextLevel, 
    levelProgress, 
    getLevelInfo,
    getNextLevelInfo,
    getTotalXpForLevel 
  } = useGamification();

  const levelInfo = getLevelInfo(currentLevel);
  const nextLevelInfo = getNextLevelInfo();
  const xpNeeded = xpForNextLevel - currentXp;
  const progressPercentage = (currentXp / xpForNextLevel) * 100;

  const getLevelIcon = (level: number) => {
    if (level >= 80) return Crown;
    if (level >= 60) return Gem;
    if (level >= 40) return Sword;
    if (level >= 20) return Shield;
    return Star;
  };

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-yellow-500';
    if (level >= 60) return 'text-purple-500';
    if (level >= 40) return 'text-red-500';
    if (level >= 20) return 'text-blue-500';
    return 'text-green-500';
  };

  const getLevelBgColor = (level: number) => {
    if (level >= 80) return 'bg-yellow-100 text-yellow-800';
    if (level >= 60) return 'bg-purple-100 text-purple-800';
    if (level >= 40) return 'bg-red-100 text-red-800';
    if (level >= 20) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const sizeClasses = {
    sm: {
      avatar: 'w-8 h-8',
      text: 'text-xs',
      badge: 'text-xs px-2 py-1'
    },
    md: {
      avatar: 'w-10 h-10',
      text: 'text-sm',
      badge: 'text-sm px-2 py-1'
    },
    lg: {
      avatar: 'w-12 h-12',
      text: 'text-base',
      badge: 'text-base px-3 py-1'
    }
  };

  const classes = sizeClasses[size];
  const LevelIcon = getLevelIcon(currentLevel);

  const display = (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Avatar className={cn(classes.avatar, getLevelBgColor(currentLevel))}>
          <AvatarFallback className={cn(getLevelBgColor(currentLevel), 'font-bold')}>
            <LevelIcon className={cn("w-4 h-4", getLevelColor(currentLevel))} />
          </AvatarFallback>
        </Avatar>
        
        {currentLevel >= 10 && (
          <div className="absolute -top-1 -right-1">
            <Badge className={cn("text-xs px-1 py-0 h-4", getLevelBgColor(currentLevel))}>
              {Math.floor(currentLevel / 10)}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className={cn("font-semibold", classes.text)}>
          {t('gamification.level')} {currentLevel}
        </div>
        <div className={cn("text-muted-foreground", classes.text)}>
          {levelInfo.title}
        </div>
      </div>
    </div>
  );

  if (!showPopover) {
    return display;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          {display}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className={cn("w-12 h-12", getLevelBgColor(currentLevel))}>
                  <AvatarFallback className={cn(getLevelBgColor(currentLevel), 'text-lg font-bold')}>
                    <LevelIcon className={cn("w-6 h-6", getLevelColor(currentLevel))} />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {t('gamification.level')} {currentLevel}
                  </CardTitle>
                  <CardDescription>{levelInfo.title}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Current Level Stats */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('gamification.currentXp')}</span>
                <span className="font-medium">{currentXp.toLocaleString()} XP</span>
              </div>
              
              <Progress value={progressPercentage} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('gamification.progress')}</span>
                <span className="font-medium">
                  {Math.round(progressPercentage)}% ({xpNeeded.toLocaleString()} XP {t('gamification.remaining')})
                </span>
              </div>
            </div>

            {/* Next Level Preview */}
            {nextLevelInfo && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">{t('gamification.nextLevel')}:</span>
                  <Badge className={getLevelBgColor(currentLevel + 1)}>
                    {t('gamification.level')} {currentLevel + 1}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {nextLevelInfo.title}
                </p>
                {nextLevelInfo.benefits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">{t('gamification.benefits')}:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {nextLevelInfo.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-green-500">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Level Milestones */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">{t('gamification.milestones')}</p>
              <div className="grid grid-cols-5 gap-2">
                {[10, 25, 50, 75, 100].map((milestone) => {
                  const reached = currentLevel >= milestone;
                  const MilestoneIcon = getLevelIcon(milestone);
                  
                  return (
                    <div 
                      key={milestone}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-md text-center",
                        reached ? getLevelBgColor(milestone) : "bg-muted text-muted-foreground"
                      )}
                    >
                      <MilestoneIcon className={cn(
                        "w-4 h-4 mb-1",
                        reached ? getLevelColor(milestone) : "text-muted-foreground"
                      )} />
                      <span className="text-xs font-medium">{milestone}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
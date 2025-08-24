'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Crown, 
  Star, 
  MessageCircle, 
  Plus,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  ChevronRight,
  UserPlus,
  Settings
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface CrewMember {
  id: string;
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  role: 'leader' | 'member' | 'new';
  status: 'online' | 'offline' | 'away';
  weeklyContribution: number;
  streakDays: number;
}

interface Crew {
  id: string;
  name: string;
  description: string;
  members: CrewMember[];
  maxMembers: number;
  totalXp: number;
  weeklyGoal: number;
  weeklyProgress: number;
  rank: number;
  category: string;
  joinedDate: Date;
  achievements: string[];
  currentChallenge?: {
    name: string;
    progress: number;
    target: number;
    endsAt: Date;
  };
}

interface CrewWidgetProps {
  crew: Crew | null;
}

const statusConfig = {
  online: { color: 'bg-green-500', text: 'Online' },
  offline: { color: 'bg-gray-400', text: 'Offline' },
  away: { color: 'bg-yellow-500', text: 'Away' },
};

const roleConfig = {
  leader: { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  member: { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  new: { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' },
};

export function CrewWidget({ crew }: CrewWidgetProps) {
  const t = useTranslations('dashboard.crew');

  if (!crew) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">{t('noCrew')}</p>
            <div className="space-y-2">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {t('createCrew')}
              </Button>
              <Button variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                {t('joinCrew')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weeklyGoalProgress = (crew.weeklyProgress / crew.weeklyGoal) * 100;
  const challengeProgress = crew.currentChallenge 
    ? (crew.currentChallenge.progress / crew.currentChallenge.target) * 100 
    : 0;

  const sortedMembers = crew.members.sort((a, b) => {
    if (a.role === 'leader') return -1;
    if (b.role === 'leader') return 1;
    return b.weeklyContribution - a.weeklyContribution;
  });

  const daysUntilChallenge = crew.currentChallenge 
    ? Math.ceil((crew.currentChallenge.endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            {t('title')}
          </div>
          <Badge variant="outline">
            #{crew.rank}
          </Badge>
        </CardTitle>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{crew.name}</h3>
          <Button size="sm" variant="ghost">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{crew.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Crew Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {crew.members.length}/{crew.maxMembers}
            </div>
            <p className="text-xs text-muted-foreground">{t('members')}</p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {crew.totalXp.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('totalXp')}</p>
          </div>
        </div>

        {/* Weekly Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{t('weeklyGoal')}</h4>
            <span className="text-sm text-muted-foreground">
              {crew.weeklyProgress}/{crew.weeklyGoal}
            </span>
          </div>
          <Progress value={weeklyGoalProgress} className="h-2" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>{Math.round(weeklyGoalProgress)}% {t('complete')}</span>
          </div>
        </div>

        {/* Current Challenge */}
        {crew.currentChallenge && (
          <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-500" />
                <h4 className="font-medium text-sm">{crew.currentChallenge.name}</h4>
              </div>
              <Badge variant="outline" className="text-xs">
                {daysUntilChallenge}d {t('left')}
              </Badge>
            </div>
            <Progress value={challengeProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {crew.currentChallenge.progress}/{crew.currentChallenge.target} {t('completed')}
            </p>
          </div>
        )}

        {/* Top Members */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{t('activeMembers')}</h4>
          <div className="space-y-2">
            {sortedMembers.slice(0, 4).map((member) => {
              const roleInfo = roleConfig[member.role];
              const RoleIcon = roleInfo.icon;
              const statusInfo = statusConfig[member.status];
              
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div 
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                        statusInfo.color
                      )} 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <div className={cn('p-1 rounded-full', roleInfo.bg)}>
                        <RoleIcon className={cn('h-3 w-3', roleInfo.color)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{t('level')} {member.level}</span>
                      <span>•</span>
                      <span>{member.weeklyContribution} {t('xpThisWeek')}</span>
                      {member.streakDays > 0 && (
                        <>
                          <span>•</span>
                          <span>{member.streakDays}d {t('streak')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {crew.members.length > 4 && (
              <Button size="sm" variant="outline" className="w-full">
                {t('viewAllMembers')} ({crew.members.length - 4} {t('more')})
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Recent Achievements */}
        {crew.achievements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('recentAchievements')}</h4>
            <div className="flex flex-wrap gap-2">
              {crew.achievements.slice(0, 3).map((achievement) => (
                <Badge key={achievement} variant="secondary" className="text-xs">
                  <Trophy className="h-3 w-3 mr-1 text-yellow-500" />
                  {achievement}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('chat')}
          </Button>
          <Button size="sm">
            <Target className="h-4 w-4 mr-2" />
            {t('viewCrew')}
          </Button>
        </div>

        {/* Membership Info */}
        <div className="text-center p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            {t('memberSince')} {crew.joinedDate.toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
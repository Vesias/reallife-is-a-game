'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useCrew } from '@/hooks/use-crew';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Crown, 
  Star, 
  Target, 
  Trophy,
  Calendar,
  MoreVertical,
  Shield,
  UserMinus,
  MessageCircle,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import type { CrewMember } from '@/types';

interface MemberListProps {
  members: CrewMember[];
  isLeader: boolean;
  crewId: string;
}

export function MemberList({ members, isLeader, crewId }: MemberListProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { removeMemberFromCrew, promoteMember } = useCrew();
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'xp' | 'joined'>('level');

  const sortedMembers = [...members].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'level':
        return (b.stats?.level || 1) - (a.stats?.level || 1);
      case 'xp':
        return (b.stats?.totalXP || 0) - (a.stats?.totalXP || 0);
      case 'joined':
        return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
      default:
        return 0;
    }
  });

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(t('Are you sure you want to remove {{name}} from the crew?', { name: memberName }))) {
      return;
    }

    try {
      await removeMemberFromCrew(crewId, memberId);
      toast.success(t('Member removed successfully'));
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(t('Failed to remove member'));
    }
  };

  const handlePromoteMember = async (memberId: string, memberName: string) => {
    if (!confirm(t('Are you sure you want to make {{name}} a co-leader?', { name: memberName }))) {
      return;
    }

    try {
      await promoteMember(crewId, memberId);
      toast.success(t('Member promoted successfully'));
    } catch (error) {
      console.error('Error promoting member:', error);
      toast.error(t('Failed to promote member'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityStatus = (lastActive: string) => {
    if (!lastActive) return { status: 'unknown', color: 'bg-gray-400' };
    
    const lastActiveDate = new Date(lastActive);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return { status: 'online', color: 'bg-green-500' };
    if (diffHours < 24) return { status: 'recent', color: 'bg-yellow-500' };
    if (diffHours < 168) return { status: 'weekly', color: 'bg-orange-500' };
    return { status: 'inactive', color: 'bg-gray-400' };
  };

  const calculateLevelProgress = (xp: number) => {
    const level = Math.floor(xp / 1000) + 1;
    const progressInLevel = (xp % 1000) / 1000 * 100;
    return { level, progressInLevel };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('Crew Members')} ({members.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy(sortBy === 'level' ? 'xp' : 'level')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {sortBy === 'level' ? t('By Level') : t('By XP')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMembers.map((member) => {
            const isCurrentUser = member.userId === user?.id;
            const activityStatus = getActivityStatus(member.lastActive);
            const { level, progressInLevel } = calculateLevelProgress(member.stats?.totalXP || 0);

            return (
              <div
                key={member.userId}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                {/* Avatar with status indicator */}
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div 
                    className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${activityStatus.color}`}
                    title={t(`Status: ${activityStatus.status}`)}
                  />
                </div>

                {/* Member info */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">
                      {member.name || t('Anonymous')}
                      {isCurrentUser && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({t('You')})
                        </span>
                      )}
                    </h4>
                    {member.role === 'leader' && (
                      <Badge variant="outline" className="gap-1">
                        <Crown className="h-3 w-3" />
                        {t('Leader')}
                      </Badge>
                    )}
                    {member.role === 'co-leader' && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {t('Co-Leader')}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {t('Level')} {level}
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      {(member.stats?.totalXP || 0).toLocaleString()} XP
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {member.stats?.completedQuests || 0} {t('quests')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t('Joined')} {formatDate(member.joinedAt)}
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="space-y-1">
                    <Progress value={progressInLevel} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{((level - 1) * 1000).toLocaleString()}</span>
                      <span>{(member.stats?.totalXP || 0).toLocaleString()} XP</span>
                      <span>{(level * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Member actions */}
                <div className="flex items-center gap-2">
                  {/* Quick Stats */}
                  <div className="text-center px-3 py-2 bg-muted/30 rounded-lg">
                    <div className="text-lg font-bold">{member.contribution || 0}%</div>
                    <div className="text-xs text-muted-foreground">{t('Contribution')}</div>
                  </div>

                  {/* Actions menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {t('Send Message')}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trophy className="h-4 w-4 mr-2" />
                        {t('View Profile')}
                      </DropdownMenuItem>

                      {/* Leader actions */}
                      {isLeader && !isCurrentUser && member.role !== 'leader' && (
                        <>
                          <DropdownMenuSeparator />
                          {member.role !== 'co-leader' && (
                            <DropdownMenuItem 
                              onClick={() => handlePromoteMember(member.userId, member.name || 'Member')}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {t('Promote to Co-Leader')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member.userId, member.name || 'Member')}
                            className="text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            {t('Remove from Crew')}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p>{t('No members found')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
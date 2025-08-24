'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useCrew } from '@/hooks/use-crew';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Crown, 
  Lock, 
  Globe, 
  Target, 
  Trophy,
  Clock,
  MoreVertical
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { Crew } from '@/types';

interface CrewCardProps {
  crew: Crew;
  showJoinButton?: boolean;
  onJoin?: (crewId: string) => void;
  onLeave?: (crewId: string) => void;
}

export function CrewCard({ 
  crew, 
  showJoinButton = false, 
  onJoin, 
  onLeave 
}: CrewCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { joinCrew, leaveCrew, loading } = useCrew();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const isLeader = crew.leaderId === user?.id;
  const isMember = crew.memberIds?.includes(user?.id || '');
  const canJoin = !isMember && (crew.memberCount || 0) < (crew.maxMembers || 5);

  const getCrewTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fitness: '💪',
      productivity: '⚡',
      learning: '📚',
      creative: '🎨',
      social: '🌍',
      general: '🎯'
    };
    return icons[type] || '🎯';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('Just now');
    if (diffInHours < 24) return t('{{hours}}h ago', { hours: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('{{days}}d ago', { days: diffInDays });
    
    return date.toLocaleDateString();
  };

  const handleJoin = async () => {
    if (!user || !canJoin) return;
    
    setIsJoining(true);
    try {
      await joinCrew(crew.id, user.id);
      toast.success(t('Successfully joined crew!'));
      onJoin?.(crew.id);
    } catch (error) {
      console.error('Error joining crew:', error);
      toast.error(t('Failed to join crew'));
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !isMember) return;
    
    try {
      await leaveCrew(crew.id, user.id);
      toast.success(t('Left crew successfully'));
      onLeave?.(crew.id);
    } catch (error) {
      console.error('Error leaving crew:', error);
      toast.error(t('Failed to leave crew'));
    }
  };

  const handleViewCrew = () => {
    router.push(`/crew/${crew.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{getCrewTypeIcon(crew.type || 'general')}</div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {crew.name}
                </h3>
                {crew.isPrivate ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Globe className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {crew.description || t('No description available')}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewCrew}>
                <Users className="h-4 w-4 mr-2" />
                {t('View Details')}
              </DropdownMenuItem>
              {isMember && !isLeader && (
                <DropdownMenuItem onClick={handleLeave} className="text-destructive">
                  <Users className="h-4 w-4 mr-2" />
                  {t('Leave Crew')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2">
          {isLeader && (
            <Badge variant="outline" className="gap-1">
              <Crown className="h-3 w-3" />
              {t('Leader')}
            </Badge>
          )}
          {isMember && !isLeader && (
            <Badge variant="secondary">
              {t('Member')}
            </Badge>
          )}
          {crew.tags?.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {crew.memberCount || 0}/{crew.maxMembers || 5}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{t('Members')}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{crew.activeQuests || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t('Quests')}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{crew.totalXP || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">{t('XP')}</p>
          </div>
        </div>

        {/* Member Avatars */}
        {crew.memberIds && crew.memberIds.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {crew.memberIds.slice(0, 4).map((memberId, index) => (
                <Avatar key={memberId} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {(memberId.charAt(0) + memberId.charAt(1)).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {crew.memberIds.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs font-medium">+{crew.memberIds.length - 4}</span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground ml-2">
              {t('Active members')}
            </span>
          </div>
        )}

        {/* Activity Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{t('Updated')} {formatTimeAgo(crew.updatedAt || crew.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${
              crew.lastActivity && 
              new Date(crew.lastActivity).getTime() > Date.now() - 24 * 60 * 60 * 1000
                ? 'bg-green-500'
                : 'bg-gray-400'
            }`} />
            <span>{t('Level')} {Math.floor((crew.totalXP || 0) / 1000) + 1}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            onClick={handleViewCrew}
            className="flex-1"
          >
            {t('View')}
          </Button>
          
          {showJoinButton && canJoin && (
            <Button
              onClick={handleJoin}
              disabled={isJoining}
              className="flex-1"
            >
              {isJoining ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                t('Join')
              )}
            </Button>
          )}
          
          {isMember && (
            <Button
              onClick={handleViewCrew}
              className="flex-1"
            >
              {t('Open')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/hooks/use-auth';
import { useCrew } from '@/hooks/use-crew';
import { CrewDashboard } from '@/components/crew/crew-dashboard';
import { MemberList } from '@/components/crew/member-list';
import { SharedQuest } from '@/components/crew/shared-quest';
import { ActivityFeed } from '@/components/crew/activity-feed';
import { InviteModal } from '@/components/crew/invite-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Trophy, 
  Settings, 
  UserPlus, 
  Crown,
  MessageCircle,
  Activity
} from 'lucide-react';

export default function CrewDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { 
    currentCrew, 
    loadCrew, 
    crewMembers, 
    crewQuests, 
    crewActivity,
    loading 
  } = useCrew();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadCrew(id as string);
    }
  }, [id, loadCrew]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentCrew) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{t('Crew not found')}</h2>
          <p className="text-muted-foreground">{t('This crew may not exist or you don\'t have access')}</p>
        </div>
      </div>
    );
  }

  const isLeader = currentCrew.leaderId === user?.id;
  const isMember = crewMembers?.some(member => member.userId === user?.id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{currentCrew.name}</h1>
            {isLeader && (
              <Badge variant="outline" className="gap-1">
                <Crown className="h-3 w-3" />
                {t('Leader')}
              </Badge>
            )}
            <Badge variant="secondary">
              {crewMembers?.length || 0}/{currentCrew.maxMembers || 5}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {currentCrew.description || t('No description available')}
          </p>
        </div>
        
        <div className="flex gap-2">
          {isLeader && (
            <Button
              onClick={() => setShowInviteModal(true)}
              variant="outline"
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {t('Invite Member')}
            </Button>
          )}
          {isLeader && (
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              {t('Settings')}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{t('Members')}</span>
          </div>
          <div className="text-2xl font-bold">{crewMembers?.length || 0}</div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">{t('Active Quests')}</span>
          </div>
          <div className="text-2xl font-bold">{crewQuests?.length || 0}</div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">{t('Collective XP')}</span>
          </div>
          <div className="text-2xl font-bold">{currentCrew.totalXP || 0}</div>
        </div>
        
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">{t('Level')}</span>
          </div>
          <div className="text-2xl font-bold">{Math.floor((currentCrew.totalXP || 0) / 1000) + 1}</div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Users className="h-4 w-4" />
            {t('Overview')}
          </TabsTrigger>
          <TabsTrigger value="quests" className="gap-2">
            <Target className="h-4 w-4" />
            {t('Quests')}
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            {t('Activity')}
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            {t('Chat')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CrewDashboard crew={currentCrew} members={crewMembers || []} />
          <MemberList 
            members={crewMembers || []} 
            isLeader={isLeader}
            crewId={currentCrew.id}
          />
        </TabsContent>

        <TabsContent value="quests" className="space-y-6">
          <div className="grid gap-4">
            {crewQuests && crewQuests.length > 0 ? (
              crewQuests.map((quest) => (
                <SharedQuest key={quest.id} quest={quest} members={crewMembers || []} />
              ))
            ) : (
              <div className="text-center py-8 bg-card rounded-lg border">
                <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">{t('No shared quests')}</h3>
                <p className="text-muted-foreground">
                  {t('Create or assign quests to collaborate with your crew')}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityFeed activities={crewActivity || []} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <div className="bg-card rounded-lg border p-8 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">{t('Chat Coming Soon')}</h3>
            <p className="text-muted-foreground">
              {t('Real-time chat functionality will be available in the next update')}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          crewId={currentCrew.id}
          crewName={currentCrew.name}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  );
}
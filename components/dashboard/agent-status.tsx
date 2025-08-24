'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Heart, 
  Brain, 
  Zap, 
  MessageCircle, 
  Settings,
  Battery,
  Wifi,
  Clock
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  personality: string;
  mood: 'happy' | 'neutral' | 'focused' | 'excited' | 'tired';
  energy: number;
  intelligence: number;
  experience: number;
  status: 'active' | 'idle' | 'working' | 'offline';
  currentTask?: string;
  lastActive: Date;
  traits: string[];
  level: number;
  responses: number;
  helpfulness: number;
}

interface AgentStatusProps {
  agent: Agent;
}

const moodConfig = {
  happy: { color: 'text-green-500', bg: 'bg-green-500/10', emoji: '😊' },
  neutral: { color: 'text-gray-500', bg: 'bg-gray-500/10', emoji: '😐' },
  focused: { color: 'text-blue-500', bg: 'bg-blue-500/10', emoji: '🤔' },
  excited: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', emoji: '🤗' },
  tired: { color: 'text-purple-500', bg: 'bg-purple-500/10', emoji: '😴' },
};

const statusConfig = {
  active: { color: 'text-green-500', bg: 'bg-green-500', text: 'Online' },
  idle: { color: 'text-yellow-500', bg: 'bg-yellow-500', text: 'Idle' },
  working: { color: 'text-blue-500', bg: 'bg-blue-500', text: 'Working' },
  offline: { color: 'text-gray-500', bg: 'bg-gray-500', text: 'Offline' },
};

export function AgentStatus({ agent }: AgentStatusProps) {
  const t = useTranslations('dashboard.agent');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const moodStyle = moodConfig[agent.mood];
  const statusStyle = statusConfig[agent.status];
  const lastActiveMinutes = Math.floor(
    (currentTime.getTime() - agent.lastActive.getTime()) / 60000
  );

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-500" />
            {t('title')}
          </div>
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                'w-2 h-2 rounded-full',
                statusStyle.bg
              )}
            />
            <Badge variant="outline" className={statusStyle.color}>
              {statusStyle.text}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Agent Profile */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {agent.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div 
              className={cn(
                'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center text-xs',
                moodStyle.bg
              )}
            >
              {moodStyle.emoji}
            </div>
          </div>
          
          <div className="flex-1 space-y-2">
            <div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-sm text-muted-foreground">{agent.personality}</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lastActiveMinutes === 0 ? t('justNow') : t('minutesAgo', { minutes: lastActiveMinutes })}
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4" />
                {t('level')} {agent.level}
              </div>
            </div>
            
            {agent.currentTask && (
              <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {agent.currentTask}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className={cn('p-3 rounded-full mx-auto w-fit', 'bg-red-500/10')}>
              <Heart className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{agent.energy}%</div>
              <p className="text-xs text-muted-foreground">{t('energy')}</p>
              <Progress value={agent.energy} className="h-1 mt-1" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className={cn('p-3 rounded-full mx-auto w-fit', 'bg-purple-500/10')}>
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{agent.intelligence}%</div>
              <p className="text-xs text-muted-foreground">{t('intelligence')}</p>
              <Progress value={agent.intelligence} className="h-1 mt-1" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <div className={cn('p-3 rounded-full mx-auto w-fit', 'bg-green-500/10')}>
              <Battery className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{agent.experience}%</div>
              <p className="text-xs text-muted-foreground">{t('experience')}</p>
              <Progress value={agent.experience} className="h-1 mt-1" />
            </div>
          </div>
        </div>

        {/* Agent Traits */}
        <div>
          <h4 className="font-medium mb-2">{t('traits')}</h4>
          <div className="flex flex-wrap gap-2">
            {agent.traits.map((trait) => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        {/* Agent Performance */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-500">
              {agent.responses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{t('responses')}</p>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-500">
              {agent.helpfulness}%
            </div>
            <p className="text-xs text-muted-foreground">{t('helpfulness')}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('chat')}
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
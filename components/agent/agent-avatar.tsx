"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User, Sparkles, Circle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  agent: any;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-20 h-20'
};

const iconSizes = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6', 
  large: 'w-10 h-10'
};

export function AgentAvatar({ 
  agent, 
  size = 'medium', 
  className 
}: AgentAvatarProps) {
  const avatarContent = useMemo(() => {
    const style = agent?.avatarStyle || 'robot';
    const personality = agent?.personality || [];
    
    // Generate colors based on personality
    const getPersonalityColor = () => {
      if (personality.includes('creative')) return 'bg-purple-500';
      if (personality.includes('friendly')) return 'bg-green-500';
      if (personality.includes('professional')) return 'bg-blue-500';
      if (personality.includes('energetic')) return 'bg-orange-500';
      if (personality.includes('analytical')) return 'bg-gray-500';
      if (personality.includes('supportive')) return 'bg-pink-500';
      return 'bg-blue-500'; // default
    };
    
    const getIcon = () => {
      switch (style) {
        case 'robot':
          return Bot;
        case 'human':
          return User;
        case 'abstract':
          return Circle;
        case 'cute':
          return Heart;
        default:
          return Bot;
      }
    };
    
    const Icon = getIcon();
    const bgColor = getPersonalityColor();
    
    return {
      Icon,
      bgColor,
      initials: agent?.name ? agent.name.substring(0, 2).toUpperCase() : 'AI'
    };
  }, [agent]);
  
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className={`${avatarContent.bgColor} text-white`}>
        {agent?.name && size === 'large' ? (
          <div className="text-center">
            <avatarContent.Icon className={iconSizes[size]} />
            <div className="text-xs mt-1 font-medium">
              {avatarContent.initials}
            </div>
          </div>
        ) : (
          <avatarContent.Icon className={iconSizes[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
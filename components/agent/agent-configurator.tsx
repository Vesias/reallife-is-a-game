"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AgentAvatar } from "./agent-avatar";
import { Bot, Sparkles, Brain, Heart, Zap } from "lucide-react";

interface AgentConfiguratorProps {
  agent: any;
  onUpdate: (updates: any) => void;
  language: 'de' | 'en';
}

const personalityTraits = {
  de: [
    { id: 'friendly', name: 'Freundlich', description: 'Warm und einladend' },
    { id: 'professional', name: 'Professionell', description: 'Formell und sachlich' },
    { id: 'creative', name: 'Kreativ', description: 'Ideenreich und inspirierend' },
    { id: 'analytical', name: 'Analytisch', description: 'Logisch und faktenbasiert' },
    { id: 'supportive', name: 'Unterstützend', description: 'Hilfsbereit und ermutigend' },
    { id: 'energetic', name: 'Energisch', description: 'Dynamisch und motivierend' }
  ],
  en: [
    { id: 'friendly', name: 'Friendly', description: 'Warm and welcoming' },
    { id: 'professional', name: 'Professional', description: 'Formal and business-like' },
    { id: 'creative', name: 'Creative', description: 'Imaginative and inspiring' },
    { id: 'analytical', name: 'Analytical', description: 'Logical and fact-based' },
    { id: 'supportive', name: 'Supportive', description: 'Helpful and encouraging' },
    { id: 'energetic', name: 'Energetic', description: 'Dynamic and motivating' }
  ]
};

const avatarStyles = {
  de: [
    { id: 'robot', name: 'Roboter', description: 'Klassisches Roboter-Design' },
    { id: 'human', name: 'Humanoid', description: 'Menschlichähnlich' },
    { id: 'abstract', name: 'Abstrakt', description: 'Geometrische Formen' },
    { id: 'cute', name: 'Süß', description: 'Freundlich und niedlich' }
  ],
  en: [
    { id: 'robot', name: 'Robot', description: 'Classic robot design' },
    { id: 'human', name: 'Humanoid', description: 'Human-like appearance' },
    { id: 'abstract', name: 'Abstract', description: 'Geometric shapes' },
    { id: 'cute', name: 'Cute', description: 'Friendly and adorable' }
  ]
};

const content = {
  de: {
    basicSettings: 'Grundeinstellungen',
    agentName: 'Agent Name',
    agentNamePlaceholder: 'Gib deinem Agenten einen Namen...',
    personality: 'Persönlichkeit',
    personalitySubtitle: 'Wähle bis zu 3 Eigenschaften',
    appearance: 'Erscheinungsbild',
    avatarStyle: 'Avatar-Stil',
    behavior: 'Verhalten',
    formality: 'Förmlichkeit',
    formalityLevels: ['Sehr locker', 'Locker', 'Neutral', 'Formal', 'Sehr formal'],
    helpfulness: 'Hilfsbereitschaft',
    helpfulnessLevels: ['Zurückhaltend', 'Etwas zurückhaltend', 'Ausgewogen', 'Hilfsbereit', 'Sehr hilfsbereit'],
    proactivity: 'Proaktivität',
    proactivityLevels: ['Passiv', 'Reaktiv', 'Ausgewogen', 'Proaktiv', 'Sehr proaktiv'],
    expertise: 'Fachgebiete',
    preview: 'Vorschau',
    selectedTraits: 'Ausgewählte Eigenschaften'
  },
  en: {
    basicSettings: 'Basic Settings',
    agentName: 'Agent Name',
    agentNamePlaceholder: 'Give your agent a name...',
    personality: 'Personality',
    personalitySubtitle: 'Choose up to 3 traits',
    appearance: 'Appearance',
    avatarStyle: 'Avatar Style',
    behavior: 'Behavior',
    formality: 'Formality',
    formalityLevels: ['Very casual', 'Casual', 'Neutral', 'Formal', 'Very formal'],
    helpfulness: 'Helpfulness',
    helpfulnessLevels: ['Reserved', 'Somewhat reserved', 'Balanced', 'Helpful', 'Very helpful'],
    proactivity: 'Proactivity',
    proactivityLevels: ['Passive', 'Reactive', 'Balanced', 'Proactive', 'Very proactive'],
    expertise: 'Areas of Expertise',
    preview: 'Preview',
    selectedTraits: 'Selected Traits'
  }
};

export function AgentConfigurator({ 
  agent, 
  onUpdate, 
  language 
}: AgentConfiguratorProps) {
  const t = content[language];
  const traits = personalityTraits[language];
  const avatars = avatarStyles[language];
  
  const handleTraitToggle = (traitId: string) => {
    const currentTraits = agent.personality || [];
    const isSelected = currentTraits.includes(traitId);
    
    if (isSelected) {
      onUpdate({
        personality: currentTraits.filter((id: string) => id !== traitId)
      });
    } else if (currentTraits.length < 3) {
      onUpdate({
        personality: [...currentTraits, traitId]
      });
    }
  };
  
  const handleSliderChange = (field: string, value: number[]) => {
    onUpdate({ [field]: value[0] });
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Panel */}
      <div className="lg:col-span-2 space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {t.basicSettings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="agentName">{t.agentName}</Label>
              <Input
                id="agentName"
                value={agent.name || ''}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder={t.agentNamePlaceholder}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Personality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {t.personality}
            </CardTitle>
            <p className="text-sm text-gray-600">{t.personalitySubtitle}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {traits.map((trait) => {
                const isSelected = agent.personality?.includes(trait.id);
                const isMaxSelected = agent.personality?.length >= 3 && !isSelected;
                
                return (
                  <Button
                    key={trait.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-auto p-3 text-left justify-start ${
                      isMaxSelected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={() => !isMaxSelected && handleTraitToggle(trait.id)}
                    disabled={isMaxSelected}
                  >
                    <div>
                      <div className="font-medium">{trait.name}</div>
                      <div className="text-xs opacity-75">{trait.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
            
            {agent.personality?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {t.selectedTraits}:
                </p>
                <div className="flex flex-wrap gap-1">
                  {agent.personality.map((traitId: string) => {
                    const trait = traits.find(t => t.id === traitId);
                    return trait ? (
                      <Badge key={traitId} variant="secondary">
                        {trait.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {t.appearance}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label>{t.avatarStyle}</Label>
              <Select 
                value={agent.avatarStyle || 'robot'} 
                onValueChange={(value) => onUpdate({ avatarStyle: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatars.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Behavior */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              {t.behavior}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Formality */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>{t.formality}</Label>
                <span className="text-sm text-gray-500">
                  {t.formalityLevels[agent.formality || 2]}
                </span>
              </div>
              <Slider
                value={[agent.formality || 2]}
                onValueChange={(value) => handleSliderChange('formality', value)}
                max={4}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Helpfulness */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>{t.helpfulness}</Label>
                <span className="text-sm text-gray-500">
                  {t.helpfulnessLevels[agent.helpfulness || 3]}
                </span>
              </div>
              <Slider
                value={[agent.helpfulness || 3]}
                onValueChange={(value) => handleSliderChange('helpfulness', value)}
                max={4}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Proactivity */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>{t.proactivity}</Label>
                <span className="text-sm text-gray-500">
                  {t.proactivityLevels[agent.proactivity || 2]}
                </span>
              </div>
              <Slider
                value={[agent.proactivity || 2]}
                onValueChange={(value) => handleSliderChange('proactivity', value)}
                max={4}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Preview Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t.preview}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <AgentAvatar agent={agent} size="large" />
            
            <div>
              <h3 className="font-semibold text-lg">
                {agent.name || (language === 'de' ? 'Dein Agent' : 'Your Agent')}
              </h3>
              
              {agent.personality?.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {agent.personality.slice(0, 2).map((traitId: string) => {
                    const trait = traits.find(t => t.id === traitId);
                    return trait ? (
                      <Badge key={traitId} variant="outline" className="text-xs">
                        {trait.name}
                      </Badge>
                    ) : null;
                  })}
                  {agent.personality.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.personality.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Behavior Indicators */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.formality}:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= (agent.formality || 2) ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.helpfulness}:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= (agent.helpfulness || 3) ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t.proactivity}:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i <= (agent.proactivity || 2) ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
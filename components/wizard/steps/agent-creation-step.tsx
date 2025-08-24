"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { AgentConfigurator } from "@/components/agent/agent-configurator";
import { AgentAvatar } from "@/components/agent/agent-avatar";
import { Bot, Sparkles, Brain, Heart } from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface AgentCreationStepProps {
  language: 'de' | 'en';
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const personalityTraits = {
  de: [
    { id: 'supportive', name: 'Unterstützend', description: 'Hilfsbereit und ermutigend' },
    { id: 'analytical', name: 'Analytisch', description: 'Faktenbasiert und logisch' },
    { id: 'creative', name: 'Kreativ', description: 'Ideenreich und inspirierend' },
    { id: 'practical', name: 'Praktisch', description: 'Lösungsorientiert und pragmatisch' },
    { id: 'empathetic', name: 'Empathisch', description: 'Verständnisvoll und mitfühlend' },
    { id: 'motivational', name: 'Motivierend', description: 'Ermutigend und antreibend' },
    { id: 'patient', name: 'Geduldig', description: 'Ruhig und ausdauernd' },
    { id: 'energetic', name: 'Energisch', description: 'Dynamisch und begeisternd' }
  ],
  en: [
    { id: 'supportive', name: 'Supportive', description: 'Helpful and encouraging' },
    { id: 'analytical', name: 'Analytical', description: 'Fact-based and logical' },
    { id: 'creative', name: 'Creative', description: 'Imaginative and inspiring' },
    { id: 'practical', name: 'Practical', description: 'Solution-oriented and pragmatic' },
    { id: 'empathetic', name: 'Empathetic', description: 'Understanding and compassionate' },
    { id: 'motivational', name: 'Motivational', description: 'Encouraging and driving' },
    { id: 'patient', name: 'Patient', description: 'Calm and persistent' },
    { id: 'energetic', name: 'Energetic', description: 'Dynamic and enthusiastic' }
  ]
};

const communicationStyles = {
  de: [
    { id: 'formal', name: 'Formal', description: 'Professionell und respektvoll' },
    { id: 'casual', name: 'Locker', description: 'Freundlich und entspannt' },
    { id: 'encouraging', name: 'Ermutigend', description: 'Positiv und aufbauend' },
    { id: 'direct', name: 'Direkt', description: 'Klar und geradlinig' },
    { id: 'thoughtful', name: 'Nachdenklich', description: 'Bedacht und überlegt' }
  ],
  en: [
    { id: 'formal', name: 'Formal', description: 'Professional and respectful' },
    { id: 'casual', name: 'Casual', description: 'Friendly and relaxed' },
    { id: 'encouraging', name: 'Encouraging', description: 'Positive and uplifting' },
    { id: 'direct', name: 'Direct', description: 'Clear and straightforward' },
    { id: 'thoughtful', name: 'Thoughtful', description: 'Considerate and deliberate' }
  ]
};

const content = {
  de: {
    title: "Erstelle deinen digitalen Assistenten",
    subtitle: "Gestalte einen KI-Assistenten, der perfekt zu dir und deinen Zielen passt",
    agentName: "Name des Assistenten",
    agentNamePlaceholder: "Wie soll dein Assistent heißen?",
    personality: "Persönlichkeit",
    personalitySubtitle: "Wähle bis zu 3 Eigenschaften",
    communicationStyle: "Kommunikationsstil",
    expertise: "Fachgebiete",
    expertiseSubtitle: "Basierend auf deinen ausgewählten Fähigkeiten",
    customization: "Anpassungen",
    formality: "Förmlichkeit",
    formalityLevels: ['Sehr locker', 'Locker', 'Neutral', 'Formal', 'Sehr formal'],
    helpfulness: "Hilfsbereitschaft",
    helpfulnessLevels: ['Zurückhaltend', 'Zurückhaltend', 'Ausgewogen', 'Hilfsbereit', 'Sehr hilfsbereit'],
    proactivity: "Proaktivität",
    proactivityLevels: ['Passiv', 'Reaktiv', 'Ausgewogen', 'Proaktiv', 'Sehr proaktiv'],
    preview: "Vorschau",
    testMessage: "Teste deinen Assistenten",
    testMessagePlaceholder: "Schreibe eine Nachricht, um zu sehen, wie dein Assistent antwortet...",
    send: "Senden",
    selectedTraits: "Ausgewählte Eigenschaften"
  },
  en: {
    title: "Create your digital assistant",
    subtitle: "Design an AI assistant that perfectly fits you and your goals",
    agentName: "Assistant Name",
    agentNamePlaceholder: "What should your assistant be called?",
    personality: "Personality",
    personalitySubtitle: "Choose up to 3 traits",
    communicationStyle: "Communication Style",
    expertise: "Areas of Expertise",
    expertiseSubtitle: "Based on your selected skills",
    customization: "Customization",
    formality: "Formality",
    formalityLevels: ['Very casual', 'Casual', 'Neutral', 'Formal', 'Very formal'],
    helpfulness: "Helpfulness",
    helpfulnessLevels: ['Reserved', 'Reserved', 'Balanced', 'Helpful', 'Very helpful'],
    proactivity: "Proactivity",
    proactivityLevels: ['Passive', 'Reactive', 'Balanced', 'Proactive', 'Very proactive'],
    preview: "Preview",
    testMessage: "Test your assistant",
    testMessagePlaceholder: "Write a message to see how your assistant would respond...",
    send: "Send",
    selectedTraits: "Selected Traits"
  }
};

export function AgentCreationStep({
  language,
  data,
  onUpdate
}: AgentCreationStepProps) {
  const t = content[language];
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState('');
  
  const agent = data.agent || {
    name: '',
    personality: [],
    communicationStyle: '',
    formality: 2,
    helpfulness: 3,
    proactivity: 2,
    avatar: 'default'
  };

  const handleAgentUpdate = (field: string, value: any) => {
    onUpdate({
      agent: {
        ...agent,
        [field]: value
      }
    });
  };

  const handlePersonalityToggle = (traitId: string) => {
    const currentTraits = agent.personality || [];
    const isSelected = currentTraits.includes(traitId);
    
    if (isSelected) {
      handleAgentUpdate('personality', currentTraits.filter(id => id !== traitId));
    } else if (currentTraits.length < 3) {
      handleAgentUpdate('personality', [...currentTraits, traitId]);
    }
  };

  const generateTestResponse = () => {
    if (!testMessage.trim()) return;
    
    // Simple response generation based on agent configuration
    const traits = personalityTraits[language].filter(t => agent.personality.includes(t.id));
    const style = communicationStyles[language].find(s => s.id === agent.communicationStyle);
    
    let response = language === 'de' 
      ? `Hallo! Als dein ${agent.name || 'Assistent'} helfe ich dir gerne. `
      : `Hello! As your ${agent.name || 'assistant'}, I'm happy to help you. `;
    
    if (agent.formality >= 3) {
      response = language === 'de'
        ? `Guten Tag! Ich bin ${agent.name || 'Ihr Assistent'} und stehe Ihnen gerne zur Verfügung. `
        : `Good day! I am ${agent.name || 'your assistant'} and I'm here to assist you. `;
    }
    
    setTestResponse(response + (language === 'de' 
      ? 'Wie kann ich Ihnen heute helfen?'
      : 'How can I help you today?'));
  };

  const selectedSkills = data.skills || [];
  const expertiseAreas = [...new Set(selectedSkills.map(skill => skill.category))];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-600">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agentName">{t.agentName} *</Label>
                  <Input
                    id="agentName"
                    placeholder={t.agentNamePlaceholder}
                    value={agent.name || ''}
                    onChange={(e) => handleAgentUpdate('name', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personality Traits */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-1">{t.personality}</h3>
                <p className="text-sm text-gray-600">{t.personalitySubtitle}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {personalityTraits[language].map((trait) => {
                  const isSelected = agent.personality?.includes(trait.id);
                  const isMaxSelected = agent.personality?.length >= 3 && !isSelected;
                  
                  return (
                    <Button
                      key={trait.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`p-3 h-auto text-left justify-start ${
                        isMaxSelected ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => !isMaxSelected && handlePersonalityToggle(trait.id)}
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
                  <p className="text-sm font-medium text-gray-700 mb-2">{t.selectedTraits}:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.personality.map((traitId) => {
                      const trait = personalityTraits[language].find(t => t.id === traitId);
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

          {/* Communication Style */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">{t.communicationStyle}</h3>
              </div>
              
              <Select 
                value={agent.communicationStyle || ''} 
                onValueChange={(value) => handleAgentUpdate('communicationStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.communicationStyle} />
                </SelectTrigger>
                <SelectContent>
                  {communicationStyles[language].map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Expertise Areas */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">{t.expertise}</h3>
                <p className="text-sm text-gray-600">{t.expertiseSubtitle}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {expertiseAreas.length > 0 ? (
                  expertiseAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {area}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    {language === 'de' 
                      ? 'Keine Fähigkeiten ausgewählt'
                      : 'No skills selected'
                    }
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personality Sliders */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-6">{t.customization}</h3>
              
              <div className="space-y-6">
                {/* Formality */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>{t.formality}</Label>
                    <span className="text-sm text-gray-500">
                      {t.formalityLevels[agent.formality]}
                    </span>
                  </div>
                  <Slider
                    value={[agent.formality]}
                    onValueChange={([value]) => handleAgentUpdate('formality', value)}
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
                      {t.helpfulnessLevels[agent.helpfulness]}
                    </span>
                  </div>
                  <Slider
                    value={[agent.helpfulness]}
                    onValueChange={([value]) => handleAgentUpdate('helpfulness', value)}
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
                      {t.proactivityLevels[agent.proactivity]}
                    </span>
                  </div>
                  <Slider
                    value={[agent.proactivity]}
                    onValueChange={([value]) => handleAgentUpdate('proactivity', value)}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          {/* Avatar */}
          <Card>
            <CardContent className="pt-6 text-center">
              <AgentAvatar 
                agent={agent}
                size="large"
              />
              <h3 className="font-semibold mt-4">
                {agent.name || (language === 'de' ? 'Dein Assistent' : 'Your Assistant')}
              </h3>
            </CardContent>
          </Card>

          {/* Test Interface */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t.testMessage}</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder={t.testMessagePlaceholder}
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={generateTestResponse}
                    disabled={!testMessage.trim()}
                    size="sm"
                    className="w-full"
                  >
                    {t.send}
                  </Button>
                </div>
                
                {testResponse && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm text-blue-900">
                        {testResponse}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
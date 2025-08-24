"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  Target, 
  Lightbulb, 
  Clock, 
  Zap, 
  BookOpen, 
  Globe,
  Award,
  Puzzle,
  Shield,
  Compass
} from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface PropertiesStepProps {
  language: 'de' | 'en';
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const properties = {
  de: [
    {
      id: 'creative',
      name: 'Kreativ',
      description: 'Du denkst außerhalb der Box und findest innovative Lösungen',
      icon: Lightbulb,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    {
      id: 'teamPlayer',
      name: 'Teamplayer',
      description: 'Du arbeitest gerne mit anderen zusammen und schätzt Kollaboration',
      icon: Users,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 'disciplined',
      name: 'Diszipliniert',
      description: 'Du bist strukturiert und hältst dich konsequent an deine Pläne',
      icon: Target,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'empathetic',
      name: 'Empathisch',
      description: 'Du verstehst andere gut und kannst dich in sie hineinversetzen',
      icon: Heart,
      color: 'bg-pink-100 text-pink-700 border-pink-200'
    },
    {
      id: 'timeEfficient',
      name: 'Zeiteffizient',
      description: 'Du nutzt deine Zeit optimal und priorisierst gut',
      icon: Clock,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      id: 'energetic',
      name: 'Energiegeladen',
      description: 'Du gehst mit Begeisterung und Energie an neue Herausforderungen',
      icon: Zap,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      id: 'curious',
      name: 'Neugierig',
      description: 'Du möchtest ständig Neues lernen und entdecken',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    },
    {
      id: 'adaptable',
      name: 'Anpassungsfähig',
      description: 'Du kannst dich schnell an neue Situationen anpassen',
      icon: Globe,
      color: 'bg-teal-100 text-teal-700 border-teal-200'
    },
    {
      id: 'competitive',
      name: 'Wettbewerbsorientiert',
      description: 'Du liebst Herausforderungen und möchtest dich messen',
      icon: Award,
      color: 'bg-red-100 text-red-700 border-red-200'
    },
    {
      id: 'analytical',
      name: 'Analytisch',
      description: 'Du gehst systematisch vor und analysierst Probleme gründlich',
      icon: Puzzle,
      color: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    {
      id: 'reliable',
      name: 'Zuverlässig',
      description: 'Andere können sich auf dich verlassen',
      icon: Shield,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    {
      id: 'visionary',
      name: 'Visionär',
      description: 'Du denkst in großen Zusammenhängen und planst langfristig',
      icon: Compass,
      color: 'bg-violet-100 text-violet-700 border-violet-200'
    }
  ],
  en: [
    {
      id: 'creative',
      name: 'Creative',
      description: 'You think outside the box and find innovative solutions',
      icon: Lightbulb,
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    },
    {
      id: 'teamPlayer',
      name: 'Team Player',
      description: 'You enjoy working with others and value collaboration',
      icon: Users,
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      id: 'disciplined',
      name: 'Disciplined',
      description: 'You are structured and consistently stick to your plans',
      icon: Target,
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      id: 'empathetic',
      name: 'Empathetic',
      description: 'You understand others well and can put yourself in their shoes',
      icon: Heart,
      color: 'bg-pink-100 text-pink-700 border-pink-200'
    },
    {
      id: 'timeEfficient',
      name: 'Time Efficient',
      description: 'You use your time optimally and prioritize well',
      icon: Clock,
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    {
      id: 'energetic',
      name: 'Energetic',
      description: 'You approach new challenges with enthusiasm and energy',
      icon: Zap,
      color: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    {
      id: 'curious',
      name: 'Curious',
      description: 'You constantly want to learn and discover new things',
      icon: BookOpen,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    },
    {
      id: 'adaptable',
      name: 'Adaptable',
      description: 'You can quickly adapt to new situations',
      icon: Globe,
      color: 'bg-teal-100 text-teal-700 border-teal-200'
    },
    {
      id: 'competitive',
      name: 'Competitive',
      description: 'You love challenges and want to compete',
      icon: Award,
      color: 'bg-red-100 text-red-700 border-red-200'
    },
    {
      id: 'analytical',
      name: 'Analytical',
      description: 'You approach systematically and analyze problems thoroughly',
      icon: Puzzle,
      color: 'bg-gray-100 text-gray-700 border-gray-200'
    },
    {
      id: 'reliable',
      name: 'Reliable',
      description: 'Others can depend on you',
      icon: Shield,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-200'
    },
    {
      id: 'visionary',
      name: 'Visionary',
      description: 'You think in big picture terms and plan long-term',
      icon: Compass,
      color: 'bg-violet-100 text-violet-700 border-violet-200'
    }
  ]
};

const content = {
  de: {
    title: "Wähle deine Eigenschaften",
    subtitle: "Welche Eigenschaften beschreiben dich am besten? Wähle 3-5 aus.",
    selectedCount: "Ausgewählt",
    minSelection: "Wähle mindestens 3 Eigenschaften aus",
    maxSelection: "Du kannst maximal 5 Eigenschaften auswählen"
  },
  en: {
    title: "Choose your properties",
    subtitle: "Which properties describe you best? Choose 3-5.",
    selectedCount: "Selected",
    minSelection: "Choose at least 3 properties",
    maxSelection: "You can select maximum 5 properties"
  }
};

export function PropertiesStep({
  language,
  data,
  onUpdate
}: PropertiesStepProps) {
  const t = content[language];
  const propertyList = properties[language];
  const selectedProperties = data.properties || [];

  const handlePropertyToggle = (propertyId: string) => {
    const isSelected = selectedProperties.includes(propertyId);
    
    if (isSelected) {
      // Remove property
      onUpdate({
        properties: selectedProperties.filter(id => id !== propertyId)
      });
    } else {
      // Add property (max 5)
      if (selectedProperties.length < 5) {
        onUpdate({
          properties: [...selectedProperties, propertyId]
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {t.title}
        </h2>
        <p className="text-gray-600 mb-4">
          {t.subtitle}
        </p>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {t.selectedCount}: {selectedProperties.length}/5
          </Badge>
          
          {selectedProperties.length < 3 && (
            <Badge variant="destructive">
              {t.minSelection}
            </Badge>
          )}
          
          {selectedProperties.length === 5 && (
            <Badge className="bg-yellow-500">
              {t.maxSelection}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {propertyList.map((property) => {
          const isSelected = selectedProperties.includes(property.id);
          const isMaxSelected = selectedProperties.length >= 5 && !isSelected;
          const Icon = property.icon;
          
          return (
            <Card 
              key={property.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-200 bg-blue-50' 
                  : isMaxSelected
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-blue-200 hover:shadow-md'
              }`}
              onClick={() => !isMaxSelected && handlePropertyToggle(property.id)}
            >
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {/* Icon */}
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      isSelected ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  {/* Name */}
                  <h3 className={`font-semibold text-lg ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {property.name}
                  </h3>
                  
                  {/* Description */}
                  <p className={`text-sm leading-relaxed ${
                    isSelected ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {property.description}
                  </p>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex justify-center">
                      <Badge className="bg-blue-500">
                        ✓ {language === 'de' ? 'Ausgewählt' : 'Selected'}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Properties Summary */}
      {selectedProperties.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-4">
              {language === 'de' ? 'Deine ausgewählten Eigenschaften:' : 'Your selected properties:'}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {selectedProperties.map((propertyId) => {
                const property = propertyList.find(p => p.id === propertyId);
                if (!property) return null;
                
                return (
                  <Badge
                    key={propertyId}
                    variant="secondary"
                    className="px-3 py-1 bg-blue-100 text-blue-800"
                  >
                    {property.name}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
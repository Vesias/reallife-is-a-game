"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Sparkles, Target, Users } from "lucide-react";
import { WizardData } from "@/hooks/use-wizard";

interface WelcomeStepProps {
  language: 'de' | 'en';
  onLanguageChange: (language: 'de' | 'en') => void;
  data: WizardData;
  onUpdate: (updates: Partial<WizardData>) => void;
}

const content = {
  de: {
    title: "Willkommen bei LifeQuest!",
    subtitle: "Deine Reise zu persönlichem und beruflichem Wachstum beginnt hier",
    description: "LifeQuest ist deine personalisierte Plattform für lebenslanges Lernen und Zielerreichung. Wir helfen dir dabei, deine Fähigkeiten zu entwickeln, Ziele zu setzen und mit deinem digitalen Assistenten erfolgreich zu sein.",
    features: [
      {
        icon: Target,
        title: "Zielorientiert",
        description: "Setze dir klare Ziele und verfolge deinen Fortschritt"
      },
      {
        icon: Sparkles,
        title: "KI-Assistent",
        description: "Dein personalisierter digitaler Agent unterstützt dich"
      },
      {
        icon: Users,
        title: "Community",
        description: "Vernetze dich mit Gleichgesinnten und lerne gemeinsam"
      },
      {
        icon: Globe,
        title: "Vielfältig",
        description: "Entdecke Fähigkeiten aus allen Lebensbereichen"
      }
    ],
    getStarted: "Lass uns beginnen!"
  },
  en: {
    title: "Welcome to LifeQuest!",
    subtitle: "Your journey to personal and professional growth starts here",
    description: "LifeQuest is your personalized platform for lifelong learning and goal achievement. We help you develop skills, set goals, and succeed with your digital assistant.",
    features: [
      {
        icon: Target,
        title: "Goal-Oriented",
        description: "Set clear goals and track your progress"
      },
      {
        icon: Sparkles,
        title: "AI Assistant",
        description: "Your personalized digital agent supports you"
      },
      {
        icon: Users,
        title: "Community",
        description: "Connect with like-minded people and learn together"
      },
      {
        icon: Globe,
        title: "Diverse",
        description: "Discover skills from all areas of life"
      }
    ],
    getStarted: "Let's get started!"
  }
};

export function WelcomeStep({
  language,
  onLanguageChange,
  data,
  onUpdate
}: WelcomeStepProps) {
  const t = content[language];

  return (
    <div className="space-y-8">
      {/* Language Selector */}
      <div className="flex justify-end gap-2">
        <Button
          variant={language === 'de' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('de')}
        >
          Deutsch
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onLanguageChange('en')}
        >
          English
        </Button>
      </div>

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">
          {t.title}
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Description */}
      <div className="bg-blue-50 rounded-lg p-6">
        <p className="text-gray-700 leading-relaxed">
          {t.description}
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {t.features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Beta Badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="px-4 py-2">
          {language === 'de' ? '✨ Beta Version - Exklusiver Zugang' : '✨ Beta Version - Exclusive Access'}
        </Badge>
      </div>
    </div>
  );
}
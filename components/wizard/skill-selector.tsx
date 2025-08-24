"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Code,
  Palette,
  TrendingUp,
  Users,
  Heart,
  Cpu,
  BookOpen,
  Music,
  Globe,
  Target,
  Briefcase,
  Wrench
} from "lucide-react";

interface SkillSelectorProps {
  language: 'de' | 'en';
  searchTerm: string;
  selectedSkills: any[];
  onSkillToggle: (skill: any) => void;
}

const skillCategories = {
  de: {
    technology: {
      name: 'Technologie',
      icon: Code,
      color: 'bg-blue-100 text-blue-700',
      skills: [
        { id: 'web-development', name: 'Webentwicklung', category: 'technology' },
        { id: 'mobile-development', name: 'Mobile Entwicklung', category: 'technology' },
        { id: 'data-science', name: 'Data Science', category: 'technology' },
        { id: 'ai-ml', name: 'Künstliche Intelligenz', category: 'technology' },
        { id: 'cloud-computing', name: 'Cloud Computing', category: 'technology' },
        { id: 'cybersecurity', name: 'Cybersecurity', category: 'technology' },
        { id: 'devops', name: 'DevOps', category: 'technology' },
        { id: 'blockchain', name: 'Blockchain', category: 'technology' },
        { id: 'ui-ux-design', name: 'UI/UX Design', category: 'technology' },
        { id: 'game-development', name: 'Spieleentwicklung', category: 'technology' }
      ]
    },
    creative: {
      name: 'Kreativität',
      icon: Palette,
      color: 'bg-purple-100 text-purple-700',
      skills: [
        { id: 'graphic-design', name: 'Grafikdesign', category: 'creative' },
        { id: 'photography', name: 'Fotografie', category: 'creative' },
        { id: 'video-editing', name: 'Videobearbeitung', category: 'creative' },
        { id: 'writing', name: 'Schreiben', category: 'creative' },
        { id: 'illustration', name: 'Illustration', category: 'creative' },
        { id: 'animation', name: 'Animation', category: 'creative' },
        { id: 'music-production', name: 'Musikproduktion', category: 'creative' },
        { id: 'storytelling', name: 'Storytelling', category: 'creative' },
        { id: 'branding', name: 'Branding', category: 'creative' },
        { id: 'content-creation', name: 'Content Creation', category: 'creative' }
      ]
    },
    business: {
      name: 'Business',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-700',
      skills: [
        { id: 'project-management', name: 'Projektmanagement', category: 'business' },
        { id: 'marketing', name: 'Marketing', category: 'business' },
        { id: 'sales', name: 'Vertrieb', category: 'business' },
        { id: 'entrepreneurship', name: 'Unternehmertum', category: 'business' },
        { id: 'finance', name: 'Finanzen', category: 'business' },
        { id: 'strategy', name: 'Strategie', category: 'business' },
        { id: 'operations', name: 'Operations', category: 'business' },
        { id: 'consulting', name: 'Beratung', category: 'business' },
        { id: 'negotiation', name: 'Verhandlung', category: 'business' },
        { id: 'leadership', name: 'Führung', category: 'business' }
      ]
    },
    communication: {
      name: 'Kommunikation',
      icon: Users,
      color: 'bg-orange-100 text-orange-700',
      skills: [
        { id: 'public-speaking', name: 'Öffentliches Sprechen', category: 'communication' },
        { id: 'presentation', name: 'Präsentation', category: 'communication' },
        { id: 'networking', name: 'Networking', category: 'communication' },
        { id: 'teamwork', name: 'Teamarbeit', category: 'communication' },
        { id: 'conflict-resolution', name: 'Konfliktlösung', category: 'communication' },
        { id: 'coaching', name: 'Coaching', category: 'communication' },
        { id: 'mentoring', name: 'Mentoring', category: 'communication' },
        { id: 'customer-service', name: 'Kundenservice', category: 'communication' },
        { id: 'cultural-awareness', name: 'Kulturelles Bewusstsein', category: 'communication' },
        { id: 'emotional-intelligence', name: 'Emotionale Intelligenz', category: 'communication' }
      ]
    },
    personal: {
      name: 'Persönlich',
      icon: Heart,
      color: 'bg-red-100 text-red-700',
      skills: [
        { id: 'time-management', name: 'Zeitmanagement', category: 'personal' },
        { id: 'productivity', name: 'Produktivität', category: 'personal' },
        { id: 'mindfulness', name: 'Achtsamkeit', category: 'personal' },
        { id: 'stress-management', name: 'Stressmanagement', category: 'personal' },
        { id: 'goal-setting', name: 'Zielsetzung', category: 'personal' },
        { id: 'self-discipline', name: 'Selbstdisziplin', category: 'personal' },
        { id: 'critical-thinking', name: 'Kritisches Denken', category: 'personal' },
        { id: 'problem-solving', name: 'Problemlösung', category: 'personal' },
        { id: 'adaptability', name: 'Anpassungsfähigkeit', category: 'personal' },
        { id: 'resilience', name: 'Resilienz', category: 'personal' }
      ]
    },
    languages: {
      name: 'Sprachen',
      icon: Globe,
      color: 'bg-teal-100 text-teal-700',
      skills: [
        { id: 'english', name: 'Englisch', category: 'languages' },
        { id: 'spanish', name: 'Spanisch', category: 'languages' },
        { id: 'french', name: 'Französisch', category: 'languages' },
        { id: 'german', name: 'Deutsch', category: 'languages' },
        { id: 'chinese', name: 'Chinesisch', category: 'languages' },
        { id: 'japanese', name: 'Japanisch', category: 'languages' },
        { id: 'italian', name: 'Italienisch', category: 'languages' },
        { id: 'portuguese', name: 'Portugiesisch', category: 'languages' },
        { id: 'russian', name: 'Russisch', category: 'languages' },
        { id: 'arabic', name: 'Arabisch', category: 'languages' }
      ]
    }
  },
  en: {
    technology: {
      name: 'Technology',
      icon: Code,
      color: 'bg-blue-100 text-blue-700',
      skills: [
        { id: 'web-development', name: 'Web Development', category: 'technology' },
        { id: 'mobile-development', name: 'Mobile Development', category: 'technology' },
        { id: 'data-science', name: 'Data Science', category: 'technology' },
        { id: 'ai-ml', name: 'Artificial Intelligence', category: 'technology' },
        { id: 'cloud-computing', name: 'Cloud Computing', category: 'technology' },
        { id: 'cybersecurity', name: 'Cybersecurity', category: 'technology' },
        { id: 'devops', name: 'DevOps', category: 'technology' },
        { id: 'blockchain', name: 'Blockchain', category: 'technology' },
        { id: 'ui-ux-design', name: 'UI/UX Design', category: 'technology' },
        { id: 'game-development', name: 'Game Development', category: 'technology' }
      ]
    },
    creative: {
      name: 'Creative',
      icon: Palette,
      color: 'bg-purple-100 text-purple-700',
      skills: [
        { id: 'graphic-design', name: 'Graphic Design', category: 'creative' },
        { id: 'photography', name: 'Photography', category: 'creative' },
        { id: 'video-editing', name: 'Video Editing', category: 'creative' },
        { id: 'writing', name: 'Writing', category: 'creative' },
        { id: 'illustration', name: 'Illustration', category: 'creative' },
        { id: 'animation', name: 'Animation', category: 'creative' },
        { id: 'music-production', name: 'Music Production', category: 'creative' },
        { id: 'storytelling', name: 'Storytelling', category: 'creative' },
        { id: 'branding', name: 'Branding', category: 'creative' },
        { id: 'content-creation', name: 'Content Creation', category: 'creative' }
      ]
    },
    business: {
      name: 'Business',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-700',
      skills: [
        { id: 'project-management', name: 'Project Management', category: 'business' },
        { id: 'marketing', name: 'Marketing', category: 'business' },
        { id: 'sales', name: 'Sales', category: 'business' },
        { id: 'entrepreneurship', name: 'Entrepreneurship', category: 'business' },
        { id: 'finance', name: 'Finance', category: 'business' },
        { id: 'strategy', name: 'Strategy', category: 'business' },
        { id: 'operations', name: 'Operations', category: 'business' },
        { id: 'consulting', name: 'Consulting', category: 'business' },
        { id: 'negotiation', name: 'Negotiation', category: 'business' },
        { id: 'leadership', name: 'Leadership', category: 'business' }
      ]
    },
    communication: {
      name: 'Communication',
      icon: Users,
      color: 'bg-orange-100 text-orange-700',
      skills: [
        { id: 'public-speaking', name: 'Public Speaking', category: 'communication' },
        { id: 'presentation', name: 'Presentation', category: 'communication' },
        { id: 'networking', name: 'Networking', category: 'communication' },
        { id: 'teamwork', name: 'Teamwork', category: 'communication' },
        { id: 'conflict-resolution', name: 'Conflict Resolution', category: 'communication' },
        { id: 'coaching', name: 'Coaching', category: 'communication' },
        { id: 'mentoring', name: 'Mentoring', category: 'communication' },
        { id: 'customer-service', name: 'Customer Service', category: 'communication' },
        { id: 'cultural-awareness', name: 'Cultural Awareness', category: 'communication' },
        { id: 'emotional-intelligence', name: 'Emotional Intelligence', category: 'communication' }
      ]
    },
    personal: {
      name: 'Personal',
      icon: Heart,
      color: 'bg-red-100 text-red-700',
      skills: [
        { id: 'time-management', name: 'Time Management', category: 'personal' },
        { id: 'productivity', name: 'Productivity', category: 'personal' },
        { id: 'mindfulness', name: 'Mindfulness', category: 'personal' },
        { id: 'stress-management', name: 'Stress Management', category: 'personal' },
        { id: 'goal-setting', name: 'Goal Setting', category: 'personal' },
        { id: 'self-discipline', name: 'Self-Discipline', category: 'personal' },
        { id: 'critical-thinking', name: 'Critical Thinking', category: 'personal' },
        { id: 'problem-solving', name: 'Problem Solving', category: 'personal' },
        { id: 'adaptability', name: 'Adaptability', category: 'personal' },
        { id: 'resilience', name: 'Resilience', category: 'personal' }
      ]
    },
    languages: {
      name: 'Languages',
      icon: Globe,
      color: 'bg-teal-100 text-teal-700',
      skills: [
        { id: 'english', name: 'English', category: 'languages' },
        { id: 'spanish', name: 'Spanish', category: 'languages' },
        { id: 'french', name: 'French', category: 'languages' },
        { id: 'german', name: 'German', category: 'languages' },
        { id: 'chinese', name: 'Chinese', category: 'languages' },
        { id: 'japanese', name: 'Japanese', category: 'languages' },
        { id: 'italian', name: 'Italian', category: 'languages' },
        { id: 'portuguese', name: 'Portuguese', category: 'languages' },
        { id: 'russian', name: 'Russian', category: 'languages' },
        { id: 'arabic', name: 'Arabic', category: 'languages' }
      ]
    }
  }
};

export function SkillSelector({ 
  language, 
  searchTerm, 
  selectedSkills, 
  onSkillToggle 
}: SkillSelectorProps) {
  const [activeTab, setActiveTab] = useState('all');
  const categories = skillCategories[language];
  
  const filteredSkills = useMemo(() => {
    const allSkills = Object.values(categories).flatMap(category => category.skills);
    
    if (!searchTerm) {
      if (activeTab === 'all') {
        return allSkills;
      } else {
        return categories[activeTab as keyof typeof categories]?.skills || [];
      }
    }
    
    return allSkills.filter(skill => 
      skill.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, activeTab, categories]);
  
  const getSkillsByCategory = (categoryKey: string) => {
    if (searchTerm) {
      return filteredSkills.filter(skill => skill.category === categoryKey);
    }
    return categories[categoryKey as keyof typeof categories]?.skills || [];
  };
  
  const isSkillSelected = (skillId: string) => {
    return selectedSkills.some(skill => skill.id === skillId);
  };

  const tabsList = [
    { key: 'all', name: language === 'de' ? 'Alle' : 'All' },
    ...Object.entries(categories).map(([key, category]) => ({
      key,
      name: category.name,
      icon: category.icon
    }))
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          {tabsList.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger 
                key={tab.key} 
                value={tab.key} 
                className="flex items-center gap-1 text-xs"
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span className="hidden sm:inline">{tab.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(categories).map(([categoryKey, category]) => {
            const categorySkills = getSkillsByCategory(categoryKey);
            const Icon = category.icon;
            
            if (searchTerm && categorySkills.length === 0) return null;
            
            return (
              <div key={categoryKey}>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  <Badge variant="outline">{categorySkills.length}</Badge>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categorySkills.map((skill) => {
                    const isSelected = isSkillSelected(skill.id);
                    
                    return (
                      <Button
                        key={skill.id}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto p-3 text-left justify-start transition-all duration-200 ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100' 
                            : 'hover:border-blue-200'
                        }`}
                        onClick={() => onSkillToggle(skill)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{skill.name}</span>
                          {isSelected && (
                            <Badge className="ml-2 bg-blue-500 text-white">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {Object.entries(categories).map(([categoryKey, category]) => {
          const categorySkills = getSkillsByCategory(categoryKey);
          const Icon = category.icon;
          
          return (
            <TabsContent key={categoryKey} value={categoryKey}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">
                        {categorySkills.length} {language === 'de' ? 'Fähigkeiten verfügbar' : 'skills available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categorySkills.map((skill) => {
                      const isSelected = isSkillSelected(skill.id);
                      
                      return (
                        <Button
                          key={skill.id}
                          variant={isSelected ? "default" : "outline"}
                          className={`h-auto p-4 text-left justify-start transition-all duration-200 ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100' 
                              : 'hover:border-blue-200'
                          }`}
                          onClick={() => onSkillToggle(skill)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{skill.name}</span>
                            {isSelected && (
                              <Badge className="ml-2 bg-blue-500 text-white">
                                ✓
                              </Badge>
                            )}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
      
      {searchTerm && filteredSkills.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>
            {language === 'de' 
              ? 'Keine Fähigkeiten gefunden'
              : 'No skills found'
            }
          </p>
        </div>
      )}
    </div>
  );
}
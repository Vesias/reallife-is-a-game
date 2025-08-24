"use client";

import { useState, useCallback } from 'react';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  location: string;
  occupation: string;
  bio: string;
  profilePicture?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  targetLevel: 'beginner' | 'intermediate' | 'advanced';
  isCustom?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  timeframe: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Goals {
  mainGoal: string;
  mainGoalDescription: string;
  secondaryGoals: Goal[];
}

export interface Agent {
  name: string;
  personality: string[];
  communicationStyle: string;
  formality: number;
  helpfulness: number;
  proactivity: number;
  avatar: string;
  avatarStyle?: string;
}

export interface Connection {
  id: string;
  name: string;
  email: string;
  platform: string;
  role?: string;
  avatar?: string;
}

export interface Connections {
  imported: Connection[];
  manual: Connection[];
  privacySettings: {
    allowNetworking: boolean;
    shareProgress: boolean;
    allowMentoring: boolean;
  };
}

export interface WizardData {
  personalInfo?: PersonalInfo;
  skills?: Skill[];
  properties?: string[];
  goals?: Goals;
  agent?: Agent;
  connections?: Connections;
}

const WIZARD_STORAGE_KEY = 'lifequest-wizard-data';

export function useWizard() {
  const [wizardData, setWizardData] = useState<WizardData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
      } catch (error) {
        console.error('Failed to load wizard data from localStorage:', error);
        return {};
      }
    }
    return {};
  });

  const updateWizardData = useCallback((updates: Partial<WizardData>) => {
    setWizardData(prevData => {
      const newData = { ...prevData, ...updates };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(newData));
        } catch (error) {
          console.error('Failed to save wizard data to localStorage:', error);
        }
      }
      
      return newData;
    });
  }, []);

  const resetWizard = useCallback(() => {
    setWizardData({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WIZARD_STORAGE_KEY);
    }
  }, []);

  const getStepProgress = useCallback(() => {
    let completedSteps = 0;
    const totalSteps = 7;

    // Step 0: Welcome (always considered complete if we're past it)
    // Step 1: Personal Info
    if (wizardData.personalInfo?.firstName && wizardData.personalInfo?.lastName && wizardData.personalInfo?.email) {
      completedSteps++;
    }
    
    // Step 2: Skills
    if (wizardData.skills && wizardData.skills.length > 0) {
      completedSteps++;
    }
    
    // Step 3: Properties
    if (wizardData.properties && wizardData.properties.length >= 3) {
      completedSteps++;
    }
    
    // Step 4: Goals
    if (wizardData.goals?.mainGoal) {
      completedSteps++;
    }
    
    // Step 5: Agent
    if (wizardData.agent?.name && wizardData.agent?.personality?.length > 0) {
      completedSteps++;
    }
    
    // Step 6: Connections (optional, so always count as complete)
    completedSteps++;
    
    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: Math.round((completedSteps / totalSteps) * 100)
    };
  }, [wizardData]);

  const isStepValid = useCallback((step: number) => {
    switch (step) {
      case 0: // Welcome
        return true;
        
      case 1: // Personal Info
        return !!(wizardData.personalInfo?.firstName && 
                 wizardData.personalInfo?.lastName && 
                 wizardData.personalInfo?.email);
        
      case 2: // Skills
        return !!(wizardData.skills && wizardData.skills.length > 0);
        
      case 3: // Properties
        return !!(wizardData.properties && wizardData.properties.length >= 3);
        
      case 4: // Goals
        return !!(wizardData.goals?.mainGoal);
        
      case 5: // Agent
        return !!(wizardData.agent?.name && wizardData.agent?.personality?.length > 0);
        
      case 6: // Connections
        return true; // Optional step
        
      default:
        return false;
    }
  }, [wizardData]);

  const getCompletionSummary = useCallback(() => {
    return {
      personalInfo: {
        completed: !!(wizardData.personalInfo?.firstName && 
                     wizardData.personalInfo?.lastName && 
                     wizardData.personalInfo?.email),
        data: wizardData.personalInfo
      },
      skills: {
        completed: !!(wizardData.skills && wizardData.skills.length > 0),
        count: wizardData.skills?.length || 0,
        data: wizardData.skills
      },
      properties: {
        completed: !!(wizardData.properties && wizardData.properties.length >= 3),
        count: wizardData.properties?.length || 0,
        data: wizardData.properties
      },
      goals: {
        completed: !!(wizardData.goals?.mainGoal),
        mainGoal: wizardData.goals?.mainGoal,
        secondaryCount: wizardData.goals?.secondaryGoals?.length || 0,
        data: wizardData.goals
      },
      agent: {
        completed: !!(wizardData.agent?.name && wizardData.agent?.personality?.length > 0),
        name: wizardData.agent?.name,
        personalityCount: wizardData.agent?.personality?.length || 0,
        data: wizardData.agent
      },
      connections: {
        importedCount: wizardData.connections?.imported?.length || 0,
        manualCount: wizardData.connections?.manual?.length || 0,
        totalCount: (wizardData.connections?.imported?.length || 0) + 
                   (wizardData.connections?.manual?.length || 0),
        data: wizardData.connections
      }
    };
  }, [wizardData]);

  return {
    wizardData,
    updateWizardData,
    resetWizard,
    getStepProgress,
    isStepValid,
    getCompletionSummary
  };
}
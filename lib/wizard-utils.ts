import { WizardData } from '@/hooks/use-wizard';

export function getStepValidation(step: number, data: WizardData): boolean {
  switch (step) {
    case 0: // Welcome Step
      return true; // Always valid
      
    case 1: // Personal Info Step
      return !!(data.personalInfo?.firstName && 
               data.personalInfo?.lastName && 
               data.personalInfo?.email);
      
    case 2: // Skills Step
      return !!(data.skills && data.skills.length > 0);
      
    case 3: // Properties Step
      return !!(data.properties && data.properties.length >= 3 && data.properties.length <= 5);
      
    case 4: // Goals Step
      return !!(data.goals?.mainGoal && data.goals.mainGoal.trim().length > 0);
      
    case 5: // Agent Creation Step
      return !!(data.agent?.name && 
               data.agent.name.trim().length > 0 &&
               data.agent?.personality && 
               data.agent.personality.length > 0);
      
    case 6: // Connections Step
      return true; // Optional step, always valid
      
    default:
      return false;
  }
}

export function getStepTitle(step: number, language: 'de' | 'en'): string {
  const titles = {
    de: [
      'Willkommen',
      'Persönliche Daten',
      'Fähigkeiten',
      'Eigenschaften',
      'Ziele',
      'Digitaler Agent',
      'Verbindungen'
    ],
    en: [
      'Welcome',
      'Personal Info',
      'Skills',
      'Properties',
      'Goals',
      'Digital Agent',
      'Connections'
    ]
  };
  
  return titles[language][step] || '';
}

export function getStepDescription(step: number, language: 'de' | 'en'): string {
  const descriptions = {
    de: [
      'Willkommen bei LifeQuest - Deine Reise beginnt hier',
      'Erzähle uns etwas über dich',
      'Wähle die Fähigkeiten, die du entwickeln möchtest',
      'Welche Eigenschaften beschreiben dich am besten?',
      'Setze dir Ziele für deine persönliche Entwicklung',
      'Erstelle deinen perfekten digitalen Assistenten',
      'Vernetze dich mit anderen Lernenden'
    ],
    en: [
      'Welcome to LifeQuest - Your journey starts here',
      'Tell us about yourself',
      'Choose the skills you want to develop',
      'Which properties describe you best?',
      'Set goals for your personal development',
      'Create your perfect digital assistant',
      'Connect with other learners'
    ]
  };
  
  return descriptions[language][step] || '';
}

export function calculateWizardProgress(data: WizardData): number {
  const steps = [
    true, // Welcome (always complete)
    !!(data.personalInfo?.firstName && data.personalInfo?.lastName && data.personalInfo?.email),
    !!(data.skills && data.skills.length > 0),
    !!(data.properties && data.properties.length >= 3),
    !!(data.goals?.mainGoal),
    !!(data.agent?.name && data.agent?.personality?.length > 0),
    true // Connections (optional, always complete)
  ];
  
  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
}

export function getRequiredFieldsForStep(step: number, language: 'de' | 'en'): string[] {
  const fields = {
    de: {
      1: ['Vorname', 'Nachname', 'E-Mail'],
      2: ['Mindestens eine Fähigkeit'],
      3: ['3-5 Eigenschaften'],
      4: ['Hauptziel'],
      5: ['Agent-Name', 'Mindestens eine Persönlichkeitseigenschaft']
    },
    en: {
      1: ['First Name', 'Last Name', 'Email'],
      2: ['At least one skill'],
      3: ['3-5 properties'],
      4: ['Main goal'],
      5: ['Agent name', 'At least one personality trait']
    }
  };
  
  return fields[language][step as keyof typeof fields[typeof language]] || [];
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>"'&]/g, '');
}

export function formatWizardDataForAPI(data: WizardData) {
  return {
    user: {
      firstName: data.personalInfo?.firstName,
      lastName: data.personalInfo?.lastName,
      email: data.personalInfo?.email,
      age: data.personalInfo?.age,
      location: data.personalInfo?.location,
      occupation: data.personalInfo?.occupation,
      bio: data.personalInfo?.bio,
      profilePicture: data.personalInfo?.profilePicture
    },
    skills: data.skills?.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      currentLevel: skill.level,
      targetLevel: skill.targetLevel,
      isCustom: skill.isCustom || false
    })) || [],
    properties: data.properties || [],
    goals: {
      primary: {
        title: data.goals?.mainGoal,
        description: data.goals?.mainGoalDescription
      },
      secondary: data.goals?.secondaryGoals?.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        timeframe: goal.timeframe,
        priority: goal.priority
      })) || []
    },
    agent: {
      name: data.agent?.name,
      personality: data.agent?.personality || [],
      communicationStyle: data.agent?.communicationStyle,
      settings: {
        formality: data.agent?.formality || 2,
        helpfulness: data.agent?.helpfulness || 3,
        proactivity: data.agent?.proactivity || 2
      },
      avatar: {
        style: data.agent?.avatarStyle || 'robot'
      }
    },
    connections: {
      imported: data.connections?.imported || [],
      manual: data.connections?.manual || [],
      privacySettings: data.connections?.privacySettings || {
        allowNetworking: true,
        shareProgress: true,
        allowMentoring: true
      }
    }
  };
}

export function getWizardCompletionPercentage(data: WizardData): { overall: number; steps: Record<number, number> } {
  const stepCompletions = {
    0: 100, // Welcome always complete
    1: data.personalInfo?.firstName && data.personalInfo?.lastName && data.personalInfo?.email ? 100 : 0,
    2: data.skills && data.skills.length > 0 ? Math.min(100, (data.skills.length / 5) * 100) : 0,
    3: data.properties && data.properties.length >= 3 ? 100 : data.properties ? (data.properties.length / 3) * 100 : 0,
    4: data.goals?.mainGoal ? 100 : 0,
    5: data.agent?.name && data.agent?.personality?.length > 0 ? 100 : 0,
    6: 100 // Connections optional
  };
  
  const overall = Object.values(stepCompletions).reduce((sum, completion) => sum + completion, 0) / Object.keys(stepCompletions).length;
  
  return {
    overall: Math.round(overall),
    steps: stepCompletions
  };
}
# KI-erweiterte API-Endpunkte für LifeQuest
*AI-Enhanced API Endpoints for LifeQuest*

## Übersicht / Overview

Diese Dokumentation beschreibt alle KI-erweiterten API-Endpunkte von LifeQuest, die neueste Modelle wie Grok 4, GPT-5, O3 Deep Research und weitere integrieren.

*This documentation describes all AI-enhanced API endpoints of LifeQuest that integrate the latest models like Grok 4, GPT-5, O3 Deep Research and more.*

## 🤖 KI-Kern-Services / AI Core Services

### Base URL
```
https://api.lifequest.com/v1
```

### Authentifizierung / Authentication
```http
Authorization: Bearer <jwt_token>
X-API-Key: <api_key>
Content-Type: application/json
```

---

## 🎯 Quest AI Endpunkte / Quest AI Endpoints

### 1. Personalisierte Quest-Generierung
**POST** `/api/ai/quests/generate`

Generiert eine personalisierte Quest basierend auf Nutzerprofil und Präferenzen.

```typescript
// Request Body
interface GenerateQuestRequest {
  userId: string;
  questType?: 'learning' | 'skill_building' | 'creative' | 'fitness' | 'career';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'adaptive';
  duration?: number; // in minutes
  topics?: string[];
  preferences?: {
    learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
    motivation?: 'achievement' | 'social' | 'mastery' | 'autonomy';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    socialAspect?: 'solo' | 'team' | 'mentored';
  };
  context?: {
    availableTime?: number;
    currentMood?: 'motivated' | 'tired' | 'curious' | 'stressed';
    device?: 'mobile' | 'desktop' | 'tablet';
    location?: 'home' | 'office' | 'commute' | 'gym';
  };
}

// Response
interface GenerateQuestResponse {
  quest: {
    id: string;
    title: string;
    description: string;
    objectives: Objective[];
    estimatedDuration: number;
    difficulty: string;
    xpReward: number;
    aiModel: 'grok-4' | 'gpt-5';
    personalizedElements: {
      motivationHook: string;
      relevanceExplanation: string;
      adaptiveParameters: AdaptiveParameters;
    };
    visualContent?: {
      thumbnail: string;
      illustrations: string[];
    };
  };
  confidence: number;
  alternatives?: Quest[];
}
```

**cURL Beispiel:**
```bash
curl -X POST "https://api.lifequest.com/v1/api/ai/quests/generate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "questType": "learning",
    "difficulty": "adaptive",
    "duration": 30,
    "topics": ["typescript", "react"],
    "preferences": {
      "learningStyle": "visual",
      "motivation": "mastery"
    }
  }'
```

### 2. Quest-Empfehlungen
**GET** `/api/ai/quests/recommendations/{userId}`

Liefert personalisierte Quest-Empfehlungen basierend auf Verlauf und Präferenzen.

```typescript
// Query Parameters
interface RecommendationParams {
  limit?: number; // default: 10
  category?: string;
  timeframe?: '1d' | '1w' | '1m';
  includeCompleted?: boolean;
  contextAware?: boolean; // berücksichtigt aktuellen Kontext
}

// Response
interface QuestRecommendationsResponse {
  recommendations: {
    trending: QuestSuggestion[];
    personalized: QuestSuggestion[];
    challenging: QuestSuggestion[];
    social: QuestSuggestion[];
  };
  aiInsights: {
    recommendationReasoning: string;
    userPatterns: string[];
    nextOptimalTime: string;
    motivationalMessage: string;
  };
  metadata: {
    generatedAt: string;
    model: string;
    confidence: number;
  };
}
```

### 3. Adaptive Schwierigkeitsanpassung
**PUT** `/api/ai/quests/{questId}/adapt-difficulty`

Passt die Schwierigkeit einer Quest basierend auf Nutzer-Performance an.

```typescript
// Request Body
interface AdaptDifficultyRequest {
  userId: string;
  performanceData: {
    attempts: number;
    successRate: number;
    averageTime: number;
    frustractionLevel: 1 | 2 | 3 | 4 | 5;
    engagement: 1 | 2 | 3 | 4 | 5;
  };
  currentProgress: number; // 0-100%
}

// Response
interface AdaptDifficultyResponse {
  adjustments: {
    newDifficulty: string;
    modifiedObjectives: Objective[];
    addedHints: Hint[];
    timeExtension?: number;
    additionalResources?: Resource[];
  };
  reasoning: string;
  expectedImprovement: number;
  aiModel: 'grok-4';
}
```

---

## 💡 Intelligente Unterstützung / Intelligent Assistance

### 4. KI-Hints und Tipps
**POST** `/api/ai/quests/{questId}/hints`

Generiert kontextuelle Hinweise basierend auf Nutzer-Fortschritt.

```typescript
// Request Body
interface GenerateHintRequest {
  userId: string;
  currentStep: string;
  strugglingAreas: string[];
  attempts: number;
  timeSpent: number; // in minutes
  hintType?: 'gentle' | 'direct' | 'example' | 'resource';
}

// Response
interface HintResponse {
  hint: {
    content: string;
    type: string;
    difficulty: 'subtle' | 'medium' | 'direct';
    estimatedHelpfulness: number;
  };
  followUpSuggestions: string[];
  alternativeApproaches: string[];
  aiModel: 'gpt-5-mini'; // Für schnelle Antworten
}
```

### 5. Fortschritts-Analyse
**GET** `/api/ai/users/{userId}/progress-analysis`

Analysiert Nutzer-Fortschritt und liefert personalisierte Insights.

```typescript
// Query Parameters
interface ProgressAnalysisParams {
  timeframe?: '1w' | '1m' | '3m' | '1y';
  includeComparison?: boolean;
  depth?: 'quick' | 'comprehensive';
}

// Response
interface ProgressAnalysisResponse {
  analysis: {
    overallTrend: 'improving' | 'stable' | 'declining';
    strengths: string[];
    improvementAreas: string[];
    learningPatterns: {
      optimalTimes: string[];
      preferredTypes: string[];
      successFactors: string[];
    };
    predictions: {
      nextWeekGoals: Goal[];
      estimatedGrowth: number;
      riskAreas: string[];
    };
  };
  insights: {
    personalizedMessage: string;
    actionableRecommendations: Recommendation[];
    motivationalContent: string;
  };
  aiModel: 'o3-deep-research'; // Für tiefgehende Analyse
  generatedAt: string;
}
```

---

## 👥 KI-gestützte Kollaboration / AI-Powered Collaboration

### 6. Intelligente Team-Bildung
**POST** `/api/ai/teams/form`

Bildet optimale Teams basierend auf Komplementarität und Kompatibilität.

```typescript
// Request Body
interface FormTeamRequest {
  questId: string;
  availableUsers: string[];
  teamSize?: number; // default: 3-4
  criteria?: {
    skillBalance?: boolean;
    personalityMix?: boolean;
    timezoneCompatibility?: boolean;
    pastCollaboration?: boolean;
  };
}

// Response
interface FormTeamResponse {
  recommendedTeams: {
    members: TeamMember[];
    compatibility: number;
    skillCoverage: SkillCoverage;
    expectedSynergy: number;
    reasoning: string;
  }[];
  teamDynamicsGuidance: {
    roleRecommendations: RoleAssignment[];
    communicationTips: string[];
    potentialChallenges: string[];
    successStrategies: string[];
  };
  aiModel: 'grok-4';
}
```

### 7. Kollaborations-Unterstützung
**POST** `/api/ai/teams/{teamId}/moderate`

Moderiert Team-Interaktionen und bietet Verbesserungsvorschläge.

```typescript
// Request Body
interface ModerateTeamRequest {
  interaction: {
    type: 'discussion' | 'conflict' | 'decision' | 'planning';
    participants: string[];
    content: string;
    timestamp: string;
  };
  context?: {
    questPhase: string;
    teamMood: string;
    deadline?: string;
  };
}

// Response
interface ModerationResponse {
  assessment: {
    communicationQuality: number;
    participationBalance: number;
    conflictLevel: number;
    productivityScore: number;
  };
  interventions?: {
    type: 'suggestion' | 'mediation' | 'restructuring';
    message: string;
    recipients: string[];
  }[];
  improvements: string[];
  aiModel: 'gpt-5';
}
```

---

## 🎨 Kreative KI-Features / Creative AI Features

### 8. Visuelle Content-Generierung
**POST** `/api/ai/content/generate-visual`

Generiert visuelle Inhalte für Quests und Achievements.

```typescript
// Request Body
interface GenerateVisualRequest {
  type: 'quest_thumbnail' | 'achievement_badge' | 'progress_illustration' | 'avatar';
  description: string;
  style?: 'modern' | 'playful' | 'professional' | 'minimalist';
  colors?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  personalization?: {
    userId?: string;
    preferences?: UserVisualPreferences;
  };
}

// Response
interface GenerateVisualResponse {
  images: {
    url: string;
    alt: string;
    metadata: {
      style: string;
      colors: string[];
      generation_time: number;
    };
  }[];
  variations?: string[];
  aiModel: 'gpt-image-1';
  cost: number;
}
```

### 9. Personalisierte Badge-Erstellung
**POST** `/api/ai/achievements/create-badge`

Erstellt personalisierte Achievement-Badges.

```typescript
// Request Body
interface CreateBadgeRequest {
  achievementId: string;
  userId: string;
  achievement: {
    name: string;
    description: string;
    category: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  personalizedElements?: {
    userStyle: string;
    favoriteColors: string[];
    personalSymbols: string[];
  };
}

// Response
interface CreateBadgeResponse {
  badge: {
    id: string;
    imageUrl: string;
    animationUrl?: string;
    personalizedMessage: string;
    shareableContent: {
      title: string;
      description: string;
      hashtags: string[];
    };
  };
  metadata: {
    creationTime: number;
    aiModel: 'gpt-image-1';
    cost: number;
  };
}
```

---

## 🧠 Code-Intelligence / Code Intelligence

### 10. KI-Code-Assistenz
**POST** `/api/ai/code/assist`

Bietet intelligente Code-Unterstützung für Programmier-Quests.

```typescript
// Request Body
interface CodeAssistRequest {
  questId: string;
  userId: string;
  language: string;
  code: string;
  assistanceType: 'debug' | 'optimize' | 'explain' | 'complete' | 'review';
  context?: {
    objective: string;
    constraints: string[];
    testCases?: TestCase[];
  };
}

// Response
interface CodeAssistResponse {
  assistance: {
    suggestion: string;
    improvedCode?: string;
    explanation: string;
    confidence: number;
  };
  learningPoints: string[];
  nextSteps: string[];
  resources?: Resource[];
  aiModel: 'gpt-5'; // Optimiert für Code
}
```

### 11. Code-Quest Bewertung
**POST** `/api/ai/code/{questId}/evaluate`

Bewertet eingereichten Code automatisch mit KI.

```typescript
// Request Body
interface EvaluateCodeRequest {
  userId: string;
  submittedCode: string;
  language: string;
  testResults?: TestResult[];
}

// Response
interface EvaluateCodeResponse {
  evaluation: {
    score: number; // 0-100
    passedTests: number;
    totalTests: number;
    codeQuality: {
      readability: number;
      efficiency: number;
      bestPractices: number;
      security: number;
    };
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    detailedReview: string;
    nextChallenges: string[];
  };
  rewards: {
    xpEarned: number;
    badgesUnlocked: Badge[];
    skillImprovements: SkillUpdate[];
  };
  aiModel: 'gpt-5';
}
```

---

## 📊 Analytics und Insights / Analytics & Insights

### 12. KI-basierte Nutzer-Insights
**GET** `/api/ai/users/{userId}/insights`

Generiert tiefgehende Nutzer-Insights und Vorhersagen.

```typescript
// Query Parameters
interface UserInsightsParams {
  analysisDepth: 'quick' | 'standard' | 'comprehensive';
  focusAreas?: string[];
  includeComparisons?: boolean;
  predictionHorizon?: '1w' | '1m' | '3m';
}

// Response
interface UserInsightsResponse {
  insights: {
    personalityProfile: PersonalityAnalysis;
    learningPatterns: LearningPattern[];
    motivationDrivers: MotivationDriver[];
    optimalConditions: OptimalCondition[];
    growthPredictions: GrowthPrediction[];
  };
  recommendations: {
    immediate: Recommendation[];
    shortTerm: Recommendation[];
    longTerm: Recommendation[];
  };
  benchmarking: {
    peerComparison: PeerComparison;
    industryStandards: IndustryBenchmark[];
  };
  aiModel: 'o3-deep-research';
  confidence: number;
}
```

### 13. Predictive Analytics
**POST** `/api/ai/analytics/predict`

Macht Vorhersagen über Nutzerverhalten und Quest-Erfolg.

```typescript
// Request Body
interface PredictiveAnalyticsRequest {
  userId: string;
  predictionType: 'quest_success' | 'engagement_trend' | 'skill_development' | 'churn_risk';
  questId?: string;
  timeframe: string;
  factors?: string[];
}

// Response
interface PredictiveAnalyticsResponse {
  predictions: {
    outcome: string;
    probability: number;
    confidence: number;
    factors: InfluenceFactor[];
  }[];
  recommendations: {
    preventive?: Action[];
    enhancing?: Action[];
    alternative?: Action[];
  };
  scenarios: {
    best: Scenario;
    likely: Scenario;
    worst: Scenario;
  };
  aiModel: 'o3-deep-research';
}
```

---

## ⚡ Realtime KI-Features / Realtime AI Features

### 14. Live-Coaching
**WebSocket** `/ws/ai/coaching/{userId}`

Bietet Echtzeit-KI-Coaching während Quest-Ausführung.

```typescript
// WebSocket Message Types
interface CoachingMessage {
  type: 'encouragement' | 'hint' | 'warning' | 'celebration';
  content: string;
  timing: 'immediate' | 'delayed';
  priority: 'low' | 'medium' | 'high';
}

// Connection Parameters
interface CoachingConnection {
  questId: string;
  coachingStyle: 'supportive' | 'challenging' | 'analytical';
  frequency: 'minimal' | 'moderate' | 'active';
  contextAware: boolean;
}
```

### 15. Echtzeit-Empfehlungen
**GET** `/api/ai/realtime/recommendations`

**Server-Sent Events (SSE)** für Live-Empfehlungen.

```typescript
// SSE Event Types
interface RecommendationEvent {
  event: 'quest_suggestion' | 'team_opportunity' | 'skill_match' | 'trending_update';
  data: {
    recommendation: Recommendation;
    urgency: 'low' | 'medium' | 'high';
    validUntil: string;
  };
  timestamp: string;
}
```

---

## 🔧 Konfiguration und Management / Configuration & Management

### 16. AI-Modell-Konfiguration
**GET/PUT** `/api/ai/config/models`

Verwaltet KI-Modell-Präferenzen und Einstellungen.

```typescript
// GET Response
interface AIModelConfig {
  defaultModels: {
    questGeneration: 'grok-4' | 'gpt-5';
    codeAssistance: 'gpt-5';
    quickResponses: 'gpt-5-mini';
    deepAnalysis: 'o3-deep-research';
    visualContent: 'gpt-image-1';
  };
  customSettings: {
    temperature: number;
    maxTokens: number;
    costOptimization: boolean;
    qualityPriority: 'speed' | 'balanced' | 'quality';
  };
  usage: {
    monthlyBudget: number;
    currentSpend: number;
    tokenUsage: TokenUsage;
  };
}

// PUT Request Body
interface UpdateAIConfigRequest {
  defaultModels?: Partial<AIModelConfig['defaultModels']>;
  customSettings?: Partial<AIModelConfig['customSettings']>;
  budgetLimits?: {
    monthly?: number;
    perUser?: number;
    perFeature?: Record<string, number>;
  };
}
```

### 17. KI-Performance-Metriken
**GET** `/api/ai/metrics`

Liefert detaillierte KI-Performance-Metriken.

```typescript
// Query Parameters
interface MetricsParams {
  timeframe: '1h' | '24h' | '7d' | '30d';
  models?: string[];
  features?: string[];
  groupBy?: 'model' | 'feature' | 'user' | 'time';
}

// Response
interface AIMetricsResponse {
  summary: {
    totalRequests: number;
    totalCost: number;
    averageLatency: number;
    errorRate: number;
    userSatisfaction: number;
  };
  byModel: ModelMetrics[];
  byFeature: FeatureMetrics[];
  trends: {
    usage: DataPoint[];
    cost: DataPoint[];
    performance: DataPoint[];
    quality: DataPoint[];
  };
  recommendations: OptimizationRecommendation[];
}
```

---

## 🚨 Fehlerbehandlung / Error Handling

### Standard Error Response
```typescript
interface AIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    modelUsed?: string;
    retryable: boolean;
    timestamp: string;
  };
  requestId: string;
}

// Error Codes
const AI_ERROR_CODES = {
  'AI_MODEL_UNAVAILABLE': 'The requested AI model is temporarily unavailable',
  'AI_QUOTA_EXCEEDED': 'API quota limit exceeded',
  'AI_INVALID_INPUT': 'Invalid input format for AI processing',
  'AI_PROCESSING_TIMEOUT': 'AI processing timeout exceeded',
  'AI_CONTENT_FILTERED': 'Content filtered by AI safety systems',
  'AI_MODEL_OVERLOADED': 'AI model temporarily overloaded'
} as const;
```

### Rate Limiting
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60
```

---

## 🔐 Sicherheit / Security

### Input Sanitization
Alle KI-Endpunkte validieren und sanitisieren Eingaben:
- XSS-Schutz
- SQL-Injection-Prävention  
- Content-Length-Limits
- Prompt-Injection-Schutz

### Privacy Protection
```typescript
interface PrivacySettings {
  dataRetention: 'none' | '30d' | '90d' | '1y';
  shareWithAI: boolean;
  anonymization: boolean;
  optOutAnalytics: boolean;
}
```

---

## 📈 Kostenoptimierung / Cost Optimization

### Smart Token Management
```typescript
interface TokenOptimization {
  compressionEnabled: boolean;
  cachingStrategy: 'aggressive' | 'balanced' | 'conservative';
  modelFallbacks: Record<string, string>;
  budgetAlerts: {
    warning: number; // 80% of budget
    critical: number; // 95% of budget
  };
}
```

### Bulk Operations
Für kosteneffiziente Batch-Verarbeitung:
- `/api/ai/batch/quests/generate`
- `/api/ai/batch/users/analyze`
- `/api/ai/batch/content/create`

---

*Diese API-Dokumentation wird kontinuierlich erweitert und aktualisiert, wenn neue KI-Features und Modelle integriert werden.*
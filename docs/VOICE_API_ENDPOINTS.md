# Voice-Enhanced API Documentation for LifeQuest

## Overview

This document provides comprehensive API documentation for all voice-enhanced endpoints in LifeQuest, integrating ElevenLabs voice capabilities with the existing gamification system.

## Table of Contents

1. [Authentication](#authentication)
2. [Voice Services](#voice-services)
3. [Quest Voice Integration](#quest-voice-integration)
4. [Digital Agent Endpoints](#digital-agent-endpoints)
5. [Voice Communication](#voice-communication)
6. [Audio Management](#audio-management)
7. [Voice Analytics](#voice-analytics)
8. [Multi-language Support](#multi-language-support)

## Authentication

All voice-enhanced endpoints require standard LifeQuest authentication plus voice-specific permissions.

### Voice Permissions

```typescript
enum VoicePermissions {
  VOICE_GENERATION = 'voice:generate',
  VOICE_TRANSCRIPTION = 'voice:transcribe',
  VOICE_CONVERSATION = 'voice:conversation',
  VOICE_CLONING = 'voice:clone',
  MUSIC_GENERATION = 'voice:music',
  CREW_VOICE_CHAT = 'voice:crew_chat',
  VOICE_NOTIFICATIONS = 'voice:notifications'
}
```

### Headers

```http
Authorization: Bearer {jwt_token}
X-Voice-API-Key: {elevenlabs_api_key}
Content-Type: application/json
Accept: application/json, audio/mpeg
X-User-Language: de
X-Voice-Quality: high|balanced|data_saver
```

## Voice Services

### Text-to-Speech Generation

Generate speech from text using various voice personalities.

#### `POST /api/v1/voice/text-to-speech`

**Request Body:**
```typescript
interface TextToSpeechRequest {
  text: string;
  voiceId: string;
  settings?: {
    stability?: number; // 0.0 - 1.0
    similarity?: number; // 0.0 - 1.0
    style?: number; // 0.0 - 1.0
    speakingRate?: number; // 0.5 - 2.0
  };
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  streaming?: boolean;
  cacheEnabled?: boolean;
}
```

**Example Request:**
```json
{
  "text": "Willkommen zu deiner neuen Fitness-Quest! Heute werden wir gemeinsam deine Grenzen überwinden.",
  "voiceId": "quest-narrator-de",
  "settings": {
    "stability": 0.8,
    "similarity": 0.9,
    "style": 0.6,
    "speakingRate": 0.95
  },
  "outputFormat": "mp3",
  "streaming": false,
  "cacheEnabled": true
}
```

**Response:**
```typescript
interface TextToSpeechResponse {
  audioId: string;
  audioUrl: string;
  duration: number; // seconds
  format: string;
  size: number; // bytes
  cached: boolean;
  cost: {
    characters: number;
    credits: number;
    estimatedCost: number;
  };
}
```

**Status Codes:**
- `200 OK` - Audio generated successfully
- `400 Bad Request` - Invalid parameters
- `402 Payment Required` - Insufficient credits
- `429 Too Many Requests` - Rate limit exceeded

#### `POST /api/v1/voice/text-to-speech/stream`

Streaming version for real-time audio generation.

**Response:** Server-Sent Events with audio chunks
```typescript
interface AudioChunkEvent {
  type: 'audio_chunk' | 'audio_complete' | 'error';
  data: {
    chunk?: string; // base64 encoded audio
    chunkId: number;
    totalChunks?: number;
    error?: string;
  };
}
```

### Speech-to-Text Transcription

Convert audio to text with language detection.

#### `POST /api/v1/voice/speech-to-text`

**Request:**
```typescript
// Multipart form data
interface SpeechToTextRequest {
  audio: File; // Audio file
  language?: string; // Optional language hint
  detectLanguage?: boolean;
  includeTimestamps?: boolean;
  filterProfanity?: boolean;
}
```

**Response:**
```typescript
interface SpeechToTextResponse {
  transcription: string;
  confidence: number;
  language: string;
  detectedLanguage?: {
    language: string;
    confidence: number;
  };
  timestamps?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
  duration: number;
  wordCount: number;
}
```

### Voice Cloning

Create custom voice models for personalized agents.

#### `POST /api/v1/voice/clone`

**Request:**
```typescript
interface VoiceCloneRequest {
  name: string;
  description: string;
  audioSamples: File[]; // 3-10 audio samples, 30s-3min each
  language: string;
  voiceCharacteristics?: {
    age?: 'young' | 'middle_aged' | 'elderly';
    gender?: 'male' | 'female' | 'neutral';
    accent?: string;
    emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited';
  };
}
```

**Response:**
```typescript
interface VoiceCloneResponse {
  voiceId: string;
  status: 'processing' | 'completed' | 'failed';
  estimatedCompletion: string; // ISO date
  previewUrl?: string;
  characteristics: VoiceCharacteristics;
}
```

## Quest Voice Integration

### Quest Narration

Generate personalized quest narrations with contextual adaptation.

#### `POST /api/v1/quests/{questId}/narration`

**Request:**
```typescript
interface QuestNarrationRequest {
  event: 'start' | 'progress' | 'milestone' | 'completion' | 'failure';
  context: {
    userProgress: number; // 0-100
    timeInQuest: number; // minutes
    previousAttempts: number;
    userMood?: 'motivated' | 'tired' | 'stressed' | 'excited';
    crewSupport?: boolean;
  };
  voiceId?: string; // Optional voice override
  includeMusic?: boolean;
  personalizedElements?: {
    userName: string;
    achievements: string[];
    personalGoals: string[];
  };
}
```

**Example Request:**
```json
{
  "event": "start",
  "context": {
    "userProgress": 0,
    "timeInQuest": 0,
    "previousAttempts": 2,
    "userMood": "motivated",
    "crewSupport": true
  },
  "voiceId": "quest-narrator-de",
  "includeMusic": true,
  "personalizedElements": {
    "userName": "Maria",
    "achievements": ["fitness_beginner", "consistency_week"],
    "personalGoals": ["lose_weight", "build_strength"]
  }
}
```

**Response:**
```typescript
interface QuestNarrationResponse {
  narrationId: string;
  audioUrl: string;
  musicUrl?: string;
  combinedAudioUrl?: string;
  script: string;
  duration: number;
  voiceUsed: string;
  contextualAdaptations: string[];
}
```

### Voice Quest Commands

Enable voice control for quest management.

#### `POST /api/v1/quests/voice-command`

**Request:**
```typescript
interface VoiceCommandRequest {
  audio: File; // Voice command audio
  context?: {
    currentQuest?: string;
    activeQuests: string[];
    userLocation?: 'home' | 'gym' | 'work' | 'outdoor';
  };
}
```

**Response:**
```typescript
interface VoiceCommandResponse {
  command: string;
  intent: 'start_quest' | 'check_progress' | 'pause_quest' | 'get_help';
  confidence: number;
  parameters: Record<string, any>;
  action: {
    type: string;
    endpoint: string;
    payload: any;
  };
  confirmationRequired: boolean;
  responseAudio?: string; // Audio confirmation URL
}
```

## Digital Agent Endpoints

### Agent Voice Configuration

Configure and manage digital agent voices.

#### `GET /api/v1/agents/voices`

**Response:**
```typescript
interface AgentVoicesResponse {
  agents: Array<{
    agentId: string;
    name: string;
    role: 'narrator' | 'coach' | 'tracker' | 'communicator';
    description: string;
    voiceId: string;
    characteristics: {
      language: string;
      accent: string;
      personality: string;
      tone: string;
      energy: number;
    };
    sampleAudioUrl: string;
    available: boolean;
  }>;
}
```

#### `PUT /api/v1/agents/{agentId}/voice`

**Request:**
```typescript
interface UpdateAgentVoiceRequest {
  voiceId: string;
  settings: {
    stability: number;
    similarity: number;
    style: number;
    speakingRate: number;
  };
  personalizedFor?: string; // User ID for personalization
}
```

### Conversational AI Sessions

Start and manage AI coaching conversations.

#### `POST /api/v1/agents/{agentId}/conversation`

**Request:**
```typescript
interface StartConversationRequest {
  userId: string;
  context: {
    conversationType: 'daily_checkin' | 'progress_review' | 'goal_setting' | 'crisis_support';
    userMood?: string;
    recentActivity: Activity[];
    currentGoals: Goal[];
    previousConversations?: ConversationSummary[];
  };
  voiceEnabled: boolean;
  language?: string;
}
```

**Response:**
```typescript
interface ConversationSessionResponse {
  sessionId: string;
  agentId: string;
  initialMessage: string;
  initialAudioUrl?: string;
  expectedDuration: number;
  conversationType: string;
  status: 'active' | 'paused' | 'completed';
}
```

#### `POST /api/v1/conversations/{sessionId}/message`

**Request:**
```typescript
interface ConversationMessageRequest {
  message?: string; // Text message
  audio?: File; // Voice message
  metadata?: {
    emotionalState?: string;
    urgency?: 'low' | 'medium' | 'high';
    contextualInfo?: Record<string, any>;
  };
}
```

**Response:**
```typescript
interface ConversationMessageResponse {
  messageId: string;
  agentResponse: {
    text: string;
    audioUrl?: string;
    emotion: string;
    confidence: number;
    suggestedActions?: Action[];
  };
  conversationStatus: 'continuing' | 'closing' | 'escalating';
  nextExpectedInput?: 'text' | 'voice' | 'action';
}
```

## Voice Communication

### Crew Voice Chat

Enable voice communication between crew members.

#### `POST /api/v1/crews/{crewId}/voice-chat/start`

**Request:**
```typescript
interface StartVoiceChatRequest {
  participants: string[]; // User IDs
  chatType: 'group_quest' | 'general' | 'celebration' | 'support';
  maxDuration?: number; // minutes
  autoTranscription: boolean;
  realTimeTranslation: boolean;
}
```

**Response:**
```typescript
interface VoiceChatSessionResponse {
  chatId: string;
  roomUrl: string; // WebRTC room URL
  participants: Participant[];
  settings: {
    autoTranscription: boolean;
    realTimeTranslation: boolean;
    recordingEnabled: boolean;
  };
  expiresAt: string;
}
```

#### `POST /api/v1/crews/{crewId}/voice-message`

Send voice messages to crew members.

**Request:**
```typescript
// Multipart form data
interface CrewVoiceMessageRequest {
  audio: File;
  recipients?: string[]; // Optional, defaults to all crew members
  priority?: 'low' | 'normal' | 'high';
  transcriptionEnabled?: boolean;
  translationEnabled?: boolean;
}
```

### Voice Notifications

Manage voice-powered notifications.

#### `POST /api/v1/notifications/voice`

**Request:**
```typescript
interface VoiceNotificationRequest {
  userId: string;
  type: 'quest_reminder' | 'milestone' | 'crew_update' | 'system_alert';
  content: {
    title: string;
    message: string;
    personalizedElements?: Record<string, any>;
  };
  voiceSettings: {
    agentId: string;
    urgency: 'low' | 'medium' | 'high';
    respectQuietHours: boolean;
  };
  deliveryOptions: {
    immediate: boolean;
    scheduledFor?: string; // ISO date
    repeatPattern?: 'none' | 'daily' | 'weekly';
  };
}
```

**Response:**
```typescript
interface VoiceNotificationResponse {
  notificationId: string;
  status: 'scheduled' | 'delivered' | 'failed';
  audioUrl?: string;
  estimatedDelivery: string;
  cost: {
    credits: number;
    estimatedCost: number;
  };
}
```

## Audio Management

### Audio Processing

Process and optimize audio files for voice features.

#### `POST /api/v1/audio/process`

**Request:**
```typescript
interface AudioProcessRequest {
  audio: File;
  operations: Array<{
    type: 'normalize' | 'denoise' | 'compress' | 'enhance' | 'trim';
    parameters?: Record<string, any>;
  }>;
  outputFormat?: 'mp3' | 'wav' | 'ogg';
  quality?: 'high' | 'medium' | 'low';
}
```

### Music Generation

Generate contextual background music for quests.

#### `POST /api/v1/audio/generate-music`

**Request:**
```typescript
interface MusicGenerationRequest {
  context: {
    questType: 'fitness' | 'learning' | 'creative' | 'social' | 'mindfulness';
    mood: 'energetic' | 'calm' | 'inspiring' | 'celebratory' | 'focused';
    duration: number; // seconds
    intensity: number; // 0.0 - 1.0
  };
  style?: {
    genre: 'electronic' | 'orchestral' | 'ambient' | 'rock' | 'jazz';
    tempo?: number; // BPM
    key?: string; // Musical key
  };
  fadeIn?: boolean;
  fadeOut?: boolean;
  loop?: boolean;
}
```

**Response:**
```typescript
interface MusicGenerationResponse {
  musicId: string;
  audioUrl: string;
  duration: number;
  style: MusicStyle;
  metadata: {
    bpm: number;
    key: string;
    mood: string;
    energy: number;
  };
  cost: {
    generationCredits: number;
    estimatedCost: number;
  };
}
```

## Voice Analytics

### Usage Analytics

Track voice feature usage and performance.

#### `GET /api/v1/analytics/voice/usage`

**Query Parameters:**
- `startDate`: ISO date string
- `endDate`: ISO date string
- `userId`: Optional user filter
- `feature`: Optional feature filter
- `aggregation`: 'day' | 'week' | 'month'

**Response:**
```typescript
interface VoiceUsageAnalytics {
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalInteractions: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    mostUsedFeatures: Array<{
      feature: string;
      count: number;
      percentage: number;
    }>;
    qualityMetrics: {
      averageAudioQuality: number;
      userSatisfactionScore: number;
      errorRate: number;
    };
    costMetrics: {
      totalCreditsUsed: number;
      averageCostPerInteraction: number;
      costOptimizationSavings: number;
    };
  };
  trends: Array<{
    date: string;
    interactions: number;
    quality: number;
    cost: number;
  }>;
}
```

### User Voice Preferences Analytics

#### `GET /api/v1/analytics/voice/user-preferences/{userId}`

**Response:**
```typescript
interface UserVoicePreferences {
  userId: string;
  preferences: {
    preferredAgents: Array<{
      agentId: string;
      usageCount: number;
      satisfactionScore: number;
    }>;
    optimalSettings: {
      speakingRate: number;
      voicePitch: number;
      interactionStyle: string;
    };
    engagementPatterns: {
      peakUsageTimes: string[];
      averageSessionLength: number;
      preferredFeatures: string[];
    };
  };
  recommendations: {
    voiceOptimizations: string[];
    featureSuggestions: string[];
    engagementImprovements: string[];
  };
}
```

## Multi-language Support

### Language Detection

Automatically detect user's language from voice input.

#### `POST /api/v1/voice/detect-language`

**Request:**
```typescript
// Multipart form data
interface LanguageDetectionRequest {
  audio: File;
  candidateLanguages?: string[]; // Optional language hints
  confidence_threshold?: number; // 0.0 - 1.0
}
```

**Response:**
```typescript
interface LanguageDetectionResponse {
  detectedLanguage: string;
  confidence: number;
  alternatives: Array<{
    language: string;
    confidence: number;
  }>;
  recommended_voice_settings: {
    optimal_voices: string[];
    cultural_adaptations: string[];
  };
}
```

### Voice Translation

Translate and adapt voice content between languages.

#### `POST /api/v1/voice/translate`

**Request:**
```typescript
interface VoiceTranslationRequest {
  sourceAudio?: File; // Audio to translate
  sourceText?: string; // Text to translate and vocalize
  sourceLanguage: string;
  targetLanguage: string;
  maintainVoiceCharacteristics: boolean;
  culturalAdaptation: boolean;
  targetVoiceId?: string;
}
```

**Response:**
```typescript
interface VoiceTranslationResponse {
  translatedText: string;
  translatedAudioUrl: string;
  originalLanguage: string;
  targetLanguage: string;
  confidence: number;
  culturalAdaptations: string[];
  cost: {
    translationCredits: number;
    voiceCredits: number;
    totalCost: number;
  };
}
```

## Error Handling

### Standard Error Response

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
  suggestions?: string[];
}
```

### Common Error Codes

- `VOICE_001` - Invalid voice ID
- `VOICE_002` - Insufficient credits
- `VOICE_003` - Audio file too large
- `VOICE_004` - Unsupported audio format
- `VOICE_005` - Text too long
- `VOICE_006` - Rate limit exceeded
- `VOICE_007` - Language not supported
- `VOICE_008` - Voice cloning failed
- `VOICE_009` - Conversation session expired
- `VOICE_010` - Translation service unavailable

## Rate Limiting

Voice API endpoints have specific rate limits:

- Text-to-Speech: 60 requests/minute
- Speech-to-Text: 30 requests/minute  
- Conversation: 10 sessions/minute
- Voice Commands: 120 requests/minute
- Music Generation: 5 requests/minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Voice Event Notifications

Register webhooks to receive voice event notifications:

#### Webhook Events

- `voice.generation.completed`
- `voice.transcription.completed`
- `voice.conversation.started`
- `voice.conversation.ended`
- `voice.clone.completed`
- `voice.error.occurred`

#### Webhook Payload

```typescript
interface VoiceWebhookPayload {
  event: string;
  timestamp: string;
  userId?: string;
  data: {
    resourceId: string;
    status: string;
    metadata: Record<string, any>;
  };
  signature: string; // HMAC signature for verification
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { LifeQuestVoiceAPI } from '@lifequest/voice-sdk';

const voiceApi = new LifeQuestVoiceAPI({
  apiKey: process.env.LIFEQUEST_API_KEY,
  voiceApiKey: process.env.ELEVENLABS_API_KEY
});

// Generate quest narration
const narration = await voiceApi.generateQuestNarration(questId, {
  event: 'start',
  voiceId: 'quest-narrator-de',
  includeMusic: true
});

// Start AI conversation
const conversation = await voiceApi.startConversation('life-coach', {
  conversationType: 'daily_checkin',
  voiceEnabled: true
});
```

### cURL Examples

```bash
# Generate speech
curl -X POST https://api.lifequest.app/v1/voice/text-to-speech \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Voice-API-Key: $VOICE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Willkommen zu deiner neuen Quest!",
    "voiceId": "quest-narrator-de",
    "settings": {
      "stability": 0.8,
      "similarity": 0.9
    }
  }'

# Upload audio for transcription
curl -X POST https://api.lifequest.app/v1/voice/speech-to-text \
  -H "Authorization: Bearer $TOKEN" \
  -F "audio=@voice_command.mp3" \
  -F "language=de" \
  -F "detectLanguage=true"
```

---

*This comprehensive API documentation provides all the necessary endpoints and examples for integrating ElevenLabs voice capabilities into LifeQuest, creating an immersive and engaging voice-powered experience.*
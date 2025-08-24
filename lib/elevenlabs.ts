/**
 * ElevenLabs Voice Integration Client for LifeQuest
 * 
 * This module provides comprehensive integration with ElevenLabs API
 * for voice generation, speech-to-text, conversational AI, and music generation.
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { EventEmitter } from 'events';

// Types and Interfaces
export interface VoiceSettings {
  stability: number; // 0.0 - 1.0
  similarity: number; // 0.0 - 1.0
  style?: number; // 0.0 - 1.0
  use_speaker_boost?: boolean;
}

export interface VoiceModel {
  voice_id: string;
  name: string;
  samples: VoiceSample[];
  category: 'premade' | 'cloned' | 'professional';
  fine_tuning: {
    language: string;
    is_allowed_to_fine_tune: boolean;
  };
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings?: VoiceSettings;
}

export interface VoiceSample {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  pronunciation_dictionary_locators?: Array<{
    pronunciation_dictionary_id: string;
    version_id: string;
  }>;
}

export interface ConversationRequest {
  agent_id: string;
  message: string;
  conversation_id?: string;
  voice_settings?: VoiceSettings;
}

export interface MusicGenerationRequest {
  text: string;
  duration_seconds?: number;
  prompt_influence?: number;
  infill_mode?: boolean;
}

export interface VoiceCloneRequest {
  name: string;
  description: string;
  files: File[];
  labels?: Record<string, string>;
}

export interface TranscriptionRequest {
  audio: File | Blob | ArrayBuffer;
  model?: 'whisper-1';
  language?: string;
  prompt?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  temperature?: number;
}

// LifeQuest-specific voice agent configurations
export const LIFEQUEST_VOICE_AGENTS = {
  QUEST_NARRATOR: {
    id: 'quest-narrator-de',
    name: 'Der Geschichtenerzähler',
    description: 'Warm, authoritative narrator for quest introductions and celebrations',
    language: 'de',
    characteristics: {
      tone: 'inspiring',
      energy: 'moderate',
      formality: 'friendly-formal',
      accent: 'standard-german'
    },
    settings: {
      stability: 0.8,
      similarity: 0.9,
      style: 0.6,
      use_speaker_boost: true
    },
    use_cases: ['quest_start', 'quest_completion', 'milestone_celebration']
  },
  
  LIFE_COACH: {
    id: 'life-coach-de',
    name: 'Der Lebensberater',
    description: 'Energetic, motivational coach for daily encouragement',
    language: 'de',
    characteristics: {
      tone: 'motivational',
      energy: 'high',
      formality: 'casual-supportive',
      accent: 'austrian-german'
    },
    settings: {
      stability: 0.75,
      similarity: 0.85,
      style: 0.8,
      use_speaker_boost: true
    },
    use_cases: ['daily_checkin', 'motivation_boost', 'goal_setting']
  },
  
  PROGRESS_TRACKER: {
    id: 'progress-tracker-de',
    name: 'Der Fortschrittswächter',
    description: 'Friendly, informative voice for statistics and updates',
    language: 'de',
    characteristics: {
      tone: 'informative',
      energy: 'moderate',
      formality: 'professional-friendly',
      accent: 'swiss-german'
    },
    settings: {
      stability: 0.9,
      similarity: 0.8,
      style: 0.4,
      use_speaker_boost: false
    },
    use_cases: ['progress_update', 'statistics', 'reminders']
  },
  
  CREW_COMMUNICATOR: {
    id: 'crew-communicator-de',
    name: 'Der Gemeinschaftsgeist',
    description: 'Social, inclusive voice for crew interactions',
    language: 'de',
    characteristics: {
      tone: 'social',
      energy: 'moderate-high',
      formality: 'casual',
      accent: 'berlin-german'
    },
    settings: {
      stability: 0.7,
      similarity: 0.8,
      style: 0.7,
      use_speaker_boost: true
    },
    use_cases: ['crew_messages', 'social_features', 'group_activities']
  }
} as const;

export type VoiceAgentId = keyof typeof LIFEQUEST_VOICE_AGENTS;

/**
 * Cost tracking and optimization utilities
 */
export class VoiceCostTracker {
  private monthlyUsage = 0;
  private readonly MONTHLY_LIMIT = 1000000; // characters
  private readonly COST_PER_CHARACTER = 0.0001; // USD
  
  trackUsage(characterCount: number): void {
    this.monthlyUsage += characterCount;
  }
  
  getRemainingQuota(): number {
    return Math.max(0, this.MONTHLY_LIMIT - this.monthlyUsage);
  }
  
  estimateCost(text: string): number {
    return text.length * this.COST_PER_CHARACTER;
  }
  
  shouldOptimizeForCost(): boolean {
    return this.monthlyUsage > this.MONTHLY_LIMIT * 0.8;
  }
}

/**
 * Audio caching system for improved performance and cost optimization
 */
export class VoiceCache {
  private cache = new Map<string, { audio: ArrayBuffer; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds
  
  generateCacheKey(text: string, voiceSettings: VoiceSettings, voiceId: string): string {
    const content = JSON.stringify({ text, voiceSettings, voiceId });
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `voice_${Math.abs(hash)}`;
  }
  
  get(key: string): ArrayBuffer | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const now = Date.now() / 1000;
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.audio;
  }
  
  set(key: string, audio: ArrayBuffer, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      audio,
      timestamp: Date.now() / 1000,
      ttl
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  cleanup(): void {
    const now = Date.now() / 1000;
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.timestamp + cached.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Main ElevenLabs client class
 */
export class ElevenLabsClient extends EventEmitter {
  private client: AxiosInstance;
  private costTracker: VoiceCostTracker;
  private voiceCache: VoiceCache;
  
  constructor(
    private apiKey: string,
    private baseURL = 'https://api.elevenlabs.io/v1'
  ) {
    super();
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      timeout: 30000,
    });
    
    this.costTracker = new VoiceCostTracker();
    this.voiceCache = new VoiceCache();
    
    this.setupInterceptors();
    
    // Cleanup cache every 30 minutes
    setInterval(() => this.voiceCache.cleanup(), 30 * 60 * 1000);
  }
  
  private setupInterceptors(): void {
    // Request interceptor for logging and cost tracking
    this.client.interceptors.request.use((config) => {
      this.emit('request_start', { url: config.url, method: config.method });
      return config;
    });
    
    // Response interceptor for error handling and metrics
    this.client.interceptors.response.use(
      (response) => {
        this.emit('request_success', { url: response.config.url, status: response.status });
        return response;
      },
      (error) => {
        this.emit('request_error', { 
          url: error.config?.url, 
          status: error.response?.status,
          message: error.message 
        });
        throw error;
      }
    );
  }
  
  /**
   * Get all available voices
   */
  async getVoices(): Promise<VoiceModel[]> {
    try {
      const response: AxiosResponse<{ voices: VoiceModel[] }> = await this.client.get('/voices');
      return response.data.voices;
    } catch (error) {
      this.emit('error', { method: 'getVoices', error });
      throw error;
    }
  }
  
  /**
   * Generate speech from text with caching support
   */
  async generateSpeech(request: GenerateSpeechRequest, useCache = true): Promise<ArrayBuffer> {
    const cacheKey = this.voiceCache.generateCacheKey(
      request.text,
      request.voice_settings || {},
      request.voice_id
    );
    
    // Check cache first
    if (useCache) {
      const cachedAudio = this.voiceCache.get(cacheKey);
      if (cachedAudio) {
        this.emit('cache_hit', { cacheKey, textLength: request.text.length });
        return cachedAudio;
      }
    }
    
    try {
      // Track cost
      this.costTracker.trackUsage(request.text.length);
      const estimatedCost = this.costTracker.estimateCost(request.text);
      
      this.emit('generation_start', { 
        textLength: request.text.length, 
        voiceId: request.voice_id,
        estimatedCost 
      });
      
      const response: AxiosResponse<ArrayBuffer> = await this.client.post(
        `/text-to-speech/${request.voice_id}`,
        {
          text: request.text,
          model_id: request.model_id || 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.8,
            similarity: 0.9,
            style: 0.5,
            use_speaker_boost: true,
            ...request.voice_settings
          }
        },
        {
          responseType: 'arraybuffer',
        }
      );
      
      const audioBuffer = response.data;
      
      // Cache the result
      if (useCache) {
        this.voiceCache.set(cacheKey, audioBuffer);
      }
      
      this.emit('generation_complete', { 
        textLength: request.text.length,
        audioSize: audioBuffer.byteLength,
        voiceId: request.voice_id,
        cached: false
      });
      
      return audioBuffer;
    } catch (error) {
      this.emit('error', { method: 'generateSpeech', request, error });
      throw error;
    }
  }
  
  /**
   * Generate speech with streaming support
   */
  async *generateSpeechStream(
    request: GenerateSpeechRequest
  ): AsyncGenerator<Uint8Array, void, unknown> {
    try {
      this.emit('stream_start', { textLength: request.text.length, voiceId: request.voice_id });
      
      const response = await this.client.post(
        `/text-to-speech/${request.voice_id}/stream`,
        {
          text: request.text,
          model_id: request.model_id || 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.8,
            similarity: 0.9,
            ...request.voice_settings
          }
        },
        {
          responseType: 'stream',
        }
      );
      
      const stream = response.data;
      let chunkCount = 0;
      
      for await (const chunk of stream) {
        chunkCount++;
        this.emit('stream_chunk', { chunkNumber: chunkCount, chunkSize: chunk.length });
        yield chunk;
      }
      
      this.emit('stream_complete', { totalChunks: chunkCount });
    } catch (error) {
      this.emit('error', { method: 'generateSpeechStream', request, error });
      throw error;
    }
  }
  
  /**
   * Transcribe audio to text
   */
  async transcribeAudio(request: TranscriptionRequest): Promise<{
    text: string;
    language?: string;
    confidence?: number;
  }> {
    try {
      const formData = new FormData();
      
      if (request.audio instanceof File) {
        formData.append('file', request.audio);
      } else if (request.audio instanceof Blob) {
        formData.append('file', request.audio, 'audio.wav');
      } else {
        // ArrayBuffer - convert to Blob
        const blob = new Blob([request.audio], { type: 'audio/wav' });
        formData.append('file', blob, 'audio.wav');
      }
      
      formData.append('model', request.model || 'whisper-1');
      
      if (request.language) formData.append('language', request.language);
      if (request.prompt) formData.append('prompt', request.prompt);
      if (request.response_format) formData.append('response_format', request.response_format);
      if (request.temperature !== undefined) formData.append('temperature', request.temperature.toString());
      
      const response = await this.client.post('/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      this.emit('transcription_complete', { 
        textLength: response.data.text?.length || 0,
        language: response.data.language 
      });
      
      return response.data;
    } catch (error) {
      this.emit('error', { method: 'transcribeAudio', error });
      throw error;
    }
  }
  
  /**
   * Start a conversational AI session
   */
  async startConversation(agentId: string, initialMessage: string): Promise<{
    conversationId: string;
    response: string;
    audioUrl?: string;
  }> {
    try {
      const response = await this.client.post('/conversational-ai/conversations', {
        agent_id: agentId,
        message: initialMessage,
      });
      
      this.emit('conversation_started', { 
        conversationId: response.data.conversation_id,
        agentId 
      });
      
      return response.data;
    } catch (error) {
      this.emit('error', { method: 'startConversation', agentId, error });
      throw error;
    }
  }
  
  /**
   * Continue a conversation
   */
  async continueConversation(
    conversationId: string, 
    message: string,
    voiceSettings?: VoiceSettings
  ): Promise<{
    response: string;
    audioUrl?: string;
  }> {
    try {
      const response = await this.client.post(`/conversational-ai/conversations/${conversationId}`, {
        message,
        voice_settings: voiceSettings,
      });
      
      this.emit('conversation_message', { conversationId, messageLength: message.length });
      
      return response.data;
    } catch (error) {
      this.emit('error', { method: 'continueConversation', conversationId, error });
      throw error;
    }
  }
  
  /**
   * Generate music from text description
   */
  async generateMusic(request: MusicGenerationRequest): Promise<ArrayBuffer> {
    try {
      const response: AxiosResponse<ArrayBuffer> = await this.client.post(
        '/music-generation',
        request,
        {
          responseType: 'arraybuffer',
        }
      );
      
      this.emit('music_generated', { 
        promptLength: request.text.length,
        duration: request.duration_seconds,
        audioSize: response.data.byteLength 
      });
      
      return response.data;
    } catch (error) {
      this.emit('error', { method: 'generateMusic', request, error });
      throw error;
    }
  }
  
  /**
   * Clone a voice from audio samples
   */
  async cloneVoice(request: VoiceCloneRequest): Promise<{
    voice_id: string;
    status: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('name', request.name);
      formData.append('description', request.description);
      
      request.files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      
      if (request.labels) {
        formData.append('labels', JSON.stringify(request.labels));
      }
      
      const response = await this.client.post('/voices/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      this.emit('voice_cloned', { 
        voiceId: response.data.voice_id,
        name: request.name,
        sampleCount: request.files.length 
      });
      
      return response.data;
    } catch (error) {
      this.emit('error', { method: 'cloneVoice', request, error });
      throw error;
    }
  }
  
  /**
   * Get voice cloning status
   */
  async getVoiceCloneStatus(voiceId: string): Promise<{
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
    error_message?: string;
  }> {
    try {
      const response = await this.client.get(`/voices/${voiceId}`);
      return response.data;
    } catch (error) {
      this.emit('error', { method: 'getVoiceCloneStatus', voiceId, error });
      throw error;
    }
  }
  
  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<{
    character_count: number;
    character_limit: number;
    can_extend_character_limit: boolean;
    allowed_to_extend_character_limit: boolean;
    next_character_count_reset_unix: number;
    voice_limit: number;
    voice_count: number;
    can_extend_voice_limit: boolean;
  }> {
    try {
      const response = await this.client.get('/user');
      return response.data.subscription;
    } catch (error) {
      this.emit('error', { method: 'getUsageStats', error });
      throw error;
    }
  }
  
  /**
   * Get cost tracking information
   */
  getCostInfo() {
    return {
      monthlyUsage: this.costTracker['monthlyUsage'],
      remainingQuota: this.costTracker.getRemainingQuota(),
      shouldOptimize: this.costTracker.shouldOptimizeForCost(),
      cacheSize: this.voiceCache['cache'].size
    };
  }
  
  /**
   * Helper method to generate LifeQuest-specific narrations
   */
  async generateQuestNarration(
    agentId: VoiceAgentId,
    text: string,
    context?: {
      userName?: string;
      questType?: string;
      milestone?: string;
      emotionalTone?: 'encouraging' | 'celebratory' | 'supportive' | 'motivational';
    }
  ): Promise<ArrayBuffer> {
    const agent = LIFEQUEST_VOICE_AGENTS[agentId];
    
    // Adapt voice settings based on context
    const adaptedSettings = { ...agent.settings };
    if (context?.emotionalTone === 'celebratory') {
      adaptedSettings.style = Math.min(1.0, adaptedSettings.style + 0.2);
    } else if (context?.emotionalTone === 'supportive') {
      adaptedSettings.stability = Math.min(1.0, adaptedSettings.stability + 0.1);
    }
    
    // Personalize text if user name provided
    let personalizedText = text;
    if (context?.userName) {
      personalizedText = text.replace(/\{userName\}/g, context.userName);
    }
    
    return this.generateSpeech({
      text: personalizedText,
      voice_id: agent.id,
      voice_settings: adaptedSettings,
    });
  }
}

/**
 * LifeQuest-specific voice service wrapper
 */
export class LifeQuestVoiceService {
  constructor(private elevenLabsClient: ElevenLabsClient) {}
  
  /**
   * Generate quest start narration
   */
  async narrateQuestStart(
    questTitle: string,
    userName: string,
    questType: string
  ): Promise<ArrayBuffer> {
    const narrationText = `
      Willkommen zu deiner neuen ${questType}-Quest "${questTitle}", ${userName}!
      Heute wirst du deine Grenzen überwinden und einen wichtigen Schritt 
      in Richtung deiner Ziele machen. Deine Crew glaubt an dich!
    `.trim();
    
    return this.elevenLabsClient.generateQuestNarration('QUEST_NARRATOR', narrationText, {
      userName,
      questType,
      emotionalTone: 'encouraging'
    });
  }
  
  /**
   * Generate progress celebration
   */
  async celebrateProgress(
    achievement: string,
    userName: string,
    xpGained: number
  ): Promise<ArrayBuffer> {
    const celebrationText = `
      Fantastisch, ${userName}! ${achievement}
      Du hast ${xpGained} Erfahrungspunkte verdient und bist deinen Zielen einen Schritt näher gekommen!
    `.trim();
    
    return this.elevenLabsClient.generateQuestNarration('QUEST_NARRATOR', celebrationText, {
      userName,
      emotionalTone: 'celebratory'
    });
  }
  
  /**
   * Generate daily motivation check-in
   */
  async generateDailyCheckIn(userName: string, timeOfDay: string): Promise<ArrayBuffer> {
    const greetings = {
      morning: 'Guten Morgen',
      afternoon: 'Guten Tag',
      evening: 'Guten Abend'
    };
    
    const checkInText = `
      ${greetings[timeOfDay as keyof typeof greetings]}, ${userName}!
      Wie fühlst du dich heute? Lass uns schauen, wie wir deinen Tag optimal gestalten können.
      Welches Ziel möchtest du heute prioritisieren?
    `.trim();
    
    return this.elevenLabsClient.generateQuestNarration('LIFE_COACH', checkInText, {
      userName,
      emotionalTone: 'motivational'
    });
  }
  
  /**
   * Generate crew communication message
   */
  async generateCrewMessage(
    message: string,
    senderName: string,
    messageType: 'achievement' | 'support' | 'general'
  ): Promise<ArrayBuffer> {
    const contextualPrefix = {
      achievement: `${senderName} hat großartige Neuigkeiten zu teilen:`,
      support: `${senderName} braucht eure Unterstützung:`,
      general: `Nachricht von ${senderName}:`
    };
    
    const fullMessage = `${contextualPrefix[messageType]} ${message}`;
    
    return this.elevenLabsClient.generateQuestNarration('CREW_COMMUNICATOR', fullMessage, {
      emotionalTone: messageType === 'achievement' ? 'celebratory' : 'supportive'
    });
  }
}

// Export convenience factory function
export function createLifeQuestVoiceService(elevenLabsApiKey: string): LifeQuestVoiceService {
  const client = new ElevenLabsClient(elevenLabsApiKey);
  return new LifeQuestVoiceService(client);
}

// Export error types
export class VoiceServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'VoiceServiceError';
  }
}

export default ElevenLabsClient;
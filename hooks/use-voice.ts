/**
 * Voice Hook for LifeQuest
 * 
 * Comprehensive React hook for voice functionality including:
 * - Speech recognition and synthesis
 * - Voice command processing
 * - ElevenLabs integration
 * - Cost optimization and caching
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ElevenLabsClient, LifeQuestVoiceService, LIFEQUEST_VOICE_AGENTS, type VoiceAgentId, createLifeQuestVoiceService } from '@/lib/elevenlabs';

// Types
export interface VoiceSettings {
  stability: number;
  similarity: number;
  style?: number;
  speakingRate?: number;
  volume?: number;
}

export interface VoiceCommandResult {
  text: string;
  confidence: number;
  language?: string;
  timestamp: Date;
}

export interface TranscriptionChunk {
  text: string;
  isFinal: boolean;
  confidence: number;
}

export interface VoiceHookReturn {
  // State
  isListening: boolean;
  isGenerating: boolean;
  isPlaying: boolean;
  currentTranscription: string;
  lastCommand: VoiceCommandResult | null;
  voiceSettings: VoiceSettings;
  selectedAgent: string;
  error: string | null;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => void;
  generateSpeech: (text: string, agentId?: VoiceAgentId) => Promise<void>;
  playAudio: (audioUrl: string) => Promise<void>;
  stopAudio: () => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  selectVoiceAgent: (agentId: string) => void;
  clearError: () => void;
  
  // Cost & Performance
  getCostInfo: () => { monthlyUsage: number; remainingQuota: number; cacheSize: number };
  getUsageStats: () => Promise<any>;
}

// Configuration
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.8,
  similarity: 0.9,
  style: 0.5,
  speakingRate: 1.0,
  volume: 1.0
};

const SPEECH_RECOGNITION_CONFIG = {
  language: 'de-DE',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3
};

// German wake words for voice activation
const WAKE_WORDS = ['lifequest', 'life quest', 'hey quest', 'quest'];

export function useVoice(): VoiceHookReturn {
  // Core state
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [lastCommand, setLastCommand] = useState<VoiceCommandResult | null>(null);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [selectedAgent, setSelectedAgent] = useState<string>('QUEST_NARRATOR');
  const [error, setError] = useState<string | null>(null);
  
  // Refs for persistent objects
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceServiceRef = useRef<LifeQuestVoiceService | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const interimTranscriptRef = useRef('');
  
  // Initialize voice service
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (apiKey) {
      voiceServiceRef.current = createLifeQuestVoiceService(apiKey);
    } else {
      setError('ElevenLabs API key not configured');
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser');
        return;
      }

      const recognition = new SpeechRecognition();
      
      // Configure recognition
      Object.assign(recognition, SPEECH_RECOGNITION_CONFIG);
      
      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
        setCurrentTranscription('');
        interimTranscriptRef.current = '';
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setCurrentTranscription('');
      };
      
      recognition.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            
            // Process as command if confidence is high enough
            if (confidence > 0.5) {
              const commandResult: VoiceCommandResult = {
                text: transcript.trim(),
                confidence,
                language: event.results[i][0].lang || 'de-DE',
                timestamp: new Date()
              };
              
              setLastCommand(commandResult);
            }
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update current transcription display
        const fullTranscript = finalTranscript + interimTranscript;
        setCurrentTranscription(fullTranscript);
        interimTranscriptRef.current = interimTranscript;
      };
      
      recognitionRef.current = recognition;
      
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    } catch (error) {
      setError(`Failed to initialize speech recognition: ${error}`);
    }
  }, []);

  // Initialize audio context for advanced audio processing
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not available:', error);
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start listening for voice commands
  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Resume audio context if needed
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      recognitionRef.current.start();
    } catch (error) {
      setError(`Failed to start listening: ${error}`);
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Generate speech using ElevenLabs
  const generateSpeech = useCallback(async (text: string, agentId: VoiceAgentId = 'QUEST_NARRATOR') => {
    if (!voiceServiceRef.current) {
      setError('Voice service not initialized');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const audioBuffer = await voiceServiceRef.current.elevenLabsClient.generateQuestNarration(
        agentId,
        text,
        {
          emotionalTone: 'encouraging'
        }
      );

      // Convert ArrayBuffer to audio URL
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(blob);

      // Auto-play the generated audio
      await playAudio(audioUrl);
      
    } catch (error) {
      setError(`Failed to generate speech: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Play audio from URL
  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      // Stop any currently playing audio
      stopAudio();

      // Create new audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Configure audio
      audio.volume = voiceSettings.volume || 1.0;
      audio.playbackRate = voiceSettings.speakingRate || 1.0;

      // Set up event listeners
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // Clean up blob URL
      };
      
      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
      };

      // Play the audio
      await audio.play();
      
    } catch (error) {
      setError(`Failed to play audio: ${error}`);
      setIsPlaying(false);
    }
  }, [voiceSettings.volume, voiceSettings.speakingRate]);

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Update voice settings
  const updateVoiceSettings = useCallback((settings: Partial<VoiceSettings>) => {
    setVoiceSettings(prev => ({ ...prev, ...settings }));
    
    // Apply settings to current audio if playing
    if (audioRef.current) {
      if (settings.volume !== undefined) {
        audioRef.current.volume = settings.volume;
      }
      if (settings.speakingRate !== undefined) {
        audioRef.current.playbackRate = settings.speakingRate;
      }
    }
  }, []);

  // Select voice agent
  const selectVoiceAgent = useCallback((agentId: string) => {
    if (agentId in LIFEQUEST_VOICE_AGENTS) {
      setSelectedAgent(agentId);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get cost information
  const getCostInfo = useCallback(() => {
    if (voiceServiceRef.current) {
      return voiceServiceRef.current.elevenLabsClient.getCostInfo();
    }
    return { monthlyUsage: 0, remainingQuota: 0, cacheSize: 0 };
  }, []);

  // Get usage statistics
  const getUsageStats = useCallback(async () => {
    if (voiceServiceRef.current) {
      try {
        return await voiceServiceRef.current.elevenLabsClient.getUsageStats();
      } catch (error) {
        console.error('Failed to get usage stats:', error);
        return null;
      }
    }
    return null;
  }, []);

  // Wake word detection (simplified implementation)
  useEffect(() => {
    if (currentTranscription && !isListening) {
      const transcript = currentTranscription.toLowerCase();
      const hasWakeWord = WAKE_WORDS.some(word => transcript.includes(word));
      
      if (hasWakeWord && !isListening) {
        // Auto-start listening when wake word is detected
        startListening();
      }
    }
  }, [currentTranscription, isListening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      stopAudio();
    };
  }, [stopListening, stopAudio]);

  return {
    // State
    isListening,
    isGenerating,
    isPlaying,
    currentTranscription,
    lastCommand,
    voiceSettings,
    selectedAgent,
    error,
    
    // Actions
    startListening,
    stopListening,
    generateSpeech,
    playAudio,
    stopAudio,
    updateVoiceSettings,
    selectVoiceAgent,
    clearError,
    
    // Cost & Performance
    getCostInfo,
    getUsageStats
  };
}

// Convenience hooks for specific voice features
export function useVoiceCommands() {
  const voice = useVoice();
  
  const executeCommand = useCallback(async (command: string) => {
    // Process command based on intent
    // This is a simplified version - full implementation would include NLP
    if (command.includes('quest')) {
      await voice.generateSpeech('Quest-Befehl erkannt', 'QUEST_NARRATOR');
    } else if (command.includes('progress') || command.includes('fortschritt')) {
      await voice.generateSpeech('Zeige Fortschritt', 'PROGRESS_TRACKER');
    } else if (command.includes('crew')) {
      await voice.generateSpeech('Crew-Nachricht', 'CREW_COMMUNICATOR');
    } else {
      await voice.generateSpeech('Befehl nicht erkannt', 'LIFE_COACH');
    }
  }, [voice]);

  return {
    ...voice,
    executeCommand
  };
}

export function useVoiceNarration() {
  const voice = useVoice();
  
  const narrateQuestStart = useCallback(async (questTitle: string, userName: string) => {
    if (!voiceServiceRef.current) return;
    
    const audio = await voiceServiceRef.current.narrateQuestStart(
      questTitle,
      userName,
      'general'
    );
    
    const blob = new Blob([audio], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    await voice.playAudio(audioUrl);
  }, [voice]);

  const celebrateProgress = useCallback(async (achievement: string, userName: string, xp: number) => {
    if (!voiceServiceRef.current) return;
    
    const audio = await voiceServiceRef.current.celebrateProgress(
      achievement,
      userName,
      xp
    );
    
    const blob = new Blob([audio], { type: 'audio/mpeg' });
    const audioUrl = URL.createObjectURL(blob);
    await voice.playAudio(audioUrl);
  }, [voice]);

  return {
    ...voice,
    narrateQuestStart,
    celebrateProgress
  };
}

// Type guards
export function isVoiceSupported(): boolean {
  return typeof window !== 'undefined' && 
         'SpeechRecognition' in window || 
         'webkitSpeechRecognition' in window;
}

export function isAudioContextSupported(): boolean {
  return typeof window !== 'undefined' && 
         ('AudioContext' in window || 'webkitAudioContext' in window);
}
/**
 * Voice Controls Component for LifeQuest
 * 
 * Provides comprehensive voice interaction controls including:
 * - Voice command input
 * - Audio playback controls
 * - Voice settings
 * - Agent voice selection
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Pause, Square, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoice } from '@/hooks/use-voice';
import { LIFEQUEST_VOICE_AGENTS, type VoiceAgentId } from '@/lib/elevenlabs';

interface VoiceControlsProps {
  className?: string;
  showAdvancedControls?: boolean;
  onVoiceCommand?: (command: string, confidence: number) => void;
  onAudioStateChange?: (state: 'playing' | 'paused' | 'stopped') => void;
}

interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export function VoiceControls({
  className = '',
  showAdvancedControls = false,
  onVoiceCommand,
  onAudioStateChange
}: VoiceControlsProps) {
  // Voice hook for core functionality
  const {
    isListening,
    isGenerating,
    currentTranscription,
    lastCommand,
    voiceSettings,
    selectedAgent,
    startListening,
    stopListening,
    generateSpeech,
    updateVoiceSettings,
    selectVoiceAgent,
    error
  } = useVoice();

  // Audio playback state
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    volume: 1.0
  });

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [commandHistory, setCommandHistory] = useState<Array<{
    command: string;
    timestamp: Date;
    confidence: number;
    executed: boolean;
  }>>([]);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const visualizerRef = useRef<HTMLCanvasElement>(null);

  // Handle voice command recognition
  useEffect(() => {
    if (lastCommand && lastCommand.confidence > 0.7) {
      setCommandHistory(prev => [
        {
          command: lastCommand.text,
          timestamp: new Date(),
          confidence: lastCommand.confidence,
          executed: true
        },
        ...prev.slice(0, 4) // Keep last 5 commands
      ]);
      
      onVoiceCommand?.(lastCommand.text, lastCommand.confidence);
    }
  }, [lastCommand, onVoiceCommand]);

  // Audio event handlers
  const handleAudioPlay = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: true, isPaused: false }));
    onAudioStateChange?.('playing');
  }, [onAudioStateChange]);

  const handleAudioPause = useCallback(() => {
    setAudioState(prev => ({ ...prev, isPlaying: false, isPaused: true }));
    onAudioStateChange?.('paused');
  }, [onAudioStateChange]);

  const handleAudioStop = useCallback(() => {
    setAudioState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      isPaused: false, 
      currentTime: 0 
    }));
    onAudioStateChange?.('stopped');
  }, [onAudioStateChange]);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setAudioState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
        duration: audioRef.current!.duration || 0
      }));
    }
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const volume = value[0] / 100;
    setAudioState(prev => ({ ...prev, volume }));
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Voice visualization setup
  useEffect(() => {
    if (isListening && visualizerRef.current) {
      const canvas = visualizerRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const drawVisualizer = () => {
        if (!isListening) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#3b82f6';
        
        // Simple animated bars for voice visualization
        const bars = 20;
        const barWidth = canvas.width / bars;
        
        for (let i = 0; i < bars; i++) {
          const height = Math.random() * canvas.height * 0.8 + 10;
          ctx.fillRect(i * barWidth, canvas.height - height, barWidth - 2, height);
        }
        
        requestAnimationFrame(drawVisualizer);
      };
      
      drawVisualizer();
    }
  }, [isListening]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Controls</span>
          <div className="flex items-center gap-2">
            {selectedAgent && (
              <Badge variant="outline">
                {LIFEQUEST_VOICE_AGENTS[selectedAgent as VoiceAgentId].name}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Voice Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isListening ? 'destructive' : 'default'}
            size="lg"
            className="rounded-full w-16 h-16"
            onClick={isListening ? stopListening : startListening}
            disabled={isGenerating}
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isListening ? 'Listening...' : 'Click to speak'}
            </p>
            {isGenerating && (
              <p className="text-sm text-blue-600">Generating voice...</p>
            )}
          </div>
        </div>

        {/* Voice Visualization */}
        {isListening && (
          <div className="flex justify-center">
            <canvas
              ref={visualizerRef}
              width={300}
              height={60}
              className="border rounded-lg bg-gray-50"
            />
          </div>
        )}

        {/* Current Transcription */}
        {currentTranscription && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Hearing:</strong> {currentTranscription}
            </p>
          </div>
        )}

        {/* Audio Playback Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioRef.current) {
                  if (audioState.isPlaying) {
                    audioRef.current.pause();
                  } else {
                    audioRef.current.play();
                  }
                }
              }}
              disabled={!audioState.duration}
            >
              {audioState.isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  handleAudioStop();
                }
              }}
              disabled={!audioState.duration}
            >
              <Square className="h-4 w-4" />
            </Button>

            <div className="flex-1 mx-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatTime(audioState.currentTime)}</span>
                <Progress 
                  value={(audioState.currentTime / audioState.duration) * 100} 
                  className="flex-1"
                />
                <span>{formatTime(audioState.duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVolumeChange([audioState.volume === 0 ? 100 : 0])}
              >
                {audioState.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[audioState.volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Command History */}
        {commandHistory.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Commands</h4>
            <div className="space-y-2">
              {commandHistory.map((cmd, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <span className="flex-1">{cmd.command}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getConfidenceColor(cmd.confidence)}`}
                      title={`Confidence: ${(cmd.confidence * 100).toFixed(0)}%`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {cmd.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {showSettings && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-medium">Voice Settings</h4>
            
            {/* Voice Agent Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice Agent</label>
              <Select
                value={selectedAgent}
                onValueChange={selectVoiceAgent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice agent" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LIFEQUEST_VOICE_AGENTS).map(([key, agent]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span>{agent.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {agent.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Voice Stability */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Voice Stability ({voiceSettings.stability})
              </label>
              <Slider
                value={[voiceSettings.stability * 100]}
                onValueChange={(value) => 
                  updateVoiceSettings({ stability: value[0] / 100 })
                }
                max={100}
                step={1}
              />
            </div>

            {/* Voice Similarity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Voice Similarity ({voiceSettings.similarity})
              </label>
              <Slider
                value={[voiceSettings.similarity * 100]}
                onValueChange={(value) => 
                  updateVoiceSettings({ similarity: value[0] / 100 })
                }
                max={100}
                step={1}
              />
            </div>

            {/* Speaking Rate */}
            {showAdvancedControls && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Speaking Rate ({voiceSettings.speakingRate || 1.0})
                </label>
                <Slider
                  value={[(voiceSettings.speakingRate || 1.0) * 100]}
                  onValueChange={(value) => 
                    updateVoiceSettings({ speakingRate: value[0] / 100 })
                  }
                  min={50}
                  max={200}
                  step={5}
                />
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          onPlay={handleAudioPlay}
          onPause={handleAudioPause}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioTimeUpdate}
          onEnded={handleAudioStop}
          preload="metadata"
        />
      </CardContent>
    </Card>
  );
}
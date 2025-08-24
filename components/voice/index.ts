/**
 * Voice Components Barrel Export
 * 
 * Centralized export point for all voice-related components
 */

export { VoiceControls } from './VoiceControls';
export { VoiceCommandProcessor } from './VoiceCommandProcessor';

// Export types
export type {
  VoiceControlsProps,
  VoiceCommandProcessorProps,
  VoiceCommand,
  CommandIntent
} from './VoiceControls';

// Re-export voice hook types
export type {
  VoiceSettings,
  VoiceCommandResult,
  VoiceHookReturn
} from '@/hooks/use-voice';
/**
 * Voice Command Processor Component for LifeQuest
 * 
 * Processes and executes voice commands with contextual understanding
 * Integrates with LifeQuest's quest system and crew features
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';
import { useVoice } from '@/hooks/use-voice';

interface VoiceCommand {
  id: string;
  text: string;
  intent: CommandIntent;
  confidence: number;
  parameters: Record<string, any>;
  timestamp: Date;
  status: 'processing' | 'executed' | 'failed' | 'requires_confirmation';
  result?: any;
  error?: string;
}

type CommandIntent = 
  | 'start_quest'
  | 'check_progress' 
  | 'pause_quest'
  | 'show_stats'
  | 'crew_message'
  | 'set_reminder'
  | 'help'
  | 'unknown';

interface VoiceCommandProcessorProps {
  onCommandExecuted?: (command: VoiceCommand, result: any) => void;
  onCommandFailed?: (command: VoiceCommand, error: string) => void;
  className?: string;
}

// German command patterns for LifeQuest
const COMMAND_PATTERNS: Record<string, { 
  intent: CommandIntent; 
  patterns: RegExp[];
  examples: string[];
}> = {
  start_quest: {
    intent: 'start_quest',
    patterns: [
      /starte?\s+(eine\s+)?(neue\s+)?quest/i,
      /beginne?\s+(mit\s+)?(einer\s+)?quest/i,
      /neue\s+quest\s+(starten|beginnen)/i,
    ],
    examples: ['Starte eine neue Quest', 'Beginne mit einer Quest', 'Neue Quest starten']
  },
  
  check_progress: {
    intent: 'check_progress',
    patterns: [
      /zeige?\s+(mir\s+)?(meine\s+)?fortschritte?/i,
      /wie\s+(weit\s+)?bin\s+ich/i,
      /fortschritt\s+(anzeigen|zeigen)/i,
      /wie\s+viel\s+(xp|erfahrung)/i,
    ],
    examples: ['Zeige meine Fortschritte', 'Wie weit bin ich?', 'Wie viel XP habe ich?']
  },
  
  pause_quest: {
    intent: 'pause_quest',
    patterns: [
      /pausiere?\s+(die\s+)?(aktuelle\s+)?quest/i,
      /stoppe?\s+(die\s+)?quest/i,
      /quest\s+(pausieren|stoppen)/i,
    ],
    examples: ['Pausiere die Quest', 'Stoppe die aktuelle Quest']
  },
  
  show_stats: {
    intent: 'show_stats',
    patterns: [
      /zeige?\s+(mir\s+)?(meine\s+)?statistiken?/i,
      /statistik\s+(anzeigen|zeigen)/i,
      /wie\s+sind\s+meine\s+werte/i,
    ],
    examples: ['Zeige meine Statistiken', 'Wie sind meine Werte?']
  },
  
  crew_message: {
    intent: 'crew_message',
    patterns: [
      /sende?\s+(eine\s+)?nachricht\s+an\s+(die\s+)?crew/i,
      /crew\s+benachrichtigen/i,
      /nachricht\s+(an\s+)?crew/i,
    ],
    examples: ['Sende eine Nachricht an die Crew', 'Crew benachrichtigen']
  },
  
  set_reminder: {
    intent: 'set_reminder',
    patterns: [
      /stelle?\s+(einen\s+)?reminder\s+ein/i,
      /erinnere?\s+mich\s+(an|in)/i,
      /(reminder|erinnerung)\s+(einrichten|setzen)/i,
    ],
    examples: ['Stelle einen Reminder ein', 'Erinnere mich in einer Stunde']
  },
  
  help: {
    intent: 'help',
    patterns: [
      /hilfe/i,
      /was\s+kann\s+ich\s+(tun|sagen)/i,
      /zeige?\s+(mir\s+)?befehle/i,
      /kommandos\s+(anzeigen|zeigen)/i,
    ],
    examples: ['Hilfe', 'Was kann ich tun?', 'Zeige mir Befehle']
  }
};

export function VoiceCommandProcessor({
  onCommandExecuted,
  onCommandFailed,
  className = ''
}: VoiceCommandProcessorProps) {
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [processingCommand, setProcessingCommand] = useState<VoiceCommand | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState<VoiceCommand | null>(null);
  
  const { lastCommand, generateSpeech } = useVoice();

  // Process new voice commands
  useEffect(() => {
    if (lastCommand && lastCommand.confidence > 0.5) {
      processVoiceCommand(lastCommand.text, lastCommand.confidence);
    }
  }, [lastCommand]);

  const processVoiceCommand = useCallback(async (text: string, confidence: number) => {
    const command: VoiceCommand = {
      id: `cmd_${Date.now()}`,
      text,
      intent: 'unknown',
      confidence,
      parameters: {},
      timestamp: new Date(),
      status: 'processing'
    };

    // Parse command intent and parameters
    const parsed = parseCommand(text);
    command.intent = parsed.intent;
    command.parameters = parsed.parameters;

    // Add to command list
    setCommands(prev => [command, ...prev.slice(0, 9)]);
    setProcessingCommand(command);

    try {
      // Execute command based on intent
      const result = await executeCommand(command);
      
      // Update command status
      const updatedCommand = {
        ...command,
        status: result.requiresConfirmation ? 'requires_confirmation' as const : 'executed' as const,
        result: result.data
      };
      
      updateCommandInList(updatedCommand);
      
      if (result.requiresConfirmation) {
        setConfirmationRequired(updatedCommand);
      } else {
        onCommandExecuted?.(updatedCommand, result.data);
        
        // Generate voice response
        if (result.responseText) {
          await generateVoiceResponse(result.responseText);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const failedCommand = {
        ...command,
        status: 'failed' as const,
        error: errorMessage
      };
      
      updateCommandInList(failedCommand);
      onCommandFailed?.(failedCommand, errorMessage);
      
      // Generate error response
      await generateVoiceResponse(`Entschuldigung, ich konnte den Befehl nicht ausführen: ${errorMessage}`);
    } finally {
      setProcessingCommand(null);
    }
  }, [onCommandExecuted, onCommandFailed, generateSpeech]);

  const parseCommand = (text: string): { intent: CommandIntent; parameters: Record<string, any> } => {
    const normalized = text.toLowerCase().trim();
    
    for (const [, config] of Object.entries(COMMAND_PATTERNS)) {
      for (const pattern of config.patterns) {
        const match = normalized.match(pattern);
        if (match) {
          return {
            intent: config.intent,
            parameters: extractParameters(normalized, config.intent, match)
          };
        }
      }
    }
    
    return { intent: 'unknown', parameters: {} };
  };

  const extractParameters = (
    text: string, 
    intent: CommandIntent, 
    match: RegExpMatchArray
  ): Record<string, any> => {
    const params: Record<string, any> = {};
    
    switch (intent) {
      case 'start_quest':
        // Extract quest type if mentioned
        const questTypes = ['fitness', 'lernen', 'kreativ', 'sozial', 'achtsamkeit'];
        for (const type of questTypes) {
          if (text.includes(type)) {
            params.questType = type;
            break;
          }
        }
        break;
        
      case 'set_reminder':
        // Extract time information
        const timePatterns = [
          { pattern: /in\s+(\d+)\s+(minute|stunde|tag)/i, multiplier: { minute: 1, stunde: 60, tag: 1440 } },
          { pattern: /um\s+(\d{1,2}):(\d{2})/i, type: 'specific_time' }
        ];
        
        for (const timePattern of timePatterns) {
          const timeMatch = text.match(timePattern.pattern);
          if (timeMatch) {
            if (timePattern.type === 'specific_time') {
              params.reminderTime = `${timeMatch[1]}:${timeMatch[2]}`;
            } else {
              const value = parseInt(timeMatch[1]);
              const unit = timeMatch[2].toLowerCase();
              const multiplier = (timePattern.multiplier as any)[unit] || 1;
              params.reminderMinutes = value * multiplier;
            }
            break;
          }
        }
        break;
        
      case 'crew_message':
        // Extract message content after command
        const messageMatch = text.match(/nachricht.*?:\s*(.+)/i);
        if (messageMatch) {
          params.message = messageMatch[1];
        }
        break;
    }
    
    return params;
  };

  const executeCommand = async (command: VoiceCommand): Promise<{
    data?: any;
    responseText?: string;
    requiresConfirmation?: boolean;
  }> => {
    // Simulate API calls - in real implementation, these would call actual LifeQuest APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (command.intent) {
      case 'start_quest':
        return {
          data: { questId: 'quest_123', questType: command.parameters.questType || 'general' },
          responseText: `Neue Quest wurde gestartet! ${command.parameters.questType ? `Type: ${command.parameters.questType}` : ''}`
        };
        
      case 'check_progress':
        return {
          data: { 
            level: 15, 
            xp: 2450, 
            nextLevelXp: 2500, 
            activeQuests: 3,
            completedToday: 1 
          },
          responseText: 'Du bist Level 15 mit 2450 Erfahrungspunkten. Du hast 3 aktive Quests und hast heute bereits 1 Quest abgeschlossen.'
        };
        
      case 'pause_quest':
        return {
          data: { pausedQuest: 'quest_123' },
          responseText: 'Die aktuelle Quest wurde pausiert.',
          requiresConfirmation: true
        };
        
      case 'show_stats':
        return {
          data: {
            totalQuests: 45,
            completionRate: 87,
            streak: 12,
            favoriteCategory: 'Fitness'
          },
          responseText: 'Du hast 45 Quests mit 87% Abschlussrate. Deine aktuelle Serie: 12 Tage. Lieblingskategorie: Fitness.'
        };
        
      case 'crew_message':
        if (!command.parameters.message) {
          throw new Error('Keine Nachricht angegeben. Sage: "Sende Nachricht an Crew: [deine Nachricht]"');
        }
        return {
          data: { messageId: 'msg_123', recipients: ['crew_member_1', 'crew_member_2'] },
          responseText: 'Nachricht wurde an deine Crew gesendet.'
        };
        
      case 'set_reminder':
        if (!command.parameters.reminderMinutes && !command.parameters.reminderTime) {
          throw new Error('Keine Zeit angegeben. Sage: "Erinnere mich in 30 Minuten" oder "Erinnere mich um 15:30"');
        }
        return {
          data: { reminderId: 'reminder_123', scheduledFor: new Date() },
          responseText: `Reminder wurde ${command.parameters.reminderTime ? `für ${command.parameters.reminderTime}` : `in ${command.parameters.reminderMinutes} Minuten`} eingestellt.`
        };
        
      case 'help':
        const examples = Object.values(COMMAND_PATTERNS)
          .flatMap(pattern => pattern.examples)
          .slice(0, 5);
        
        return {
          data: { availableCommands: examples },
          responseText: `Hier sind einige Befehle, die du verwenden kannst: ${examples.join(', ')}`
        };
        
      default:
        throw new Error('Unbekannter Befehl. Sage "Hilfe" für verfügbare Befehle.');
    }
  };

  const generateVoiceResponse = async (text: string) => {
    try {
      await generateSpeech(text, 'PROGRESS_TRACKER');
    } catch (error) {
      console.error('Failed to generate voice response:', error);
    }
  };

  const updateCommandInList = (updatedCommand: VoiceCommand) => {
    setCommands(prev => 
      prev.map(cmd => cmd.id === updatedCommand.id ? updatedCommand : cmd)
    );
  };

  const confirmCommand = async (command: VoiceCommand) => {
    try {
      // Execute the confirmed command
      await executeConfirmedCommand(command);
      
      const confirmedCommand = {
        ...command,
        status: 'executed' as const
      };
      
      updateCommandInList(confirmedCommand);
      setConfirmationRequired(null);
      
      onCommandExecuted?.(confirmedCommand, command.result);
      await generateVoiceResponse('Befehl wurde bestätigt und ausgeführt.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const failedCommand = {
        ...command,
        status: 'failed' as const,
        error: errorMessage
      };
      
      updateCommandInList(failedCommand);
      setConfirmationRequired(null);
      onCommandFailed?.(failedCommand, errorMessage);
    }
  };

  const cancelCommand = (command: VoiceCommand) => {
    const cancelledCommand = {
      ...command,
      status: 'failed' as const,
      error: 'Cancelled by user'
    };
    
    updateCommandInList(cancelledCommand);
    setConfirmationRequired(null);
    generateVoiceResponse('Befehl wurde abgebrochen.');
  };

  const executeConfirmedCommand = async (command: VoiceCommand) => {
    // Implementation for confirmed commands
    // This would typically involve actual API calls
    console.log('Executing confirmed command:', command);
  };

  const getStatusIcon = (status: VoiceCommand['status']) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'requires_confirmation':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: VoiceCommand['status']) => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'executed':
        return 'border-green-200 bg-green-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      case 'requires_confirmation':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Confirmation Dialog */}
      {confirmationRequired && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Bestätigung erforderlich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-yellow-700">
                Möchtest du diesen Befehl wirklich ausführen?
              </p>
              <p className="font-medium">"{confirmationRequired.text}"</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => confirmCommand(confirmationRequired)}
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Ja, ausführen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => cancelCommand(confirmationRequired)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {processingCommand && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-500 animate-spin" />
              <div className="flex-1">
                <p className="text-blue-700 font-medium">
                  Verarbeite Befehl: "{processingCommand.text}"
                </p>
                <Progress value={undefined} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command History */}
      {commands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Befehlsverlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className={`p-3 rounded-lg border ${getStatusColor(command.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(command.status)}
                        <span className="font-medium">{command.text}</span>
                        <Badge variant="outline" className="text-xs">
                          {(command.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      {command.intent !== 'unknown' && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {command.intent}
                        </Badge>
                      )}
                      
                      {command.error && (
                        <p className="text-red-600 text-sm mt-1">{command.error}</p>
                      )}
                      
                      {command.result && (
                        <pre className="text-xs text-gray-600 mt-1 font-mono">
                          {JSON.stringify(command.result, null, 2)}
                        </pre>
                      )}
                    </div>
                    
                    <span className="text-xs text-muted-foreground ml-2">
                      {command.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      {commands.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Verfügbare Sprachbefehle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(COMMAND_PATTERNS).map(([key, pattern]) => (
                <div key={key} className="space-y-2">
                  <h4 className="font-medium text-sm">{pattern.intent}</h4>
                  <div className="space-y-1">
                    {pattern.examples.map((example, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        "{example}"
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
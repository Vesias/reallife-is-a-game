# E2B Next.js Code Interpreter Integration für LifeQuest
*E2B Next.js Code Interpreter Integration for LifeQuest*

## Übersicht / Overview

E2B Code Interpreter ermöglicht es LifeQuest-Nutzern, Code direkt im Browser auszuführen und interaktive Programmier-Quests zu absolvieren.

*E2B Code Interpreter enables LifeQuest users to execute code directly in the browser and complete interactive programming quests.*

## Installation und Setup

### 1. E2B SDK Installation
```bash
npm install @e2b/code-interpreter
npm install @e2b/sdk
```

### 2. Umgebungsvariablen
```bash
# .env.local
E2B_API_KEY=your_e2b_api_key_here
NEXT_PUBLIC_E2B_API_KEY=your_public_e2b_key_here
```

### 3. E2B Konfiguration
```typescript
// lib/e2b/config.ts
export const E2B_CONFIG = {
  apiKey: process.env.E2B_API_KEY!,
  timeout: 60000, // 60 seconds
  template: 'base', // oder custom template
  
  // Sandbox-Konfiguration
  sandbox: {
    allowNetworking: false,
    maxMemoryMB: 512,
    maxCPUCores: 1,
    timeoutSeconds: 300
  },
  
  // Unterstützte Sprachen
  supportedLanguages: [
    'python',
    'javascript',
    'typescript', 
    'java',
    'cpp',
    'rust',
    'go'
  ]
};
```

## Core Integration

### 1. Code Interpreter Service
```typescript
// lib/e2b/codeInterpreter.ts
import { CodeInterpreter } from '@e2b/code-interpreter';

export class LifeQuestCodeInterpreter {
  private interpreter: CodeInterpreter | null = null;
  
  async initialize(): Promise<void> {
    try {
      this.interpreter = await CodeInterpreter.create({
        apiKey: E2B_CONFIG.apiKey,
        timeout: E2B_CONFIG.timeout
      });
      
      console.log('E2B Code Interpreter initialized');
    } catch (error) {
      console.error('Failed to initialize E2B:', error);
      throw new Error('Code Interpreter initialization failed');
    }
  }
  
  async executeCode(
    code: string, 
    language: string, 
    questId: string
  ): Promise<CodeExecutionResult> {
    if (!this.interpreter) {
      await this.initialize();
    }
    
    try {
      // Sicherheitsprüfung
      await this.validateCode(code, language);
      
      // Code ausführen
      const result = await this.interpreter!.notebook.execCell(code);
      
      // Ergebnis verarbeiten
      const executionResult: CodeExecutionResult = {
        success: true,
        output: result.text || '',
        error: result.error || null,
        executionTime: result.executionTime || 0,
        questId,
        language,
        timestamp: new Date()
      };
      
      // Fortschritt speichern
      await this.saveExecutionResult(executionResult);
      
      return executionResult;
      
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        executionTime: 0,
        questId,
        language,
        timestamp: new Date()
      };
    }
  }
  
  async validateCode(code: string, language: string): Promise<void> {
    // Gefährliche Operationen prüfen
    const dangerousPatterns = [
      /import\s+os/,
      /subprocess/,
      /exec\(/,
      /eval\(/,
      /file\s*\(/,
      /open\s*\(/,
      /system\(/
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error('Gefährliche Operation erkannt');
      }
    }
    
    // Code-Länge begrenzen
    if (code.length > 10000) {
      throw new Error('Code zu lang (max 10.000 Zeichen)');
    }
  }
  
  async cleanup(): Promise<void> {
    if (this.interpreter) {
      await this.interpreter.close();
      this.interpreter = null;
    }
  }
}
```

### 2. Quest Integration
```typescript
// lib/e2b/quest-integration.ts
export class CodeQuestManager {
  private codeInterpreter: LifeQuestCodeInterpreter;
  
  constructor() {
    this.codeInterpreter = new LifeQuestCodeInterpreter();
  }
  
  async createCodeQuest(questData: CodeQuestData): Promise<CodeQuest> {
    const quest: CodeQuest = {
      id: generateId(),
      title: questData.title,
      description: questData.description,
      language: questData.language,
      difficulty: questData.difficulty,
      
      // Test-Cases für automatische Bewertung
      testCases: questData.testCases,
      
      // Starter Code
      starterCode: questData.starterCode || this.getStarterCode(questData.language),
      
      // Erwartetes Ergebnis
      expectedOutput: questData.expectedOutput,
      
      // XP-Belohnung
      xpReward: this.calculateXPReward(questData.difficulty),
      
      // Badges
      availableBadges: this.getAvailableBadges(questData),
      
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.saveQuest(quest);
    return quest;
  }
  
  async executeQuestCode(
    questId: string, 
    userCode: string, 
    userId: string
  ): Promise<QuestExecutionResult> {
    const quest = await this.getQuest(questId);
    if (!quest) {
      throw new Error('Quest nicht gefunden');
    }
    
    // Code ausführen
    const executionResult = await this.codeInterpreter.executeCode(
      userCode, 
      quest.language, 
      questId
    );
    
    // Test-Cases prüfen
    const testResults = await this.runTestCases(
      userCode, 
      quest.testCases, 
      quest.language
    );
    
    // Quest-Fortschritt bewerten
    const questResult: QuestExecutionResult = {
      executionResult,
      testResults,
      success: testResults.allPassed,
      score: this.calculateScore(testResults),
      xpEarned: testResults.allPassed ? quest.xpReward : Math.floor(quest.xpReward * 0.3),
      badgesEarned: this.calculateBadges(testResults, quest),
      feedback: this.generateFeedback(testResults, quest)
    };
    
    // Fortschritt speichern
    await this.saveQuestProgress(userId, questId, questResult);
    
    return questResult;
  }
  
  async runTestCases(
    userCode: string, 
    testCases: TestCase[], 
    language: string
  ): Promise<TestResults> {
    const results: TestCaseResult[] = [];
    
    for (const testCase of testCases) {
      const testCode = this.buildTestCode(userCode, testCase, language);
      
      const result = await this.codeInterpreter.executeCode(
        testCode, 
        language, 
        `test-${testCase.id}`
      );
      
      results.push({
        testCase,
        passed: this.evaluateTestResult(result, testCase.expectedOutput),
        actualOutput: result.output,
        error: result.error
      });
    }
    
    return {
      results,
      passed: results.filter(r => r.passed).length,
      total: results.length,
      allPassed: results.every(r => r.passed)
    };
  }
  
  private buildTestCode(userCode: string, testCase: TestCase, language: string): string {
    switch (language) {
      case 'python':
        return `
${userCode}

# Test Case: ${testCase.name}
${testCase.setupCode || ''}
result = ${testCase.testCode}
print(result)
        `;
      
      case 'javascript':
        return `
${userCode}

// Test Case: ${testCase.name}
${testCase.setupCode || ''}
console.log(${testCase.testCode});
        `;
      
      default:
        throw new Error(`Sprache ${language} wird nicht unterstützt`);
    }
  }
}
```

## React Components

### 1. Code Editor Component
```tsx
// components/code-interpreter/CodeEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Play, Save } from 'lucide-react';

interface CodeEditorProps {
  questId: string;
  language: string;
  starterCode?: string;
  onExecute?: (result: CodeExecutionResult) => void;
}

export function CodeEditor({ 
  questId, 
  language, 
  starterCode = '', 
  onExecute 
}: CodeEditorProps) {
  const [code, setCode] = useState(starterCode);
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const executeCode = async () => {
    setIsExecuting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          questId
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOutput(result.output);
        onExecute?.(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Fehler beim Ausführen des Codes');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Code Editor ({language})</h3>
          <div className="flex gap-2">
            <Button
              onClick={executeCode}
              disabled={isExecuting}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Ausführen
            </Button>
            <Button variant="outline" size="icon">
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </Card>
      
      {(output || error) && (
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Ausgabe:</h4>
          <pre className={`text-sm ${error ? 'text-red-500' : 'text-green-600'}`}>
            {error || output}
          </pre>
        </Card>
      )}
    </div>
  );
}
```

### 2. Quest Code Component
```tsx
// components/code-interpreter/QuestCodeChallenge.tsx
'use client';

import React, { useState } from 'react';
import { CodeEditor } from './CodeEditor';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Award } from 'lucide-react';

interface QuestCodeChallengeProps {
  quest: CodeQuest;
  onQuestComplete?: (result: QuestExecutionResult) => void;
}

export function QuestCodeChallenge({ quest, onQuestComplete }: QuestCodeChallengeProps) {
  const [executionResult, setExecutionResult] = useState<QuestExecutionResult | null>(null);
  
  const handleCodeExecution = async (result: CodeExecutionResult) => {
    try {
      const response = await fetch(`/api/quests/${quest.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
      
      const questResult = await response.json();
      setExecutionResult(questResult);
      onQuestComplete?.(questResult);
    } catch (error) {
      console.error('Fehler beim Bewerten der Quest:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quest Information */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{quest.title}</h2>
            <p className="text-gray-600 mb-4">{quest.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">{quest.language}</Badge>
            <Badge variant="outline">{quest.difficulty}</Badge>
            <span className="text-sm text-gray-500">{quest.xpReward} XP</span>
          </div>
        </div>
        
        {quest.testCases && quest.testCases.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Test Cases:</h3>
            <div className="space-y-2">
              {quest.testCases.map((testCase, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <strong>{testCase.name}:</strong>
                  <p className="text-sm text-gray-600 mt-1">{testCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Code Editor */}
      <CodeEditor
        questId={quest.id}
        language={quest.language}
        starterCode={quest.starterCode}
        onExecute={handleCodeExecution}
      />

      {/* Results */}
      {executionResult && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {executionResult.success ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500" />
            )}
            <h3 className="text-lg font-semibold">
              {executionResult.success ? 'Quest erfolgreich!' : 'Quest noch nicht abgeschlossen'}
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Test Ergebnisse:</h4>
              <div className="space-y-2">
                {executionResult.testResults?.results.map((result, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">{result.testCase.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Belohnungen:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{executionResult.xpEarned} XP erhalten</span>
                </div>
                {executionResult.badgesEarned?.map((badge, index) => (
                  <Badge key={index} variant="secondary">{badge}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          {executionResult.feedback && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Feedback:</h4>
              <p className="text-gray-600">{executionResult.feedback}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
```

## API Routes

### 1. Code Execution API
```typescript
// app/api/code/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LifeQuestCodeInterpreter } from '@/lib/e2b/codeInterpreter';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const codeInterpreter = new LifeQuestCodeInterpreter();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { code, language, questId } = await request.json();

    // Input-Validation
    if (!code || !language || !questId) {
      return NextResponse.json(
        { error: 'Code, Sprache und Quest-ID sind erforderlich' }, 
        { status: 400 }
      );
    }

    // Code ausführen
    const result = await codeInterpreter.executeCode(code, language, questId);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Ausführen des Codes' }, 
      { status: 500 }
    );
  }
}
```

### 2. Quest Execution API
```typescript
// app/api/quests/[questId]/execute/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CodeQuestManager } from '@/lib/e2b/quest-integration';
import { getServerSession } from 'next-auth';

const questManager = new CodeQuestManager();

export async function POST(
  request: NextRequest,
  { params }: { params: { questId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }

    const { questId } = params;
    const executionResult = await request.json();

    // Quest-Code ausführen und bewerten
    const questResult = await questManager.executeQuestCode(
      questId,
      executionResult.code,
      session.user.id
    );

    return NextResponse.json(questResult);

  } catch (error) {
    console.error('Quest execution error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Bewerten der Quest' }, 
      { status: 500 }
    );
  }
}
```

## Gamification Integration

### 1. XP und Badge System
```typescript
// lib/gamification/code-rewards.ts
export class CodeRewardSystem {
  calculateXPReward(difficulty: string, testsPassed: number, totalTests: number): number {
    const baseXP = {
      'beginner': 50,
      'intermediate': 100,
      'advanced': 200,
      'expert': 300
    };
    
    const base = baseXP[difficulty] || 50;
    const completionRatio = testsPassed / totalTests;
    
    return Math.floor(base * completionRatio);
  }
  
  determineEarnedBadges(
    language: string, 
    difficulty: string, 
    testResults: TestResults,
    executionTime: number
  ): string[] {
    const badges: string[] = [];
    
    // Sprach-spezifische Badges
    if (testResults.allPassed) {
      badges.push(`${language}-meister`);
    }
    
    // Performance Badges  
    if (executionTime < 1000) { // unter 1 Sekunde
      badges.push('blitzschnell');
    }
    
    // Schwierigkeits-Badges
    if (difficulty === 'expert' && testResults.allPassed) {
      badges.push('code-experte');
    }
    
    // Perfektion Badge
    if (testResults.allPassed && testResults.total >= 5) {
      badges.push('perfektionist');
    }
    
    return badges;
  }
  
  async updateUserProgress(
    userId: string, 
    language: string, 
    xpGained: number, 
    badges: string[]
  ): Promise<void> {
    // Update User XP
    await this.addXP(userId, xpGained);
    
    // Add new badges
    await this.addBadges(userId, badges);
    
    // Update language proficiency
    await this.updateLanguageProficiency(userId, language);
    
    // Check for level up
    await this.checkLevelUp(userId);
  }
}
```

### 2. Leaderboard Integration
```typescript
// lib/gamification/code-leaderboard.ts
export class CodeLeaderboard {
  async updateCodeChallengeStats(
    userId: string,
    questId: string, 
    result: QuestExecutionResult
  ): Promise<void> {
    const stats = {
      userId,
      questId,
      completed: result.success,
      score: result.score,
      executionTime: result.executionResult.executionTime,
      language: result.executionResult.language,
      timestamp: new Date()
    };
    
    await this.saveStats(stats);
    await this.updateLeaderboards(stats);
  }
  
  async getLanguageLeaderboard(language: string, limit = 10): Promise<LeaderboardEntry[]> {
    return await this.database.query(`
      SELECT 
        u.name,
        u.avatar_url,
        COUNT(*) as challenges_completed,
        AVG(s.score) as avg_score,
        AVG(s.execution_time) as avg_time
      FROM code_challenge_stats s
      JOIN users u ON s.user_id = u.id
      WHERE s.language = ? AND s.completed = true
      GROUP BY s.user_id
      ORDER BY challenges_completed DESC, avg_score DESC
      LIMIT ?
    `, [language, limit]);
  }
  
  async getGlobalCodeLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    return await this.database.query(`
      SELECT 
        u.name,
        u.avatar_url,
        COUNT(*) as total_challenges,
        COUNT(DISTINCT s.language) as languages_mastered,
        SUM(s.score) as total_score
      FROM code_challenge_stats s
      JOIN users u ON s.user_id = u.id  
      WHERE s.completed = true
      GROUP BY s.user_id
      ORDER BY total_score DESC
      LIMIT ?
    `, [limit]);
  }
}
```

## Monitoring und Analytics

### 1. Code Execution Metrics
```typescript
// lib/e2b/analytics.ts
export class CodeExecutionAnalytics {
  async trackCodeExecution(execution: CodeExecutionResult): Promise<void> {
    const metrics = {
      questId: execution.questId,
      language: execution.language,
      success: execution.success,
      executionTime: execution.executionTime,
      codeLength: execution.code?.length || 0,
      timestamp: execution.timestamp,
      error: execution.error
    };
    
    await this.saveMetrics(metrics);
    await this.updateDashboard(metrics);
  }
  
  async getPopularLanguages(timeframe = '30d'): Promise<LanguageStats[]> {
    return await this.database.query(`
      SELECT 
        language,
        COUNT(*) as executions,
        AVG(execution_time) as avg_time,
        SUM(CASE WHEN success = true THEN 1 ELSE 0 END) / COUNT(*) as success_rate
      FROM code_executions
      WHERE timestamp > NOW() - INTERVAL ?
      GROUP BY language
      ORDER BY executions DESC
    `, [timeframe]);
  }
  
  async getErrorPatterns(): Promise<ErrorPattern[]> {
    return await this.database.query(`
      SELECT 
        language,
        error,
        COUNT(*) as frequency
      FROM code_executions
      WHERE error IS NOT NULL
      GROUP BY language, error
      ORDER BY frequency DESC
      LIMIT 20
    `);
  }
}
```

## Testing

### 1. E2B Integration Tests
```typescript
// __tests__/e2b-integration.test.ts
import { LifeQuestCodeInterpreter } from '@/lib/e2b/codeInterpreter';

describe('E2B Code Interpreter Integration', () => {
  let interpreter: LifeQuestCodeInterpreter;
  
  beforeEach(async () => {
    interpreter = new LifeQuestCodeInterpreter();
    await interpreter.initialize();
  });
  
  afterEach(async () => {
    await interpreter.cleanup();
  });
  
  it('should execute Python code successfully', async () => {
    const code = 'print("Hello, LifeQuest!")';
    const result = await interpreter.executeCode(code, 'python', 'test-quest');
    
    expect(result.success).toBe(true);
    expect(result.output).toContain('Hello, LifeQuest!');
  });
  
  it('should handle code errors gracefully', async () => {
    const code = 'print(undefined_variable)';
    const result = await interpreter.executeCode(code, 'python', 'test-quest');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
  
  it('should validate dangerous code', async () => {
    const dangerousCode = 'import os; os.system("rm -rf /")';
    
    await expect(
      interpreter.executeCode(dangerousCode, 'python', 'test-quest')
    ).rejects.toThrow('Gefährliche Operation erkannt');
  });
});
```

## Deployment

### 1. Docker Configuration
```dockerfile
# E2B services in docker-compose.yml
version: '3.8'
services:
  lifequest-app:
    build: .
    environment:
      - E2B_API_KEY=${E2B_API_KEY}
    depends_on:
      - redis
      - postgres
    ports:
      - "3000:3000"
      
  # E2B Sandbox Service (if self-hosted)
  e2b-sandbox:
    image: e2b/sandbox:latest
    environment:
      - E2B_API_KEY=${E2B_API_KEY}
    ports:
      - "8080:8080"
    volumes:
      - sandbox-data:/data
      
volumes:
  sandbox-data:
```

### 2. Production Optimizations
```typescript
// lib/e2b/production-config.ts
export const PRODUCTION_E2B_CONFIG = {
  // Connection pooling
  maxConcurrentSandboxes: 10,
  sandboxReuseTimeout: 300000, // 5 minutes
  
  // Caching
  enableResultCaching: true,
  cacheTimeout: 3600000, // 1 hour
  
  // Monitoring
  healthCheckInterval: 30000, // 30 seconds
  metricsCollection: true,
  
  // Security
  rateLimiting: {
    windowMs: 900000, // 15 minutes
    max: 100 // requests per window
  },
  
  // Auto-scaling
  autoScaling: {
    enabled: true,
    minSandboxes: 2,
    maxSandboxes: 20,
    scaleUpThreshold: 0.8,
    scaleDownThreshold: 0.3
  }
};
```

---

*Diese Integration ermöglicht es LifeQuest, eine vollständige Code-Lern-Plattform mit sicherer, skalierbarer Code-Ausführung anzubieten.*
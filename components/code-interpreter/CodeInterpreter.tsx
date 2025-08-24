'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { CodeEditor } from './CodeEditor'
import { OutputDisplay } from './OutputDisplay'
import { Card, CardContent } from '@/components/ui/card'
import { Info } from 'lucide-react'

interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
  logs?: string[]
  executionTime?: number
  sessionId?: string
}

// Simple Alert component since we don't have shadcn Alert
function Alert({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      {children}
    </div>
  )
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm [&_p]:leading-relaxed">{children}</div>
}

export function CodeInterpreter() {
  const { user } = useAuth()
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | undefined>()
  const [sessionId, setSessionId] = useState<string>()

  const executeCode = useCallback(async (code: string) => {
    if (!user) {
      setResult({
        success: false,
        error: 'You must be logged in to execute code.'
      })
      return
    }

    setIsExecuting(true)
    setResult(undefined)

    try {
      const response = await fetch('/api/code/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          sessionId: sessionId || undefined
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to execute code')
      }

      // Update session ID if we got a new one
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId)
      }

      setResult({
        success: data.success,
        output: data.output,
        error: data.error,
        logs: data.logs,
        executionTime: data.executionTime,
        sessionId: data.sessionId
      })
    } catch (error) {
      console.error('Code execution error:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setIsExecuting(false)
    }
  }, [user, sessionId])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <div className="flex items-center space-x-2">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription>
              Please log in to use the Python Code Interpreter.
            </AlertDescription>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Python Code Interpreter</h1>
        <p className="text-muted-foreground">
          Execute Python code in a secure, sandboxed environment powered by E2B. 
          Your code runs in an isolated container with access to popular libraries like numpy, matplotlib, pandas, and more.
        </p>
      </div>

      {/* Info Banner */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <AlertDescription>
            Your code execution session is persistent - variables and functions remain available between runs. 
            Use keyboard shortcut <kbd className="px-1 py-0.5 text-xs bg-muted rounded border">Ctrl+Enter</kbd> to quickly execute code.
          </AlertDescription>
        </div>
      </Alert>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Code Editor */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Code Editor</h2>
          <CodeEditor
            onExecute={executeCode}
            isExecuting={isExecuting}
            sessionId={sessionId}
          />
        </div>

        {/* Output Display */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Execution Results</h2>
          <OutputDisplay
            result={result}
            isExecuting={isExecuting}
          />
        </div>
      </div>

      {/* Usage Statistics */}
      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {result.success ? '✓' : '✗'}
                </div>
                <div className="text-muted-foreground">Status</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {result.executionTime ? `${result.executionTime}ms` : 'N/A'}
                </div>
                <div className="text-muted-foreground">Execution Time</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {sessionId ? sessionId.slice(-8) : 'N/A'}
                </div>
                <div className="text-muted-foreground">Session ID</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">Available Libraries</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-muted p-2 rounded text-center">numpy</div>
            <div className="bg-muted p-2 rounded text-center">pandas</div>
            <div className="bg-muted p-2 rounded text-center">matplotlib</div>
            <div className="bg-muted p-2 rounded text-center">seaborn</div>
            <div className="bg-muted p-2 rounded text-center">scikit-learn</div>
            <div className="bg-muted p-2 rounded text-center">requests</div>
            <div className="bg-muted p-2 rounded text-center">beautifulsoup4</div>
            <div className="bg-muted p-2 rounded text-center">pillow</div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            And many more! The environment includes most popular Python packages for data science, web scraping, and general development.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CodeInterpreter

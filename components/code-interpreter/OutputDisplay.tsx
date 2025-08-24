'use client'

import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Download, AlertCircle, CheckCircle } from 'lucide-react'

interface ExecutionResult {
  success: boolean
  output?: string
  error?: string
  logs?: string[]
  executionTime?: number
  sessionId?: string
}

interface OutputDisplayProps {
  result?: ExecutionResult
  isExecuting: boolean
}

export function OutputDisplay({ result, isExecuting }: OutputDisplayProps) {
  const handleCopyOutput = () => {
    if (result?.output) {
      navigator.clipboard.writeText(result.output)
    }
  }

  const handleDownloadOutput = () => {
    if (result?.output) {
      const blob = new Blob([result.output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `execution_output_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const formatExecutionTime = (time?: number) => {
    if (!time) return 'N/A'
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Output</h3>
            {result && (
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.success ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 mr-1" />
                )}
                {result.success ? 'Success' : 'Error'}
              </Badge>
            )}
            {result?.executionTime && (
              <Badge variant="secondary">
                {formatExecutionTime(result.executionTime)}
              </Badge>
            )}
          </div>
          {result?.output && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyOutput}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadOutput}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="h-[400px] overflow-auto">
        {isExecuting ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-muted-foreground">Executing code...</span>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Main output */}
            {result.output && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Output:</h4>
                <pre className="bg-muted p-3 rounded-md text-sm overflow-auto whitespace-pre-wrap font-mono">
                  {result.output}
                </pre>
              </div>
            )}

            {/* Error output */}
            {result.error && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-destructive">Error:</h4>
                <pre className="bg-destructive/10 border border-destructive/20 p-3 rounded-md text-sm overflow-auto whitespace-pre-wrap font-mono text-destructive">
                  {result.error}
                </pre>
              </div>
            )}

            {/* Execution logs */}
            {result.logs && result.logs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Execution Logs:</h4>
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  {result.logs.map((log, index) => (
                    <div key={index} className="font-mono text-xs text-muted-foreground">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Session info */}
            {result.sessionId && (
              <div className="pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Session: {result.sessionId}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">🐍</div>
              <p>Run your Python code to see the output here</p>
              <p className="text-sm mt-1">Press Ctrl+Enter or click the Run button</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default OutputDisplay

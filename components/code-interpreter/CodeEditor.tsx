'use client'

import React, { useState, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Play, Square, RotateCcw, Save } from 'lucide-react'

interface CodeEditorProps {
  onExecute: (code: string) => void
  isExecuting?: boolean
  sessionId?: string
  initialCode?: string
}

export function CodeEditor({ 
  onExecute, 
  isExecuting = false, 
  sessionId,
  initialCode = '# Write your Python code here\nprint("Hello, World!")\n\n# Example: Create a simple plot\n# import matplotlib.pyplot as plt\n# import numpy as np\n# \n# x = np.linspace(0, 10, 100)\n# y = np.sin(x)\n# plt.plot(x, y)\n# plt.title("Sine Wave")\n# plt.show()'
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const editorRef = useRef<any>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // Configure Python language features
    monaco.languages.python?.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })

    // Set up keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (!isExecuting) {
        handleExecute()
      }
    })

    // Focus the editor
    editor.focus()
  }

  const handleExecute = () => {
    const currentCode = editorRef.current?.getValue() || code
    if (currentCode.trim()) {
      onExecute(currentCode)
    }
  }

  const handleClear = () => {
    const newCode = '# Write your Python code here\nprint("Hello, World!")'
    setCode(newCode)
    editorRef.current?.setValue(newCode)
    editorRef.current?.focus()
  }

  const handleSave = () => {
    const currentCode = editorRef.current?.getValue() || code
    const blob = new Blob([currentCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `python_code_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.py`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Python Code Editor</h3>
            {sessionId && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Session: {sessionId.slice(-8)}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isExecuting}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={isExecuting}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting || !code.trim()}
              size="sm"
            >
              {isExecuting ? (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Run (Ctrl+Enter)
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[400px]">
        <Editor
          height="400px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            parameterHints: {
              enabled: true
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'matchingDocuments',
            // Python specific settings
            'semanticHighlighting.enabled': true,
            bracketPairColorization: {
              enabled: true
            },
            guides: {
              indentation: true,
              bracketPairs: true
            },
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'mouseover',
            smoothScrolling: true,
            cursorBlinking: 'blink',
            cursorStyle: 'line',
            renderLineHighlight: 'all',
            selectionHighlight: false,
            occurrencesHighlight: 'off',
            codeLens: false,
            hover: {
              enabled: true
            }
          }}
        />
      </CardContent>
    </Card>
  )
}

export default CodeEditor

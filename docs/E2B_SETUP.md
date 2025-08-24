# 🧪 E2B Code Interpreter Setup

> **Execute Code Safely in LifeQuest with Isolated Cloud Environments**

E2B (Execute to Build) provides secure, isolated code execution environments that integrate seamlessly with LifeQuest quests. Perfect for programming challenges, data analysis tasks, and automated quest completion.

## 🎯 Overview

E2B enables LifeQuest to:
- **Execute code safely** in isolated cloud sandboxes
- **Support multiple languages** (Python, Node.js, Bash, etc.)
- **Handle file operations** without affecting the host system
- **Provide real-time output** for interactive coding quests
- **Scale automatically** based on quest demand

## 🚀 Quick Start

### 1. Get E2B API Key
```bash
# Sign up at https://e2b.dev and get your API key
export E2B_API_KEY="your-e2b-api-key-here"
```

### 2. Install Dependencies
```bash
npm install @e2b/code-interpreter
# or
yarn add @e2b/code-interpreter
```

### 3. Basic Integration
```javascript
// lib/e2b/codeInterpreter.js
import { CodeInterpreter } from '@e2b/code-interpreter';

export async function executeCode(language, code, context = {}) {
  const codeInterpreter = await CodeInterpreter.create({
    apiKey: process.env.E2B_API_KEY,
    metadata: {
      quest_id: context.questId,
      user_id: context.userId
    }
  });

  try {
    const execution = await codeInterpreter.notebook.execCell(code);
    
    return {
      success: true,
      output: execution.text,
      error: execution.error,
      executionTime: execution.executionTime,
      files: execution.files
    };
  } finally {
    await codeInterpreter.close();
  }
}
```

## 🔧 Advanced Configuration

### Environment Setup
Create `lib/e2b/config.js`:
```javascript
export const e2bConfig = {
  // Default template (customize as needed)
  template: "base",
  
  // Resource limits
  resources: {
    memory: "2GB",
    cpu: "1 core",
    timeout: 60000, // 60 seconds
    diskSize: "10GB"
  },
  
  // Environment variables for sandboxes
  environment: {
    PYTHON_PATH: "/usr/bin/python3",
    NODE_PATH: "/usr/bin/node",
    QUEST_MODE: "true"
  },
  
  // Allowed file operations
  filePermissions: {
    read: true,
    write: true,
    execute: false, // Security: no binary execution
    maxFileSize: "100MB"
  }
};
```

### Custom Templates
Create specialized environments for different quest types:

```bash
# Create custom template for data science quests
e2b template build -t data-science-quest
```

Template Dockerfile:
```dockerfile
FROM python:3.11-slim

# Install data science packages
RUN pip install pandas numpy matplotlib seaborn jupyter plotly

# Install Node.js for full-stack quests  
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Add LifeQuest utilities
COPY quest-utils/ /opt/quest-utils/
ENV PATH="/opt/quest-utils:${PATH}"

WORKDIR /home/user
```

## 🎮 Quest Integration

### Programming Challenge Quest
```javascript
// components/quests/programming-quest.jsx
import { useState } from 'react';
import { executeCode } from '@/lib/e2b/codeInterpreter';
import { CodeEditor } from '@/components/code-interpreter/CodeEditor';
import { OutputDisplay } from '@/components/code-interpreter/OutputDisplay';

export function ProgrammingQuest({ quest, onProgress }) {
  const [code, setCode] = useState(quest.starterCode || '');
  const [output, setOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const runCode = async () => {
    setIsExecuting(true);
    try {
      const result = await executeCode('python', code, {
        questId: quest.id,
        userId: quest.userId
      });
      
      setOutput(result);
      
      // Check if quest objectives are met
      const passed = await checkQuestObjectives(quest, result);
      if (passed) {
        onProgress(100);
      }
    } catch (error) {
      setOutput({ success: false, error: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <h3>Challenge: {quest.title}</h3>
        <p>{quest.description}</p>
        
        <CodeEditor 
          value={code}
          onChange={setCode}
          language="python"
        />
        
        <button 
          onClick={runCode}
          disabled={isExecuting}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isExecuting ? 'Running...' : 'Run Code'}
        </button>
      </div>
      
      <div>
        <OutputDisplay output={output} />
      </div>
    </div>
  );
}
```

### Data Analysis Quest
```javascript
// lib/quests/data-analysis.js
export async function createDataAnalysisQuest(dataset, objectives) {
  const setupCode = `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Load quest dataset
df = pd.read_csv('/tmp/quest_data.csv')
print(f"Dataset loaded: {df.shape}")
print(df.head())
`;

  const codeInterpreter = await CodeInterpreter.create();
  
  // Upload dataset to sandbox
  await codeInterpreter.files.write('/tmp/quest_data.csv', dataset);
  
  // Run setup
  await codeInterpreter.notebook.execCell(setupCode);
  
  return {
    type: 'data-analysis',
    environment: codeInterpreter,
    objectives: objectives,
    validationCode: generateValidationCode(objectives)
  };
}
```

### Automated Testing
```javascript
// lib/e2b/quest-validator.js
export class QuestValidator {
  constructor(quest) {
    this.quest = quest;
    this.testCases = quest.testCases || [];
  }

  async validateSolution(userCode) {
    const results = [];
    
    for (const testCase of this.testCases) {
      const testCode = `
${userCode}

# Test case
${testCase.setup || ''}
result = ${testCase.expression}
assert result == ${JSON.stringify(testCase.expected)}, f"Expected {testCase.expected}, got {result}"
print(f"✅ Test passed: {testCase.description}")
`;

      const execution = await executeCode('python', testCode);
      results.push({
        testCase: testCase.description,
        passed: execution.success && !execution.error,
        output: execution.output,
        error: execution.error
      });
    }

    const passedTests = results.filter(r => r.passed).length;
    const progressPercent = Math.round((passedTests / this.testCases.length) * 100);
    
    return {
      results,
      progressPercent,
      allPassed: passedTests === this.testCases.length
    };
  }
}
```

## 🌐 API Routes

### Code Execution Endpoint
```javascript
// app/api/code/execute/route.ts
import { NextRequest } from 'next/server';
import { executeCode } from '@/lib/e2b/codeInterpreter';
import { validateUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { language, code, questId } = await request.json();
    const user = await validateUser(request);
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Security: Validate code before execution
    const codeValidation = await validateCodeSafety(code, language);
    if (!codeValidation.safe) {
      return Response.json({ 
        error: 'Code safety check failed',
        details: codeValidation.issues 
      }, { status: 400 });
    }

    const result = await executeCode(language, code, {
      questId,
      userId: user.id
    });

    // Log execution for analytics
    await logCodeExecution({
      userId: user.id,
      questId,
      language,
      success: result.success,
      executionTime: result.executionTime
    });

    return Response.json(result);
  } catch (error) {
    console.error('Code execution failed:', error);
    return Response.json({ 
      error: 'Execution failed',
      message: error.message 
    }, { status: 500 });
  }
}
```

### File Management
```javascript
// app/api/code/files/route.ts
export async function POST(request: NextRequest) {
  const { action, filename, content, questId } = await request.json();
  const user = await validateUser(request);
  
  const codeInterpreter = await CodeInterpreter.create();
  
  try {
    switch (action) {
      case 'upload':
        await codeInterpreter.files.write(filename, content);
        break;
      case 'download':
        const fileContent = await codeInterpreter.files.read(filename);
        return Response.json({ content: fileContent });
      case 'list':
        const files = await codeInterpreter.files.list();
        return Response.json({ files });
      case 'delete':
        await codeInterpreter.files.remove(filename);
        break;
    }
    
    return Response.json({ success: true });
  } finally {
    await codeInterpreter.close();
  }
}
```

## 🎨 UI Components

### Code Editor Component
```jsx
// components/code-interpreter/CodeEditor.tsx
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

export function CodeEditor({ 
  value, 
  onChange, 
  language = 'python',
  height = '400px'
}) {
  const { theme } = useTheme();

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on'
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b">
        <span className="text-sm font-medium">{language}</span>
      </div>
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        options={editorOptions}
      />
    </div>
  );
}
```

### Output Display Component
```jsx
// components/code-interpreter/OutputDisplay.tsx
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function OutputDisplay({ output }) {
  if (!output) {
    return (
      <div className="border rounded-lg p-4">
        <p className="text-gray-500">Run your code to see output here...</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b flex items-center gap-2">
        {output.success ? (
          <CheckIcon className="w-5 h-5 text-green-500" />
        ) : (
          <XMarkIcon className="w-5 h-5 text-red-500" />
        )}
        <span className="text-sm font-medium">
          {output.success ? 'Success' : 'Error'}
        </span>
        {output.executionTime && (
          <span className="text-xs text-gray-500 ml-auto">
            {output.executionTime}ms
          </span>
        )}
      </div>
      
      <div className="p-4">
        {output.output && (
          <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto">
            {output.output}
          </pre>
        )}
        
        {output.error && (
          <pre className="text-sm text-red-600 bg-red-50 p-3 rounded overflow-auto">
            {output.error}
          </pre>
        )}
        
        {output.files && output.files.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Generated Files:</h4>
            <ul className="space-y-1">
              {output.files.map((file, index) => (
                <li key={index} className="text-sm">
                  📄 {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 🔒 Security & Best Practices

### Code Safety Validation
```javascript
// lib/e2b/security.js
const DANGEROUS_PATTERNS = [
  /import\s+os/i,
  /import\s+subprocess/i,
  /exec\s*\(/i,
  /eval\s*\(/i,
  /__import__/i,
  /file\s*\(/i,
  /open\s*\(/i
];

export async function validateCodeSafety(code, language) {
  const issues = [];
  
  // Check for dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      issues.push(`Potentially dangerous pattern detected: ${pattern}`);
    }
  }
  
  // Language-specific validation
  if (language === 'python') {
    if (code.includes('import sys') && code.includes('sys.exit')) {
      issues.push('System exit calls are not allowed');
    }
  }
  
  return {
    safe: issues.length === 0,
    issues
  };
}
```

### Rate Limiting
```javascript
// lib/e2b/rate-limiter.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

export async function checkExecutionLimit(userId) {
  const key = `code_exec_limit:${userId}`;
  const current = await redis.get(key) || 0;
  
  const limit = 100; // 100 executions per hour
  const window = 3600; // 1 hour
  
  if (current >= limit) {
    throw new Error('Execution limit exceeded. Please try again later.');
  }
  
  await redis.setex(key, window, current + 1);
  return { remaining: limit - current - 1 };
}
```

## 📊 Analytics & Monitoring

### Execution Metrics
```javascript
// lib/e2b/analytics.js
export async function trackExecution(data) {
  const metrics = {
    userId: data.userId,
    questId: data.questId,
    language: data.language,
    executionTime: data.executionTime,
    success: data.success,
    errorType: data.error ? classifyError(data.error) : null,
    linesOfCode: data.code.split('\n').length,
    timestamp: new Date().toISOString()
  };
  
  // Send to analytics service
  await analyticsService.track('code_execution', metrics);
  
  // Update quest progress if successful
  if (data.success && data.questId) {
    await updateQuestProgress(data.questId, metrics);
  }
}
```

## 🚀 Deployment

### Environment Variables
```env
# E2B Configuration
E2B_API_KEY=your-e2b-api-key
E2B_TEMPLATE=base
E2B_TIMEOUT=60000
E2B_MAX_CONCURRENT=10

# Security
ALLOWED_LANGUAGES=python,javascript,sql
CODE_EXECUTION_RATE_LIMIT=100
MAX_FILE_SIZE=10485760

# Monitoring  
ANALYTICS_ENDPOINT=https://your-analytics.com/track
ERROR_REPORTING_KEY=your-sentry-dsn
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Resources

- **[E2B Documentation](https://e2b.dev/docs)** - Official E2B docs
- **[Code Interpreter Guide](https://e2b.dev/docs/guide/code-interpreter)** - Detailed integration guide
- **[LifeQuest Examples](./examples/e2b/)** - Sample quest implementations
- **[Security Best Practices](./security.md)** - Code execution security guide

---

**Ready to add code execution to your quests?** Follow this guide to safely integrate E2B into your LifeQuest experience.
# 🔌 MCP Integration - Model Context Protocol Setup

> **Seamless AI Agent Connectivity for LifeQuest**

The Model Context Protocol (MCP) is the backbone that connects LifeQuest to powerful AI agents, allowing seamless integration with Claude, custom models, and external tools.

## 🎯 Overview

MCP enables LifeQuest to:
- **Connect to multiple AI models** simultaneously
- **Share context** across different agents
- **Execute tools and functions** through standardized protocols
- **Maintain conversation state** across sessions
- **Coordinate agent collaboration** for complex quests

## 🚀 Quick Setup

### 1. Install MCP Server
```bash
# Install the LifeQuest MCP server
npm install -g @lifequest/mcp-server

# Or run directly
npx @lifequest/mcp-server
```

### 2. Configure Claude Desktop
Add to your Claude Desktop config (`~/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "lifequest": {
      "command": "npx",
      "args": ["@lifequest/mcp-server"],
      "env": {
        "LIFEQUEST_API_URL": "http://localhost:3000",
        "LIFEQUEST_API_KEY": "your-api-key"
      }
    }
  }
}
```

### 3. Environment Variables
Create `.env.local` with MCP configuration:

```env
# MCP Server Configuration
MCP_SERVER_PORT=8000
MCP_SERVER_HOST=localhost
MCP_ALLOWED_ORIGINS=["http://localhost:3000"]

# LifeQuest API Configuration  
LIFEQUEST_API_URL=http://localhost:3000
LIFEQUEST_API_KEY=your-secret-api-key
LIFEQUEST_WEBHOOK_SECRET=your-webhook-secret

# Agent Configuration
CLAUDE_API_KEY=your-claude-api-key
OPENAI_API_KEY=your-openai-api-key
```

## 🔧 MCP Server Configuration

### Server Manifest (`mcp.config.json`)
```json
{
  "name": "lifequest-mcp-server",
  "version": "1.0.0",
  "description": "LifeQuest MCP Server for AI Agent Integration",
  "author": "LifeQuest Team",
  "license": "MIT",
  "server": {
    "host": "localhost",
    "port": 8000,
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3000", "https://your-domain.com"]
    }
  },
  "resources": [
    {
      "name": "quests",
      "description": "User quests and progress",
      "uri": "lifequest://quests/{id}"
    },
    {
      "name": "agents", 
      "description": "AI agent configurations",
      "uri": "lifequest://agents/{id}"
    },
    {
      "name": "crew",
      "description": "Team collaboration data",
      "uri": "lifequest://crew/{id}"
    }
  ],
  "tools": [
    {
      "name": "create_quest",
      "description": "Create a new quest with AI assistance",
      "inputSchema": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "description": { "type": "string" },
          "difficulty": { "type": "string", "enum": ["easy", "medium", "hard", "epic"] },
          "category": { "type": "string" },
          "xp_reward": { "type": "number" }
        },
        "required": ["title", "description"]
      }
    },
    {
      "name": "update_progress",
      "description": "Update quest progress with AI validation",
      "inputSchema": {
        "type": "object", 
        "properties": {
          "quest_id": { "type": "string" },
          "progress": { "type": "number", "minimum": 0, "maximum": 100 },
          "notes": { "type": "string" }
        },
        "required": ["quest_id", "progress"]
      }
    },
    {
      "name": "spawn_agent",
      "description": "Create specialized AI agent for quest assistance",
      "inputSchema": {
        "type": "object",
        "properties": {
          "type": { "type": "string", "enum": ["coach", "analyst", "executor", "tracker"] },
          "specialization": { "type": "string" },
          "quest_id": { "type": "string" }
        },
        "required": ["type", "specialization"]
      }
    },
    {
      "name": "execute_code",
      "description": "Execute code through E2B code interpreter",
      "inputSchema": {
        "type": "object",
        "properties": {
          "language": { "type": "string", "enum": ["python", "javascript", "bash", "sql"] },
          "code": { "type": "string" },
          "context": { "type": "string" }
        },
        "required": ["language", "code"]
      }
    }
  ],
  "prompts": [
    {
      "name": "quest_advisor",
      "description": "AI prompt for quest creation and optimization",
      "arguments": [
        {
          "name": "user_goals",
          "description": "User's stated goals and preferences",
          "required": true
        },
        {
          "name": "difficulty_preference", 
          "description": "Preferred difficulty level",
          "required": false
        }
      ]
    }
  ]
}
```

## 🤖 Agent Integration

### Quest Coach Agent
```javascript
// agents/quest-coach.js
export const questCoachAgent = {
  name: "Quest Coach",
  description: "Helps users create and optimize quests",
  
  async createQuest(userInput, context) {
    const prompt = `
    As a Quest Coach, help create an engaging quest based on:
    - User Goal: ${userInput.goal}
    - Time Available: ${userInput.timeframe}
    - Current Skills: ${context.userSkills}
    - Past Successes: ${context.completedQuests}
    
    Create a quest that is challenging but achievable, with:
    1. Clear, measurable objectives
    2. Appropriate difficulty progression
    3. Meaningful rewards (XP, badges, skills)
    4. Actionable next steps
    `;
    
    return await callMCPTool('create_quest', {
      title: generated.title,
      description: generated.description,
      difficulty: generated.difficulty,
      xp_reward: calculated.xp
    });
  }
};
```

### Progress Tracker Agent  
```javascript
// agents/progress-tracker.js
export const progressTrackerAgent = {
  name: "Progress Tracker",
  description: "Monitors quest progress and provides insights",
  
  async analyzeProgress(questId, userReport) {
    const quest = await getMCPResource('quests', questId);
    const analysis = await analyzeWithAI(quest, userReport);
    
    return await callMCPTool('update_progress', {
      quest_id: questId,
      progress: analysis.progressPercent,
      notes: analysis.insights
    });
  }
};
```

## 🔄 Real-time Coordination

### WebSocket Integration
```javascript
// lib/mcp-websocket.js
import { WebSocket } from 'ws';

export class MCPWebSocketClient {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.setupHandlers();
  }
  
  setupHandlers() {
    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'quest_update':
          this.handleQuestUpdate(message.payload);
          break;
        case 'agent_response':
          this.handleAgentResponse(message.payload);
          break;
        case 'crew_notification':
          this.handleCrewNotification(message.payload);
          break;
      }
    });
  }
  
  async sendCommand(tool, params) {
    const message = {
      jsonrpc: '2.0',
      id: generateId(),
      method: 'tools/call',
      params: {
        name: tool,
        arguments: params
      }
    };
    
    this.ws.send(JSON.stringify(message));
  }
}
```

## 🛠️ Custom Tools Development

### Adding Custom MCP Tools
```typescript
// tools/custom-analyzer.ts
import { MCPTool } from '@lifequest/mcp-types';

export const customAnalyzerTool: MCPTool = {
  name: 'analyze_habits',
  description: 'Analyze user habits and suggest quest improvements',
  
  inputSchema: {
    type: 'object',
    properties: {
      user_id: { type: 'string' },
      timeframe: { type: 'string', enum: ['week', 'month', 'quarter'] },
      categories: { type: 'array', items: { type: 'string' } }
    },
    required: ['user_id']
  },
  
  async execute(params) {
    // Your custom logic here
    const habits = await analyzeUserHabits(params.user_id, params.timeframe);
    const suggestions = await generateSuggestions(habits);
    
    return {
      analysis: habits,
      suggestions: suggestions,
      confidence: 0.85
    };
  }
};
```

## 📊 Monitoring & Analytics

### MCP Performance Tracking
```javascript
// lib/mcp-monitoring.js
export class MCPMonitor {
  constructor() {
    this.metrics = {
      toolCalls: 0,
      avgResponseTime: 0,
      errorRate: 0,
      activeAgents: 0
    };
  }
  
  trackToolCall(toolName, responseTime, success) {
    this.metrics.toolCalls++;
    this.updateResponseTime(responseTime);
    
    if (!success) {
      this.metrics.errorRate = 
        (this.metrics.errorRate + 1) / this.metrics.toolCalls;
    }
    
    // Send to analytics
    this.sendMetrics({
      tool: toolName,
      responseTime,
      success,
      timestamp: new Date().toISOString()
    });
  }
}
```

## 🔒 Security & Authentication

### MCP Security Configuration
```javascript
// security/mcp-auth.js
export const mcpSecurity = {
  // API Key validation
  validateApiKey: (key) => {
    return process.env.LIFEQUEST_API_KEY === key;
  },
  
  // Rate limiting
  rateLimiter: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // CORS configuration
  corsOptions: {
    origin: process.env.LIFEQUEST_ALLOWED_ORIGINS?.split(','),
    credentials: true,
    optionsSuccessStatus: 200
  }
};
```

## 🚀 Deployment

### Production MCP Server
```yaml
# docker-compose.yml
version: '3.8'
services:
  mcp-server:
    image: lifequest/mcp-server:latest
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - MCP_SERVER_PORT=8000
      - LIFEQUEST_API_URL=${LIFEQUEST_API_URL}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
    volumes:
      - ./config:/app/config
    restart: unless-stopped
```

## 📚 Resources

- **[MCP Specification](https://modelcontextprotocol.io/)** - Official MCP documentation
- **[Claude MCP Guide](https://docs.anthropic.com/claude/docs/mcp)** - Anthropic's MCP integration guide  
- **[LifeQuest MCP Examples](./examples/mcp/)** - Sample implementations
- **[Community Discord](https://discord.gg/lifequest)** - Get help with MCP setup

---

**Ready to connect your AI agents?** Follow this guide to unlock the full power of LifeQuest's AI-native architecture.
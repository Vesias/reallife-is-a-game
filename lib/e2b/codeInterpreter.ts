import { CodeInterpreter } from '@e2b/code-interpreter'

export interface ExecutionResult {
  logs: Array<{
    line: string
    timestamp: number
  }>
  results: Array<{
    type: 'text' | 'image' | 'html' | 'json' | 'error'
    data: any
    timestamp: number
  }>
  error?: string
  duration: number
}

export interface SessionInfo {
  sessionId: string
  createdAt: number
  lastUsed: number
  userId?: string
}

class E2BCodeInterpreterService {
  private sessions = new Map<string, CodeInterpreter>()
  private sessionInfo = new Map<string, SessionInfo>()
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 5 * 60 * 1000)
  }

  /**
   * Execute Python code in a session
   */
  async executeCode(
    code: string, 
    sessionId: string, 
    userId?: string
  ): Promise<ExecutionResult> {
    const startTime = Date.now()
    const logs: Array<{ line: string; timestamp: number }> = []
    const results: Array<{ type: 'text' | 'image' | 'html' | 'json' | 'error'; data: any; timestamp: number }> = []

    try {
      // Get or create interpreter session
      const interpreter = await this.getOrCreateSession(sessionId, userId)
      
      // Update session info
      if (this.sessionInfo.has(sessionId)) {
        const info = this.sessionInfo.get(sessionId)!
        info.lastUsed = Date.now()
      }

      // Execute the code
      const execution = await interpreter.notebook.execCell(code, {
        onStdout: (data: { line: string }) => {
          logs.push({
            line: data.line,
            timestamp: Date.now()
          })
        },
        onStderr: (data: { line: string }) => {
          logs.push({
            line: `ERROR: ${data.line}`,
            timestamp: Date.now()
          })
        },
        onResult: (data: any) => {
          // Handle different result types
          let resultType: 'text' | 'image' | 'html' | 'json' | 'error' = 'text'
          let resultData = data

          if (data.png || data.jpeg) {
            resultType = 'image'
            resultData = data.png || data.jpeg
          } else if (data.html) {
            resultType = 'html'
            resultData = data.html
          } else if (typeof data === 'object' && data !== null) {
            resultType = 'json'
            resultData = data
          }

          results.push({
            type: resultType,
            data: resultData,
            timestamp: Date.now()
          })
        }
      })

      return {
        logs,
        results,
        duration: Date.now() - startTime
      }

    } catch (error) {
      console.error('Code execution error:', error)
      
      return {
        logs,
        results,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        duration: Date.now() - startTime
      }
    }
  }

  /**
   * Get or create an interpreter session
   */
  private async getOrCreateSession(sessionId: string, userId?: string): Promise<CodeInterpreter> {
    // Check if session exists and is still valid
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId)!
      
      try {
        // Test if session is still alive with a simple check
        await session.notebook.execCell('1+1')
        return session
      } catch (error) {
        // Session is dead, remove it and create a new one
        console.log(`Session ${sessionId} is dead, creating new one`)
        this.sessions.delete(sessionId)
        this.sessionInfo.delete(sessionId)
      }
    }

    // Create new session
    console.log(`Creating new E2B session: ${sessionId}`)
    const interpreter = await CodeInterpreter.create({
      apiKey: process.env.E2B_API_KEY
    })

    // Store session
    this.sessions.set(sessionId, interpreter)
    this.sessionInfo.set(sessionId, {
      sessionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      userId
    })

    return interpreter
  }

  /**
   * Get session information
   */
  getSessionInfo(sessionId: string): SessionInfo | null {
    return this.sessionInfo.get(sessionId) || null
  }

  /**
   * List all sessions for a user
   */
  getUserSessions(userId: string): SessionInfo[] {
    return Array.from(this.sessionInfo.values()).filter(
      info => info.userId === userId
    )
  }

  /**
   * Clear a specific session
   */
  async clearSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    
    if (session) {
      try {
        await session.close()
      } catch (error) {
        console.error(`Error closing session ${sessionId}:`, error)
      }
      
      this.sessions.delete(sessionId)
      this.sessionInfo.delete(sessionId)
    }
  }

  /**
   * Clear all sessions for a user
   */
  async clearUserSessions(userId: string): Promise<void> {
    const userSessions = this.getUserSessions(userId)
    
    for (const sessionInfo of userSessions) {
      await this.clearSession(sessionInfo.sessionId)
    }
  }

  /**
   * Cleanup expired sessions
   */
  private async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now()
    const expiredSessions: string[] = []

    for (const [sessionId, info] of this.sessionInfo.entries()) {
      if (now - info.lastUsed > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId)
      }
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaning up ${expiredSessions.length} expired sessions`)

      for (const sessionId of expiredSessions) {
        await this.clearSession(sessionId)
      }
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      totalSessions: this.sessions.size,
      sessionIds: Array.from(this.sessions.keys()),
      sessionInfo: Array.from(this.sessionInfo.values())
    }
  }

  /**
   * Cleanup service on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Close all sessions
    Promise.all(
      Array.from(this.sessions.values()).map(session => 
        session.close().catch(console.error)
      )
    ).then(() => {
      console.log('All E2B sessions closed')
    })
  }
}

// Singleton instance
export const codeInterpreterService = new E2BCodeInterpreterService()

// Cleanup on process exit
process.on('SIGTERM', () => codeInterpreterService.destroy())
process.on('SIGINT', () => codeInterpreterService.destroy())

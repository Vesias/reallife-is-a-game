'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { CodeInterpreter } from '@/components/code-interpreter/CodeInterpreter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { User } from '@supabase/supabase-js'

export default function CodeInterpreterPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Error getting user:', error.message)
          router.push('/login')
          return
        }
        
        if (!user) {
          router.push('/login')
          return
        }
        
        setUser(user)
      } catch (error) {
        console.error('Error checking user:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      }
      router.push('/')
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the Code Interpreter.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Code Interpreter</h1>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                E2B Powered
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="text-sm">{user.email}</span>
              </div>
              
              <Separator orientation="vertical" className="h-6 bg-slate-700" />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <span>🐍</span>
              <span>Python Code Interpreter</span>
            </CardTitle>
            <CardDescription className="text-slate-300">
              Execute Python code in a secure sandboxed environment powered by E2B. 
              Your code runs in an isolated Jupyter notebook with persistent state during your session.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-slate-300">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-300 mb-2">✨ Features</h3>
                <ul className="text-sm space-y-1">
                  <li>• Persistent session state</li>
                  <li>• Real-time execution</li>
                  <li>• Error handling</li>
                  <li>• Code sanitization</li>
                </ul>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-300 mb-2">🔒 Security</h3>
                <ul className="text-sm space-y-1">
                  <li>• Sandboxed execution</li>
                  <li>• Rate limiting (10/min)</li>
                  <li>• Input sanitization</li>
                  <li>• Timeout protection</li>
                </ul>
              </div>
              
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">📚 Available</h3>
                <ul className="text-sm space-y-1">
                  <li>• NumPy & Pandas</li>
                  <li>• Matplotlib</li>
                  <li>• Standard library</li>
                  <li>• Data science tools</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
              <p className="text-amber-300 text-sm">
                <strong>Note:</strong> Potentially dangerous operations (os, subprocess, sys imports) are automatically blocked for security.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Code Interpreter Component */}
        <CodeInterpreter />
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>Powered by E2B Sandboxes • Secure Python Code Execution</p>
        </div>
      </main>
    </div>
  )
}

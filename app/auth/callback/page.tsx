'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { exchangeCodeForTokens } from '@/lib/cognito-client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      // Get authorization code from URL
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Check for errors from Cognito
      if (errorParam) {
        setError(errorDescription || errorParam)
        setProcessing(false)
        return
      }

      if (!code) {
        setError('No authorization code received')
        setProcessing(false)
        return
      }

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code)

      // Sign in with tokens (stores tokens and gets user info)
      await signIn(tokens)

      // Redirect happens in signIn function
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
      setProcessing(false)
    }
  }

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Signing you in...</h2>
            <p className="text-muted-foreground">Please wait while we complete authentication</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/')} className="flex-1">
              Back to Home
            </Button>
            <Button 
              onClick={() => {
                setError(null)
                setProcessing(true)
                handleCallback()
              }} 
              variant="outline"
              className="flex-1"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

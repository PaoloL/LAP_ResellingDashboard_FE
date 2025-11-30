"use client"

import { useEffect, useState } from 'react'
import { ConfigLoader } from '@/lib/config-loader'
import { Loader2 } from 'lucide-react'

interface ConfigProviderProps {
  children: React.ReactNode
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeConfig = async () => {
      try {
        await ConfigLoader.initialize()
        setIsLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Configuration failed')
        setIsLoading(false)
      }
    }

    initializeConfig()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Configuration Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
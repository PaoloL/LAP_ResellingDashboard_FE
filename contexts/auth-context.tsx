'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import type { CognitoUser, AuthTokens } from '@/lib/cognito-client'
import { getUserInfo, refreshAccessToken, signOut as cognitoSignOut } from '@/lib/cognito-client'
import { getLogoutUrl } from '@/lib/auth-config'

interface AuthContextType {
  user: CognitoUser | null
  loading: boolean
  signIn: (tokens: AuthTokens) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'auth_tokens'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from stored tokens on mount
  useEffect(() => {
    loadUserFromStorage()
  }, [])

  // Set up token refresh timer
  useEffect(() => {
    if (!user) return

    const checkTokenExpiry = () => {
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
      if (!expiryStr) return

      const expiry = parseInt(expiryStr, 10)
      const now = Date.now()
      const timeUntilExpiry = expiry - now

      // Refresh token 5 minutes before expiry
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        handleTokenRefresh()
      }
    }

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  async function loadUserFromStorage() {
    try {
      const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!tokensStr) {
        setLoading(false)
        return
      }

      const tokens: AuthTokens = JSON.parse(tokensStr)
      
      // Check if token is expired
      const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY)
      if (expiryStr) {
        const expiry = parseInt(expiryStr, 10)
        if (Date.now() >= expiry) {
          // Token expired, try to refresh
          await handleTokenRefresh()
          return
        }
      }

      // Get user info
      const userInfo = await getUserInfo(tokens.accessToken)
      setUser(userInfo)
    } catch (error) {
      console.error('Failed to load user from storage:', error)
      // Clear invalid tokens
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
    } finally {
      setLoading(false)
    }
  }

  async function handleTokenRefresh() {
    try {
      const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!tokensStr) return

      const tokens: AuthTokens = JSON.parse(tokensStr)
      const newTokens = await refreshAccessToken(tokens.refreshToken)
      
      // Store new tokens
      const expiry = Date.now() + newTokens.expiresIn * 1000
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokens))
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())

      // Update user info
      const userInfo = await getUserInfo(newTokens.accessToken)
      setUser(userInfo)
    } catch (error) {
      console.error('Failed to refresh token:', error)
      // If refresh fails, sign out
      await signOut()
    }
  }

  async function signIn(tokens: AuthTokens) {
    try {
      // Store tokens
      const expiry = Date.now() + tokens.expiresIn * 1000
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiry.toString())

      // Get user info
      const userInfo = await getUserInfo(tokens.accessToken)
      setUser(userInfo)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to sign in:', error)
      throw error
    }
  }

  async function signOut() {
    try {
      const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (tokensStr) {
        const tokens: AuthTokens = JSON.parse(tokensStr)
        // Sign out from Cognito
        await cognitoSignOut(tokens.accessToken)
      }
    } catch (error) {
      console.error('Failed to sign out from Cognito:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(TOKEN_EXPIRY_KEY)
      setUser(null)

      // Redirect to Cognito logout URL
      window.location.href = getLogoutUrl()
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

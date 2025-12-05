// Cognito authentication client using AWS SDK

import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand,
  GlobalSignOutCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { cognitoConfig } from './auth-config'

const client = new CognitoIdentityProviderClient({
  region: cognitoConfig.region,
})

export interface CognitoUser {
  username: string
  email: string
  name?: string
  familyName?: string
  emailVerified: boolean
}

export interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
  expiresIn: number
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string): Promise<AuthTokens> {
  const { userPoolClientId, redirectSignIn, domain, region } = cognitoConfig
  
  const tokenEndpoint = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`
  
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: userPoolClientId,
    code,
    redirect_uri: redirectSignIn,
  })
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }
  
  const data = await response.json()
  
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  }
}

// Get user information from access token
export async function getUserInfo(accessToken: string): Promise<CognitoUser> {
  const command = new GetUserCommand({
    AccessToken: accessToken,
  })
  
  const response = await client.send(command)
  
  const attributes = response.UserAttributes || []
  const getAttr = (name: string) => attributes.find(attr => attr.Name === name)?.Value
  
  return {
    username: response.Username || '',
    email: getAttr('email') || '',
    name: getAttr('name'),
    familyName: getAttr('family_name'),
    emailVerified: getAttr('email_verified') === 'true',
  }
}

// Refresh access token using refresh token
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const { userPoolClientId, domain, region } = cognitoConfig
  
  const tokenEndpoint = `https://${domain}.auth.${region}.amazoncognito.com/oauth2/token`
  
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: userPoolClientId,
    refresh_token: refreshToken,
  })
  
  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }
  
  const data = await response.json()
  
  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: refreshToken, // Refresh token is not returned, use the existing one
    expiresIn: data.expires_in,
  }
}

// Sign out user globally
export async function signOut(accessToken: string): Promise<void> {
  const command = new GlobalSignOutCommand({
    AccessToken: accessToken,
  })
  
  await client.send(command)
}

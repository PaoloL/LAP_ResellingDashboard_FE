import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const region = process.env.NEXT_PUBLIC_AWS_REGION || 'eu-west-1'
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''

const client = new CognitoIdentityProviderClient({ region })

export interface TokenSet {
  idToken: string
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<TokenSet> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    })

    const response = await client.send(command)

    if (!response.AuthenticationResult) {
      throw new Error('Authentication failed - no tokens received')
    }

    return {
      idToken: response.AuthenticationResult.IdToken!,
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
    }
  } catch (error: any) {
    console.error('Sign in error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'NotAuthorizedException') {
      throw new Error('Incorrect email or password')
    } else if (error.name === 'UserNotConfirmedException') {
      throw new Error('Please verify your email before signing in')
    } else if (error.name === 'UserNotFoundException') {
      throw new Error('No account found with this email')
    } else if (error.name === 'InvalidParameterException') {
      throw new Error('Invalid email or password format')
    }
    
    throw new Error(error.message || 'Failed to sign in')
  }
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string, name: string): Promise<void> {
  try {
    const command = new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: name,
        },
      ],
    })

    await client.send(command)
  } catch (error: any) {
    console.error('Sign up error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'UsernameExistsException') {
      throw new Error('An account with this email already exists')
    } else if (error.name === 'InvalidPasswordException') {
      throw new Error('Password does not meet requirements')
    } else if (error.name === 'InvalidParameterException') {
      throw new Error('Invalid email or password format')
    }
    
    throw new Error(error.message || 'Failed to create account')
  }
}

/**
 * Confirm sign up with verification code
 */
export async function confirmSignUp(email: string, code: string): Promise<void> {
  try {
    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    })

    await client.send(command)
  } catch (error: any) {
    console.error('Confirmation error:', error)
    
    // Handle specific Cognito errors
    if (error.name === 'CodeMismatchException') {
      throw new Error('Invalid verification code')
    } else if (error.name === 'ExpiredCodeException') {
      throw new Error('Verification code has expired')
    } else if (error.name === 'NotAuthorizedException') {
      throw new Error('User is already confirmed')
    }
    
    throw new Error(error.message || 'Failed to verify email')
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenSet> {
  try {
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: clientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    })

    const response = await client.send(command)

    if (!response.AuthenticationResult) {
      throw new Error('Token refresh failed')
    }

    return {
      idToken: response.AuthenticationResult.IdToken!,
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: refreshToken, // Refresh token stays the same
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
    }
  } catch (error: any) {
    console.error('Token refresh error:', error)
    throw new Error('Session expired. Please sign in again.')
  }
}

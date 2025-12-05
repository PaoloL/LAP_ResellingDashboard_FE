// Amazon Cognito configuration for authentication

export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'eu-west-1',
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
  redirectSignIn: process.env.NEXT_PUBLIC_REDIRECT_SIGN_IN || 'http://localhost:3000/auth/callback',
  redirectSignOut: process.env.NEXT_PUBLIC_REDIRECT_SIGN_OUT || 'http://localhost:3000',
  responseType: 'code' as const,
  scopes: ['email', 'openid', 'profile'],
}

export const getHostedUIUrl = () => {
  const { domain, userPoolClientId, redirectSignIn, responseType, scopes } = cognitoConfig
  
  const params = new URLSearchParams({
    client_id: userPoolClientId,
    response_type: responseType,
    scope: scopes.join(' '),
    redirect_uri: redirectSignIn,
  })
  
  return `https://${domain}.auth.${cognitoConfig.region}.amazoncognito.com/login?${params.toString()}`
}

export const getSignUpUrl = () => {
  const { domain, userPoolClientId, redirectSignIn, responseType, scopes } = cognitoConfig
  
  const params = new URLSearchParams({
    client_id: userPoolClientId,
    response_type: responseType,
    scope: scopes.join(' '),
    redirect_uri: redirectSignIn,
  })
  
  return `https://${domain}.auth.${cognitoConfig.region}.amazoncognito.com/signup?${params.toString()}`
}

export const getLogoutUrl = () => {
  const { domain, userPoolClientId, redirectSignOut } = cognitoConfig
  
  const params = new URLSearchParams({
    client_id: userPoolClientId,
    logout_uri: redirectSignOut,
  })
  
  return `https://${domain}.auth.${cognitoConfig.region}.amazoncognito.com/logout?${params.toString()}`
}

// AWS Configuration for Cognito and API Gateway
// This file reads from environment variables and provides configuration structure

// Helper function to check if we're in development mode
const isDevelopment = () => process.env.NODE_ENV === 'development'

// Helper function to get API base URL based on environment
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL
  const stage = process.env.NEXT_PUBLIC_API_GATEWAY_STAGE
  
  if (!baseUrl || !stage) {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
  }
  
  return `${baseUrl}/${stage}`
}

export const awsConfig = {
  // Environment settings
  environment: {
    isDevelopment: isDevelopment(),
    useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true',
  },


  
  // API Gateway Configuration
  apiGateway: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL || '',
    stage: process.env.NEXT_PUBLIC_API_GATEWAY_STAGE || '',
    fullUrl: getApiBaseUrl(),
    endpoints: {
      payerAccounts: '/accounts/payers',
      usageAccounts: '/accounts/usages',
      transactions: '/transactions',
    }
  },

  // S3 Configuration (if needed for file uploads)
  s3: {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET || '',
  }
}

// Configuration validation
export const validateConfig = () => {
  const errors: string[] = []
  const warnings: string[] = []

  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_AWS_REGION) {
    warnings.push('NEXT_PUBLIC_AWS_REGION not set, using default: us-east-1')
  }

  // Check API configuration
  if (!process.env.NEXT_PUBLIC_API_BASE_URL && !process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL) {
    if (!isDevelopment()) {
      errors.push('NEXT_PUBLIC_API_GATEWAY_BASE_URL must be set in production')
    } else {
      warnings.push('No API Gateway configured, using default local API')
    }
  }
  
  // Check stage configuration
  if (process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL && !process.env.NEXT_PUBLIC_API_GATEWAY_STAGE) {
    warnings.push('NEXT_PUBLIC_API_GATEWAY_STAGE not set')
  }



  return { errors, warnings }
}


// Configuration loader for AWS services
import { awsConfig } from './aws-config'

export class ConfigLoader {
  private static initialized = false

  static async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    try {
      // Validate required environment variables
      this.validateConfig()

      // Initialize AWS Amplify (if using Amplify)
      // Uncomment when ready to use Amplify
      // const { Amplify } = await import('aws-amplify')
      // Amplify.configure(awsConfig)

      console.log('AWS Configuration loaded:', {
        region: awsConfig.apiGateway.region,
        apiGatewayUrl: awsConfig.apiGateway.fullUrl,
        stage: awsConfig.apiGateway.stage
      })

      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize AWS configuration:', error)
      throw error
    }
  }

  private static validateConfig(): void {
    const requiredVars = [
      'NEXT_PUBLIC_AWS_REGION',
      'NEXT_PUBLIC_API_GATEWAY_URL'
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])

    if (missingVars.length > 0) {
      console.warn('Missing environment variables:', missingVars)
      console.warn('Some features may not work properly without proper configuration')
    }


  }

  static getConfig() {
    return {
      aws: awsConfig,
      isInitialized: this.initialized
    }
  }

  static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development'
  }

  static isProduction(): boolean {
    return process.env.NODE_ENV === 'production'
  }
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  ConfigLoader.initialize().catch(console.error)
}
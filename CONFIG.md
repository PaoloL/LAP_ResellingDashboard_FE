# AWS Billing Dashboard Configuration Guide

## Configuration Structure

The application uses a two-layer configuration approach:

### 1. Environment Variables (.env.local)
Store **sensitive values and environment-specific settings** here:

```bash
# ===========================================
# AWS BILLING DASHBOARD CONFIGURATION
# ===========================================

# Environment
NODE_ENV=development

# AWS Region
NEXT_PUBLIC_AWS_REGION=us-east-1

# ===========================================
# API GATEWAY CONFIGURATION
# ===========================================
# For development, use local API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

# For production, use your API Gateway URL
# NEXT_PUBLIC_API_GATEWAY_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
# NEXT_PUBLIC_API_STAGE=prod

# ===========================================
# COGNITO CONFIGURATION
# ===========================================
# Replace with your actual Cognito values
# NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
# NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your-client-id-here
# NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# NEXT_PUBLIC_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com

# Redirect URLs (adjust for your environment)
NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN=http://localhost:3000/
NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT=http://localhost:3000/

# ===========================================
# S3 CONFIGURATION (Optional)
# ===========================================
# NEXT_PUBLIC_S3_BUCKET=your-s3-bucket-name

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
# Set to true to use mock data when API is not available
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 2. Configuration Logic (lib/aws-config.ts)
This file **reads from environment variables** and provides **default values and structure**.

## Configuration Steps

### Step 1: Basic Setup
1. Copy the environment variables above to your `.env.local` file
2. Update `NEXT_PUBLIC_AWS_REGION` to your preferred AWS region
3. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` for development without backend

### Step 2: API Gateway Setup

**Configure API Gateway with Dev/Prod Stages:**

1. Set your API Gateway base URL (without stage):
```bash
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
```

2. Configure stage names:
```bash
NEXT_PUBLIC_API_GATEWAY_DEV_STAGE=dev
NEXT_PUBLIC_API_GATEWAY_PROD_STAGE=prd
```

**How it works:**
- Development environment automatically uses: `{base_url}/dev`
- Production environment automatically uses: `{base_url}/prd`

**For local development fallback:**
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```



### Step 3: Production Setup
For production deployment:

1. Set `NODE_ENV=production`
2. Use your actual API Gateway URL
3. Configure proper redirect URLs for your domain
4. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`

## Configuration Validation

The application includes built-in configuration validation:

- **Red indicators**: Missing required configuration
- **Yellow indicators**: Missing optional configuration
- **Green indicators**: Properly configured

Click the "Config" button in the bottom-right corner to view current configuration status.

## Environment-Specific Files

The application includes pre-configured environment files:

- `.env.local` - Local development (overrides all others)
- `.env.development` - Development environment (NODE_ENV=development)
- `.env.production` - Production environment (NODE_ENV=production)

**Environment Resolution:**
1. `.env.local` (highest priority, ignored by git)
2. `.env.development` or `.env.production` (based on NODE_ENV)
3. Default values in `lib/aws-config.ts`

**API Gateway URL Resolution:**
- Development: `{NEXT_PUBLIC_API_GATEWAY_BASE_URL}/{NEXT_PUBLIC_API_GATEWAY_DEV_STAGE}`
- Production: `{NEXT_PUBLIC_API_GATEWAY_BASE_URL}/{NEXT_PUBLIC_API_GATEWAY_PROD_STAGE}`

**Example URLs:**
- Dev: `https://abc123.execute-api.us-east-1.amazonaws.com/dev`
- Prod: `https://abc123.execute-api.us-east-1.amazonaws.com/prd`

## Security Notes

1. **Never commit sensitive values** to version control
2. Use **AWS Secrets Manager** or **Parameter Store** for production secrets
3. **Rotate credentials** regularly
4. **Use least privilege** IAM policies

## Troubleshooting

### Common Issues

1. **Configuration not loading**: Check that environment variables start with `NEXT_PUBLIC_`
2. **API calls failing**: Verify API Gateway URL and CORS settings
3. **Authentication issues**: Check Cognito configuration and redirect URLs
4. **Build errors**: Ensure all required environment variables are set

### Debug Mode

Set `NEXT_PUBLIC_USE_MOCK_DATA=true` to use mock data when troubleshooting API issues.
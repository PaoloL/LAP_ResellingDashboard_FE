# API Endpoint Configuration Fix

## Issue
The frontend application was not using the correct API endpoint. The `.env.development` file was missing the API Gateway stage configuration.

## Root Cause
The environment variable `NEXT_PUBLIC_API_GATEWAY_STAGE` was not set in `.env.development`, causing the application to construct an incomplete API URL.

**Before:**
```
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://yr7gcsllh7.execute-api.eu-west-1.amazonaws.com
```

This resulted in API calls to: `https://yr7gcsllh7.execute-api.eu-west-1.amazonaws.com/accounts/payers` (missing `/dev` stage)

## Solution
Added the missing stage configuration to `.env.development`:

**After:**
```
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://yr7gcsllh7.execute-api.eu-west-1.amazonaws.com
NEXT_PUBLIC_API_GATEWAY_STAGE=dev
```

This now correctly constructs API calls to: `https://yr7gcsllh7.execute-api.eu-west-1.amazonaws.com/dev/accounts/payers`

## Verification

### Development Environment
- **Base URL**: `https://yr7gcsllh7.execute-api.eu-west-1.amazonaws.com`
- **Stage**: `dev`
- **Full URL**: `https://yr7gcsllh7.execute-api.eu-west-1.amazonaws.com/dev`

### Production Environment
- **Base URL**: `https://rcoasdajbi.execute-api.eu-west-1.amazonaws.com`
- **Stage**: `prd`
- **Full URL**: `https://rcoasdajbi.execute-api.eu-west-1.amazonaws.com/prd`

## How It Works

The `lib/aws-config.ts` file constructs the full API URL:

```typescript
const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL
  const stage = process.env.NEXT_PUBLIC_API_GATEWAY_STAGE
  
  if (!baseUrl || !stage) {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'
  }
  
  return `${baseUrl}/${stage}`
}
```

## Testing

After this fix, verify the following endpoints work correctly:

1. **Payer Accounts**: `GET /dev/accounts/payers`
2. **Usage Accounts**: `GET /dev/accounts/usages`
3. **Transactions**: `GET /dev/transactions`
4. **Create Payer**: `POST /dev/accounts/payers`
5. **Create Usage**: `POST /dev/accounts/usages`
6. **Create Transaction**: `POST /dev/transactions`

## Next Steps

If you need to restart the development server for changes to take effect:

```bash
cd LAP_BillingDashboard_FE
npm run dev
```

The application should now correctly connect to the API Gateway endpoints.

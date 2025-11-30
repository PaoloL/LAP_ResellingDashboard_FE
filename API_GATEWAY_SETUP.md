# API Gateway Configuration Guide

## Overview

This guide will help you set up AWS API Gateway to work with the billing dashboard application. The application expects specific endpoints for managing payer accounts, usage accounts, and transactions.

## Required API Endpoints

The application expects the following REST API endpoints:

### Payer Accounts
- `GET /accounts/payer` - List all payer accounts
- `POST /accounts/payer` - Create new payer account
- `GET /accounts/payer/{accountId}` - Get specific payer account
- `PUT /accounts/payer/{accountId}` - Update payer account
- `DELETE /accounts/payer/{accountId}` - Delete payer account

### Usage Accounts
- `GET /accounts/usage` - List all usage accounts
- `POST /accounts/usage` - Create new usage account
- `GET /accounts/usage/{accountId}` - Get specific usage account
- `PUT /accounts/usage/{accountId}` - Update usage account
- `DELETE /accounts/usage/{accountId}` - Delete usage account

### Transactions
- `GET /transactions` - List all transactions
- `POST /transactions` - Create new transaction
- `GET /transactions/{accountId}` - List transactions by account
- `GET /transactions/{accountId}/{txId}` - Get specific transaction
- `PUT /transactions/{accountId}/{txId}` - Update transaction
- `DELETE /transactions/{accountId}/{txId}` - Delete transaction

## Step-by-Step Setup

### Step 1: Create API Gateway

1. **Open AWS Console**
   - Navigate to API Gateway service
   - Choose your preferred region (e.g., us-east-1)

2. **Create New API**
   - Click "Create API"
   - Choose "REST API" (not REST API Private)
   - Select "New API"
   - API Name: `billing-dashboard-api`
   - Description: `API for AWS Billing Dashboard`
   - Endpoint Type: `Regional`
   - Click "Create API"

### Step 2: Create Resources Structure

Create the following resource hierarchy:

```
/
├── accounts/
│   ├── payer/
│   │   └── {accountId}
│   └── usage/
│       └── {accountId}
└── transactions/
    └── {accountId}/
        └── {txId}
```

**Creating Resources:**

1. **Create /accounts resource**
   - Select root `/` resource
   - Actions → Create Resource
   - Resource Name: `accounts`
   - Resource Path: `/accounts`
   - Enable CORS: ✓
   - Click "Create Resource"

2. **Create /accounts/payer resource**
   - Select `/accounts` resource
   - Actions → Create Resource
   - Resource Name: `payer`
   - Resource Path: `/payer`
   - Enable CORS: ✓
   - Click "Create Resource"

3. **Create /accounts/payer/{accountId} resource**
   - Select `/accounts/payer` resource
   - Actions → Create Resource
   - Resource Name: `accountId`
   - Resource Path: `/{accountId}`
   - Enable CORS: ✓
   - Click "Create Resource"

4. **Create /accounts/usage resource**
   - Select `/accounts` resource
   - Actions → Create Resource
   - Resource Name: `usage`
   - Resource Path: `/usage`
   - Enable CORS: ✓
   - Click "Create Resource"

5. **Create /accounts/usage/{accountId} resource**
   - Select `/accounts/usage` resource
   - Actions → Create Resource
   - Resource Name: `accountId`
   - Resource Path: `/{accountId}`
   - Enable CORS: ✓
   - Click "Create Resource"

6. **Create /transactions resource**
   - Select root `/` resource
   - Actions → Create Resource
   - Resource Name: `transactions`
   - Resource Path: `/transactions`
   - Enable CORS: ✓
   - Click "Create Resource"

7. **Create /transactions/{accountId} resource**
   - Select `/transactions` resource
   - Actions → Create Resource
   - Resource Name: `accountId`
   - Resource Path: `/{accountId}`
   - Enable CORS: ✓
   - Click "Create Resource"

8. **Create /transactions/{accountId}/{txId} resource**
   - Select `/transactions/{accountId}` resource
   - Actions → Create Resource
   - Resource Name: `txId`
   - Resource Path: `/{txId}`
   - Enable CORS: ✓
   - Click "Create Resource"

### Step 3: Create Methods

For each resource, create the appropriate HTTP methods:

**For /accounts/payer:**
- GET (list all)
- POST (create new)

**For /accounts/payer/{accountId}:**
- GET (get one)
- PUT (update)
- DELETE (delete)

**For /accounts/usage:**
- GET (list all)
- POST (create new)

**For /accounts/usage/{accountId}:**
- GET (get one)
- PUT (update)
- DELETE (delete)

**For /transactions:**
- GET (list all)
- POST (create new)

**For /transactions/{accountId}:**
- GET (list by account)

**For /transactions/{accountId}/{txId}:**
- GET (get one)
- PUT (update)
- DELETE (delete)

**Creating a Method (example for GET /accounts/payer):**

1. Select `/accounts/payer` resource
2. Actions → Create Method
3. Select `GET` from dropdown
4. Click checkmark
5. Integration type: Choose based on your backend:
   - **Lambda Function** (recommended)
   - **HTTP** (for existing REST API)
   - **Mock** (for testing)
6. Configure integration settings
7. Click "Save"

### Step 4: Configure CORS

For each resource that will be called from the browser:

1. Select the resource
2. Actions → Enable CORS
3. Access-Control-Allow-Origin: `*` (or your domain)
4. Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
5. Access-Control-Allow-Methods: Select all methods you created
6. Click "Enable CORS and replace existing CORS headers"

### Step 5: Create Deployment Stages

1. **Create Development Stage**
   - Actions → Deploy API
   - Deployment stage: `[New Stage]`
   - Stage name: `dev`
   - Stage description: `Development environment`
   - Click "Deploy"

2. **Create Production Stage**
   - Actions → Deploy API
   - Deployment stage: `[New Stage]`
   - Stage name: `prd`
   - Stage description: `Production environment`
   - Click "Deploy"

### Step 6: Get API Gateway URLs

After deployment, you'll get URLs like:
- Dev: `https://abc123def.execute-api.us-east-1.amazonaws.com/dev`
- Prod: `https://abc123def.execute-api.us-east-1.amazonaws.com/prd`

### Step 7: Configure Application

Update your `.env.local` file:

```bash
# API Gateway Configuration
NEXT_PUBLIC_API_GATEWAY_BASE_URL=https://abc123def.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_GATEWAY_DEV_STAGE=dev
NEXT_PUBLIC_API_GATEWAY_PROD_STAGE=prd
```

## Backend Integration Options

### Option 1: Lambda Functions (Recommended)

Create Lambda functions for each endpoint:

```javascript
// Example Lambda function for GET /accounts/usage
exports.handler = async (event) => {
    try {
        // Your business logic here
        const accounts = await getUsageAccounts();
        
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(accounts)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: error.message })
        };
    }
};
```

### Option 2: HTTP Integration

If you have an existing REST API, use HTTP integration:

1. Integration type: `HTTP`
2. HTTP method: Match the API Gateway method
3. Endpoint URL: Your backend API URL
4. Configure request/response transformations as needed

### Option 3: Mock Integration (Testing)

For testing without a backend:

1. Integration type: `Mock`
2. Configure mock responses in "Integration Response"
3. Example mock response:
   ```json
   {
     "accounts": [
       {
         "id": "1",
         "name": "Test Account",
         "accountId": "123456789",
         "status": "active",
         "totalCost": 1000.00
       }
     ]
   }
   ```

## Data Models

### UsageAccount Model
```json
{
  "id": "string",
  "accountId": "string",
  "payerId": "string",
  "name": "string",
  "status": "active|inactive",
  "totalCost": "number",
  "depositPercentage": "number",
  "withdrawalPercentage": "number",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### PayerAccount Model
```json
{
  "id": "string",
  "name": "string",
  "customerName": "string",
  "piva": "string",
  "status": "active|inactive",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

### Transaction Model
```json
{
  "id": "string",
  "accountId": "string",
  "date": "string (ISO date)",
  "description": "string",
  "type": "deposit|withdrawal",
  "amount": "number",
  "category": "string (optional)",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

## Testing

### Test with curl

```bash
# Test GET /accounts/usage
curl -X GET "https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/accounts/usage"

# Test POST /accounts/usage
curl -X POST "https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/accounts/usage" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "123456789",
    "payerId": "987654321",
    "name": "Test Account",
    "status": "active",
    "totalCost": 1000.00,
    "depositPercentage": 20,
    "withdrawalPercentage": 80
  }'
```

### Test with API Gateway Console

1. Select a method in API Gateway console
2. Click "TEST"
3. Enter path parameters if needed
4. Enter request body for POST/PUT methods
5. Click "Test"

## Security Considerations

1. **API Keys**: Consider adding API key requirement
2. **IAM Authorization**: Use IAM roles for Lambda integration
3. **Cognito Authorization**: Add Cognito User Pool authorizer if needed
4. **Rate Limiting**: Configure throttling settings
5. **Request Validation**: Add request validators for input validation

## Monitoring

1. **CloudWatch Logs**: Enable logging for debugging
2. **CloudWatch Metrics**: Monitor API performance
3. **X-Ray Tracing**: Enable for detailed request tracing

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is properly configured
2. **404 Errors**: Check resource paths and method configurations
3. **500 Errors**: Check Lambda function logs in CloudWatch
4. **Integration Timeout**: Increase timeout settings if needed

### Debug Steps

1. Check API Gateway execution logs
2. Check Lambda function logs (if using Lambda)
3. Test methods individually in API Gateway console
4. Verify request/response transformations
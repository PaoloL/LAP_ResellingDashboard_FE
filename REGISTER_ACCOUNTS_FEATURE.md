# Register Accounts Feature

## Overview
Added functionality to register new Payer and Usage accounts directly from the Accounts page.

## Changes Made

### New Components

#### 1. `components/register-payer-account-modal.tsx`
Modal component for creating new payer accounts.

**Features:**
- Form with PayerAccountId and PayerAccountName fields
- Input validation (required fields)
- Error handling and display
- Loading states
- Calls `POST /accounts/payers` API endpoint
- Auto-refreshes account list after successful creation

**Fields:**
- **Payer Account ID** (required): AWS Account ID (12 digits)
- **Payer Account Name** (required): Company/Organization name

#### 2. `components/register-usage-account-modal.tsx`
Modal component for creating new usage accounts.

**Features:**
- Form with UsageAccountId, CustomerName, PIVA, and PayerAccountId fields
- Dynamic payer account dropdown (fetches from API)
- Input validation (required fields)
- Error handling and display
- Loading states
- Calls `POST /accounts/usages` API endpoint
- Auto-refreshes account list after successful creation

**Fields:**
- **Usage Account ID** (required): AWS Account ID (12 digits)
- **Customer Name** (required): Customer company name
- **VAT Number (PIVA)** (required): Italian VAT number format
- **Payer Account** (required): Select from existing payer accounts

### Updated Components

#### `app/accounts/page.tsx`
Added register buttons and modal integration.

**Changes:**
- Added "Register Payer Account" button in Payer Accounts section header
- Added "Register Usage Account" button in Usage Accounts section header
- Integrated RegisterPayerAccountModal component
- Integrated RegisterUsageAccountModal component
- Added state management for modal open/close
- Connected modals to refetch functions for automatic list updates

## User Flow

### Registering a Payer Account
1. User clicks "Register Payer Account" button
2. Modal opens with form
3. User enters:
   - Payer Account ID (e.g., 123456789012)
   - Payer Account Name (e.g., "TDSynnex")
4. User clicks "Create Payer Account"
5. API call is made to `POST /accounts/payers`
6. On success:
   - Modal closes
   - Account list refreshes automatically
   - New account appears in the list
7. On error:
   - Error message displays in modal
   - User can correct and retry

### Registering a Usage Account
1. User clicks "Register Usage Account" button
2. Modal opens with form
3. User enters:
   - Usage Account ID (e.g., 987654321098)
   - Customer Name (e.g., "ICARR")
   - VAT Number (e.g., IT12345678901)
   - Selects Payer Account from dropdown
4. User clicks "Create Usage Account"
5. API call is made to `POST /accounts/usages`
6. On success:
   - Modal closes
   - Account list refreshes automatically
   - New account appears in the list
7. On error:
   - Error message displays in modal
   - User can correct and retry

## API Integration

### Payer Account Creation
```typescript
POST /accounts/payers
Content-Type: application/json

{
  "PayerAccountId": "123456789012",
  "PayerAccountName": "Company Name"
}
```

**Response:**
```json
{
  "message": "Payer account created successfully",
  "data": {
    "PayerAccountId": "123456789012",
    "PayerAccountName": "Company Name",
    "CreatedAt": "2025-12-01T13:25:40.661711+00:00",
    "UpdatedAt": "2025-12-01T13:25:40.661711+00:00"
  }
}
```

### Usage Account Creation
```typescript
POST /accounts/usages
Content-Type: application/json

{
  "UsageAccountId": "987654321098",
  "CustomerName": "Customer Name",
  "PIVA": "IT12345678901",
  "PayerAccountId": "123456789012"
}
```

**Response:**
```json
{
  "message": "Usage account created successfully",
  "data": {
    "UsageAccountId": "987654321098",
    "CustomerName": "Customer Name",
    "PIVA": "IT12345678901",
    "PayerAccountId": "123456789012",
    "CreatedAt": "2025-12-01T13:26:05.090611+00:00",
    "UpdatedAt": "2025-12-01T13:26:05.090611+00:00"
  }
}
```

## UI/UX Improvements

1. **Consistent Design**: Modals match existing edit modals style
2. **Clear Labels**: All fields have descriptive labels and helper text
3. **Validation**: Required fields are marked with red asterisk
4. **Error Handling**: Clear error messages displayed inline
5. **Loading States**: Buttons show loading spinner during API calls
6. **Disabled States**: Form fields disabled during submission
7. **Auto-refresh**: Lists automatically update after successful creation

## Benefits

1. **Self-Service**: Users can create accounts without backend access
2. **Data Integrity**: Ensures proper account entity creation in DynamoDB
3. **Prevents Orphaned Transactions**: Users can create account entities before transactions
4. **User-Friendly**: Simple, intuitive interface for account management
5. **Consistent Experience**: Matches existing modal patterns in the application

## Technical Notes

- Uses existing API client (`@/lib/api`)
- Leverages existing hooks (`usePayerAccounts`)
- Follows established component patterns
- TypeScript type-safe with proper interfaces
- No breaking changes to existing functionality

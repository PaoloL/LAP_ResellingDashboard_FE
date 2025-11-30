# Accounts Page Implementation

## Overview
Implemented a comprehensive Accounts page that displays both Payer Accounts and Usage Accounts in separate sections with proper tagging.

## Features Implemented

### 1. Dual Account Type Display
The page now shows two distinct sections:

#### Payer Accounts Section
- **Tag**: PAYER badge
- **Icon**: Building2 icon
- **API Endpoint**: GET /accounts/payers
- **Fields Displayed**:
  - Account Name (PayerAccountName)
  - Account ID (PayerAccountId)
  - Created Date
  - Last Updated Date
- **Actions**: Edit, View Details buttons

#### Usage Accounts Section
- **Tag**: USAGE badge
- **Icon**: Users icon
- **API Endpoint**: GET /accounts/usages
- **Fields Displayed**:
  - Customer Name
  - Account ID (UsageAccountId)
  - VAT Number (PIVA)
  - Payer Account ID (linked payer)
  - Created Date
- **Actions**: Edit, View Details buttons

### 2. Card-Based Layout
- Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
- Hover effects for better UX
- Clean card design with proper spacing
- Badge indicators for account type

### 3. Empty States
- Friendly empty state messages when no accounts exist
- Icon-based visual feedback
- Separate empty states for each account type

### 4. Loading & Error States
- Loading spinner with message
- Error alerts with descriptive messages
- Proper error handling for both API calls

### 5. Action Buttons
- "Add Payer" button for creating new payer accounts
- "Add Usage Account" button for creating new usage accounts
- Edit and View Details buttons on each card (ready for future implementation)

## Component Structure

```
app/accounts/page.tsx
├── PayerAccountCard (inline component)
│   ├── Account Name
│   ├── Account ID
│   ├── Created/Updated dates
│   └── Action buttons
└── UsageAccountCard (inline component)
    ├── Customer Name
    ├── Account ID
    ├── VAT Number
    ├── Payer Account ID
    ├── Created date
    └── Action buttons
```

## API Integration

### Hooks Used:
- `usePayerAccounts()` - Fetches all payer accounts
- `useUsageAccounts()` - Fetches all usage accounts

### Data Handling:
- Supports both new backend format (single-table design) and legacy format
- Graceful fallbacks for missing fields
- Proper date formatting

## Styling

### Design Elements:
- Primary color for section icons
- Secondary badges for account type tags
- Outline badges for section headers
- Consistent spacing and typography
- Responsive grid system

### Visual Hierarchy:
1. Section headers with icons and badges
2. Add buttons for quick actions
3. Card grid for account display
4. Individual card actions

## Current Test Data

### Payer Account:
```
ID: 337413407308
Name: Main Payer Account
```

### Usage Account:
```
ID: 008848054048
Customer: Customer A
VAT: IT12345678901
Payer: 337413407308
```

## Future Enhancements

### Planned Features:
1. **Add Account Modals**
   - Form for creating new payer accounts
   - Form for creating new usage accounts
   - Validation and error handling

2. **Edit Functionality**
   - Modal or page for editing account details
   - Update API integration

3. **View Details Page**
   - Detailed account information
   - Transaction history for the account
   - Related accounts view

4. **Search & Filter**
   - Search accounts by name or ID
   - Filter by status or date range
   - Sort options

5. **Bulk Actions**
   - Select multiple accounts
   - Bulk delete or update
   - Export functionality

6. **Account Statistics**
   - Total transaction count
   - Total amount processed
   - Activity charts

## Files Modified

1. `app/accounts/page.tsx` - Complete rewrite with dual account type support

## Testing

To test the implementation:

1. Navigate to `/accounts` in the frontend
2. Verify both sections are displayed
3. Check that the payer account appears in the Payer Accounts section
4. Check that the usage account appears in the Usage Accounts section
5. Verify badges show "PAYER" and "USAGE" correctly
6. Test responsive layout on different screen sizes

## API Endpoints Used

```
GET /accounts/payers
Response: {
  "count": 1,
  "data": [
    {
      "PayerAccountId": "337413407308",
      "PayerAccountName": "Main Payer Account",
      "CreatedAt": "2025-11-30T17:11:36.045896+00:00",
      "UpdatedAt": "2025-11-30T17:11:36.045896+00:00"
    }
  ]
}

GET /accounts/usages
Response: {
  "count": 1,
  "data": [
    {
      "UsageAccountId": "008848054048",
      "CustomerName": "Customer A",
      "PIVA": "IT12345678901",
      "PayerAccountId": "337413407308",
      "CreatedAt": "2025-11-30T17:11:16.895466+00:00",
      "UpdatedAt": "2025-11-30T17:11:16.895466+00:00"
    }
  ]
}
```

## Status

✅ Payer Accounts section implemented
✅ Usage Accounts section implemented
✅ PAYER and USAGE tags displayed
✅ Responsive card layout
✅ Loading and error states
✅ Empty states
✅ API integration working
✅ Ready for testing

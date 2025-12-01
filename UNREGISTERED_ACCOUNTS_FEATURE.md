# Unregistered Accounts Detection Feature

## Overview
Automatically detects accounts referenced in transactions but not registered in the system, and provides a quick registration interface.

## Problem Solved
When transactions are created with payer or usage account IDs that don't have corresponding account entities in the database, those accounts won't appear in the accounts list. This feature detects these "orphaned" account references and helps users register them properly.

## Changes Made

### New Files

#### 1. `lib/account-utils.ts`
Utility functions for account management.

**Key Function:**
```typescript
findUnregisteredAccounts(
  transactions: Transaction[],
  payerAccounts: PayerAccount[],
  usageAccounts: UsageAccount[]
): UnregisteredAccount[]
```

**Logic:**
- Extracts all payer and usage account IDs from transactions
- Compares against registered account IDs
- Returns list of unregistered accounts with:
  - Account ID
  - Account type (payer or usage)
  - Number of transactions using this account

#### 2. `components/unregistered-accounts-section.tsx`
Component that displays unregistered accounts in a prominent warning section.

**Features:**
- Orange alert banner showing count of unregistered accounts
- Two-column grid layout (payer accounts | usage accounts)
- Each unregistered account shows:
  - Account ID (monospace font)
  - Account type badge (color-coded)
  - Transaction count
  - "Register" button
- Clicking "Register" opens the appropriate modal with pre-filled account ID

### Updated Files

#### 3. `components/register-payer-account-modal.tsx`
Added support for pre-filled account IDs.

**Changes:**
- Added `prefilledAccountId?: string` prop
- Account ID field is pre-filled and disabled when provided
- Visual indication (muted background) for pre-filled fields

#### 4. `components/register-usage-account-modal.tsx`
Added support for pre-filled account IDs.

**Changes:**
- Added `prefilledAccountId?: string` prop
- Account ID field is pre-filled and disabled when provided
- Visual indication (muted background) for pre-filled fields

#### 5. `app/accounts/page.tsx`
Integrated unregistered accounts detection.

**Changes:**
- Added `useAllTransactions()` hook to fetch transactions
- Calls `findUnregisteredAccounts()` to detect unregistered accounts
- Displays `UnregisteredAccountsSection` at the top of the page (when unregistered accounts exist)
- Added `handleAccountRegistered()` to refresh all data after registration

## User Flow

### Detection
1. Page loads and fetches:
   - All payer accounts
   - All usage accounts
   - All transactions
2. System compares transaction account IDs with registered account IDs
3. If unregistered accounts are found, displays warning section at top

### Registration Flow
1. User sees orange alert: "Unregistered Accounts Detected"
2. Unregistered accounts are displayed in cards showing:
   - Account ID
   - Type (PAYER or USAGE badge)
   - Number of transactions using this account
3. User clicks "Register" button on an unregistered account
4. Modal opens with:
   - Account ID pre-filled and locked
   - Other fields empty and ready for input
5. User completes the required fields:
   - **For Payer**: Account Name
   - **For Usage**: Customer Name, VAT Number, Payer Account selection
6. User clicks "Create" button
7. Account is registered in the system
8. All data refreshes automatically
9. Registered account moves from "Unregistered" section to appropriate section
10. If no more unregistered accounts, warning section disappears

## UI/UX Design

### Visual Hierarchy
1. **Top Priority**: Unregistered accounts section (orange alert)
2. **Secondary**: Registered payer accounts
3. **Tertiary**: Registered usage accounts

### Color Coding
- **Orange**: Warning/unregistered state
  - Alert banner: `border-orange-500 bg-orange-50`
  - Cards: `border-orange-200 bg-orange-50`
  - Icon: `text-orange-600`
- **Payer Badge**: `#EC9400` (orange)
- **Usage Badge**: `#026172` (teal)

### Information Display
Each unregistered account card shows:
```
┌─────────────────────────────────────┐
│ 619638742201          [PAYER]      │
│ Used in 5 transactions              │
│                      [Register →]   │
└─────────────────────────────────────┘
```

## Technical Implementation

### Data Flow
```
Transactions API
      ↓
findUnregisteredAccounts()
      ↓
Compare with Registered Accounts
      ↓
UnregisteredAccountsSection
      ↓
Register Modal (pre-filled)
      ↓
API Create Call
      ↓
Refresh All Data
```

### Performance Considerations
- Detection runs client-side (no additional API calls)
- Uses existing data from hooks
- Efficient Set-based lookups for O(1) comparison
- Only renders section when unregistered accounts exist

## Benefits

1. **Data Integrity**: Ensures all account references have proper entities
2. **User Awareness**: Immediately alerts users to data inconsistencies
3. **Quick Resolution**: One-click registration with pre-filled IDs
4. **Prevents Errors**: Reduces orphaned transaction references
5. **Audit Trail**: Shows transaction count for each unregistered account
6. **Self-Service**: Users can fix issues without backend access

## Example Scenarios

### Scenario 1: Transaction Created Before Account
1. User creates transaction with PayerAccountId: `123456789012`
2. Payer account entity doesn't exist yet
3. Unregistered section shows: "123456789012 (PAYER) - Used in 1 transaction"
4. User clicks Register, fills in name, creates account
5. Account now appears in Payer Accounts section

### Scenario 2: Bulk Import with Missing Accounts
1. System imports 100 transactions from external source
2. References 5 payer accounts and 10 usage accounts
3. Only 2 payer and 3 usage accounts are registered
4. Unregistered section shows 3 payers + 7 usage accounts
5. User systematically registers each one
6. Section disappears when all are registered

### Scenario 3: Data Migration
1. Old system had different account structure
2. Transactions migrated but accounts need manual entry
3. Unregistered section shows all accounts needing registration
4. Provides clear count and priority for data cleanup

## API Integration

No new API endpoints required. Uses existing:
- `GET /transactions` - Fetch all transactions
- `GET /accounts/payers` - Fetch registered payer accounts
- `GET /accounts/usages` - Fetch registered usage accounts
- `POST /accounts/payers` - Register new payer account
- `POST /accounts/usages` - Register new usage account

## Future Enhancements

Potential improvements:
1. **Bulk Registration**: Register multiple accounts at once
2. **Auto-Suggest Names**: Use external AWS API to fetch account names
3. **Export List**: Download CSV of unregistered accounts
4. **Email Alerts**: Notify admins when unregistered accounts are detected
5. **Historical Tracking**: Show when accounts were registered vs first transaction
6. **Validation Rules**: Warn if account ID format is invalid

## Testing Checklist

- [ ] Unregistered payer account detected and displayed
- [ ] Unregistered usage account detected and displayed
- [ ] Transaction count is accurate
- [ ] Register button opens correct modal
- [ ] Account ID is pre-filled and disabled
- [ ] Registration succeeds and refreshes data
- [ ] Section disappears when no unregistered accounts
- [ ] Multiple unregistered accounts display correctly
- [ ] Color coding matches design system
- [ ] Responsive layout works on mobile

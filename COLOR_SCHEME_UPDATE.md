# Color Scheme Update

## Updated Color Palette

The application now uses the following custom color scheme:

### Transaction Colors
- **Withdrawals**: `#EC9400` (Orange) - Used for withdrawal transactions and amounts
- **Deposits**: `#3D97AD` (Light Teal) - Used for deposit transactions and amounts

### Badge Colors
- **Payer Account Tags**: `#EC9400` (Orange) - Used for PAYER badges
- **Usage Account Tags**: `#026172` (Teal) - Used for USAGE badges

## Files Updated

### 1. Global CSS (`app/globals.css`)
- Updated `--destructive` color to `#EC9400` (Orange)
- Updated `--success` color to `#3D97AD` (Light Teal)
- Applied to both light and dark themes

### 2. Account Details Page (`app/accounts/[id]/page.tsx`)
- Badge colors: Orange for PAYER, Teal for USAGE
- Total Deposits: Light teal color (`#3D97AD`)
- Total Withdrawals: Orange color (`#EC9400`)

### 3. Accounts List Page (`app/accounts/page.tsx`)
- PAYER badges: Orange background (`#EC9400`)
- USAGE badges: Teal background (`#026172`)

### 4. Transaction List Component (`components/transaction-list.tsx`)
- Border color for deposits: `#3D97AD` (Light Teal)
- Border color for withdrawals: `#EC9400` (Orange)
- Amount text color for deposits: `#3D97AD`
- Amount text color for withdrawals: `#EC9400`

## Visual Impact

- **Withdrawals** are now consistently displayed in orange across all pages
- **Deposits** are now consistently displayed in light teal across all pages
- **Payer accounts** are tagged with orange badges
- **Usage accounts** are tagged with teal badges
- All changes maintain accessibility and visual consistency

## Date: November 30, 2024

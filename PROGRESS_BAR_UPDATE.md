# Progress Bar Logic Update

## Overview
Updated the "Deposits vs Withdrawals" progress bar to show budget utilization more intuitively.

## New Logic

### Progress Bar Representation
- **Background Color**: `#3D97AD` (Light Teal) - Represents total deposits (available budget)
- **Bar Fill**: Represents total cost (withdrawals) as a percentage of deposits
- **Bar Color**: 
  - `#EC9400` (Orange) - Normal spending (withdrawals ≤ deposits)
  - `#DC2626` (Red) - Over budget (withdrawals > deposits, capped at 100%)

### Calculation
```typescript
costPercentage = (totalWithdrawals / totalDeposits) * 100
isOverBudget = totalWithdrawals > totalDeposits
```

### Visual Indicators
1. **Label**: Changed from "Deposits vs Withdrawals" to "Cost vs Budget"
2. **Percentage Display**: 
   - Shows cost as percentage of budget
   - Color changes to red when over budget
   - Text changes to "Over Budget" when exceeding deposits
3. **Progress Bar**:
   - Background represents the full budget (deposits)
   - Fill represents how much has been spent (withdrawals)
   - Turns red when spending exceeds budget

### Examples

**Scenario 1: Under Budget**
- Deposits: €1000
- Withdrawals: €750
- Bar: 75% filled in orange
- Label: "75.0% Used"

**Scenario 2: Over Budget**
- Deposits: €1000
- Withdrawals: €1200
- Bar: 100% filled in red
- Label: "120.0% Over Budget" (in red text)

**Scenario 3: No Spending**
- Deposits: €1000
- Withdrawals: €0
- Bar: 0% filled
- Label: "0.0% Used"

## Files Modified

### 1. `app/accounts/[id]/page.tsx`
- Updated calculation logic to compute `costPercentage` and `isOverBudget`
- Replaced standard Progress component with custom progress bar
- Updated labels and descriptions
- Added conditional styling for over-budget state

### 2. `components/ui/progress.tsx`
- Added `indicatorClassName` prop support for custom indicator styling
- Allows dynamic color changes based on state

## Benefits

1. **Intuitive Visualization**: Users can immediately see how much of their budget has been consumed
2. **Clear Warning**: Red color provides immediate visual feedback when over budget
3. **Accurate Representation**: Background shows total available funds, fill shows spending
4. **Better Decision Making**: Helps users understand their financial position at a glance

## Date: November 30, 2024

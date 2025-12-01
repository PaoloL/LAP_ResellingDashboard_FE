# Home Page Charts Update

## Overview
Updated all three charts on the home page to display real transaction data filtered for the current year.

## Chart Updates

### 1. Total Cost (YTD) Chart
**File**: `components/charts/total-cost-chart.tsx`

**Changes**:
- Now shows **total withdrawals only** (not all transactions)
- Filtered for **current year** transactions
- Groups withdrawals by month
- Displays all 12 months (Jan-Dec) with zero values for months without data
- Bar color: `#EC9400` (Orange)

**Data Source**: All withdrawal transactions from current year

**Calculation**:
```typescript
currentYearWithdrawals = transactions
  .filter(t => year === currentYear && type === 'WITHDRAWAL')
  .groupBy(month)
  .sum(amount)
```

---

### 2. Usage by Account Chart
**File**: `components/charts/usage-chart.tsx`

**Changes**:
- Now shows **total withdrawals per usage account**
- Filtered for **current year** transactions
- Calculates actual withdrawal amounts from transactions (not mock data)
- Sorts accounts by withdrawal amount (descending)
- Only shows accounts with withdrawals > 0
- Pie chart with legend showing account names and amounts

**Data Source**: Withdrawal transactions grouped by UsageAccountId for current year

**Calculation**:
```typescript
accountWithdrawals = transactions
  .filter(t => year === currentYear && type === 'WITHDRAWAL')
  .groupBy(UsageAccountId)
  .sum(amount)
```

---

### 3. Deposit vs Withdrawal Chart
**File**: `components/charts/deposit-withdrawal-chart.tsx`

**Changes**:
- Now shows **deposits vs withdrawals** for all accounts
- Filtered for **current year** transactions
- Two lines: Deposits (Light Teal #3D97AD) and Withdrawals (Orange #EC9400)
- Groups by month showing both deposit and withdrawal totals
- Displays all 12 months with zero values for months without data

**Data Source**: All transactions (deposits and withdrawals) from current year

**Calculation**:
```typescript
monthlyData = transactions
  .filter(t => year === currentYear)
  .groupBy(month)
  .aggregate({
    deposits: sum(amount where type === 'DEPOSIT'),
    withdrawals: sum(amount where type === 'WITHDRAWAL')
  })
```

**Legend**:
- **Deposits**: Light Teal line (#3D97AD)
- **Withdrawals**: Orange line (#EC9400)

---

## Key Features

### Current Year Filtering
All charts now filter transactions to show only data from the current year (2024):
```typescript
const currentYear = new Date().getFullYear()
const currentYearTransactions = transactions.filter(t => {
  const date = new Date(t.TransactionDate || t.date)
  return date.getFullYear() === currentYear
})
```

### Month Ordering
Charts display months in calendar order (Jan-Dec) with zero values for months without transactions, providing a complete year view.

### Real-Time Data
All charts now use actual transaction data from the API instead of mock data, updating automatically when transactions change.

### Color Consistency
- **Withdrawals/Costs**: `#EC9400` (Orange)
- **Deposits**: `#3D97AD` (Light Teal)
- Consistent with the color scheme used throughout the application

---

## Benefits

1. **Accurate Financial Overview**: Shows real spending patterns and budget utilization
2. **Year-to-Date Tracking**: Easy to see cumulative costs and trends for the current year
3. **Account-Level Insights**: Identify which accounts are consuming the most budget
4. **Budget vs Spending**: Compare deposits (budget) against withdrawals (spending) over time
5. **Complete Timeline**: All 12 months displayed for full year context

## Date: November 30, 2024

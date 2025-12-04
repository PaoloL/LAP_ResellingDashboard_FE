// Utility functions for account management

import type { Transaction, PayerAccount, UsageAccount } from './api'

export interface UnregisteredAccount {
  id: string
  type: 'payer' | 'usage'
  transactionCount: number
}

/**
 * Find unregistered accounts by comparing transactions with registered accounts
 */
export function findUnregisteredAccounts(
  transactions: Transaction[],
  payerAccounts: PayerAccount[],
  usageAccounts: UsageAccount[]
): UnregisteredAccount[] {
  const unregistered: Map<string, UnregisteredAccount> = new Map()

  // Get registered account IDs
  const registeredPayerIds = new Set(
    payerAccounts.map(acc => acc.PayerAccountId || acc.id).filter(Boolean)
  )
  const registeredUsageIds = new Set(
    usageAccounts.map(acc => acc.UsageAccountId || acc.accountId || acc.id).filter(Boolean)
  )

  // Check each transaction for unregistered accounts
  transactions.forEach(tx => {
    const payerId = tx.PayerAccountId || tx.payerId
    const usageId = tx.UsageAccountId || tx.accountId

    // Check payer account
    if (payerId && !registeredPayerIds.has(payerId)) {
      const existing = unregistered.get(`payer-${payerId}`)
      if (existing) {
        existing.transactionCount++
      } else {
        unregistered.set(`payer-${payerId}`, {
          id: payerId,
          type: 'payer',
          transactionCount: 1
        })
      }
    }

    // Check usage account
    if (usageId && !registeredUsageIds.has(usageId)) {
      const existing = unregistered.get(`usage-${usageId}`)
      if (existing) {
        existing.transactionCount++
      } else {
        unregistered.set(`usage-${usageId}`, {
          id: usageId,
          type: 'usage',
          transactionCount: 1
        })
      }
    }
  })

  return Array.from(unregistered.values())
}

export interface AccountMetrics {
  totalCostYTD: number
  totalCostMTD: number
  costVsBudgetPercentage: number | null
}

/**
 * Calculate YTD (Year-to-Date) cost for an account
 * Only counts WITHDRAWAL transactions
 */
export function calculateYTDCost(
  transactions: Transaction[],
  accountId: string,
  accountType: 'payer' | 'usage'
): number {
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1)

  return transactions
    .filter(tx => {
      const matchesAccount = accountType === 'payer'
        ? (tx.PayerAccountId || tx.payerId) === accountId
        : (tx.UsageAccountId || tx.accountId) === accountId
      
      const txDate = new Date(tx.TransactionDate || tx.Timestamp || tx.date || '')
      const isThisYear = txDate >= yearStart
      
      // Only count WITHDRAWAL transactions
      const isWithdrawal = (tx.TransactionType || tx.type)?.toUpperCase() === 'WITHDRAWAL'

      return matchesAccount && isThisYear && isWithdrawal
    })
    .reduce((sum, tx) => sum + (tx.Amount || tx.amount || 0), 0)
}

/**
 * Calculate MTD (Month-to-Date) cost for an account
 * Only counts WITHDRAWAL transactions
 */
export function calculateMTDCost(
  transactions: Transaction[],
  accountId: string,
  accountType: 'payer' | 'usage'
): number {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  return transactions
    .filter(tx => {
      const matchesAccount = accountType === 'payer'
        ? (tx.PayerAccountId || tx.payerId) === accountId
        : (tx.UsageAccountId || tx.accountId) === accountId
      
      const txDate = new Date(tx.TransactionDate || tx.Timestamp || tx.date || '')
      const isThisMonth = txDate >= monthStart
      
      // Only count WITHDRAWAL transactions
      const isWithdrawal = (tx.TransactionType || tx.type)?.toUpperCase() === 'WITHDRAWAL'

      return matchesAccount && isThisMonth && isWithdrawal
    })
    .reduce((sum, tx) => sum + (tx.Amount || tx.amount || 0), 0)
}

/**
 * Calculate YTD budget from DEPOSIT transactions
 */
export function calculateYTDBudget(
  transactions: Transaction[],
  accountId: string,
  accountType: 'payer' | 'usage'
): number {
  const currentYear = new Date().getFullYear()
  const yearStart = new Date(currentYear, 0, 1)

  return transactions
    .filter(tx => {
      const matchesAccount = accountType === 'payer'
        ? (tx.PayerAccountId || tx.payerId) === accountId
        : (tx.UsageAccountId || tx.accountId) === accountId
      
      const txDate = new Date(tx.TransactionDate || tx.Timestamp || tx.date || '')
      const isThisYear = txDate >= yearStart
      
      // Only count DEPOSIT transactions
      const isDeposit = (tx.TransactionType || tx.type)?.toUpperCase() === 'DEPOSIT'

      return matchesAccount && isThisYear && isDeposit
    })
    .reduce((sum, tx) => sum + (tx.Amount || tx.amount || 0), 0)
}

/**
 * Calculate cost vs budget percentage
 * Returns null if no budget is set
 */
export function calculateCostVsBudgetPercentage(
  actualCost: number,
  budget: number | undefined
): number | null {
  if (!budget || budget === 0) {
    return null
  }
  return (actualCost / budget) * 100
}

/**
 * Get all metrics for an account
 */
export function getAccountMetrics(
  transactions: Transaction[],
  accountId: string,
  accountType: 'payer' | 'usage',
  yearlyBudget?: number
): AccountMetrics {
  const totalCostYTD = calculateYTDCost(transactions, accountId, accountType)
  const totalCostMTD = calculateMTDCost(transactions, accountId, accountType)
  
  // Calculate budget from DEPOSIT transactions if not provided
  const budget = yearlyBudget || calculateYTDBudget(transactions, accountId, accountType)
  const costVsBudgetPercentage = calculateCostVsBudgetPercentage(totalCostYTD, budget)

  return {
    totalCostYTD,
    totalCostMTD,
    costVsBudgetPercentage
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

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

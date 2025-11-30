import { useState, useEffect, useCallback } from 'react'
import { payerAccountsApi, usageAccountsApi, transactionsApi, PayerAccount, UsageAccount, Transaction } from '@/lib/api'

// Generic hook for API calls
function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Payer Accounts hooks
export function usePayerAccounts() {
  return useApi(() => payerAccountsApi.getAll())
}

export function usePayerAccount(accountId: string) {
  const [data, setData] = useState<PayerAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await payerAccountsApi.getById(accountId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [accountId])

  return { data, loading, error, refetch: () => {} }
}

// Usage Accounts hooks
export function useUsageAccounts() {
  return useApi(() => usageAccountsApi.getAll())
}

export function useUsageAccount(accountId: string) {
  const [data, setData] = useState<UsageAccount | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accountId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await usageAccountsApi.getById(accountId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [accountId])

  return { data, loading, error, refetch: () => {} }
}

// Transactions hooks
export function useAllTransactions() {
  return useApi(() => transactionsApi.getAll())
}

export function usePayerTransactions(payerId: string) {
  const [data, setData] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!payerId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await transactionsApi.getByPayer(payerId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [payerId])

  return { data, loading, error, refetch: () => {} }
}

export function useAccountTransactions(payerId: string, accountId: string) {
  const [data, setData] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!payerId || !accountId) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await transactionsApi.getByPayerAndAccount(payerId, accountId)
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [payerId, accountId])

  return { data, loading, error, refetch: () => {} }
}

export function useTransaction(payerId: string, accountId: string, txId: string) {
  return useApi(() => transactionsApi.getById(payerId, accountId, txId), [payerId, accountId, txId])
}

// Mutation hooks for create/update/delete operations
export function useCreateUsageAccount() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAccount = async (data: Omit<UsageAccount, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await usageAccountsApi.create(data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createAccount, loading, error }
}

export function useCreateTransaction() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true)
      setError(null)
      const result = await transactionsApi.create(data)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createTransaction, loading, error }
}
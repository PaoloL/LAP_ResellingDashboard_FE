// API service for the billing dashboard

import { awsConfig } from './aws-config'

const API_BASE_URL = awsConfig.apiGateway.fullUrl

// Types
export interface PayerAccount {
  // New backend format
  PayerAccountId?: string
  PayerAccountName?: string
  YearlyBudget?: number
  CreatedAt?: string
  UpdatedAt?: string
  
  // Legacy format
  id?: string
  name?: string
  customerName?: string
  piva?: string
  yearlyBudget?: number
  status?: 'active' | 'inactive'
  createdAt?: string
  updatedAt?: string
}

export interface UsageAccount {
  // New backend format
  UsageAccountId?: string
  CustomerName?: string
  PIVA?: string
  PayerAccountId?: string
  YearlyBudget?: number
  CreatedAt?: string
  UpdatedAt?: string
  
  // Legacy format
  id?: string
  accountId?: string
  payerId?: string
  name?: string
  yearlyBudget?: number
  status?: 'active' | 'inactive'
  totalCost?: number
  depositPercentage?: number
  withdrawalPercentage?: number
  createdAt?: string
  updatedAt?: string
}

export interface Transaction {
  // New backend format (single-table design)
  TransactionId?: string
  PayerAccountId?: string
  UsageAccountId?: string
  TransactionType?: 'DEPOSIT' | 'WITHDRAWAL'
  TransactionDate?: string
  Timestamp?: string
  Amount?: number
  Currency?: string
  InvoiceId?: string
  BillingPeriod?: string
  Description?: string
  CreatedAt?: string
  
  // Legacy format (for backward compatibility)
  id?: string
  payerId?: string
  accountId?: string
  date?: string
  description?: string
  type?: 'deposit' | 'withdrawal'
  amount?: number
  category?: string
  createdAt?: string
  updatedAt?: string
}

// API Error handling
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, `API Error: ${response.statusText} - ${errorText}`)
  }

  const data = await response.json()
  
  // Handle backend response format: { data: [...], count: X } or { data: {...} }
  if (data && typeof data === 'object' && 'data' in data) {
    return data.data as T
  }
  
  return data as T
}

// Payer Accounts API
export const payerAccountsApi = {
  // GET /accounts/payers - List all
  getAll: (): Promise<PayerAccount[]> => 
    apiRequest('/accounts/payers'),

  // POST /accounts/payers - Create
  create: (data: Omit<PayerAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayerAccount> =>
    apiRequest('/accounts/payers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /accounts/payers/{accountId} - Get one
  getById: (accountId: string): Promise<PayerAccount> =>
    apiRequest(`/accounts/payers/${accountId}`),

  // PUT /accounts/payers/{accountId} - Update
  update: (accountId: string, data: Partial<PayerAccount>): Promise<PayerAccount> =>
    apiRequest(`/accounts/payers/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /accounts/payers/{accountId} - Delete
  delete: (accountId: string): Promise<void> =>
    apiRequest(`/accounts/payers/${accountId}`, {
      method: 'DELETE',
    }),
}

// Usage Accounts API
export const usageAccountsApi = {
  // GET /accounts/usages - List all
  getAll: (): Promise<UsageAccount[]> =>
    apiRequest('/accounts/usages'),

  // POST /accounts/usages - Create
  create: (data: Omit<UsageAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<UsageAccount> =>
    apiRequest('/accounts/usages', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /accounts/usages/{accountId} - Get one
  getById: (accountId: string): Promise<UsageAccount> =>
    apiRequest(`/accounts/usages/${accountId}`),

  // PUT /accounts/usages/{accountId} - Update
  update: (accountId: string, data: Partial<UsageAccount>): Promise<UsageAccount> =>
    apiRequest(`/accounts/usages/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /accounts/usages/{accountId} - Delete
  delete: (accountId: string): Promise<void> =>
    apiRequest(`/accounts/usages/${accountId}`, {
      method: 'DELETE',
    }),
}

// Transactions API
export const transactionsApi = {
  // GET /transactions - List all
  getAll: (): Promise<Transaction[]> =>
    apiRequest('/transactions'),

  // POST /transactions - Create
  create: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> =>
    apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /transactions/{payerId} - List by payer
  getByPayer: (payerId: string): Promise<Transaction[]> =>
    apiRequest(`/transactions/${payerId}`),

  // GET /transactions/{payerId}/{accountId} - List by payer and account
  getByPayerAndAccount: (payerId: string, accountId: string): Promise<Transaction[]> =>
    apiRequest(`/transactions/${payerId}/${accountId}`),

  // GET /transactions/{payerId}/{accountId}/{txId} - Get one
  getById: (payerId: string, accountId: string, txId: string): Promise<Transaction> =>
    apiRequest(`/transactions/${payerId}/${accountId}/${txId}`),

  // PUT /transactions/{payerId}/{accountId}/{txId} - Update
  update: (payerId: string, accountId: string, txId: string, data: Partial<Transaction>): Promise<Transaction> =>
    apiRequest(`/transactions/${payerId}/${accountId}/${txId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /transactions/{payerId}/{accountId}/{txId} - Delete
  delete: (payerId: string, accountId: string, txId: string): Promise<void> =>
    apiRequest(`/transactions/${payerId}/${accountId}/${txId}`, {
      method: 'DELETE',
    }),
}

// Helper function to get date range for last month
export function getLastMonthDateRange(): { startDate: string; endDate: string } {
  const today = new Date()
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
  
  return {
    startDate: lastMonth.toISOString().split('T')[0],
    endDate: lastMonthEnd.toISOString().split('T')[0]
  }
}

// Helper function to get date range for current month
export function getCurrentMonthDateRange(): { startDate: string; endDate: string } {
  const today = new Date()
  const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  return {
    startDate: currentMonthStart.toISOString().split('T')[0],
    endDate: currentMonthEnd.toISOString().split('T')[0]
  }
}
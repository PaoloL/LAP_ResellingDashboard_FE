"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TransactionList } from "@/components/transaction-list"
import { usePayerAccount, useUsageAccount, usePayerTransactions, useAccountTransactions, useUsageAccounts } from "@/hooks/use-api"
import { PayerAccount, UsageAccount } from "@/lib/api"
import { ArrowLeft, Loader2, Building2, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { use, useMemo, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccountDetailsPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    type?: string
  }>
}

export default function AccountDetailsPage({ params, searchParams }: AccountDetailsPageProps) {
  const { id } = use(params)
  const { type } = use(searchParams)
  
  // Determine account type from URL parameter
  const isPayer = type === 'payer'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // ALWAYS call all hooks unconditionally to follow Rules of Hooks
  const { data: payerAccount, loading: payerLoading, error: payerError } = usePayerAccount(isPayer ? id : '')
  const { data: usageAccount, loading: usageLoading, error: usageError } = useUsageAccount(!isPayer ? id : '')
  const { data: payerTransactions, loading: payerTxLoading, error: payerTxError } = usePayerTransactions(isPayer ? id : '')
  const { data: usageTransactions, loading: usageTxLoading, error: usageTxError } = useAccountTransactions(
    !isPayer && usageAccount?.PayerAccountId ? usageAccount.PayerAccountId : '',
    !isPayer ? id : ''
  )
  const { data: allUsageAccounts, loading: usageAccountsLoading } = useUsageAccounts()
  
  // Derive values from hooks
  const account = isPayer ? payerAccount : usageAccount
  const transactions = isPayer ? payerTransactions : usageTransactions
  const accountLoading = isPayer ? payerLoading : usageLoading
  const accountError = isPayer ? payerError : usageError
  const transactionsLoading = isPayer ? payerTxLoading : usageTxLoading
  const transactionsError = isPayer ? payerTxError : usageTxError

  // Filter usage accounts for this payer (only for payer accounts)
  const associatedUsageAccounts = useMemo(() => {
    if (!isPayer || !allUsageAccounts) return []
    return allUsageAccounts.filter(acc => 
      (acc.PayerAccountId || acc.payerId) === id
    )
  }, [isPayer, allUsageAccounts, id])

  // Get last 10 transactions (for usage accounts sidebar)
  const recentTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    // Sort by date descending and take first 10
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(a.TransactionDate || a.Timestamp || a.date || 0)
        const dateB = new Date(b.TransactionDate || b.Timestamp || b.date || 0)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 10)
  }, [transactions])

  // Pagination calculations
  const { paginatedTransactions, totalPages } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { paginatedTransactions: [], totalPages: 0 }
    }
    
    const total = Math.ceil(transactions.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginated = transactions.slice(startIndex, endIndex)
    
    return { paginatedTransactions: paginated, totalPages: total }
  }, [transactions, currentPage, itemsPerPage])

  // Calculate deposit and withdrawal totals - MUST be called before any early returns
  const { totalDeposits, totalWithdrawals, costPercentage, isOverBudget } = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalDeposits: 0, totalWithdrawals: 0, costPercentage: 0, isOverBudget: false }
    }

    const deposits = transactions
      .filter(t => (t.TransactionType || t.type)?.toUpperCase() === 'DEPOSIT')
      .reduce((sum, t) => sum + (t.Amount || t.amount || 0), 0)

    const withdrawals = transactions
      .filter(t => (t.TransactionType || t.type)?.toUpperCase() === 'WITHDRAWAL')
      .reduce((sum, t) => sum + (t.Amount || t.amount || 0), 0)

    // Calculate cost percentage: withdrawals as percentage of deposits
    // If withdrawals > deposits, cap at 100% and mark as over budget
    const costPercent = deposits > 0 ? (withdrawals / deposits) * 100 : 0
    const overBudget = withdrawals > deposits

    return {
      totalDeposits: deposits,
      totalWithdrawals: withdrawals,
      costPercentage: Math.min(costPercent, 100),
      isOverBudget: overBudget
    }
  }, [transactions])

  // Early returns AFTER all hooks have been called
  if (accountLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Loading..." />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading account details...</span>
          </div>
        </main>
      </div>
    )
  }

  if (accountError || !account) {
    return (
      <div className="min-h-screen">
        <Header title="Error" />
        <main className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              {accountError || 'Account not found'}
            </AlertDescription>
          </Alert>
          <Link href="/accounts">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Accounts
            </Button>
          </Link>
        </main>
      </div>
    )
  }

  // Extract account details based on type with proper type guards
  const accountId = isPayer 
    ? ((account as PayerAccount).PayerAccountId || (account as PayerAccount).id)
    : ((account as UsageAccount).UsageAccountId || (account as UsageAccount).accountId || (account as UsageAccount).id)
  const accountName = isPayer
    ? ((account as PayerAccount).PayerAccountName || (account as PayerAccount).name)
    : ((account as UsageAccount).CustomerName || (account as UsageAccount).name)
  const createdAt = account.CreatedAt || account.createdAt
  const updatedAt = account.UpdatedAt || account.updatedAt

  return (
    <div className="min-h-screen">
      <Header title={`${accountName}`} />

      <main className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/accounts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {isPayer ? (
              <Building2 className="h-6 w-6 text-primary" />
            ) : (
              <Users className="h-6 w-6 text-primary" />
            )}
            <h2 className="text-2xl font-semibold">{accountName}</h2>
            <Badge 
              className={isPayer ? "bg-[#EC9400] text-white hover:bg-[#EC9400]/90" : "bg-[#026172] text-white hover:bg-[#026172]/90"}
            >
              {isPayer ? 'PAYER' : 'USAGE'}
            </Badge>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Left side (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Card */}
            <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="text-base font-medium font-mono">{accountId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isPayer ? 'Account Name' : 'Customer Name'}</p>
                <p className="text-base font-medium">{accountName}</p>
              </div>
              {!isPayer && (account as UsageAccount).PIVA && (
                <div>
                  <p className="text-sm text-muted-foreground">VAT Number (PIVA)</p>
                  <p className="text-base font-medium font-mono">{(account as UsageAccount).PIVA}</p>
                </div>
              )}
              {!isPayer && (account as UsageAccount).PayerAccountId && (
                <div>
                  <p className="text-sm text-muted-foreground">Payer Account ID</p>
                  <p className="text-base font-medium font-mono">{(account as UsageAccount).PayerAccountId}</p>
                </div>
              )}
              {createdAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-base font-medium">{new Date(createdAt).toLocaleString()}</p>
                </div>
              )}
              {updatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-base font-medium">{new Date(updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

            {/* Financial Summary */}
        {transactions && transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Cost vs Budget</span>
                  <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-primary'}`}>
                    {costPercentage.toFixed(1)}% {isOverBudget ? 'Over Budget' : 'Used'}
                  </span>
                </div>
                {/* Custom progress bar */}
                <div className="relative h-3 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#3D97AD' }}>
                  <div 
                    className="h-full transition-all"
                    style={{
                      width: `${costPercentage}%`,
                      backgroundColor: isOverBudget ? '#DC2626' : '#EC9400'
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Budget (Deposits)</p>
                  <p className="text-xl font-semibold" style={{ color: '#3D97AD' }}>
                    {totalDeposits.toFixed(2)} {transactions[0]?.Currency || 'USD'}
                  </p>
                  <p className="text-xs text-muted-foreground">Available funds</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Cost (Withdrawals)</p>
                  <p className="text-xl font-semibold" style={{ color: isOverBudget ? '#DC2626' : '#EC9400' }}>
                    {totalWithdrawals.toFixed(2)} {transactions[0]?.Currency || 'USD'}
                  </p>
                  <p className="text-xs text-muted-foreground">{costPercentage.toFixed(1)}% of budget</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

            {/* Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {isPayer ? 'All Transactions for this Payer' : 'Transactions for this Usage Account'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                ) : transactionsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Error loading transactions: {transactionsError}
                    </AlertDescription>
                  </Alert>
                ) : transactions && transactions.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                    <TransactionList transactions={paginatedTransactions} />
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No transactions found for this account</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right side (1/3 width) */}
          {(isPayer || !isPayer) && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isPayer ? 'Associated Usage Accounts' : 'Recent Transactions'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isPayer ? (
                    // Payer Account: Show associated usage accounts
                    usageAccountsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : associatedUsageAccounts.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground mb-3">
                          {associatedUsageAccounts.length} account{associatedUsageAccounts.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                          {associatedUsageAccounts.map((usageAcc) => {
                            const usageAccId = usageAcc.UsageAccountId || usageAcc.accountId || usageAcc.id
                            const usageAccName = usageAcc.CustomerName || usageAcc.name
                            return (
                              <Link 
                                key={usageAccId} 
                                href={`/accounts/${usageAccId}?type=usage`}
                                className="block"
                              >
                                <div className="p-3 border rounded-lg hover:bg-accent transition-colors">
                                  <div className="flex items-start gap-2 mb-1">
                                    <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{usageAccName}</p>
                                      <p className="text-xs text-muted-foreground font-mono truncate">{usageAccId}</p>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No usage accounts
                      </p>
                    )
                  ) : (
                    // Usage Account: Show recent transactions
                    transactionsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : recentTransactions.length > 0 ? (
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground mb-3">
                          Last {recentTransactions.length} transaction{recentTransactions.length !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                          {recentTransactions.map((tx) => {
                            const txDate = new Date(tx.TransactionDate || tx.Timestamp || tx.date || '')
                            const amount = tx.Amount || tx.amount || 0
                            const currency = tx.Currency || 'USD'
                            const type = (tx.TransactionType || tx.type || '').toUpperCase()
                            
                            return (
                              <div 
                                key={tx.TransactionId || tx.id || Math.random()} 
                                className="p-3 border rounded-lg"
                              >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-muted-foreground">
                                      {txDate.toLocaleDateString()}
                                    </p>
                                    <p className={`text-sm font-semibold ${
                                      type === 'DEPOSIT' ? 'text-green-600' : 'text-orange-600'
                                    }`}>
                                      {amount.toFixed(2)} {currency}
                                    </p>
                                  </div>
                                  <Badge 
                                    className={`text-xs text-white ${
                                      type === 'DEPOSIT' 
                                        ? 'bg-green-600 hover:bg-green-600/90' 
                                        : 'bg-[#EC9400] hover:bg-[#EC9400]/90'
                                    }`}
                                  >
                                    {type}
                                  </Badge>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-8">
                        No transactions
                      </p>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

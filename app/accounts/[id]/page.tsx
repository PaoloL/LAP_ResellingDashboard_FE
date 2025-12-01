"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TransactionList } from "@/components/transaction-list"
import { usePayerAccount, useUsageAccount, usePayerTransactions, useAccountTransactions } from "@/hooks/use-api"
import { PayerAccount, UsageAccount } from "@/lib/api"
import { ArrowLeft, Loader2, Building2, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { use, useMemo } from "react"
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
  
  // ALWAYS call all hooks unconditionally to follow Rules of Hooks
  const { data: payerAccount, loading: payerLoading, error: payerError } = usePayerAccount(isPayer ? id : '')
  const { data: usageAccount, loading: usageLoading, error: usageError } = useUsageAccount(!isPayer ? id : '')
  const { data: payerTransactions, loading: payerTxLoading, error: payerTxError } = usePayerTransactions(isPayer ? id : '')
  const { data: usageTransactions, loading: usageTxLoading, error: usageTxError } = useAccountTransactions(
    !isPayer && usageAccount?.PayerAccountId ? usageAccount.PayerAccountId : '',
    !isPayer ? id : ''
  )
  
  // Derive values from hooks
  const account = isPayer ? payerAccount : usageAccount
  const transactions = isPayer ? payerTransactions : usageTransactions
  const accountLoading = isPayer ? payerLoading : usageLoading
  const accountError = isPayer ? payerError : usageError
  const transactionsLoading = isPayer ? payerTxLoading : usageTxLoading
  const transactionsError = isPayer ? payerTxError : usageTxError

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

      <main className="p-6 space-y-6">
        <div className="flex items-center gap-4">
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
                <p className="text-sm text-muted-foreground mb-4">
                  Found {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </p>
                <TransactionList transactions={transactions} />
              </>
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions found for this account</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

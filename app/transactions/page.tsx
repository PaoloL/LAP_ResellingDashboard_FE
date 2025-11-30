"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { TransactionList } from "@/components/transaction-list"
import { RegisterTransactionModal } from "@/components/register-transaction-modal"
import { useAllTransactions, useUsageAccounts, usePayerAccounts } from "@/hooks/use-api"
import { getCurrentMonthDateRange } from "@/lib/api"
import { Loader2, Filter, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TransactionsPage() {
  // Initialize with current month's date range
  const currentMonth = getCurrentMonthDateRange()
  const [dateFrom, setDateFrom] = useState(currentMonth.startDate)
  const [dateTo, setDateTo] = useState(currentMonth.endDate)
  const [selectedAccount, setSelectedAccount] = useState("all")
  const [selectedPayer, setSelectedPayer] = useState("all")
  const [registerModalOpen, setRegisterModalOpen] = useState(false)
  
  const { data: transactions, loading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useAllTransactions()
  const { data: accounts, loading: accountsLoading } = useUsageAccounts()
  const { data: payers, loading: payersLoading } = usePayerAccounts()

  // Debug logging
  useEffect(() => {
    console.log('Transactions data:', transactions)
    console.log('Transactions loading:', transactionsLoading)
    console.log('Transactions error:', transactionsError)
  }, [transactions, transactionsLoading, transactionsError])

  const filteredTransactions = transactions?.filter(transaction => {
    // Parse transaction date (could be TransactionDate or Timestamp field)
    const transactionDateStr = transaction.TransactionDate || transaction.date
    if (!transactionDateStr) return false
    
    const transactionDate = new Date(transactionDateStr)
    const fromDate = dateFrom ? new Date(dateFrom) : null
    const toDate = dateTo ? new Date(dateTo) : null
    
    // Set time to start of day for proper date comparison
    if (fromDate) fromDate.setHours(0, 0, 0, 0)
    if (toDate) toDate.setHours(23, 59, 59, 999)
    transactionDate.setHours(0, 0, 0, 0)
    
    const dateMatch = (!fromDate || transactionDate >= fromDate) && 
                     (!toDate || transactionDate <= toDate)
    const accountMatch = selectedAccount === "all" || 
                        transaction.UsageAccountId === selectedAccount || 
                        transaction.accountId === selectedAccount
    
    return dateMatch && accountMatch
  }) || []

  const clearFilters = () => {
    const currentMonth = getCurrentMonthDateRange()
    setDateFrom(currentMonth.startDate)
    setDateTo(currentMonth.endDate)
    setSelectedAccount("all")
  }

  // Get the first payer and usage account for the register modal
  const defaultPayer = payers && payers.length > 0 ? (payers[0].PayerAccountId || payers[0].id || "") : ""
  const defaultUsageAccount = accounts && accounts.length > 0 ? (accounts[0].UsageAccountId || accounts[0].accountId || accounts[0].id || "") : ""

  if (transactionsLoading || accountsLoading || payersLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Transactions" />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        </main>
      </div>
    )
  }

  if (transactionsError) {
    return (
      <div className="min-h-screen">
        <Header title="Transactions" />
        <main className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Error loading transactions: {transactionsError}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Transactions" />

      <main className="p-6 space-y-6">
        {/* Register Transaction Button */}
        <div className="flex justify-end">
          <Button onClick={() => setRegisterModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Register Transaction
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="account">Usage Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="All accounts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All accounts</SelectItem>
                    {accounts?.map((account) => (
                      <SelectItem 
                        key={account.UsageAccountId || account.id} 
                        value={account.UsageAccountId || account.accountId || ""}
                      >
                        {account.CustomerName || account.name} ({account.UsageAccountId || account.accountId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              All Transactions ({filteredTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <TransactionList transactions={filteredTransactions} />
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No transactions found matching the selected filters
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <RegisterTransactionModal
        open={registerModalOpen}
        onOpenChange={setRegisterModalOpen}
        onTransactionCreated={refetchTransactions}
        payerId={defaultPayer}
        usageAccountId={defaultUsageAccount}
      />
    </div>
  )
}
"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TotalCostChart } from "@/components/charts/total-cost-chart"
import { UsageChart } from "@/components/charts/usage-chart"
import { DepositWithdrawalChart } from "@/components/charts/deposit-withdrawal-chart"
import { TransactionList } from "@/components/transaction-list"
import { useAllTransactions } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HomePage() {
  const { data: transactions, loading, error } = useAllTransactions()
  return (
    <div className="min-h-screen">
      <Header title="Home" />

      <main className="p-6 space-y-6">
        {/* Total Cost Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Cost (YTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <TotalCostChart />
          </CardContent>
        </Card>

        {/* Usage and Deposit vs Withdrawal Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage by Account</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Deposit vs Withdrawal</CardTitle>
            </CardHeader>
            <CardContent>
              <DepositWithdrawalChart />
            </CardContent>
          </Card>
        </div>

        {/* Last Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Last 5 Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading transactions...</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Error loading transactions: {error}
                </AlertDescription>
              </Alert>
            ) : transactions && transactions.length > 0 ? (
              <TransactionList transactions={transactions.slice(0, 5)} />
            ) : (
              <p className="text-center text-muted-foreground py-8">No transactions found</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

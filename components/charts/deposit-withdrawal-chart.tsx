"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { useAllTransactions } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

export function DepositWithdrawalChart() {
  const { data: transactions, loading, error } = useAllTransactions()
  
  const depositWithdrawalData = useMemo(() => {
    if (!transactions) return []
    
    const monthlyData = transactions.reduce((acc, transaction) => {
      const dateStr = transaction.TransactionDate || transaction.date
      const date = new Date(dateStr)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expenditure: 0 }
      }
      
      const transactionType = (transaction.TransactionType || transaction.type)?.toLowerCase()
      const amount = transaction.Amount || transaction.amount || 0
      
      if (transactionType === 'deposit') {
        acc[monthKey].income += amount
      } else {
        acc[monthKey].expenditure += Math.abs(amount)
      }
      
      return acc
    }, {} as Record<string, { month: string; income: number; expenditure: number }>)
    
    return Object.values(monthlyData).map(data => ({
      ...data,
      income: Math.round(data.income * 100) / 100,
      expenditure: Math.round(data.expenditure * 100) / 100
    }))
  }, [transactions])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading transaction data...</span>
      </div>
    )
  }
  
  if (error || !transactions) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        Error loading transaction data
      </div>
    )
  }
  return (
    <ChartContainer
      config={{
        income: {
          label: "Income",
          color: "hsl(var(--success))",
        },
        expenditure: {
          label: "Expenditure",
          color: "hsl(var(--destructive))",
        },
      }}
      className="h-[250px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={depositWithdrawalData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: "12px" }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: "12px" }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="expenditure" stroke="var(--color-expenditure)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

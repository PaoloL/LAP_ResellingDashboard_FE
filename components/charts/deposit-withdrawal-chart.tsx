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
    
    const currentYear = new Date().getFullYear()
    
    // Filter for current year only
    const currentYearTransactions = transactions.filter(transaction => {
      const dateStr = transaction.TransactionDate || transaction.date
      if (!dateStr) return false
      
      const date = new Date(dateStr)
      return date.getFullYear() === currentYear
    })
    
    // Group by month
    const monthlyData = currentYearTransactions.reduce((acc, transaction) => {
      const dateStr = transaction.TransactionDate || transaction.date
      if (!dateStr) return acc
      
      const date = new Date(dateStr)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, deposits: 0, withdrawals: 0 }
      }
      
      const transactionType = (transaction.TransactionType || transaction.type)?.toUpperCase()
      const amount = transaction.Amount || transaction.amount || 0
      
      if (transactionType === 'DEPOSIT') {
        acc[monthKey].deposits += amount
      } else if (transactionType === 'WITHDRAWAL') {
        acc[monthKey].withdrawals += Math.abs(amount)
      }
      
      return acc
    }, {} as Record<string, { month: string; deposits: number; withdrawals: number }>)
    
    // Create array with all months of current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map(month => ({
      month,
      deposits: Math.round((monthlyData[month]?.deposits || 0) * 100) / 100,
      withdrawals: Math.round((monthlyData[month]?.withdrawals || 0) * 100) / 100
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
        deposits: {
          label: "Deposits",
          color: "#3D97AD",
        },
        withdrawals: {
          label: "Withdrawals",
          color: "#EC9400",
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
          <ChartLegend content={<ChartLegendContent payload={[]} />} />
          <Line type="monotone" dataKey="deposits" stroke="var(--color-deposits)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="withdrawals" stroke="var(--color-withdrawals)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

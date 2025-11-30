"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAllTransactions } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

export function TotalCostChart() {
  const { data: transactions, loading, error } = useAllTransactions()
  
  const monthlyData = useMemo(() => {
    if (!transactions) return []
    
    const monthlyTotals = transactions.reduce((acc, transaction) => {
      const dateStr = transaction.TransactionDate || transaction.date
      const date = new Date(dateStr)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!acc[monthKey]) {
        acc[monthKey] = 0
      }
      
      const amount = transaction.Amount || transaction.amount || 0
      acc[monthKey] += Math.abs(amount)
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(monthlyTotals).map(([month, cost]) => ({
      month,
      cost: Math.round(cost * 100) / 100
    }))
  }, [transactions])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading cost data...</span>
      </div>
    )
  }
  
  if (error || !transactions) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Error loading cost data
      </div>
    )
  }
  return (
    <ChartContainer
      config={{
        cost: {
          label: "Cost",
          color: "#EC9400",
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: "12px" }} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} style={{ fontSize: "12px" }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useUsageAccounts, useAllTransactions } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

export function UsageChart() {
  const { data: accounts, loading: accountsLoading, error: accountsError } = useUsageAccounts()
  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useAllTransactions()
  
  const loading = accountsLoading || transactionsLoading
  const error = accountsError || transactionsError
  
  // Color palette for different accounts
  const colorPalette = [
    '#026172', // Teal (usage account color)
    '#3D97AD', // Light blue (deposit color)
    '#EC9400', // Orange (payer/withdrawal color)
    '#8B5CF6', // Purple
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#14B8A6', // Cyan
  ]

  const usageData = useMemo(() => {
    if (!accounts || accounts.length === 0 || !transactions) return []
    
    const currentYear = new Date().getFullYear()
    
    // Calculate total withdrawals per account for current year
    const accountTotals = transactions.reduce((acc, transaction) => {
      const dateStr = transaction.TransactionDate || transaction.date
      if (!dateStr) return acc
      
      const date = new Date(dateStr)
      const transactionType = (transaction.TransactionType || transaction.type)?.toUpperCase()
      
      if (date.getFullYear() === currentYear && transactionType === 'WITHDRAWAL') {
        const accountId = transaction.UsageAccountId || transaction.accountId
        if (accountId) {
          if (!acc[accountId]) {
            acc[accountId] = 0
          }
          const amount = transaction.Amount || transaction.amount || 0
          acc[accountId] += Math.abs(amount)
        }
      }
      
      return acc
    }, {} as Record<string, number>)
    
    return accounts
      .map((account) => {
        const accountId = account.UsageAccountId || account.accountId || account.id
        const name = account.CustomerName || account.name || 'Unknown'
        const value = accountTotals[accountId || ''] || 0
        
        return {
          name,
          value: Math.round(value * 100) / 100,
          accountId,
        }
      })
      .filter(item => item.name && item.value > 0) // Filter out accounts with no withdrawals
      .sort((a, b) => b.value - a.value) // Sort by value descending
      .slice(0, 10) // Take only top 10 accounts
      .map((item, index) => ({
        ...item,
        color: colorPalette[index % colorPalette.length],
      }))
  }, [accounts, transactions])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading usage data...</span>
      </div>
    )
  }
  
  if (error || !accounts) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Error loading usage data
      </div>
    )
  }

  if (usageData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No usage data available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ChartContainer
        config={usageData.reduce((config, item, index) => {
          const key = item.name ? item.name.toLowerCase().replace(/\s+/g, '_') : `item_${index}`
          config[key] = {
            label: item.name || 'Unknown',
            color: item.color,
          }
          return config
        }, {} as Record<string, { label: string; color: string }>)}
        className="h-[200px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={usageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
              {usageData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Legend */}
      <div className="space-y-2">
        {usageData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium">USD {item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

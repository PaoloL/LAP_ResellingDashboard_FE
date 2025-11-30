"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useUsageAccounts } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { useMemo } from "react"

export function UsageChart() {
  const { data: accounts, loading, error } = useUsageAccounts()
  
  const usageData = useMemo(() => {
    if (!accounts || accounts.length === 0) return []
    
    return accounts
      .map((account, index) => {
        const name = account.CustomerName || account.name || 'Unknown'
        const value = account.totalCost || 0
        
        return {
          name,
          value,
          color: `hsl(var(--chart-${(index % 5) + 1}))`,
        }
      })
      .filter(item => item.name && item.value > 0) // Filter out invalid entries
  }, [accounts])
  
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

import { Clock } from "lucide-react"
import type { Transaction } from "@/lib/api"
import { cn } from "@/lib/utils"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="space-y-3">
      {transactions.map((transaction) => {
        // Handle both old and new transaction formats
        const transactionId = transaction.TransactionId || transaction.id
        const transactionType = (transaction.TransactionType || transaction.type)?.toLowerCase()
        const transactionDate = transaction.TransactionDate || transaction.date
        const transactionAmount = transaction.Amount || transaction.amount
        const transactionCurrency = transaction.Currency || 'EUR'
        const description = transaction.Description || transaction.description || 
                          `${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} - ${transaction.UsageAccountId || transaction.accountId}`
        const category = transaction.InvoiceId || transaction.category
        
        // Format date
        const dateObj = new Date(transactionDate)
        const dateStr = dateObj.toLocaleDateString()
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        
        return (
          <div
            key={transactionId}
            className="flex items-center justify-between border-l-4 py-3 px-4 rounded-r-lg transition-colors hover:bg-muted/50"
            style={{
              borderColor: transactionType === "deposit" ? "hsl(var(--success))" : "hsl(var(--destructive))",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-xs text-muted-foreground">{dateStr}</div>
                <div className="text-xs font-medium text-muted-foreground">{timeStr}</div>
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-sm">{description}</span>
                {category && <span className="text-xs text-muted-foreground">Invoice: {category}</span>}
                <span className="text-xs text-muted-foreground">
                  Account: {transaction.UsageAccountId || transaction.accountId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span
                className={cn(
                  "font-semibold text-sm",
                  transactionType === "deposit" ? "text-success" : "text-destructive",
                )}
              >
                {transactionType === "deposit" ? "+" : "-"}
                {Math.abs(transactionAmount).toFixed(2)} {transactionCurrency}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { Clock } from "lucide-react"
import type { Transaction } from "@/lib/api"

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
        const usageAccountId = transaction.UsageAccountId || transaction.accountId
        const payerAccountId = transaction.PayerAccountId || transaction.payerId
        
        // Format title: "Withdrawal on {UsageAccountId}" or "Deposit on {UsageAccountId}"
        const title = `${transactionType === 'deposit' ? 'Deposit' : 'Withdrawal'} on ${usageAccountId}`
        
        const category = transaction.InvoiceId || transaction.category
        
        // Format date
        const dateObj = transactionDate ? new Date(transactionDate) : new Date()
        const dateStr = dateObj.toLocaleDateString()
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        
        return (
          <div
            key={transactionId}
            className="flex items-center justify-between border-l-4 py-3 px-4 rounded-r-lg transition-colors hover:bg-muted/50"
            style={{
              borderColor: transactionType === "deposit" ? "#3D97AD" : "#EC9400",
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <div className="text-xs text-muted-foreground">{dateStr}</div>
                <div className="text-xs font-medium text-muted-foreground">{timeStr}</div>
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-sm">{title}</span>
                <span className="text-xs text-muted-foreground">{payerAccountId}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span
                className="font-semibold text-sm"
                style={{
                  color: transactionType === "deposit" ? "#3D97AD" : "#EC9400"
                }}
              >
                {transactionType === "deposit" ? "+" : "-"}
                {Math.abs(transactionAmount || 0).toFixed(2)} {transactionCurrency}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

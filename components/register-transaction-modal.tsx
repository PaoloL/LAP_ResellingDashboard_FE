"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { transactionsApi } from "@/lib/api"
import { usePayerAccounts, useUsageAccounts } from "@/hooks/use-api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegisterTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTransactionCreated: () => void
  payerId?: string
  usageAccountId?: string
}

export function RegisterTransactionModal({
  open,
  onOpenChange,
  onTransactionCreated,
  payerId: initialPayerId = "",
  usageAccountId: initialUsageAccountId = "",
}: RegisterTransactionModalProps) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: payerAccounts, loading: payerLoading } = usePayerAccounts()
  const { data: usageAccounts, loading: usageLoading } = useUsageAccounts()
  
  const [payerId, setPayerId] = useState(initialPayerId)
  const [usageAccountId, setUsageAccountId] = useState(initialUsageAccountId)
  const [transactionType, setTransactionType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT")
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [description, setDescription] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update state when props change
  useEffect(() => {
    setPayerId(initialPayerId)
    setUsageAccountId(initialUsageAccountId)
  }, [initialPayerId, initialUsageAccountId])

  // Filter usage accounts by selected payer
  const filteredUsageAccounts = useMemo(() => {
    if (!usageAccounts || !payerId) return []
    return usageAccounts.filter(account => {
      const accountPayerId = account.PayerAccountId || account.payerId
      return accountPayerId === payerId
    })
  }, [usageAccounts, payerId])

  // Validate that selected usage account belongs to selected payer
  useEffect(() => {
    if (usageAccountId && payerId && filteredUsageAccounts.length > 0) {
      const isValid = filteredUsageAccounts.some(account => {
        const accountId = account.UsageAccountId || account.accountId || account.id
        return accountId === usageAccountId
      })
      if (!isValid) {
        setUsageAccountId("") // Clear invalid selection
      }
    }
  }, [payerId, usageAccountId, filteredUsageAccounts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate payer account
      if (!payerId) {
        setError("Please select a payer account")
        setLoading(false)
        return
      }

      // Validate usage account
      if (!usageAccountId) {
        setError("Please select a usage account")
        setLoading(false)
        return
      }

      // Validate that usage account belongs to payer
      const isValid = filteredUsageAccounts.some(account => {
        const accountId = account.UsageAccountId || account.accountId || account.id
        return accountId === usageAccountId
      })
      
      if (!isValid) {
        setError("Selected usage account does not belong to the selected payer account")
        setLoading(false)
        return
      }

      // Validate amount
      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Please enter a valid amount greater than 0")
        setLoading(false)
        return
      }

      await transactionsApi.create({
        PayerAccountId: payerId,
        UsageAccountId: usageAccountId,
        TransactionType: transactionType,
        Amount: amountNum,
        Currency: currency,
        Description: description || undefined,
        InvoiceId: invoiceId || undefined,
      })

      onTransactionCreated()
      onOpenChange(false)
      
      // Reset form
      setPayerId(initialPayerId)
      setUsageAccountId(initialUsageAccountId)
      setTransactionType("DEPOSIT")
      setDate(today)
      setAmount("")
      setCurrency("EUR")
      setDescription("")
      setInvoiceId("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create transaction")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register Transaction</DialogTitle>
          <DialogDescription>
            Create a new transaction for this account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="payerId">
                Payer Account <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={payerId} 
                onValueChange={setPayerId}
                disabled={payerLoading || (initialPayerId !== "" && initialPayerId !== undefined)}
              >
                <SelectTrigger className={(initialPayerId && initialPayerId !== "") ? "bg-muted" : ""}>
                  <SelectValue placeholder="Select payer account" />
                </SelectTrigger>
                <SelectContent>
                  {payerAccounts && payerAccounts.length > 0 ? (
                    payerAccounts.map((payer) => {
                      const id = payer.PayerAccountId || payer.id
                      const name = payer.PayerAccountName || payer.name
                      return (
                        <SelectItem key={id} value={id || ""}>
                          {name} ({id})
                        </SelectItem>
                      )
                    })
                  ) : (
                    <SelectItem value="no-payers" disabled>
                      No payer accounts available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="usageAccountId">
                Usage Account <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={usageAccountId} 
                onValueChange={setUsageAccountId}
                disabled={usageLoading || !payerId || (initialUsageAccountId !== "" && initialUsageAccountId !== undefined)}
              >
                <SelectTrigger className={(initialUsageAccountId && initialUsageAccountId !== "") ? "bg-muted" : ""}>
                  <SelectValue placeholder={payerId ? "Select usage account" : "Select payer first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsageAccounts.length > 0 ? (
                    filteredUsageAccounts.map((usage) => {
                      const id = usage.UsageAccountId || usage.accountId || usage.id
                      const name = usage.CustomerName || usage.name
                      return (
                        <SelectItem key={id} value={id || ""}>
                          {name} ({id})
                        </SelectItem>
                      )
                    })
                  ) : payerId ? (
                    <SelectItem value="no-usage" disabled>
                      No usage accounts for this payer
                    </SelectItem>
                  ) : (
                    <SelectItem value="no-payer-selected" disabled>
                      Select a payer account first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {payerId && filteredUsageAccounts.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No usage accounts found for the selected payer
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transactionType">
                Transaction Type <span className="text-destructive">*</span>
              </Label>
              <Select value={transactionType} onValueChange={(value) => setTransactionType(value as "DEPOSIT" | "WITHDRAWAL")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPOSIT">DEPOSIT</SelectItem>
                  <SelectItem value="WITHDRAWAL">WITHDRAWAL</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="currency">
                Currency <span className="text-destructive">*</span>
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input
                id="invoiceId"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="e.g., INV-12345"
                maxLength={50}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Transaction description"
                maxLength={25}
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/25 characters
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

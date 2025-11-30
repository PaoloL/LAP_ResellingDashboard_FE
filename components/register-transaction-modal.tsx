"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { transactionsApi } from "@/lib/api"
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
  payerId = "",
  usageAccountId = "",
}: RegisterTransactionModalProps) {
  const today = new Date().toISOString().split('T')[0]
  
  const [transactionType, setTransactionType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT")
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [description, setDescription] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
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
              <Label htmlFor="payerId">Payer Account ID</Label>
              <Input
                id="payerId"
                value={payerId}
                disabled
                className="bg-muted font-mono"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="usageAccountId">Usage Account ID</Label>
              <Input
                id="usageAccountId"
                value={usageAccountId}
                disabled
                className="bg-muted font-mono"
              />
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

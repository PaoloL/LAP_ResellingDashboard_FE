"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateTransaction } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DepositModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountName: string
  accountId: string
  onTransactionCreated?: () => void
}

export function DepositModal({ open, onOpenChange, accountName, accountId, onTransactionCreated }: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const { createTransaction, loading, error } = useCreateTransaction()
  const { toast } = useToast()

  const handleDeposit = async () => {
    try {
      await createTransaction({
        accountId,
        amount: parseFloat(amount),
        description: description || `Deposit to ${accountName}`,
        type: "deposit",
        date: new Date().toISOString(),
      })
      
      toast({
        title: "Success",
        description: "Deposit created successfully",
      })
      
      // Reset form
      setAmount("")
      setDescription("")
      onOpenChange(false)
      onTransactionCreated?.()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create deposit",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deposit Money</DialogTitle>
          <DialogDescription>
            Add funds to {accountName} ({accountId})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter deposit description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleDeposit} disabled={!amount || Number.parseFloat(amount) <= 0 || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Deposit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

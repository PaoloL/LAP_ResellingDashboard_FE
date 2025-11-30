"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { usageAccountsApi, type UsageAccount } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EditUsageAccountModalProps {
  account: UsageAccount
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountUpdated: () => void
}

export function EditUsageAccountModal({
  account,
  open,
  onOpenChange,
  onAccountUpdated,
}: EditUsageAccountModalProps) {
  const accountId = account.UsageAccountId || account.accountId || account.id || ""
  const [customerName, setCustomerName] = useState(account.CustomerName || account.name || "")
  const [piva, setPiva] = useState(account.PIVA || account.piva || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await usageAccountsApi.update(accountId, {
        CustomerName: customerName,
        PIVA: piva,
      })

      onAccountUpdated()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Usage Account</DialogTitle>
          <DialogDescription>
            Update the customer name and VAT number for this usage account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                value={accountId}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customerName">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="piva">
                VAT Number (PIVA) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="piva"
                value={piva}
                onChange={(e) => setPiva(e.target.value)}
                placeholder="e.g., IT12345678901"
                required
              />
              <p className="text-xs text-muted-foreground">
                Italian VAT number format
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

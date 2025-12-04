"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { usageAccountsApi } from "@/lib/api"
import { usePayerAccounts } from "@/hooks/use-api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegisterUsageAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountCreated: () => void
  prefilledAccountId?: string
  prefilledAccountName?: string
}

export function RegisterUsageAccountModal({
  open,
  onOpenChange,
  onAccountCreated,
  prefilledAccountId,
}: RegisterUsageAccountModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: payerAccounts, loading: payerLoading } = usePayerAccounts()
  
  const [formData, setFormData] = useState({
    UsageAccountId: prefilledAccountId || "",
    CustomerName: prefilledAccountId || "",
    PIVA: "",
    PayerAccountId: "",
  })

  // Update form when prefilledAccountId changes
  useState(() => {
    if (prefilledAccountId) {
      setFormData(prev => ({ 
        ...prev, 
        UsageAccountId: prefilledAccountId,
        CustomerName: prefilledAccountId 
      }))
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await usageAccountsApi.create(formData)
      
      // Reset form
      setFormData({
        UsageAccountId: "",
        CustomerName: "",
        PIVA: "",
        PayerAccountId: "",
      })
      
      // Close modal and refresh list
      onOpenChange(false)
      onAccountCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create usage account")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Register Usage Account</DialogTitle>
          <DialogDescription>
            Create a new usage account in the system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="usageAccountId">
                Usage Account ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="usageAccountId"
                placeholder="e.g., 123456789012"
                value={formData.UsageAccountId}
                onChange={(e) => handleChange("UsageAccountId", e.target.value)}
                required
                disabled={loading || !!prefilledAccountId}
                className={prefilledAccountId ? "bg-muted" : ""}
              />
              <p className="text-xs text-muted-foreground">
                AWS Account ID (12 digits)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">
                Usage Account Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                placeholder="e.g., Customer Company Name"
                value={formData.CustomerName}
                onChange={(e) => handleChange("CustomerName", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="piva">
                VAT Number (PIVA)
              </Label>
              <Input
                id="piva"
                placeholder="e.g., IT12345678901"
                value={formData.PIVA}
                onChange={(e) => handleChange("PIVA", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerAccountId">
                Payer Account <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.PayerAccountId}
                onValueChange={(value) => handleChange("PayerAccountId", value)}
                disabled={loading || payerLoading}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payer account" />
                </SelectTrigger>
                <SelectContent>
                  {payerAccounts && payerAccounts.length > 0 ? (
                    payerAccounts.map((payer) => (
                      <SelectItem 
                        key={payer.PayerAccountId || payer.id} 
                        value={payer.PayerAccountId || payer.id || ""}
                      >
                        {payer.PayerAccountName || payer.name} ({payer.PayerAccountId || payer.id})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-payers" disabled>
                      No payer accounts available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
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
            <Button type="submit" disabled={loading || !formData.PayerAccountId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Usage Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

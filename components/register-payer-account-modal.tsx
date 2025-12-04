"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { payerAccountsApi } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegisterPayerAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccountCreated: () => void
  prefilledAccountId?: string
}

export function RegisterPayerAccountModal({
  open,
  onOpenChange,
  onAccountCreated,
  prefilledAccountId,
}: RegisterPayerAccountModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    PayerAccountId: prefilledAccountId || "",
    PayerAccountName: prefilledAccountId || "",
  })

  // Update form when prefilledAccountId changes
  useState(() => {
    if (prefilledAccountId) {
      setFormData(prev => ({ 
        ...prev, 
        PayerAccountId: prefilledAccountId,
        PayerAccountName: prefilledAccountId 
      }))
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await payerAccountsApi.create(formData)
      
      // Reset form
      setFormData({
        PayerAccountId: "",
        PayerAccountName: "",
      })
      
      // Close modal and refresh list
      onOpenChange(false)
      onAccountCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payer account")
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
          <DialogTitle>Register Payer Account</DialogTitle>
          <DialogDescription>
            Create a new payer account in the system
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
              <Label htmlFor="payerAccountId">
                Payer Account ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payerAccountId"
                placeholder="e.g., 123456789012"
                value={formData.PayerAccountId}
                onChange={(e) => handleChange("PayerAccountId", e.target.value)}
                required
                disabled={loading || !!prefilledAccountId}
                className={prefilledAccountId ? "bg-muted" : ""}
              />
              <p className="text-xs text-muted-foreground">
                AWS Account ID (12 digits)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payerAccountName">
                Payer Account Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payerAccountName"
                placeholder="e.g., Company Name"
                value={formData.PayerAccountName}
                onChange={(e) => handleChange("PayerAccountName", e.target.value)}
                required
                disabled={loading}
              />
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Payer Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

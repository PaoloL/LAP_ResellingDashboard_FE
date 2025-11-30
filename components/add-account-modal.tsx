"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateUsageAccount } from "@/hooks/use-api"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddAccountModalProps {
  children: React.ReactNode
  onAccountCreated?: () => void
}

export function AddAccountModal({ children, onAccountCreated }: AddAccountModalProps) {
  const [open, setOpen] = useState(false)
  const { createAccount, loading, error } = useCreateUsageAccount()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    accountId: "",
    payerId: "",
    status: "active" as const,
    totalCost: 0,
    depositPercentage: 0,
    withdrawalPercentage: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAccount(formData)
      toast({
        title: "Success",
        description: "Account created successfully",
      })
      setOpen(false)
      onAccountCreated?.()
      // Reset form
      setFormData({
        name: "",
        accountId: "",
        payerId: "",
        status: "active" as const,
        totalCost: 0,
        depositPercentage: 0,
        withdrawalPercentage: 0,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>Add a new AWS account to track billing and spending.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="Production AWS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input
                id="accountId"
                placeholder="123456789123"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payerId">Payer ID</Label>
              <Input
                id="payerId"
                placeholder="123456789123"
                value={formData.payerId}
                onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
                required
              />
            </div>

          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Loader2, Building2, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePayerAccounts, useUsageAccounts, useAllTransactions } from "@/hooks/use-api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EditPayerAccountModal } from "@/components/edit-payer-account-modal"
import { EditUsageAccountModal } from "@/components/edit-usage-account-modal"
import { UnregisteredAccountsSection } from "@/components/unregistered-accounts-section"
import { findUnregisteredAccounts } from "@/lib/account-utils"
import type { PayerAccount, UsageAccount } from "@/lib/api"

export default function AccountsPage() {
  const { data: payerAccounts, loading: payerLoading, error: payerError, refetch: refetchPayers } = usePayerAccounts()
  const { data: usageAccounts, loading: usageLoading, error: usageError, refetch: refetchUsage } = useUsageAccounts()
  const { data: transactions, loading: transactionsLoading, refetch: refetchTransactions } = useAllTransactions()

  const loading = payerLoading || usageLoading || transactionsLoading
  const error = payerError || usageError

  // Find unregistered accounts
  const unregisteredAccounts = findUnregisteredAccounts(
    transactions || [],
    payerAccounts || [],
    usageAccounts || []
  )

  const handleAccountRegistered = () => {
    refetchPayers()
    refetchUsage()
    refetchTransactions()
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header title="Accounts" />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading accounts...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="Accounts" />
        <main className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              Error loading accounts: {error}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header title="Accounts" />

      <main className="p-6 space-y-8">
        {/* Unregistered Accounts Section */}
        {unregisteredAccounts.length > 0 && (
          <section className="space-y-4">
            <UnregisteredAccountsSection
              unregisteredAccounts={unregisteredAccounts}
              onAccountRegistered={handleAccountRegistered}
            />
          </section>
        )}

        {/* Payer Accounts Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Payer Accounts</h2>
          </div>

          {payerAccounts && payerAccounts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {payerAccounts.map((account) => (
                <PayerAccountCard 
                  key={account.PayerAccountId || account.id} 
                  account={account}
                  onAccountUpdated={refetchPayers}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No payer accounts found</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Usage Accounts Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Usage Accounts</h2>
          </div>

          {usageAccounts && usageAccounts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {usageAccounts.map((account) => (
                <UsageAccountCard 
                  key={account.UsageAccountId || account.id} 
                  account={account}
                  onAccountUpdated={refetchUsage}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No usage accounts found</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}

function PayerAccountCard({ account, onAccountUpdated }: { account: PayerAccount; onAccountUpdated: () => void }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const accountId = account.PayerAccountId || account.id
  const accountName = account.PayerAccountName || account.name
  const createdAt = account.CreatedAt || account.createdAt
  const updatedAt = account.UpdatedAt || account.updatedAt

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{accountName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">ID: {accountId}</p>
            </div>
            <Badge className="bg-[#EC9400] text-white hover:bg-[#EC9400]/90">PAYER</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm">{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          {updatedAt && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm">{new Date(updatedAt).toLocaleDateString()}</p>
            </div>
          )}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setEditModalOpen(true)}
            >
              Edit
            </Button>
            <Link href={`/accounts/${accountId}?type=payer`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <EditPayerAccountModal
        account={account}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onAccountUpdated={onAccountUpdated}
      />
    </>
  )
}

function UsageAccountCard({ account, onAccountUpdated }: { account: UsageAccount; onAccountUpdated: () => void }) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const accountId = account.UsageAccountId || account.accountId || account.id
  const customerName = account.CustomerName || account.name
  const piva = account.PIVA
  const payerId = account.PayerAccountId || account.payerId
  const createdAt = account.CreatedAt || account.createdAt
  const updatedAt = account.UpdatedAt || account.updatedAt

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{customerName}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">ID: {accountId}</p>
            </div>
            <Badge className="bg-[#026172] text-white hover:bg-[#026172]/90">USAGE</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {piva && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">VAT Number</p>
              <p className="text-sm font-mono">{piva}</p>
            </div>
          )}
          {payerId && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Payer Account</p>
              <p className="text-sm font-mono">{payerId}</p>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-sm">{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setEditModalOpen(true)}
            >
              Edit
            </Button>
            <Link href={`/accounts/${accountId}?type=usage`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <EditUsageAccountModal
        account={account}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onAccountUpdated={onAccountUpdated}
      />
    </>
  )
}

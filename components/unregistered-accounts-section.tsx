"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import type { UnregisteredAccount } from "@/lib/account-utils"
import { RegisterPayerAccountModal } from "./register-payer-account-modal"
import { RegisterUsageAccountModal } from "./register-usage-account-modal"

interface UnregisteredAccountsSectionProps {
  unregisteredAccounts: UnregisteredAccount[]
  onAccountRegistered: () => void
}

export function UnregisteredAccountsSection({
  unregisteredAccounts,
  onAccountRegistered
}: UnregisteredAccountsSectionProps) {
  const [selectedAccount, setSelectedAccount] = useState<UnregisteredAccount | null>(null)
  const [registerPayerModalOpen, setRegisterPayerModalOpen] = useState(false)
  const [registerUsageModalOpen, setRegisterUsageModalOpen] = useState(false)

  if (unregisteredAccounts.length === 0) {
    return null
  }

  const payerAccounts = unregisteredAccounts.filter(acc => acc.type === 'payer')
  const usageAccounts = unregisteredAccounts.filter(acc => acc.type === 'usage')

  const handleRegisterClick = (account: UnregisteredAccount) => {
    setSelectedAccount(account)
    if (account.type === 'payer') {
      setRegisterPayerModalOpen(true)
    } else {
      setRegisterUsageModalOpen(true)
    }
  }

  const handleModalClose = () => {
    setRegisterPayerModalOpen(false)
    setRegisterUsageModalOpen(false)
    setSelectedAccount(null)
  }

  const handleAccountCreated = () => {
    handleModalClose()
    onAccountRegistered()
  }

  return (
    <>
      <Alert variant="default" className="border-orange-500 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-900">Unregistered Accounts Detected</AlertTitle>
        <AlertDescription className="text-orange-800">
          Found {unregisteredAccounts.length} account{unregisteredAccounts.length !== 1 ? 's' : ''} referenced in transactions but not registered in the system.
          Please register them to ensure data integrity.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Unregistered Payer Accounts */}
        {payerAccounts.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Unregistered Payer Accounts
              </CardTitle>
              <CardDescription>
                {payerAccounts.length} payer account{payerAccounts.length !== 1 ? 's' : ''} need registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {payerAccounts.map(account => (
                <div
                  key={`payer-${account.id}`}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium">{account.id}</p>
                      <Badge variant="outline" className="bg-[#EC9400] text-white border-[#EC9400]">
                        PAYER
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used in {account.transactionCount} transaction{account.transactionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRegisterClick(account)}
                    className="ml-3"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Register
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Unregistered Usage Accounts */}
        {usageAccounts.length > 0 && (
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Unregistered Usage Accounts
              </CardTitle>
              <CardDescription>
                {usageAccounts.length} usage account{usageAccounts.length !== 1 ? 's' : ''} need registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {usageAccounts.map(account => (
                <div
                  key={`usage-${account.id}`}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium">{account.id}</p>
                      <Badge variant="outline" className="bg-[#026172] text-white border-[#026172]">
                        USAGE
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used in {account.transactionCount} transaction{account.transactionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleRegisterClick(account)}
                    className="ml-3"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Register
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals with pre-filled account IDs */}
      {selectedAccount?.type === 'payer' && (
        <RegisterPayerAccountModal
          open={registerPayerModalOpen}
          onOpenChange={(open) => {
            setRegisterPayerModalOpen(open)
            if (!open) handleModalClose()
          }}
          onAccountCreated={handleAccountCreated}
          prefilledAccountId={selectedAccount.id}
        />
      )}

      {selectedAccount?.type === 'usage' && (
        <RegisterUsageAccountModal
          open={registerUsageModalOpen}
          onOpenChange={(open) => {
            setRegisterUsageModalOpen(open)
            if (!open) handleModalClose()
          }}
          onAccountCreated={handleAccountCreated}
          prefilledAccountId={selectedAccount.id}
        />
      )}
    </>
  )
}

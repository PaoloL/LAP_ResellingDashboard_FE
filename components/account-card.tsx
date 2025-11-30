import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { UsageAccount } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface AccountCardProps {
  account: UsageAccount
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{account.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Account ID: {account.accountId}</p>
          </div>
          <Badge variant={account.status === "active" ? "default" : "secondary"}>{account.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium text-primary">{account.depositPercentage}%</span>
          </div>
          <Progress value={account.depositPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="text-lg font-semibold">${account.totalCost.toFixed(2)}</p>
          </div>
          <Link href={`/accounts/${account.id}`}>
            <Button variant="outline" size="sm">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

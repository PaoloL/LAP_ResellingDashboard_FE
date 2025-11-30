import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Settings" />

      <main className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Settings</CardTitle>
            <CardDescription>Configure your AWS Billing Dashboard settings</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Settings options will be available here</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfigLoader } from '@/lib/config-loader'
import { Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export function ConfigStatus() {
  const [isVisible, setIsVisible] = useState(false)
  const config = ConfigLoader.getConfig()

  const getStatusIcon = (isConfigured: boolean, isRequired: boolean = false) => {
    if (isConfigured) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return isRequired ? 
      <XCircle className="h-4 w-4 text-red-500" /> : 
      <AlertCircle className="h-4 w-4 text-yellow-500" />
  }

  const configItems = [
    {
      name: 'AWS Region',
      value: config.aws.apiGateway.region,
      configured: !!config.aws.apiGateway.region,
      required: true
    },
    {
      name: 'API Gateway URL',
      value: config.aws.apiGateway.fullUrl,
      configured: !!config.aws.apiGateway.fullUrl && !config.aws.apiGateway.fullUrl.includes('localhost'),
      required: true
    },
    {
      name: 'API Stage',
      value: config.aws.apiGateway.stage,
      configured: !!config.aws.apiGateway.stage,
      required: true
    },

    {
      name: 'S3 Bucket',
      value: config.aws.s3.bucket || 'Not configured',
      configured: !!config.aws.s3.bucket,
      required: false
    }
  ]

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        Config
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Configuration Status</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Environment:</span>
            <Badge variant={ConfigLoader.isDevelopment() ? "secondary" : "default"}>
              {ConfigLoader.isDevelopment() ? 'Development' : 'Production'}
            </Badge>
          </div>
          
          {configItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getStatusIcon(item.configured, item.required)}
                <span className="font-medium">{item.name}:</span>
              </div>
              <span className="text-muted-foreground text-xs max-w-32 truncate">
                {item.value}
              </span>
            </div>
          ))}
          
          <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
            <p>✅ Required | ⚠️ Optional | ❌ Missing Required</p>
            <p className="font-mono text-xs">
              Current: {ConfigLoader.isDevelopment() ? 'DEV' : 'PROD'} → {config.aws.apiGateway.stage}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
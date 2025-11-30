import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
// <CHANGE> Added SidebarNav for dashboard navigation
import { SidebarNav } from "@/components/sidebar-nav"
import { Toaster } from "@/components/ui/toaster"
import { ConfigProvider } from "@/components/config-provider"
import { ConfigStatus } from "@/components/config-status"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // <CHANGE> Updated metadata for AWS Billing Dashboard
  title: "AWS Billing Dashboard",
  description: "Track spending across AWS accounts",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <ConfigProvider>
          {/* <CHANGE> Added sidebar navigation and adjusted layout for dashboard */}
          <SidebarNav />
          <div className="ml-64">{children}</div>
          <ConfigStatus />
          <Toaster />
        </ConfigProvider>
        <Analytics />
      </body>
    </html>
  )
}

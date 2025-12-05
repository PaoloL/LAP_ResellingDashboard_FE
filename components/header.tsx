'use client'

import { UserMenu } from './user-menu'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <UserMenu />
    </header>
  )
}

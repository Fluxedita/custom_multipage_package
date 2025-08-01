'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface DynamicPageProps {
  children: React.ReactNode
}

export function DynamicPage({ children }: DynamicPageProps) {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      {children}
    </React.Suspense>
  )
}

// Add dynamic configuration
DynamicPage.dynamic = 'force-dynamic'
DynamicPage.revalidate = 0 
"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface PremiumContentGuardProps {
  children: React.ReactNode
  isPremium: boolean
}

export default function PremiumContentGuard({ children, isPremium }: PremiumContentGuardProps) {
  const { user } = useAuth()

  // If content is not premium or user is logged in, show the content
  if (!isPremium || user) {
    return <>{children}</>
  }

  // If content is premium and user is not logged in, show the premium content guard
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center p-8">
      <div className="bg-rose-100 p-4 rounded-full">
        <Lock className="h-8 w-8 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold">Premium Content</h2>
      <p className="text-gray-600 max-w-md">
        This content is available exclusively to members. Sign in or subscribe to access premium content.
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/members">Subscribe Now</Link>
        </Button>
      </div>
    </div>
  )
} 
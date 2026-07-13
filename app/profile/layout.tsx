'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/stores/useUserStore'
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hasHydrated = useUserStore.persist.hasHydrated()
  const user = useUserStore((state) => state.user)
  const loading = useUserStore((state) => state.loading)

  useEffect(() => {
    if (hasHydrated && !loading && !user) {
      router.replace(`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`)
    }
  }, [hasHydrated, loading, user, router])

  if (!hasHydrated || loading || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          Restoring session...
        </p>
      </div>
    )
  }

  return <main>{children}</main>
}
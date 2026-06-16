'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from "@/stores/useUserStore";
import { Loader2 } from 'lucide-react'

export default function ProtectedLayout({ children }: {children: React.ReactNode}) {
  const router = useRouter()
  const user = useUserStore((state) => state.user)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace(`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login`);
    }
  }, [isHydrated, user, router])

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-2 font-medium tracking-wide">
          Verifying security context...
        </p>
      </div>
    )
  }
  return <>{children}</>
}
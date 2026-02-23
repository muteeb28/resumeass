"use client"

import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import { useUserStore } from '@/stores/useUserStore'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useUserStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <Toaster position="top-right" />
      <SonnerToaster position="top-right" />
      {children}
    </>
  )
}

"use client"

import { Suspense } from "react"
import CreatePortfolioPage from '@/components/create-portfolio-page'

export default function PortfolioRoute() {
  return (
    <Suspense>
      <CreatePortfolioPage />
    </Suspense>
  )
}

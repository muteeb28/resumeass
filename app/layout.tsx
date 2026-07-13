import type { Metadata } from 'next'
import Script from 'next/script'
import '@/index.css'
import '@/App.css'
import AuthProvider from './AuthProvider'
import Providers from './Providers'
import { Toaster } from "@/components/ui/sonner";
import MembershipSync from '@/components/MembershipSync';

export const metadata: Metadata = {
  title: 'ResumeAssist AI - AI-Powered Resume Builder',
  description: 'AI-powered resume builder and optimizer',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <AuthProvider>
            <MembershipSync />
            {children}
          </AuthProvider>
        </Providers>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <Toaster position="top-center" />
      </body>
    </html>
  )
}

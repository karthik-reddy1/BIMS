import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AppNavigation } from '@/components/app-navigation'
import './globals.css'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'BIS - Beverage Inventory System',
  description: 'Complete beverage inventory management system for tracking sales, purchases, routes, and reports.',
}

export const viewport: Viewport = {
  themeColor: '#171717',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased min-h-screen bg-gradient-to-br from-neutral-50 via-white to-stone-50`}
      >
        <AppNavigation />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  )
}

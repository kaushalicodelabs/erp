'use client'

import { SessionProvider } from 'next-auth/react'
import { useUIStore } from '@/lib/store/ui-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()

  return (
    <SessionProvider>
      <div className="min-h-screen bg-[#f5f6fa]">
        {/* Backdrop for mobile */}
        {mobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <Sidebar />
        <Header />
        <main
          className={cn(
            'pt-[80px] pb-8 transition-all duration-300 ease-in-out',
            'ml-0 lg:ml-[250px]',
            sidebarCollapsed && 'lg:ml-[70px]'
          )}
        >
          <div className="px-4 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  )
}

import type { ReactNode } from 'react'
import { useState } from 'react'
import { LayoutContext } from '../context/LayoutContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileBottomNav } from './MobileBottomNav'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex flex-col h-screen bg-[#fafbfc]">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar />

          {/* Main content */}
          <main
            className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out md:pb-0 pb-20 ${
              sidebarOpen ? 'md:ml-64' : 'md:ml-20'
            }`}
          >
            <div className="h-full">{children}</div>
          </main>
        </div>

        <MobileBottomNav />
      </div>
    </LayoutContext.Provider>
  )
}

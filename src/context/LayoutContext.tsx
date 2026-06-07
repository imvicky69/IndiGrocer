import { createContext, useContext } from 'react'

export interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const LayoutContext = createContext<LayoutContextType | undefined>(
  undefined,
)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider')
  }
  return context
}

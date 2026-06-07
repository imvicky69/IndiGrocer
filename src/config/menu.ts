import {
  LayoutDashboard,
  Building2,
  FileText,
  Receipt,
  Package,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  badge?: number
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'schools',
    label: 'Schools',
    path: '/schools',
    icon: Building2,
  },
  {
    id: 'allocations',
    label: 'Allocations',
    path: '/allocations',
    icon: FileText,
  },
  {
    id: 'bills',
    label: 'Bills',
    path: '/bills',
    icon: Receipt,
    badge: 3,
  },
  {
    id: 'items',
    label: 'Items',
    path: '/items',
    icon: Package,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]

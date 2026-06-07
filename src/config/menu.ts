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
  allowedRoles?: Array<'super_admin' | 'billing_staff' | 'headmaster'>
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    allowedRoles: ['super_admin', 'billing_staff', 'headmaster'],
  },
  {
    id: 'schools',
    label: 'Schools',
    path: '/schools',
    icon: Building2,
    allowedRoles: ['super_admin', 'billing_staff'],
  },
  {
    id: 'allocations',
    label: 'Allocations',
    path: '/allocations',
    icon: FileText,
    allowedRoles: ['super_admin', 'billing_staff', 'headmaster'],
  },
  {
    id: 'bills',
    label: 'Bills',
    path: '/bills',
    icon: Receipt,
    badge: 3,
    allowedRoles: ['super_admin', 'billing_staff', 'headmaster'],
  },
  {
    id: 'items',
    label: 'Items',
    path: '/items',
    icon: Package,
    allowedRoles: ['super_admin', 'billing_staff'],
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    allowedRoles: ['super_admin', 'billing_staff', 'headmaster'],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    allowedRoles: ['super_admin'],
  },
]

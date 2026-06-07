import { Link, useLocation } from 'react-router-dom'
import type { MenuItem } from '../config/menu'
import { useLayout } from '../context/LayoutContext'

interface NavItemProps {
  item: MenuItem
  collapsed?: boolean
  mobile?: boolean
}

export function NavItem({ item, collapsed = false, mobile = false }: NavItemProps) {
  const location = useLocation()
  const isActive = location.pathname === item.path
  useLayout()

  const handleClick = () => {
    if (mobile) {
      // Don't close sidebar on mobile nav clicks
      return
    }
  }

  const baseClasses =
    'flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 relative group text-sm'

  const activeClasses = isActive
    ? 'bg-gradient-to-r from-indigo-600 to-violet-650 text-white shadow-sm shadow-indigo-100 font-semibold'
    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'

  const Icon = item.icon

  if (mobile) {
    return (
      <Link
        to={item.path}
        className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-200 relative ${
          isActive
            ? 'text-indigo-600 bg-indigo-50/70 font-semibold'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
        }`}
        title={item.label}
      >
        <Icon size={20} className="flex-shrink-0" />
        <span className="text-[10px] tracking-tight">{item.label}</span>
        {item.badge && (
          <span className="absolute top-1 right-2 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-rose-500 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <Link
      to={item.path}
      onClick={handleClick}
      className={`${baseClasses} ${activeClasses}`}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className="flex-shrink-0" />

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-500 rounded-full flex-shrink-0 shadow-sm">
              {item.badge}
            </span>
          )}
        </>
      )}

      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
          {item.label}
          {item.badge && ` (${item.badge})`}
        </div>
      )}
    </Link>
  )
}

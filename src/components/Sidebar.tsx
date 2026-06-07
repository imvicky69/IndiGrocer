import { MENU_ITEMS } from '../config/menu'
import { NavItem } from './NavItem'
import { useLayout } from '../context/LayoutContext'
import { useAuth } from '../hooks/useAuth'

export function Sidebar() {
  const { sidebarOpen } = useLayout()
  const { profile } = useAuth()

  // Filter menu items by user's role
  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true
    if (!profile) return false
    return item.allowedRoles.includes(profile.role)
  })

  // Get initials for profile name
  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  // Format roles for visual display
  const formatRole = (role?: string) => {
    if (!role) return ''
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo section for collapsed state */}
        {!sidebarOpen && (
          <div className="h-16 flex items-center justify-center border-b border-slate-200/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              IG
            </div>
          </div>
        )}

        {/* Scrollable menu section */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className={`p-4 space-y-1.5 ${!sidebarOpen ? 'py-6' : ''}`}>
            {filteredMenuItems.map((item) => (
              <NavItem key={item.id} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>
        </nav>

        {/* Footer section */}
        <div
          className={`border-t border-slate-200/80 p-4 flex items-center ${
            !sidebarOpen ? 'justify-center' : 'gap-3.5'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-50 to-indigo-100 flex-shrink-0 border border-indigo-200 flex items-center justify-center text-indigo-650 font-semibold text-xs">
            {getInitials(profile?.name)}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {profile?.name || 'User Profile'}
              </p>
              <p className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider truncate">
                {formatRole(profile?.role)}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

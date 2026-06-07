import { MENU_ITEMS } from '../config/menu'
import { NavItem } from './NavItem'
import { useAuth } from '../hooks/useAuth'

export function MobileBottomNav() {
  const { profile } = useAuth()

  // Filter menu items by user's role
  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true
    if (!profile) return false
    return item.allowedRoles.includes(profile.role)
  })

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40">
      <div className="flex justify-around items-center h-16 gap-1 px-3">
        {filteredMenuItems.map((item) => (
          <NavItem key={item.id} item={item} mobile={true} />
        ))}
      </div>
    </nav>
  )
}

import { MENU_ITEMS } from '../config/menu'
import { NavItem } from './NavItem'

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-40">
      <div className="flex justify-around items-center h-16 gap-1 px-3">
        {MENU_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} mobile={true} />
        ))}
      </div>
    </nav>
  )
}

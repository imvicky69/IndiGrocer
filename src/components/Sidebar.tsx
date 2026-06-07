import { MENU_ITEMS } from '../config/menu'
import { NavItem } from './NavItem'
import { useLayout } from '../context/LayoutContext'

export function Sidebar() {
  const { sidebarOpen } = useLayout()

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
            {MENU_ITEMS.map((item) => (
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex-shrink-0 border border-slate-300/50 flex items-center justify-center text-slate-700 font-semibold text-xs">
            AD
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                Admin User
              </p>
              <p className="text-xs text-slate-400 font-medium truncate">
                admin@indigrocer.com
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Backdrop for mobile when sidebar might be open */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 md:hidden z-20" />
      )}
    </>
  )
}

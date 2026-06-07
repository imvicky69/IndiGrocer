import { Menu, X, LogOut } from 'lucide-react'
import { useLayout } from '../context/LayoutContext'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { sidebarOpen, setSidebarOpen } = useLayout()
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }

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
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:inline-flex p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <div className="flex items-center gap-3.5">
            <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-xl" />
            <h1 className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
              IndiGrocer <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full ml-1.5 border border-indigo-100">Billing</span>
            </h1>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notification icon */}
          <button
            className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-all relative"
            aria-label="Notifications"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>

          {/* User profile info & role */}
          {profile && (
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-slate-800 leading-none">{profile.name}</span>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-0.5">{formatRole(profile.role)}</span>
            </div>
          )}

          {/* User avatar */}
          <div
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200/80 flex items-center justify-center text-indigo-650 font-bold text-xs shadow-sm"
            aria-label="User profile"
            title={profile?.name || 'User Profile'}
          >
            {getInitials(profile?.name)}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  )
}

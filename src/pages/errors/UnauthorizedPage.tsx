import { useNavigate } from 'react-router-dom'
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function UnauthorizedPage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 sm:p-8 flex flex-col justify-between min-h-[500px] relative overflow-hidden animate-slide-in">
        
        {/* Top Spacer */}
        <div></div>

        {/* Content */}
        <div className="flex-grow flex flex-col justify-center items-center text-center px-2">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-6 hover:scale-105 transition-all">
            <ShieldAlert size={32} />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Access Denied
          </h2>

          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            {!user ? (
              'You must be signed in to access this section.'
            ) : !profile ? (
              <span>
                Your phone number <strong className="text-slate-700">{user.phoneNumber}</strong> is not registered in our MDM Billing directory. Please contact your administrator.
              </span>
            ) : !profile.isActive ? (
              'Your account has been deactivated. Please contact your administrator to reactivate it.'
            ) : (
              'Your account does not have permission to view this page.'
            )}
          </p>

          {profile && (
            <div className="mt-6 px-4 py-2.5 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-500">
              Role: <span className="text-slate-700 uppercase">{profile.role.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-8">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft size={16} />
              Back to Login
            </button>
          )}

          {user && profile && profile.isActive && (
            <button
              onClick={() => navigate('/')}
              className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

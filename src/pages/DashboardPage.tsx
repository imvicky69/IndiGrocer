import { School, Receipt, DollarSign, BarChart3, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchSchoolDashboardStats } from '../lib/db'

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchSchoolDashboardStats
  })

  const statCards = [
    { 
      title: 'Total Schools', 
      value: isLoading ? '...' : stats?.total.toString() || '0', 
      change: 'Registered Institutions', 
      type: 'info', 
      icon: School, 
      color: 'bg-indigo-50 text-indigo-650 border-indigo-100/50' 
    },
    { 
      title: 'Active Schools', 
      value: isLoading ? '...' : stats?.active.toString() || '0', 
      change: 'Fully Operating', 
      type: 'increase', 
      icon: CheckCircle2, 
      color: 'bg-emerald-50 text-emerald-650 border-emerald-100/50' 
    },
    { 
      title: 'Inactive Schools', 
      value: isLoading ? '...' : stats?.inactive.toString() || '0', 
      change: 'Deactivated / Archived', 
      type: 'decrease', 
      icon: XCircle, 
      color: 'bg-rose-50 text-rose-650 border-rose-100/50' 
    },
    { 
      title: 'Billing Allocations', 
      value: '156', 
      change: 'Active Distributions', 
      type: 'info', 
      icon: BarChart3, 
      color: 'bg-sky-50 text-sky-600 border-sky-100/50' 
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-slide-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">Welcome back to your IndiGrocer MDM Billing System</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 hover:shadow-md hover:border-slate-350/60 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${stat.type === 'increase'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : stat.type === 'decrease'
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-sky-50 text-sky-600 border border-sky-100'
                    }`}>
                    {stat.type === 'increase' && <ArrowUpRight size={12} />}
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart & Activities section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Billing Overview
              </h2>
              <p className="text-xs text-slate-400 font-medium">Monthly billing activity and school metrics</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Paid
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Pending
              </span>
            </div>
          </div>

          {/* Beautiful mockup chart graphics */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-1 px-2">
            {[45, 60, 35, 75, 50, 90, 65, 80, 55, 95, 70, 110].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end">
                <div className="w-full flex gap-1 items-end justify-center h-full">
                  <div
                    className="w-1.5 sm:w-2 bg-indigo-500 rounded-t-full transition-all group-hover:bg-indigo-650"
                    style={{ height: `${height * 0.7}%` }}
                  />
                  <div
                    className="w-1.5 sm:w-2 bg-amber-300 rounded-t-full transition-all group-hover:bg-amber-400"
                    style={{ height: `${height * 0.3}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              { text: 'New bill generated for Central School', time: '2 hours ago', icon: Receipt, bg: 'bg-indigo-50 text-indigo-600' },
              { text: 'Allocations updated for District 4', time: '5 hours ago', icon: BarChart3, bg: 'bg-emerald-50 text-emerald-600' },
              { text: 'West Academy bill marked as Paid', time: 'Yesterday', icon: DollarSign, bg: 'bg-teal-50 text-teal-600' },
            ].map((activity, i) => {
              const ActIcon = activity.icon
              return (
                <div key={i} className="flex gap-3">
                  <div className={`p-2 rounded-xl h-fit border border-slate-100 ${activity.bg}`}>
                    <ActIcon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-normal">{activity.text}</p>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{activity.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

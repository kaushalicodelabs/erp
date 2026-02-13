'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/axios'
import { 
  Users, 
  FolderKanban, 
  DollarSign, 
  FileText, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  Receipt,
  BarChart3,
  Loader2
} from 'lucide-react'
import { CircleProgress } from '@/components/dashboard/circle-progress'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    if (session) fetchStats()
  }, [session])

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || !stats) return null

  const isAdmin = session.user.role === 'super_admin' || session.user.role === 'hr'

  return (
    <div className="space-y-6 animate-enter">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Hi, {session.user.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {isAdmin ? "Here's your business performance overview." : "Here's your personal overview."}
        </p>
      </div>

      {isAdmin ? (
        <>
          {/* Row 1: Circle Charts + Revenue Card */}
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Invoice Collection Rate</h3>
              <CircleProgress value={stats.stats.totalRevenue > 0 ? Math.round((stats.stats.collectedRevenue / stats.stats.totalRevenue) * 100) : 0} color="#7c3aed" label="All Time" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Expense/Revenue Ratio</h3>
              <CircleProgress value={stats.stats.totalRevenue > 0 ? Math.round((stats.stats.totalExpenses / stats.stats.totalRevenue) * 100) : 0} color="#6366f1" label="All Time" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 xl:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Revenue</h3>
                <span className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md",
                  stats.stats.revenueChange >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                  {stats.stats.revenueChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stats.stats.revenueChange).toFixed(1)}%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">${stats.stats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mb-4">Growth vs last month</p>
              
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Receivables</p>
                    <p className="text-sm font-bold text-gray-900">${stats.stats.receivables.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Collected</p>
                    <p className="text-sm font-bold text-gray-900">${stats.stats.collectedRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Quick Stats */}
          <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Total Employees', value: stats.stats.totalEmployees, positive: true, icon: Users, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
              { label: 'Active Projects', value: stats.stats.activeProjects, positive: true, icon: FolderKanban, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
              { label: 'Total Expenses', value: `$${stats.stats.totalExpenses.toLocaleString()}`, positive: false, icon: Receipt, iconBg: 'bg-red-50', iconColor: 'text-red-500' },
              { label: 'Pending Invoices', value: stats.stats.pendingInvoices, positive: stats.stats.overdueInvoices === 0, icon: FileText, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <stat.icon className={`w-[18px] h-[18px] ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Employee View - Simplified */
        <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Projects</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.stats.myActiveProjects}</p>
            <p className="text-xs text-gray-400 mt-1">Currently assigned projects</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pending Expenses</h3>
            <p className="text-2xl font-bold text-gray-900">${stats.stats.pendingExpenses.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Claims awaiting approval</p>
          </div>
        </div>
      )}

      {/* Row 4: Recent Projects */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            {isAdmin ? "Company Projects" : "My Projects"}
          </h2>
          <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Project</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentProjects.map((project: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{project.name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{project.clientId?.companyName}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                      project.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      project.status === 'in-progress' ? 'bg-violet-50 text-violet-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 tabular-nums">{project.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {stats.recentProjects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-gray-500">
                    No active projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

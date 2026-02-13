'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWFH } from '@/lib/hooks/use-wfh'
import { useSession } from 'next-auth/react'
import { RequestWFHModal } from '@/components/dashboard/request-wfh-modal'
import { 
  Home, 
  Plus, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  Trash2,
  CalendarDays,
  User as UserIcon,
  ChevronRight,
  ClipboardList
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

export default function WFHPage() {
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const { wfhRequests, isLoading, updateWFH, deleteWFH } = useWFH(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )

  const isAdmin = session?.user?.role === 'super_admin' || session?.user?.role === 'hr' || session?.user?.role === 'project_manager'

  const stats = [
    {
      title: 'WFH Requests',
      value: wfhRequests?.length || 0,
      description: 'Submitted this month',
      icon: Home,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Approved',
      value: wfhRequests?.filter(r => r.status === 'approved').length || 0,
      description: 'Remote work active',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Pending Review',
      value: wfhRequests?.filter(r => r.status.startsWith('pending')).length || 0,
      description: 'Awaiting response',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ]

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'rejected_hr':
      case 'rejected_admin': return 'bg-red-50 text-red-700 border-red-100'
      case 'cancelled': return 'bg-gray-50 text-gray-500 border-gray-100'
      case 'pending_admin': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'pending_hr':
      default: return 'bg-amber-50 text-amber-700 border-amber-100'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const safeFormat = (date: any, formatStr: string) => {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'Invalid Date'
    return format(d, formatStr)
  }

  const safeDifferenceInDays = (end: any, start: any) => {
    const dEnd = new Date(end)
    const dStart = new Date(start)
    if (isNaN(dEnd.getTime()) || isNaN(dStart.getTime())) return 0
    return differenceInDays(dEnd, dStart) + 1
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">WFH Management</h1>
          <p className="text-gray-500 mt-1">Submit work from home requests and manage remote sessions.</p>
        </div>
        {session?.user?.role !== 'super_admin' && (
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold gap-2"
          >
            <Plus className="w-5 h-5" />
            Request WFH
          </Button>
        )}
      </div>

      <RequestWFHModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WFH Table */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Home className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle>Remote Work History</CardTitle>
              <p className="text-sm text-gray-500 font-normal">Track status and manage WFH history</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['all', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
                    statusFilter === status 
                      ? "bg-white text-gray-900 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-lg">
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{isAdmin ? 'Employee' : 'Reason'}</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-400">Loading requests...</td></tr>
                ) : wfhRequests?.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-400">No WFH requests found.</td></tr>
                ) : (
                  wfhRequests?.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 line-clamp-1">
                            {isAdmin && request.employeeId ? `${(request.employeeId as any).firstName} ${(request.employeeId as any).lastName}` : request.reason}
                          </span>
                          {isAdmin && <span className="text-xs text-gray-500 line-clamp-1">{request.reason}</span>}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          {safeDifferenceInDays(request.endDate, request.startDate)} Days
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-600 font-medium flex items-center gap-1.5">
                          {safeFormat(request.startDate, 'MMM dd')} — {safeFormat(request.endDate, 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                          getStatusStyles(request.status)
                        )}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            (session.user.role === 'hr' && request.status === 'pending_hr') ||
                            (session.user.role === 'super_admin' && request.status === 'pending_admin')
                          ) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold"
                                onClick={() => updateWFH({ id: request._id, data: { status: 'approved' } })}
                              >
                                {session.user.role === 'hr' ? 'Verify' : 'Approve'}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold"
                                onClick={() => updateWFH({ id: request._id, data: { status: 'rejected' as any } })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {!isAdmin && request.status === 'pending_hr' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              onClick={() => deleteWFH(request._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

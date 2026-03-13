'use client'
import React, { useState, useMemo } from 'react'
import { useAttendance } from '@/lib/hooks/use-attendance'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Users, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Employee } from '@/types'

type ViewMode = 'by-date' | 'by-employee'

export default function AdminAttendancePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('by-date')
  const { attendance, isLoading } = useAttendance(undefined, undefined, true)

  // 1. Group by Date logic — must be before any early returns
  const groupedByDate = useMemo(() => {
    if (!attendance) return []
    const groups: Record<string, any[]> = {}
    
    attendance.forEach(record => {
      const dateKey = format(new Date(record.date), 'yyyy-MM-dd')
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(record)
    })

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [attendance])

  // 2. Group by Employee logic — must be before any early returns
  const groupedByEmployee = useMemo(() => {
    if (!attendance) return []
    const groups: Record<string, { employee: Employee, records: typeof attendance }> = {}
    
    attendance.forEach(record => {
      const emp = record.employee
      const empId = emp?._id
      if (!empId) return
      if (!groups[empId]) {
        groups[empId] = {
          employee: emp,
          records: []
        }
      }
      groups[empId].records.push(record)
    })

    return Object.values(groups).sort((a, b) => 
      `${a.employee.firstName} ${a.employee.lastName}`.localeCompare(`${b.employee.firstName} ${b.employee.lastName}`)
    )
  }, [attendance])

  if (status === 'loading') return <div className="p-8 text-center">Loading...</div>

  // RBAC check
  if (status === 'authenticated' && session && session.user.role !== 'super_admin' && session.user.role !== 'hr') {
    router.replace('/time-tracking')
    return null
  }

  const renderAttendanceTable = (records: any[], hideColumn: 'employee' | 'date') => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/50">
            {hideColumn !== 'employee' && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>}
            {hideColumn !== 'date' && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>}
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock In</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Out</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Working Hours</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {records.map((record: any) => (
            <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
              {hideColumn !== 'employee' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {record.employee?.firstName?.[0]}{record.employee?.lastName?.[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {record.employee?.firstName} {record.employee?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{record.employee?.position}</div>
                    </div>
                  </div>
                </td>
              )}
              {hideColumn !== 'date' && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </span>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {record.checkIn ? format(new Date(record.checkIn), 'hh:mm a') : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {record.checkOut ? format(new Date(record.checkOut), 'hh:mm a') : (
                  <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    Still Working
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                {record.hoursWorked ? `${record.hoursWorked} hrs` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  record.status === 'present' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}>
                  {record.status.toUpperCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employee Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor organization-wide attendance and working hours.</p>
        </div>
        
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit">
          <Button
            variant={viewMode === 'by-date' ? 'default' : 'ghost'}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              viewMode === 'by-date' ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setViewMode('by-date')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            By Date
          </Button>
          <Button
            variant={viewMode === 'by-employee' ? 'default' : 'ghost'}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
              viewMode === 'by-employee' ? "bg-white text-violet-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => setViewMode('by-employee')}
          >
            <Users className="w-4 h-4 mr-2" />
            By Employee
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400 font-medium">
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-4 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
            </div>
          </CardContent>
        </Card>
      ) : !attendance || attendance.length === 0 ? (
        <Card className="border-none shadow-sm rounded-2xl">
          <CardContent className="p-12 text-center text-gray-400">No attendance records found.</CardContent>
        </Card>
      ) : viewMode === 'by-date' ? (
        <div className="space-y-6">
          {groupedByDate.map(([dateKey, records]) => (
            <Card key={dateKey} className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/10 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {format(new Date(dateKey), 'EEEE, MMMM do, yyyy')}
                    </h3>
                    <p className="text-xs text-gray-500">{records.length} Employee Records</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderAttendanceTable(records, 'date')}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByEmployee.map(({ employee, records }) => (
            <Card key={employee._id} className="border-none shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/10 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {employee.firstName[0]}{employee.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</h3>
                    <p className="text-xs text-gray-500">{employee.position} • {records.length} Total Records</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {renderAttendanceTable(records, 'employee')}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

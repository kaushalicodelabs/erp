'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTimesheetReports } from '@/lib/hooks/use-timesheet-reports'
import { useEmployees } from '@/lib/hooks/use-employees'
import { useSession } from 'next-auth/react'
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  Download, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  User as UserIcon,
  Briefcase,
  ChevronRight
} from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

export default function TimesheetReportsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'manager'

  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })
  const [department, setDepartment] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState('all')

  const { reportData, isLoading } = useTimesheetReports({
    startDate: dateRange.start,
    endDate: dateRange.end,
    department,
    employeeId: selectedEmployee !== 'all' ? selectedEmployee : undefined
  })

  const { employees } = useEmployees()

  const departments = Array.from(new Set(employees?.map(e => e.department) || []))

  const chartData = reportData?.stats?.map((s: any) => ({
    name: format(new Date(s._id), 'MMM dd'),
    hours: s.totalHours,
  })) || []

  const stats = [
    {
      title: 'Total Hours Worked',
      value: reportData?.summary?.totalHours.toFixed(1) || '0.0',
      change: '+12.5%',
      isPositive: true,
      icon: Clock,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Avg. Daily Hours',
      value: reportData?.summary?.averageDailyHours.toFixed(1) || '0.0',
      change: '-2.1%',
      isPositive: false,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Active Days',
      value: reportData?.summary?.activeDays || 0,
      change: '+4',
      isPositive: true,
      icon: Calendar,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Timesheet Reports</h1>
          <p className="text-gray-500 mt-1">Analyze productivity and attendance trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-gray-200 hover:bg-gray-50 font-semibold gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card className="border-none shadow-sm rounded-2xl bg-white/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</Label>
              <Input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">End Date</Label>
              <Input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
              />
            </div>
            {isAdmin && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Department</Label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border-transparent bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee</Label>
                  <select 
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border-transparent bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="all">All Employees</option>
                    {employees?.map(e => (
                      <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
                  stat.isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                  {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Work Hours Trend</CardTitle>
                  <p className="text-sm text-gray-500 font-normal">Daily productivity analysis</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="hours" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 6, 6]} 
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Employees / Personal Breakdown */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">{isAdmin ? 'Team Breakdown' : 'Daily Insights'}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {isLoading ? (
                <div className="p-8 text-center text-gray-400">Analysis in progress...</div>
              ) : isAdmin ? (
                reportData?.breakdown?.map((emp: any, i: number) => (
                  <div key={i} className="p-6 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 border-2 border-white shadow-sm">
                        {emp.employee.firstName[0]}{emp.employee.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.employee.firstName} {emp.employee.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-violet-600">{emp.totalHours.toFixed(1)}h</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{emp.daysPresent} Days</p>
                    </div>
                  </div>
                ))
              ) : (
                chartData.map((day: any, i: number) => (
                  <div key={i} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">{day.name}</p>
                    </div>
                    <p className="text-sm font-bold text-violet-600">{day.hours} Hours</p>
                  </div>
                ))
              )}
            </div>
            {isAdmin && (
              <div className="p-6 border-t border-gray-50">
                <Button variant="ghost" className="w-full text-violet-600 font-bold hover:bg-violet-50 rounded-xl py-6 gap-2">
                  View Full Directory
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

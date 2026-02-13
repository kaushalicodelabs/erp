'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePerformanceReports } from '@/lib/hooks/use-performance-reports'
import { useSession } from 'next-auth/react'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  User as UserIcon,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts'

export default function EmployeePerformancePage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'manager'

  const [date, setDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  const { performanceData, isLoading } = usePerformanceReports({
    month: date.month,
    year: date.year
  })

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const stats = [
    {
      title: 'Company Avg. Score',
      value: `${performanceData?.summary?.averageScore.toFixed(0) || '0'}`,
      isPositive: true,
      icon: Target,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Top Performer',
      value: performanceData?.summary?.topPerformer ? `${performanceData.summary.topPerformer.firstName}` : 'N/A',
      isPositive: true,
      icon: Trophy,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Active Employees',
      value: performanceData?.summary?.totalEmployees || 0,
      isPositive: true,
      icon: Zap,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ]

  // Mock data for radar chart (multidimensional analysis)
  const getRadarData = (metrics: any) => [
    { subject: 'Attendance', A: metrics.attendanceRate, fullMark: 100 },
    { subject: 'Consistency', A: Math.min(100, (metrics.daysPresent / 20) * 100), fullMark: 100 },
    { subject: 'Hours', A: Math.min(100, (metrics.avgHoursPerDay / 8) * 100), fullMark: 100 },
    { subject: 'Reliability', A: 90 - (metrics.leaveCount * 5), fullMark: 100 },
    { subject: 'Remote Exp', A: metrics.wfhCount > 0 ? 100 : 50, fullMark: 100 },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Performance Analytics</h1>
          <p className="text-gray-500 mt-1">Track Team productivity and efficiency metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <select 
              value={date.month}
              onChange={(e) => setDate(prev => ({ ...prev, month: parseInt(e.target.value) }))}
              className="bg-transparent text-sm font-bold px-3 py-1.5 focus:outline-none"
            >
              {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
            <select 
              value={date.year}
              onChange={(e) => setDate(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              className="bg-transparent text-sm font-bold px-3 py-1.5 focus:outline-none"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <Button variant="outline" className="rounded-xl h-11 border-gray-200 hover:bg-gray-50 flex gap-2 font-bold px-6">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Leaderboard */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-violet-600" />
              </div>
              <CardTitle className="text-xl">Team Rankings</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{months[date.month-1]} {date.year}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Employee</th>
                    <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Score</th>
                    <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Attendance</th>
                    <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Avg. Hours</th>
                    <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-400">Loading rankings...</td></tr>
                  ) : performanceData?.data?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border-2 border-white shadow-sm">
                            {item.employee.firstName[0]}{item.employee.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{item.employee.firstName} {item.employee.lastName}</span>
                            <span className="text-xs text-gray-500">{item.employee.position}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm",
                            item.metrics.performanceScore >= 90 ? "bg-emerald-50 text-emerald-700" :
                            item.metrics.performanceScore >= 75 ? "bg-violet-50 text-violet-700" :
                            "bg-amber-50 text-amber-700"
                          )}>
                            {item.metrics.performanceScore}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5 w-24">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-gray-400">{item.metrics.attendanceRate.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${item.metrics.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">{item.metrics.avgHoursPerDay.toFixed(1)}h</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 text-emerald-600 font-bold text-xs">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          2.4%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Selected Performer Analysis */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Deep Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {!isLoading && performanceData?.data?.[0] ? (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-400 border-4 border-white shadow-xl mb-4 relative">
                    {performanceData.data[0].employee.firstName[0]}{performanceData.data[0].employee.lastName[0]}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{performanceData.data[0].employee.firstName} {performanceData.data[0].employee.lastName}</h3>
                  <p className="text-sm text-gray-500">{performanceData.data[0].employee.department}</p>
                </div>

                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData(performanceData.data[0].metrics)}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                      <Radar
                        name="Performance"
                        dataKey="A"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">WFH Utilization</p>
                    <p className="text-xl font-bold text-gray-900">{performanceData.data[0].metrics.wfhCount} Days</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Leaves Taken</p>
                    <p className="text-xl font-bold text-orange-600">{performanceData.data[0].metrics.leaveCount} Days</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 py-12">
                Select an employee for details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

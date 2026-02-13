'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectReports } from '@/lib/hooks/use-project-reports'
import { 
  FolderKanban, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  PieChart as PieChartIcon,
  LayoutGrid,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts'

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function ProjectReportsPage() {
  const { reportData, isLoading } = useProjectReports()

  const summaryStats = [
    {
      title: 'Total Budgeted',
      value: `$${reportData?.summary?.totalBudget.toLocaleString() || '0'}`,
      change: '+8.2%',
      isPositive: true,
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Total Billed',
      value: `$${reportData?.summary?.totalBilled.toLocaleString() || '0'}`,
      change: '+15.4%',
      isPositive: true,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Avg. Progress',
      value: `${reportData?.summary?.averageProgress.toFixed(1) || '0'}%`,
      change: '+2.5%',
      isPositive: true,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ]

  const statusData = reportData?.summary?.statusBreakdown ? [
    { name: 'Planning', value: reportData.summary.statusBreakdown.planning },
    { name: 'In Progress', value: reportData.summary.statusBreakdown['in-progress'] },
    { name: 'Completed', value: reportData.summary.statusBreakdown.completed },
    { name: 'On Hold', value: reportData.summary.statusBreakdown['on-hold'] },
  ].filter(s => s.value > 0) : []

  const budgetData = reportData?.projects?.slice(0, 5).map((p: any) => ({
    name: p.name,
    budget: p.budget,
    billed: p.billedAmount
  })) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Project Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive health and budget tracking reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-gray-200 hover:bg-gray-50 font-semibold gap-2">
            <Download className="w-4 h-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryStats.map((stat, i) => (
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
        {/* Budget Allocation Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <CardTitle className="text-xl">Budget vs Actual Billed</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-violet-600 font-bold hover:bg-violet-50 rounded-lg">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="budget" name="Total Budget" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="billed" name="Billed Amount" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Project Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-gray-900">{reportData?.summary?.projectCount || 0}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Health Table */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Project Performance</CardTitle>
              <p className="text-sm text-gray-500 font-normal">Health check and budget utilization</p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl border-gray-200 h-10 px-4 text-sm font-bold gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Project Name</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Progress</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Budget Utilization</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Assigned</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Health</th>
                  <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">Analyzing projects...</td></tr>
                ) : reportData?.projects?.map((project: any) => {
                  const budgetUtilization = project.budget > 0 ? (project.billedAmount / project.budget) * 100 : 0
                  const isHealthy = project.progress >= budgetUtilization
                  
                  return (
                    <tr key={project._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors">{project.name}</span>
                          <span className="text-xs text-gray-500 capitalize">{project.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-gray-400">{project.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-violet-500 transition-all duration-1000" 
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">${project.billedAmount.toLocaleString()}</span>
                          <span className="text-xs text-gray-400">out of ${project.budget.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{project.assignedCount}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold gap-1.5",
                          isHealthy ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"
                        )}>
                          {isHealthy ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {isHealthy ? 'HEALTHY' : 'AT RISK'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-violet-50 hover:text-violet-600 transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

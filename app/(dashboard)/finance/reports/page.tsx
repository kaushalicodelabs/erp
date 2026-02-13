'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useFinancialReports } from '@/lib/hooks/use-financial-reports'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Calendar,
  Wallet,
  Receipt,
  PieChart as PieChartIcon,
  ChevronRight,
  Calculator,
  Percent
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

export default function FinancialReportsPage() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const { reportData, isLoading } = useFinancialReports(selectedYear)

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${reportData?.summary?.totalRevenue.toLocaleString() || '0'}`,
      isPositive: true,
      change: '+12.4%',
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Net Profit',
      value: `$${reportData?.summary?.netProfit.toLocaleString() || '0'}`,
      isPositive: true,
      change: '+5.2%',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Profit Margin',
      value: `${reportData?.summary?.profitMargin.toFixed(1) || '0'}%`,
      isPositive: true,
      change: '+1.8%',
      icon: Percent,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    }
  ]

  const chartData = reportData?.monthlyTrends || []
  const categoryData = reportData?.expenseCategories?.map((c: any) => ({
    name: c._id,
    value: c.total
  })).filter((c: any) => c.value > 0) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Reports</h1>
          <p className="text-gray-500 mt-1">Real-time analysis of company income and expenditure.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="h-11 px-4 rounded-xl border-gray-200 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all border shadow-sm"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y} Fiscal Year</option>)}
          </select>
          <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-violet-200 font-bold gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>
      </div>

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
        {/* Main Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Revenue vs Expenses</CardTitle>
                <p className="text-sm text-gray-500 font-normal">Monthly financial performance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-xs font-bold text-gray-500">REVENUE</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-gray-500">OUTFLOW</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#revenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalOut" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#outflow)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-8 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <PieChartIcon className="w-5 h-5 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Expense Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-gray-900">${reportData?.summary?.totalExpenses.toLocaleString()}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total OpEx</span>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {categoryData.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600 font-medium capitalize">{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-bold">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Metrics Table */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Monthly Financial Ledger</CardTitle>
              <p className="text-sm text-gray-500 font-normal">Detailed monthly performance audit</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Month</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Expenses</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Payroll</th>
                  <th className="px-8 py-5 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Net Profit</th>
                  <th className="px-8 py-5 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {chartData.map((m: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-gray-900">{m.month}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-900">${m.revenue.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-gray-600">${m.expenses.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-gray-600">${m.payroll.toLocaleString()}</td>
                    <td className={cn(
                      "px-8 py-5 text-sm font-bold",
                      m.profit >= 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {m.profit < 0 ? '-' : ''}${Math.abs(m.profit).toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Button variant="ghost" size="sm" className="text-violet-600 font-bold hover:bg-violet-50 rounded-lg text-xs gap-2">
                        Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePayments } from '@/lib/hooks/use-payments'
import { useInvoices } from '@/lib/hooks/use-invoices'
import { 
  DollarSign, 
  CreditCard, 
  History, 
  Plus, 
  Filter, 
  Search,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { LogPaymentModal } from '@/components/finance/log-payment-modal'

export default function PaymentTrackingPage() {
  const { payments, isLoading } = usePayments()
  const { invoices } = useInvoices()
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  const stats = [
    {
      title: 'Total Collections',
      value: `$${payments?.reduce((acc: number, p: any) => acc + p.amount, 0).toLocaleString() || '0'}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Recent Payments',
      value: payments?.length || 0,
      icon: History,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Outstanding',
      value: `$${invoices?.filter((inv: any) => inv.status !== 'paid').reduce((acc: number, inv: any) => acc + inv.total, 0).toLocaleString() || '0'}`,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payment Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor all incoming settlements and invoice payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsLogModalOpen(true)}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-6 shadow-lg shadow-violet-200 font-bold gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Payment
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl">
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

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 border-b border-gray-50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <CardTitle className="text-xl">Transaction History</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search payments..." 
                className="h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition-all w-64"
              />
            </div>
            <Button variant="outline" className="rounded-xl border-gray-200 h-10 px-4 font-bold gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-8 py-5 text-left">Invoice #</th>
                  <th className="px-8 py-5 text-left">Client</th>
                  <th className="px-8 py-5 text-left">Amount</th>
                  <th className="px-8 py-5 text-left">Date</th>
                  <th className="px-8 py-5 text-left">Method</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">Fetching records...</td></tr>
                ) : payments?.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">No payment records found.</td></tr>
                ) : payments?.map((payment: any) => (
                  <tr key={payment._id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5 text-sm font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-violet-400" />
                        INV-{payment.invoiceId?.invoiceNumber || payment.invoiceId?._id?.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{payment.invoiceId?.clientName || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-900">${payment.amount.toLocaleString()}</td>
                    <td className="px-8 py-5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {format(new Date(payment.date), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-8 py-5 capitalize">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {payment.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold gap-1.5",
                        payment.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      )}>
                        {payment.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {payment.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LogPaymentModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useInvoices } from '@/lib/hooks/use-invoices'
import { useClients } from '@/lib/hooks/use-clients'
import { AddInvoiceModal } from '@/components/dashboard/add-invoice-modal'
import { UpdateInvoiceModal } from '@/components/dashboard/update-invoice-modal'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  DollarSign, 
  Plus, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText,
  Clock,
  MoreVertical,
  Download,
  Receipt,
  Edit2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Invoice } from '@/types'

export default function FinancePage() {
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  
  const { invoices, isLoading, updateInvoice } = useInvoices(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )

  const isAdmin = session?.user?.role === 'super_admin' || session?.user?.role === 'hr' || session?.user?.role === 'project_manager'

  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,500.00',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Pending Invoices',
      value: invoices?.filter(i => i.status === 'sent').length || 0,
      change: '4 overdue',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Monthly Growth',
      value: '+24%',
      change: 'from last month',
      trend: 'up',
      icon: ArrowUpRight,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    }
  ]

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-100'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-100'
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-100'
      default: return 'bg-amber-50 text-amber-700 border-amber-100'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Financial Management</h1>
          <p className="text-gray-500 mt-1">Monitor revenue, invoices, and company expenses.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Button>
      </div>

      <AddInvoiceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <UpdateInvoiceModal 
        isOpen={!!editingInvoice} 
        onClose={() => setEditingInvoice(null)} 
        invoice={editingInvoice}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                  stat.trend === 'up' ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                )}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Invoices Table */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle>Invoices</CardTitle>
              <p className="text-sm text-gray-500 font-normal">Manage client billing and payments</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {['all', 'draft', 'sent', 'paid', 'overdue'].map((status) => (
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
            <Link href="/finance/expenses">
              <Button variant="outline" className="h-9 rounded-lg gap-2 text-violet-600 border-violet-100 hover:bg-violet-50">
                <Receipt className="w-4 h-4" />
                Manage Expenses
              </Button>
            </Link>
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
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">Loading invoices...</td></tr>
                ) : invoices?.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400">No invoices found.</td></tr>
                ) : (
                  invoices?.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{invoice.invoiceNumber}</span>
                          <span className="text-xs text-gray-500">{(invoice.projectId as any)?.name || 'General Project'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">{(invoice.clientId as any)?.companyName}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-600 font-medium">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</span>
                          <span className="text-xs text-red-500">Due {format(new Date(invoice.dueDate), 'MMM dd')}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">${invoice.total.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                          getStatusStyles(invoice.status)
                        )}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && invoice.status === 'draft' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-bold"
                              onClick={() => updateInvoice({ id: invoice._id, data: { status: 'sent' } })}
                            >
                              Issue
                            </Button>
                          )}
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg text-xs font-bold"
                              onClick={() => setEditingInvoice(invoice)}
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                          )}
                          {invoice.status === 'sent' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold"
                              onClick={() => updateInvoice({ id: invoice._id, data: { status: 'paid' } })}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <Download className="w-4 h-4 text-gray-400" />
                          </Button>
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

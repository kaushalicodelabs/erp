'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useExpenses } from '@/lib/hooks/use-expenses'
import { useSession } from 'next-auth/react'
import { AddExpenseModal } from '@/components/dashboard/add-expense-modal'
import { UpdateExpenseModal } from '@/components/dashboard/update-expense-modal'
import { 
  Receipt, 
  Plus, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock,
  MoreVertical,
  Download,
  Trash2,
  Calendar,
  DollarSign,
  Edit2
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Expense } from '@/types'

export default function ExpensesPage() {
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  const { expenses, isLoading, updateExpense, deleteExpense } = useExpenses(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )

  const isAdmin = session?.user?.role === 'super_admin' || session?.user?.role === 'hr'

  const stats = [
    {
      title: 'Total Expenses',
      value: `$${expenses?.reduce((acc, curr) => acc + (curr.status === 'approved' ? curr.amount : 0), 0).toLocaleString() || '0.00'}`,
      description: 'Approved this month',
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50'
    },
    {
      title: 'Pending Claims',
      value: expenses?.filter(e => e.status === 'pending').length || 0,
      description: 'Awaiting review',
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Rejected',
      value: expenses?.filter(e => e.status === 'rejected').length || 0,
      description: 'Requires attention',
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ]

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100'
      case 'rejected': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-amber-50 text-amber-700 border-amber-100'
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Expense Tracking</h1>
          <p className="text-gray-500 mt-1">Submit and manage business-related expense claims.</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 h-11 px-6 rounded-xl font-semibold gap-2"
        >
          <Plus className="w-5 h-5" />
          Submit Expense
        </Button>
      </div>

      <AddExpenseModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <UpdateExpenseModal 
        isOpen={!!editingExpense} 
        onClose={() => setEditingExpense(null)} 
        expense={editingExpense}
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

      {/* Expenses Table */}
      <Card className="border-none shadow-sm rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 bg-gray-50/30 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <CardTitle>Expense Claims</CardTitle>
              <p className="text-sm text-gray-500 font-normal">History and status of your submissions</p>
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
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expense ID</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{isAdmin ? 'Employee' : 'Description'}</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-gray-400">Loading expenses...</td></tr>
                ) : expenses?.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-gray-400">No expense claims found.</td></tr>
                ) : (
                  expenses?.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">EXT-{expense._id.toString().slice(-6).toUpperCase()}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-700">{expense.category}</span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700 line-clamp-1">
                            {isAdmin && expense.employeeId ? `${(expense.employeeId as any).firstName} ${(expense.employeeId as any).lastName}` : expense.description}
                          </span>
                          {isAdmin && <span className="text-xs text-gray-500 line-clamp-1">{expense.description}</span>}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border",
                          getStatusStyles(expense.status)
                        )}>
                          {expense.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && expense.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg text-xs font-bold"
                                onClick={() => setEditingExpense(expense)}
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold"
                                onClick={() => updateExpense({ id: expense._id, data: { status: 'approved' } })}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold"
                                onClick={() => updateExpense({ id: expense._id, data: { status: 'rejected' } })}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {!isAdmin && expense.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              onClick={() => deleteExpense(expense._id)}
                            >
                              <Trash2 className="w-4 h-4" />
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
